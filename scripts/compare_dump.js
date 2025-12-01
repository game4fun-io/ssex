#!/usr/bin/env node
/**
 * CLI to compare the MongoDB content against the scraped dump (scraping/data).
 * Checks characters (names, skills), artifacts, force cards, and bonds.
 * Reports discrepancies and can optionally write expected docs into a shadow DB
 * or update the target DB to match the dump.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const Character = require('../packages/server/src/models/Character');
const Artifact = require('../packages/server/src/models/Artifact');
const ForceCard = require('../packages/server/src/models/ForceCard');

const DATA_DIR = path.join(__dirname, '../scraping/data');

const argv = yargs(hideBin(process.argv))
    .option('mongo-uri', {
        type: 'string',
        default: 'mongodb://localhost:27017/ssex',
        describe: 'Mongo connection string to compare against (existing DB)',
    })
    .option('shadow-db', {
        type: 'string',
        describe: 'When provided, writes expected docs into this DB for manual inspection (e.g. ssex_shadow)',
    })
    .option('apply', {
        type: 'boolean',
        default: false,
        describe: 'Update target DB documents to match dump when discrepancies are found',
    })
    .option('lang-filter', {
        type: 'array',
        describe: 'Only compare specific language codes (e.g. --lang-filter en pt)',
    })
    .help()
    .argv;

const LANG_MAP = {
    EN: 'en',
    PT: 'pt',
    ES: 'es',
    FR: 'fr',
    ID: 'id',
    TH: 'th',
    CN: 'cn',
};

function detectLanguages() {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    return entries
        .filter((dirent) => dirent.isDirectory() && fs.existsSync(path.join(DATA_DIR, dirent.name, 'tables')))
        .map((dirent) => dirent.name)
        .sort();
}

function loadTable(lang, tableName) {
    const filePath = path.join(DATA_DIR, lang, 'tables', `${tableName}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildTranslations(lang) {
    const tableName = `LanguagePackage_${lang}`;
    const table = loadTable(lang, tableName);
    const map = new Map();
    table.forEach((row) => {
        if (row.key && row.value) {
            map.set(row.key, row.value);
        }
    });
    return map;
}

function resolveString(key, translations) {
    if (typeof key !== 'string') return JSON.stringify(key);
    if (key.startsWith('LC_') && translations.has(key)) return translations.get(key);
    return key;
}

function collectExpectedCharacters(langs) {
    const result = new Map();

    langs.forEach((langCode) => {
        const langLower = LANG_MAP[langCode];
        const translations = buildTranslations(langCode);
        const roles = loadTable(langCode, 'RoleConfig');
        const resources = loadTable(langCode, 'RoleResourcesConfig');
        const skillsTable = loadTable(langCode, 'SkillConfig');
        const relations = loadTable(langCode, 'HeroRelationConfig');
        const fetters = loadTable(langCode, 'HeroFettersConfig');

        const resByRole = new Map(resources.map((r) => [r.role_id, r]));
        const skillById = new Map(skillsTable.map((s) => [s.skillid, s]));
        const relationByHero = new Map(relations.map((r) => [r.id, r]));
        const fetterById = new Map(fetters.map((f) => [f.id, f]));

        roles.forEach((role) => {
            const existing = result.get(role.id) || {
                id: role.id,
                name: {},
                skills: new Map(), // skillId -> {id, name:{}, description:{}}
                bonds: new Map(), // fetterId -> {id, name:{}}
                rawSkillIds: role.skills || [],
            };

            const res = resByRole.get(role.id);
            if (res && res.role_name) {
                existing.name[langLower] = resolveString(res.role_name, translations);
            }

            (role.skills || []).forEach((sid) => {
                const skillRow = skillById.get(sid);
                if (!skillRow) return;
                const skillEntry = existing.skills.get(sid) || {
                    id: sid,
                    name: {},
                    description: {},
                };
                if (skillRow.skill_des) {
                    skillEntry.description[langLower] = resolveString(skillRow.skill_des, translations);
                }
                if (skillRow.skill_name) {
                    skillEntry.name[langLower] = resolveString(skillRow.skill_name, translations);
                }
                existing.skills.set(sid, skillEntry);
            });

            const relation = relationByHero.get(role.id);
            if (relation && Array.isArray(relation.bond)) {
                relation.bond.forEach((fid) => {
                    const fetter = fetterById.get(fid);
                    if (!fetter) return;
                    const bondEntry = existing.bonds.get(fid) || { id: fid, name: {} };
                    if (fetter.name) {
                        bondEntry.name[langLower] = resolveString(fetter.name, translations);
                    }
                    existing.bonds.set(fid, bondEntry);
                });
            }

            result.set(role.id, existing);
        });
    });

    return result;
}

function collectExpectedArtifacts(langs) {
    const result = new Map();

    langs.forEach((langCode) => {
        const langLower = LANG_MAP[langCode];
        const translations = buildTranslations(langCode);
        const artifacts = loadTable(langCode, 'ArtifactConfig');
        artifacts.forEach((row) => {
            const existing = result.get(row.id) || { id: row.id, name: {}, desc: {} };
            existing.name[langLower] = resolveString(row.name, translations);
            existing.desc[langLower] = resolveString(row.desc, translations);
            result.set(row.id, existing);
        });
    });

    return result;
}

function collectExpectedForceCards(langs) {
    const result = new Map();

    langs.forEach((langCode) => {
        const langLower = LANG_MAP[langCode];
        const translations = buildTranslations(langCode);
        const cards = loadTable(langCode, 'ForceCardItemConfig');
        cards.forEach((row) => {
            const existing = result.get(row.id) || { id: row.id, name: {}, desc: {} };
            existing.name[langLower] = resolveString(row.name, translations);
            existing.desc[langLower] = resolveString(row.desc, translations);
            result.set(row.id, existing);
        });
    });

    return result;
}

function compareLocalized(expected, actual, langs) {
    const diffs = [];
    langs.forEach((langLower) => {
        const exp = expected?.[langLower] || '';
        const act = actual?.[langLower] || '';
        if (String(exp || '').trim() !== String(act || '').trim()) {
            diffs.push({ lang: langLower, expected: exp, actual: act });
        }
    });
    return diffs;
}

async function compareCharacters(expectedChars, langs, apply) {
    const mismatches = [];
    const records = await Character.find({});

    for (const doc of records) {
        const expected = expectedChars.get(doc.id);
        if (!expected) {
            mismatches.push({ id: doc.id, issue: 'missing-in-dump' });
            continue;
        }

        const nameDiffs = compareLocalized(expected.name, doc.name, langs);
        if (nameDiffs.length) {
            mismatches.push({ id: doc.id, issue: 'name', details: nameDiffs });
            if (apply) {
                nameDiffs.forEach(({ lang, expected: exp }) => {
                    doc.name[lang] = exp;
                });
            }
        }

        const expectedSkillIds = Array.from(expected.skills.keys());
        const actualSkillIds = (doc.skills || []).map((s) => s.id);
        if (expectedSkillIds.length !== actualSkillIds.length) {
            mismatches.push({
                id: doc.id,
                issue: 'skill-count',
                details: { expected: expectedSkillIds.length, actual: actualSkillIds.length },
            });
        }

        (doc.skills || []).forEach((skillDoc) => {
            const expSkill = expected.skills.get(skillDoc.id);
            if (!expSkill) {
                mismatches.push({ id: doc.id, issue: `skill-${skillDoc.id}-missing-in-dump` });
                return;
            }
            const nameDiff = compareLocalized(expSkill.name, skillDoc.name, langs);
            const descDiff = compareLocalized(expSkill.description, skillDoc.description, langs);
            if (nameDiff.length) {
                mismatches.push({ id: doc.id, issue: `skill-${skillDoc.id}-name`, details: nameDiff });
                if (apply) {
                    nameDiff.forEach(({ lang, expected: exp }) => {
                        skillDoc.name[lang] = exp;
                    });
                }
            }
            if (descDiff.length) {
                mismatches.push({ id: doc.id, issue: `skill-${skillDoc.id}-description`, details: descDiff });
                if (apply) {
                    descDiff.forEach(({ lang, expected: exp }) => {
                        skillDoc.description[lang] = exp;
                    });
                }
            }
        });

        const expectedBonds = Array.from(expected.bonds.values());
        if (expectedBonds.length !== (doc.bonds || []).length) {
            mismatches.push({
                id: doc.id,
                issue: 'bond-count',
                details: { expected: expectedBonds.length, actual: (doc.bonds || []).length },
            });
        }
        (doc.bonds || []).forEach((bondDoc) => {
            if (typeof bondDoc.id === 'undefined') return;
            const expBond = expected.bonds.get(bondDoc.id);
            if (!expBond) {
                mismatches.push({ id: doc.id, issue: `bond-${bondDoc.id}-missing-in-dump` });
                return;
            }
            const bondDiff = compareLocalized(expBond.name, bondDoc.name, langs);
            if (bondDiff.length) {
                mismatches.push({ id: doc.id, issue: `bond-${bondDoc.id}-name`, details: bondDiff });
                if (apply) {
                    bondDiff.forEach(({ lang, expected: exp }) => {
                        bondDoc.name[lang] = exp;
                    });
                }
            }
        });

        if (apply && doc.isModified()) {
            await doc.save();
        }
    }

    return mismatches;
}

async function compareArtifacts(expectedArtifacts, langs, apply) {
    const mismatches = [];
    const records = await Artifact.find({});

    for (const doc of records) {
        const expected = expectedArtifacts.get(doc.id);
        if (!expected) {
            mismatches.push({ id: doc.id, issue: 'missing-in-dump' });
            continue;
        }
        const nameDiff = compareLocalized(expected.name, doc.name, langs);
        const descDiff = compareLocalized(expected.desc, doc.effect || doc.description, langs);

        if (nameDiff.length) {
            mismatches.push({ id: doc.id, issue: 'name', details: nameDiff });
            if (apply) nameDiff.forEach(({ lang, expected: exp }) => (doc.name[lang] = exp));
        }
        if (descDiff.length) {
            mismatches.push({ id: doc.id, issue: 'description', details: descDiff });
            if (apply) descDiff.forEach(({ lang, expected: exp }) => {
                if (!doc.effect) doc.effect = {};
                doc.effect[lang] = exp;
            });
        }

        if (apply && doc.isModified()) {
            await doc.save();
        }
    }

    return mismatches;
}

async function compareForceCards(expectedCards, langs, apply) {
    const mismatches = [];
    const records = await ForceCard.find({});

    for (const doc of records) {
        const expected = expectedCards.get(doc.id);
        if (!expected) {
            mismatches.push({ id: doc.id, issue: 'missing-in-dump' });
            continue;
        }
        const nameDiff = compareLocalized(expected.name, doc.name, langs);
        const descDiff = compareLocalized(expected.desc, (doc.skill && doc.skill.description) || doc.description, langs);

        if (nameDiff.length) {
            mismatches.push({ id: doc.id, issue: 'name', details: nameDiff });
            if (apply) nameDiff.forEach(({ lang, expected: exp }) => (doc.name[lang] = exp));
        }
        if (descDiff.length) {
            mismatches.push({ id: doc.id, issue: 'description', details: descDiff });
            if (apply) {
                if (doc.skill && doc.skill.description) {
                    descDiff.forEach(({ lang, expected: exp }) => (doc.skill.description[lang] = exp));
                }
            }
        }

        if (apply && doc.isModified()) {
            await doc.save();
        }
    }

    return mismatches;
}

async function seedShadowDB(expectedChars, expectedArtifacts, expectedCards, langs, shadowDb) {
    const shadowUri = `mongodb://localhost:27017/${shadowDb}`;
    const shadowConn = await mongoose.createConnection(shadowUri).asPromise();
    const ShadowCharacter = shadowConn.model('Character', Character.schema);
    const ShadowArtifact = shadowConn.model('Artifact', Artifact.schema);
    const ShadowForceCard = shadowConn.model('ForceCard', ForceCard.schema);

    await Promise.all([
        ShadowCharacter.deleteMany({}),
        ShadowArtifact.deleteMany({}),
        ShadowForceCard.deleteMany({}),
    ]);

    const charDocs = Array.from(expectedChars.values()).map((c) => ({
        id: c.id,
        name: c.name,
        skills: Array.from(c.skills.values()).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
        })),
    }));
    const artifactDocs = Array.from(expectedArtifacts.values()).map((a) => ({
        id: a.id,
        name: a.name,
        effect: a.desc,
    }));
    const forceCardDocs = Array.from(expectedCards.values()).map((f) => ({
        id: f.id,
        name: f.name,
        skill: { description: f.desc },
    }));

    await ShadowCharacter.insertMany(charDocs);
    await ShadowArtifact.insertMany(artifactDocs);
    await ShadowForceCard.insertMany(forceCardDocs);

    await shadowConn.close();
}

async function main() {
    const allLangs = detectLanguages();
    const langs = (argv.langFilter || allLangs).map((l) => LANG_MAP[l.toUpperCase()] || l);
    const langCodes = (argv.langFilter || allLangs).map((l) => l.toUpperCase());

    const expectedChars = collectExpectedCharacters(langCodes);
    const expectedArtifacts = collectExpectedArtifacts(langCodes);
    const expectedCards = collectExpectedForceCards(langCodes);

    await mongoose.connect(argv.mongoUri);

    if (argv.shadowDb) {
        await seedShadowDB(expectedChars, expectedArtifacts, expectedCards, langs, argv.shadowDb);
        console.log(`Shadow DB "${argv.shadowDb}" refreshed with dump data.`);
    }

    const charDiffs = await compareCharacters(expectedChars, langs, argv.apply);
    const artifactDiffs = await compareArtifacts(expectedArtifacts, langs, argv.apply);
    const cardDiffs = await compareForceCards(expectedCards, langs, argv.apply);

    await mongoose.disconnect();

    const format = (list) =>
        list.slice(0, 10).map((d) => `${d.id || ''} ${d.issue}${d.details ? ` ${JSON.stringify(d.details)}` : ''}`);

    console.log(`Characters: ${charDiffs.length} mismatches`);
    if (charDiffs.length) console.log(format(charDiffs).join('\n'));

    console.log(`Artifacts: ${artifactDiffs.length} mismatches`);
    if (artifactDiffs.length) console.log(format(artifactDiffs).join('\n'));

    console.log(`Force Cards: ${cardDiffs.length} mismatches`);
    if (cardDiffs.length) console.log(format(cardDiffs).join('\n'));

    if (argv.apply) {
        console.log('Applied fixes to target DB where differences were found.');
    } else {
        console.log('Run with --apply to push dump values into the target DB.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Character = require('../packages/server/src/models/Character');
const Artifact = require('../packages/server/src/models/Artifact');
const ForceCard = require('../packages/server/src/models/ForceCard');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ssex', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const DATA_DIR = path.join(__dirname, '../scraping/data');
const LANGUAGES = ['EN', 'PT', 'ES', 'FR', 'CN', 'ID', 'TH'];

// Helper to load JSON data
const loadJSON = (lang, filename) => {
    const filePath = path.join(DATA_DIR, lang, 'tables', filename);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
};

// Helper to translate keys
const translate = (key, langData) => {
    if (!key) return '';
    // Find the item with Key matching the input key
    const translation = langData.find(item => item.key === key);
    return translation ? translation.value : key;
};

// Helper to get localized string object
const getLocalized = (key, langPackages) => {
    const loc = {};
    LANGUAGES.forEach(lang => {
        loc[lang.toLowerCase()] = translate(key, langPackages[lang]);
    });
    return loc;
};

const resolveSkillDescription = (desKey, valueId, skillValueConfig, langPackages) => {
    let description = getLocalized(desKey, langPackages);
    if (!description) return '';

    // Helper to clean text
    const cleanText = (text) => {
        if (!text) return text;
        // Remove <color=...> and </color>
        let cleaned = text.replace(/<color=[^>]+>/g, '').replace(/<\/color>/g, '');
        // Remove <link=...> and </link>
        cleaned = cleaned.replace(/<link=[^>]+>/g, '').replace(/<\/link>/g, '');
        // Remove any other tags like <i>, <b> if needed, or just generic tag removal if safe
        // For now, specific removal seems safer to preserve potential intended formatting if any
        return cleaned;
    };

    // Find values in SkillValueConfig
    const valueConfig = skillValueConfig.find(v => v.skillid === valueId);
    if (valueConfig && valueConfig.show_value) {
        const replaceValues = (text) => {
            if (!text) return text;
            let newText = cleanText(text); // Clean tags first
            valueConfig.show_value.forEach((val, index) => {
                newText = newText.replace(new RegExp(`\\{${index}\\}`, 'g'), val);
            });
            return newText;
        };

        if (typeof description === 'string') {
            description = replaceValues(description);
        } else if (typeof description === 'object') {
            for (const lang in description) {
                description[lang] = replaceValues(description[lang]);
            }
        }
    } else {
        // If no values to replace, still clean the text
        if (typeof description === 'string') {
            description = cleanText(description);
        } else if (typeof description === 'object') {
            for (const lang in description) {
                description[lang] = cleanText(description[lang]);
            }
        }
    }
    return description;
};

const mapSkills = (skillIds, skillConfig, skillValueConfig, langPackages) => {
    if (!skillIds) return [];
    return skillIds.map(id => {
        const skill = skillConfig.find(s => s.skillid === id);
        if (!skill) return null;

        // Resolve main description
        let description = {};
        if (skill.skill_des && skill.skill_des.length > 0) {
            description = resolveSkillDescription(skill.skill_des[0].des, skill.skill_des[0].value, skillValueConfig, langPackages);
        }

        // Map levels
        const levels = [];
        if (skill.skill_star_des && skill.skill_star_des.length > 0) {
            skill.skill_star_des.forEach((starDes, index) => {
                const levelDesc = resolveSkillDescription(starDes.des, starDes.value, skillValueConfig, langPackages);

                let unlockReq = {};
                if (skill.skill_condition && skill.skill_condition[index]) {
                    unlockReq = getLocalized(skill.skill_condition[index].condition, langPackages);
                }

                levels.push({
                    level: index + 1,
                    description: levelDesc,
                    unlockRequirement: unlockReq
                });
            });
        }

        return {
            id: skill.skillid,
            name: getLocalized(skill.name, langPackages),
            description: description,
            iconUrl: skill.iconpath
                ? `https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/${skill.iconpath.split('/').pop()}.png`
                : '',
            type: skill.skill_type.toString(),
            cost: skill.cd || -1,
            levels: levels
        };
    }).filter(s => s !== null);
};

const ATTRIBUTE_MAP = {
    'Max_Hp': 'HP',
    'Attack': 'ATK',
    'Physis_Def': 'P.DEF',
    'Magic_Def': 'M.DEF',
    'Physis_Pierce': 'P.Pierce',
    'Pierce_Resist': 'Pierce Res',
    'Crit_Level': 'Crit',
    'Crit_Def_Level': 'Crit Res',
    'Hit_Level': 'Hit',
    'Dodge_Level': 'Dodge',
    'Speed': 'Speed'
};

const mapBonds = (relationId, relationConfig, fettersConfig, roleConfig, langPackages) => {
    if (!relationId) return [];

    const relation = relationConfig.find(r => r.id === relationId);
    if (!relation || !relation.bond) return [];

    return relation.bond.map(bondId => {
        const fetter = fettersConfig.find(f => f.id === bondId);
        if (!fetter) return null;

        const targets = fetter.condition.map(targetId => {
            const targetRole = roleConfig.find(r => r.id === targetId);
            if (!targetRole) console.log(`Target role not found for ID: ${targetId}`);
            return getLocalized(targetRole ? targetRole.rolename_short : '', langPackages);
        });

        const effects = fetter.attribute.map(attr => {
            const name = ATTRIBUTE_MAP[attr[0]] || attr[0];
            const val = attr[2];
            return `${name} +${val}%`;
        });
        const effectStr = effects.join(', ');

        return {
            name: getLocalized(fetter.name, langPackages),
            effect: { en: effectStr, pt: effectStr, es: effectStr, fr: effectStr, cn: effectStr, id: effectStr, th: effectStr }, // Use constructed string for all langs for now
            partners: targets
        };
    }).filter(b => b !== null);
};

const mapRarity = (quality) => {
    switch (quality) {
        case 1: return 'N';
        case 2: return 'R';
        case 3: return 'SR';
        case 4: return 'SSR';
        case 5: return 'UR';
        case 6: return 'UR';
    }
};

const mapArtifactRarity = (quality) => {
    // Shift down by 1 level as requested (UR -> SSR, etc.)
    const adjustedQuality = Math.max(1, quality - 1);
    return mapRarity(adjustedQuality);
};

const mapArtifactSkills = (artifactId, skillConfig, skillValueConfig, langPackages) => {
    const skillId = artifactId * 100;
    const skill = skillConfig.find(s => s.skillid === skillId);
    if (!skill) return [];

    // Artifact skills seem to be in skill_des array, each entry representing a level or stage
    if (!skill.skill_des) return [];

    return skill.skill_des.map((des, index) => {
        return {
            level: index + 1,
            description: resolveSkillDescription(des.des, des.value, skillValueConfig, langPackages)
        };
    });
};

const mapArtifactImage = (id, artifactResourcesConfig) => {
    const resource = artifactResourcesConfig.find(r => r.id === id);
    if (!resource || !resource.preview_icon) return '';
    return `/assets/resources/${resource.preview_icon.toLowerCase()}.png`;
};

const mapForceCardSkills = (cardId, skillConfig, skillValueConfig, langPackages) => {
    // Force Card ID maps directly to Skill ID
    const skill = skillConfig.find(s => s.skillid === cardId);
    if (!skill) return [];

    // Force Card skills seem to be in skill_des array
    if (!skill.skill_des) return [];

    return skill.skill_des.map((des, index) => {
        return {
            level: index + 1,
            description: resolveSkillDescription(des.des, des.value, skillValueConfig, langPackages)
        };
    });
};

const mapTags = (labelList, skillLabelConfig, langPackages) => {
    if (!labelList) return [];
    return labelList.map(labelId => {
        const label = skillLabelConfig.find(l => l.id === labelId);
        if (!label) return null;
        return {
            name: getLocalized(label.name, langPackages),
            style: label.back_path
        };
    }).filter(t => t !== null);
};

const migrate = async () => {
    try {
        // Load Language Packages
        const langPackages = {};
        for (const lang of LANGUAGES) {
            langPackages[lang] = loadJSON(lang, `LanguagePackage_${lang}.json`);
        }

        // Load Configs
        const roleConfig = loadJSON('EN', 'RoleConfig.json');
        const heroConfig = loadJSON('EN', 'HeroConfig.json');
        const skillConfig = loadJSON('EN', 'SkillConfig.json');
        const skillValueConfig = loadJSON('EN', 'SkillValueConfig.json');
        const relationConfig = loadJSON('EN', 'HeroRelationConfig.json');
        const fettersConfig = loadJSON('EN', 'HeroFettersConfig.json');
        const artifactConfig = loadJSON('EN', 'ArtifactConfig.json');
        const forceCardConfig = loadJSON('EN', 'ForceCardItemConfig.json');
        const artifactResourcesConfig = loadJSON('EN', 'ArtifactResourcesConfig.json');
        const skillLabelConfig = loadJSON('EN', 'SkillLabelConfig.json');

        console.log(`Loaded ${roleConfig.length} roles, ${heroConfig.length} heroes, ${skillConfig.length} skills`);
        console.log(`Loaded ${artifactConfig.length} artifacts, ${forceCardConfig.length} force cards`);

        // Clear existing data
        await Promise.all([
            Character.deleteMany({}),
            Artifact.deleteMany({}),
            ForceCard.deleteMany({})
        ]);
        console.log('Cleared collections');

        // Migrate Characters
        for (const role of roleConfig) {
            const hero = heroConfig.find(h => h.id === role.id);
            if (!hero) continue;

            const characterData = {
                id: role.id,
                name: getLocalized(`LC_ROLE_role_full_name_${role.id}`, langPackages) || getLocalized(role.rolename_short, langPackages),
                description: getLocalized(role.role_introduction, langPackages),
                rarity: mapRarity(role.quality),
                faction: getLocalized(`LC_COMMON_cloth_trial_hero_camp_${role.camp}`, langPackages) || 'Other',
                combatPosition: getLocalized(`LC_COMMON_cloth_trial_hero_occupation_${role.occupation}`, langPackages) || 'Warrior',
                positioning: getLocalized(`LC_COMMON_cloth_trial_hero_stance_${role.stance}`, langPackages) || 'Front Row',
                attackType: getLocalized(`LC_COMMON_cloth_trial_hero_damagetype_${role.damagetype}`, langPackages) || 'P-ATK',
                stats: {
                    hp: 1000 + (role.quality * 100),
                    atk: 100 + (role.quality * 10),
                    def: 50 + (role.quality * 5),
                    speed: 100 + (role.quality * 2)
                },
                skills: mapSkills(role.skills, skillConfig, skillValueConfig, langPackages),
                bonds: mapBonds(role.id, relationConfig, fettersConfig, roleConfig, langPackages),
                constellation: getLocalized(role.role_constellation_name, langPackages),
                cv_name: getLocalized(role.cvname, langPackages),
                quality: role.quality,
                imageUrl: role.role_initial_skins && role.role_initial_skins.length > 0
                    ? `/assets/resources/textures/hero/circleherohead/CircleHeroHead_${role.role_initial_skins[0]}.png`
                    : '',
                avatarUrl: role.role_initial_skins && role.role_initial_skins.length > 0
                    ? `/assets/resources/textures/hero/circleherohead/CircleHeroHead_${role.role_initial_skins[0]}.png`
                    : ''
            };

            await Character.create(characterData);
        }
        console.log('Migrated Characters');

        // Migrate Artifacts
        for (const art of artifactConfig) {
            const artifactData = {
                id: art.id,
                name: getLocalized(art.name, langPackages),
                rarity: mapArtifactRarity(art.initial_quality),
                faction: getLocalized(art.camp, langPackages),
                stats: {
                    hp: 0,
                    atk: 0,
                    def: 0,
                    speed: 0
                },
                effect: getLocalized(art.desc, langPackages),
                tags: mapTags(art.label_list, skillLabelConfig, langPackages),
                skills: mapArtifactSkills(art.id, skillConfig, skillValueConfig, langPackages),
                imageUrl: mapArtifactImage(art.id, artifactResourcesConfig)
            };
            await Artifact.create(artifactData);
        }
        console.log('Migrated Artifacts');

        // Migrate Force Cards
        for (const card of forceCardConfig) {
            let imageUrl = '';
            if (card.icon_path) {
                const parts = card.icon_path.split('/');
                const filename = parts.pop();
                const path = parts.join('/').toLowerCase();
                imageUrl = `/assets/resources/${path}/${filename}.png`;
            }

            const cardData = {
                id: card.id,
                name: getLocalized(card.name, langPackages),
                rarity: mapArtifactRarity(card.quality),
                stats: {
                    hp: 0,
                    atk: card.args || 0,
                    def: 0
                },
                skill: {
                    name: getLocalized(card.name, langPackages),
                    description: getLocalized(card.desc, langPackages)
                },
                skills: mapForceCardSkills(card.id, skillConfig, skillValueConfig, langPackages),
                imageUrl: imageUrl
            };
            await ForceCard.create(cardData);
        }
        console.log('Migrated Force Cards');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

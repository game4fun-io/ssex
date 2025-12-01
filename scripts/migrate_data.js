const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Character = require('../packages/server/src/models/Character');
const Artifact = require('../packages/server/src/models/Artifact');
const ForceCard = require('../packages/server/src/models/ForceCard');


// Connect to MongoDB moved inside migrate()

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
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/ssex', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

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

        // Process Force Cards
        console.log('Processing Force Cards...');
        // forceCardConfig and skillConfig are already loaded at the beginning of migrate()
        // const forceCardConfigPath = path.join(DATA_DIR, 'tables', 'ForceCardItemConfig.json');
        // if (fs.existsSync(forceCardConfigPath)) {
        //     const forceCardConfig = JSON.parse(fs.readFileSync(forceCardConfigPath, 'utf8'));

        for (const card of forceCardConfig) {
            const name = getLocalized(card.name, langPackages);
            if (!name) continue;

            // Try to find linked skill for progression
            let progression = [];
            // Estimate base stats based on quality/args
            let baseAtk = card.args || 0;
            let baseHp = baseAtk * 10; // Rough estimate
            let baseDef = baseAtk * 0.5; // Rough estimate

            let growth_stats = {
                hp: baseHp * 0.1,
                atk: baseAtk * 0.1,
                pdef: baseDef * 0.1,
                mdef: baseDef * 0.1,
                phys_pen: 0,
                mag_pen: 0
            };

            let imageUrl = '';
            if (card.icon_path) {
                // icon_path: "Textures/Dynamis/Card/Card_93073"
                // Target: "/assets/resources/textures/dynamis/card/Card_93073.png"
                const parts = card.icon_path.split('/');
                const filename = parts.pop(); // Card_93073
                const dir = parts.join('/').toLowerCase(); // textures/dynamis/card
                imageUrl = `/assets/resources/${dir}/${filename}.png`;
            }

            if (card.EffectIDList) {
                try {
                    // EffectIDList is a string like "[93053101]" or just numbers
                    const effectIds = JSON.parse(card.EffectIDList || '[]');
                    if (effectIds.length > 0) {
                        const effectId = effectIds[0].toString();
                        // Try to find skill by prefix (first 5 digits usually)
                        const skillPrefix = effectId.substring(0, 5);
                        const skill = skillConfig.find(s => s.skillid.toString() === skillPrefix || s.skillid.toString() === effectId);

                        if (skill && skill.skill_des) {
                            progression = skill.skill_des.map((des, index) => ({
                                star: index + 1,
                                effect: resolveSkillDescription(des.des, des.value, skillValueConfig, langPackages),
                                copies_needed: index > 0 ? 1 : 0, // Placeholder
                                refund: index > 0 ? 10 : 0,      // Placeholder
                                cost: (index + 1) * 1000         // Placeholder
                            }));
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to parse EffectIDList for card ${card.id}:`, e.message);
                }
            }

            // Generate Exp Table
            const exp_table = Array.from({ length: 90 }, (_, i) => ({
                level: i + 1,
                exp_needed: (i + 1) * 100 // Placeholder formula
            }));

            await ForceCard.findOneAndUpdate(
                { id: card.id },
                {
                    name: getLocalized(card.name, langPackages),
                    rarity: mapRarity(card.quality),
                    imageUrl: imageUrl,
                    skill: {
                        name: getLocalized(card.name, langPackages), // Using card name as skill name for now
                        description: getLocalized(card.desc, langPackages)
                    },
                    stats: {
                        hp: baseHp,
                        atk: baseAtk,
                        pdef: baseDef,
                        mdef: baseDef,
                        phys_pen: 0,
                        mag_pen: 0
                    },
                    growth_stats: growth_stats,
                    progression: progression,
                    exp_table: exp_table,
                    level: 1,
                    stars: card.star || 0,
                    tags: []
                },
                { upsert: true, new: true }
            );
        }
        console.log(`Processed ${forceCardConfig.length} Force Cards`);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

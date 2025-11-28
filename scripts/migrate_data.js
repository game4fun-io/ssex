const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Character = require('../packages/server/src/models/Character');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ssex', {
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

    // Find values in SkillValueConfig
    const valueConfig = skillValueConfig.find(v => v.skillid === valueId);
    if (valueConfig && valueConfig.show_value) {
        const replaceValues = (text) => {
            if (!text) return text;
            let newText = text;
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
    }
    return description;
};

const mapSkills = (skillIds, skillConfig, skillValueConfig, langPackages) => {
    if (!skillIds) return [];
    return skillIds.map(id => {
        const skill = skillConfig.find(s => s.skillid === id);
        if (!skill) return null;

        // Resolve main description
        // skill_des is an array, usually taking the first one or matching level?
        // Taking the first one for now as base description
        let description = {};
        if (skill.skill_des && skill.skill_des.length > 0) {
            description = resolveSkillDescription(skill.skill_des[0].des, skill.skill_des[0].value, skillValueConfig, langPackages);
        }

        // Map levels
        const levels = [];
        if (skill.skill_star_des && skill.skill_star_des.length > 0) {
            skill.skill_star_des.forEach((starDes, index) => {
                const levelDesc = resolveSkillDescription(starDes.des, starDes.value, skillValueConfig, langPackages);

                // Find condition for this level (assuming index match or logic)
                // skill_condition has lv: 1, lv: 2...
                // skill_star_des usually corresponds to these levels
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
            icon: skill.iconpath ? skill.iconpath.split('/').pop() : '',
            type: skill.skill_type.toString(), // 1=Basic, 2=Special, etc.
            cost: skill.cd || -1, // Assuming cost field exists or -1
            levels: levels
        };
    }).filter(s => s !== null);
};

const mapBonds = (relationId, relationConfig, fettersConfig, roleConfig, langPackages) => {
    if (!relationId) return [];

    // Find the relation config for this hero
    // Assuming RoleConfig.id maps to HeroRelationConfig.id
    const relation = relationConfig.find(r => r.id === relationId);
    if (!relation || !relation.bond) return [];

    return relation.bond.map(bondId => {
        const fetter = fettersConfig.find(f => f.id === bondId);
        if (!fetter) return null;

        // Resolve target characters names
        const targets = fetter.condition.map(targetId => {
            const targetRole = roleConfig.find(r => r.id === targetId);
            if (!targetRole) console.log(`Target role not found for ID: ${targetId}`);
            return getLocalized(targetRole ? targetRole.rolename_short : '', langPackages);
        });

        if (targets.length > 0) {
            // console.log(`Found targets for bond ${bondId}:`, targets[0].en);
        } else {
            console.log(`No targets for bond ${bondId}`);
        }

        return {
            name: getLocalized(fetter.name, langPackages),
            // Using name as effect/desc for now as placeholder since we don't have a direct description key
            effect: getLocalized(fetter.name, langPackages),
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
        default: return 'R';
    }
};

const migrate = async () => {
    try {
        // Load Language Packages
        const langPackages = {};
        for (const lang of LANGUAGES) {
            langPackages[lang] = loadJSON(lang, `LanguagePackage_${lang}.json`);
        }

        // Load Configs (using EN for structure, assuming structure is same across langs)
        const roleConfig = loadJSON('EN', 'RoleConfig.json');
        const heroConfig = loadJSON('EN', 'HeroConfig.json');
        const skillConfig = loadJSON('EN', 'SkillConfig.json');
        const skillValueConfig = loadJSON('EN', 'SkillValueConfig.json');
        const relationConfig = loadJSON('EN', 'HeroRelationConfig.json');
        const fettersConfig = loadJSON('EN', 'HeroFettersConfig.json');

        console.log(`Loaded ${roleConfig.length} roles, ${heroConfig.length} heroes, ${skillConfig.length} skills`);

        // Clear existing data and indexes
        try {
            await Character.collection.drop();
            console.log('Dropped Character collection');
        } catch (e) {
            if (e.code === 26) {
                console.log('Character collection does not exist, skipping drop');
            } else {
                throw e;
            }
        }

        for (const role of roleConfig) {
            const hero = heroConfig.find(h => h.id === role.id);

            // Skip if not a valid hero (some roles might be NPCs)
            if (!hero) continue;

            const characterData = {
                id: role.id,
                name: getLocalized(role.rolename_short, langPackages),
                description: getLocalized(role.role_introduction, langPackages),
                rarity: mapRarity(role.quality),
                faction: role.camp,

                // Default Stats (PropertyConfig missing)
                stats: {
                    hp: 1000 + (role.quality * 100),
                    atk: 100 + (role.quality * 10),
                    def: 50 + (role.quality * 5),
                    speed: 100 + (role.quality * 2)
                },

                skills: mapSkills(role.skills, skillConfig, skillValueConfig, langPackages),

                // Map Bonds
                bonds: mapBonds(role.id, relationConfig, fettersConfig, roleConfig, langPackages),

                constellation: getLocalized(role.role_constellation_name, langPackages),
                cv_name: getLocalized(role.cvname, langPackages),
                quality: role.quality,

                imageUrl: `/assets/resources/textures/hero/show/${role.id}.png`, // Placeholder path logic
                avatarUrl: `/assets/resources/textures/hero/icon/${role.id}.png` // Placeholder path logic
            };

            await Character.findOneAndUpdate(
                { id: role.id },
                characterData,
                { upsert: true, new: true }
            );
            console.log(`Migrated ${characterData.name.en}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

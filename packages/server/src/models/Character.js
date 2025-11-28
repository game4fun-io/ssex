const mongoose = require('mongoose');

const LocalizedString = new mongoose.Schema({
    en: { type: String, default: '' },
    pt: { type: String, default: '' },
    es: { type: String, default: '' },
    fr: { type: String, default: '' },
    cn: { type: String, default: '' },
    id: { type: String, default: '' },
    th: { type: String, default: '' }
}, { _id: false });

const CharacterSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Scraped ID
    name: { type: LocalizedString, required: true },
    rarity: { type: String, enum: ['N', 'R', 'SR', 'SSR', 'UR'], default: 'R' },
    tags: [{ type: String }],
    faction: { type: LocalizedString, default: {} }, // Camp

    // New Fields from scraping
    constellation: { type: LocalizedString },
    cv_name: { type: LocalizedString },
    quality: { type: Number },

    combatPosition: { type: LocalizedString, default: {} }, // Default for now
    positioning: { type: LocalizedString, default: {} },
    attackType: { type: LocalizedString, default: {} },

    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 },
        mdef: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        hitRate: { type: Number, default: 0 },
        dodgeRate: { type: Number, default: 0 },
        critRate: { type: Number, default: 0 },
        critResistRate: { type: Number, default: 0 },
        critDmgReduction: { type: Number, default: 0 },
        parryRate: { type: Number, default: 0 }
    },

    skills: [{
        id: { type: Number },
        name: { type: LocalizedString },
        description: { type: LocalizedString },
        type: { type: String }, // Basic, Skill, Ultimate, Passive
        cost: { type: Number, default: 0 },
        iconUrl: { type: String },
        levels: [{
            level: { type: Number },
            description: { type: LocalizedString },
            unlockRequirement: { type: LocalizedString }
        }],
        isAwakened: { type: Boolean, default: false }
    }],

    bonds: [{
        name: { type: LocalizedString },
        partners: [{ type: LocalizedString }],
        effect: { type: LocalizedString },
        isActive: { type: Boolean, default: false }
    }],

    imageUrl: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    description: { type: LocalizedString },
    collection: { type: String }
});

module.exports = mongoose.model('Character', CharacterSchema);

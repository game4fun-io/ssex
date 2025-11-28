const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rarity: { type: String, enum: ['R', 'SR', 'SSR', 'UR'], required: true },
    tags: [{ type: String }], // e.g., "Bronze Saint", "Gold Saint"
    faction: { type: String, enum: ['Sanctuary', 'Asgard', 'Poseidon', 'Hades', 'Athena', 'Other'], required: true },

    // New Fields
    combatPosition: { type: String, enum: ['Tank', 'Warrior', 'Archer', 'Supporter'], required: true },
    positioning: { type: String, enum: ['Front Row', 'Mid Row', 'Back Row'], required: true },
    attackType: { type: String, enum: ['P-ATK', 'M-ATK'], required: true },

    stats: {
        // Basic Stats
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 }, // Physical Defense
        mdef: { type: Number, default: 0 }, // Mental Defense
        speed: { type: Number, default: 0 },

        // Special Stats
        hitRate: { type: Number, default: 0 },
        dodgeRate: { type: Number, default: 0 },
        critRate: { type: Number, default: 0 },
        critResistRate: { type: Number, default: 0 },
        critDmgReduction: { type: Number, default: 0 },
        parryRate: { type: Number, default: 0 }
    },

    skills: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, enum: ['Basic', 'Skill', 'Ultimate', 'Passive'], required: true },
        cost: { type: Number, default: 0 },
        iconUrl: { type: String, default: '' },
        levels: [{
            level: { type: Number, required: true },
            description: { type: String, required: true }, // Description at this level
            unlockRequirement: { type: String } // e.g., "Unlock at 3 stars"
        }],
        isAwakened: { type: Boolean, default: false }
    }],

    bonds: [{
        name: { type: String, required: true },
        partners: [{ type: String }], // Names of partner characters
        effect: { type: String, required: true },
        isActive: { type: Boolean, default: false } // Calculated on frontend usually, but good to have structure
    }],

    imageUrl: { type: String, default: '' },
    description: { type: String }, // Lore/Bio
    collection: { type: String } // e.g., "Bronze Saints", "Gold Saints"
});

module.exports = mongoose.model('Character', CharacterSchema);

const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Basic', 'Skill', 'Ultimate', 'Passive'], required: true },
    cost: { type: Number, default: 0 } // Energy cost if applicable
});

const CharacterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    rarity: {
        type: String,
        enum: ['R', 'SR', 'SSR', 'UR'],
        required: true
    },
    element: {
        type: String,
        enum: ['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark'], // Adjust based on actual game elements
        default: 'Light'
    },
    faction: {
        type: String, // e.g., Sanctuary, Poseidon, Hades, Asgard
        default: 'Sanctuary'
    },
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 },
        speed: { type: Number, default: 0 }
    },
    skills: [SkillSchema],
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Character', CharacterSchema);

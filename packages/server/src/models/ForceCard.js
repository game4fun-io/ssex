const mongoose = require('mongoose');

const ForceCardSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    rarity: { type: String, enum: ['R', 'SR', 'SSR', 'UR'], required: true },
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 }
    },
    skill: {
        name: { type: String, required: true },
        description: { type: String, required: true }
    },
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('ForceCard', ForceCardSchema);

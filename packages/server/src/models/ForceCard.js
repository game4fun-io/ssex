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

const ForceCardSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: LocalizedString, required: true },
    rarity: { type: String, enum: ['N', 'R', 'SR', 'SSR', 'UR'], required: true },
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 }
    },
    skill: {
        name: { type: LocalizedString, required: true },
        description: { type: LocalizedString, required: true }
    },
    skills: [{
        level: { type: Number, required: true },
        description: { type: LocalizedString, required: true }
    }],
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('ForceCard', ForceCardSchema);

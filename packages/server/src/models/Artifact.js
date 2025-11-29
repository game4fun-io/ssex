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

const ArtifactSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: LocalizedString, required: true },
    rarity: { type: String, enum: ['N', 'R', 'SR', 'SSR', 'UR'], required: true },
    faction: { type: LocalizedString, default: null },
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 },
        speed: { type: Number, default: 0 }
    },
    effect: { type: LocalizedString, required: true },
    skills: { type: Array, default: [] },
    tags: [{
        name: LocalizedString,
        style: Number
    }],
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Artifact', ArtifactSchema);

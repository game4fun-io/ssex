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

const CommunityCompSchema = new mongoose.Schema({
    title: { type: String, required: true },
    characters: [{
        slot: { type: String, required: true }, // e.g. 'front1', 'mid2', 'support1'
        character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
        relic: { type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' },
        cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForceCard' }]
    }],
    tags: [{ type: String }], // e.g., "PVP", "PVE", "F2P", "Asgard"
    description: { type: LocalizedString },
    author: { type: String, default: 'Anonymous' },
    likes: { type: Number, default: 0 },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityComp', CommunityCompSchema);

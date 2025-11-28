const mongoose = require('mongoose');

const ArtifactSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    rarity: { type: String, enum: ['R', 'SR', 'SSR', 'UR'], required: true },
    type: { type: String, required: true }, // e.g., Attack, Defense, Support
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 },
        speed: { type: Number, default: 0 }
    },
    effect: { type: String, required: true },
    imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Artifact', ArtifactSchema);

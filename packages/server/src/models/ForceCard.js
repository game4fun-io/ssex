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
    rarity: {
        type: String,
        enum: ['N', 'R', 'SR', 'SSR', 'UR', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
        required: true
    },
    level: { type: Number, default: 1, max: 90 },
    stars: { type: Number, default: 0, max: 15 },
    tags: { type: [String], default: [] },
    stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        pdef: { type: Number, default: 0 },
        mdef: { type: Number, default: 0 },
        crit: { type: Number, default: 0 },
        crit_res: { type: Number, default: 0 },
        phys_pen: { type: Number, default: 0 },
        mag_pen: { type: Number, default: 0 }
    },
    growth_stats: {
        hp: { type: Number, default: 0 },
        atk: { type: Number, default: 0 },
        pdef: { type: Number, default: 0 },
        mdef: { type: Number, default: 0 },
        phys_pen: { type: Number, default: 0 },
        mag_pen: { type: Number, default: 0 }
    },
    progression: [{
        star: Number,
        effect: LocalizedString,
        copies_needed: Number,
        refund: Number,
        cost: Number
    }],
    exp_table: [{
        level: Number,
        exp_needed: Number
    }],
    skill: {
        name: { type: LocalizedString, required: true },
        description: { type: LocalizedString, required: true }
    },
    skills: [{
        level: { type: Number, required: true },
        description: { type: LocalizedString, required: true }
    }],
    imageUrl: { type: String, default: '' },
    isVisible: { type: Boolean, default: true }
});

module.exports = mongoose.model('ForceCard', ForceCardSchema);

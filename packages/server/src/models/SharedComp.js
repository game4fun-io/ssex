const mongoose = require('mongoose');

const SharedCompSchema = new mongoose.Schema({
    shortCode: { type: String, required: true, unique: true, index: true },
    teamData: { type: Object, required: true },
    name: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // Auto-delete after 30 days
});

module.exports = mongoose.model('SharedComp', SharedCompSchema);

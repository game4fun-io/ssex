const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['fix', 'content', 'feature'],
        required: true
    },
    targetId: {
        type: String, // ID of the character/artifact/card if applicable
        required: false
    },
    targetType: {
        type: String,
        enum: ['character', 'artifact', 'forceCard', 'other'],
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Proposal', ProposalSchema);

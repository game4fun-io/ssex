const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    type: {
        type: String,
        enum: ['update', 'event', 'maintenance', 'general'],
        default: 'general'
    },
    language: {
        type: String,
        enum: ['all', 'en', 'es', 'pt', 'fr', 'cn', 'id', 'th'],
        default: 'all'
    },
    minRole: {
        type: String,
        enum: ['user', 'member', 'moderator', 'influencer', 'admin'],
        default: 'user' // 'user' means visible to everyone (including guests if we treat guest as user or null)
        // Actually, 'user' in our enum is the default role for registered users.
        // If we want public news, we might need 'public' or handle 'user' as public.
        // Let's assume 'user' is the base role. If we want guest-only, we might need to handle that.
        // But usually news is public or registered-only.
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('News', NewsSchema);

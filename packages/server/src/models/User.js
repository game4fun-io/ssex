const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    age: {
        type: Number
    },
    providers: {
        google: String,
        discord: String,
        microsoft: String,
        twitch: String,
        steam: String,
        instagram: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    ownedCharacters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    featureFlags: {
        menus: {
            characters: { type: Boolean, default: true },
            teamBuilder: { type: Boolean, default: true },
            artifacts: { type: Boolean, default: true },
            forceCards: { type: Boolean, default: true },
            announcementBanner: { type: Boolean, default: true }
        },
        enableAds: {
            type: Boolean,
            default: true
        }
    },
    adConfig: {
        homeTop: {
            type: String,
            default: 'Home Top Banner'
        },
        homeBottom: {
            type: String,
            default: 'Home Bottom Banner'
        },
        charactersListTop: {
            type: String,
            default: 'Characters List Top Banner'
        },
        characterDetailsSidebar: {
            type: String,
            default: 'Character Details Sidebar'
        },
        characterDetailsBottom: {
            type: String,
            default: 'Character Details Bottom Banner'
        }
    }
}, { timestamps: true });

// Ensure only one config document exists
ConfigSchema.statics.getSingleton = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    } else {
        // Ensure new fields are present
        if (config.featureFlags.announcementBanner === undefined) {
            config.featureFlags.announcementBanner = true;
            await config.save();
        }
    }
    return config;
};

module.exports = mongoose.model('Config', ConfigSchema);

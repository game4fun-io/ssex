const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Config = require('./src/models/Config');

dotenv.config({ path: path.join(__dirname, '.env') });

const fixConfig = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        let config = await Config.findOne();
        if (config) {
            console.log('Found config, updating...');

            // Initialize menus if missing
            if (!config.featureFlags.menus) {
                config.featureFlags.menus = {
                    characters: true,
                    teamBuilder: true,
                    artifacts: true,
                    forceCards: true
                };
            }

            // Remove old field if it exists (Mongoose might handle this automatically on save if strict is true)
            if (config.featureFlags.enableMenus !== undefined) {
                config.featureFlags.enableMenus = undefined;
            }

            // Mark modified because we are changing nested properties or mixed types
            config.markModified('featureFlags');

            await config.save();
            console.log('Config updated successfully:', JSON.stringify(config.featureFlags, null, 2));
        } else {
            console.log('No config found, creating new one...');
            await Config.create({});
            console.log('New config created.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixConfig();

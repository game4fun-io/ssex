const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const Character = require('../src/models/Character');
const Artifact = require('../src/models/Artifact');
const ForceCard = require('../src/models/ForceCard');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateDB = async () => {
    try {
        console.log('Starting Database Migration...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Migrate Users
        console.log('Migrating Users...');
        const userUpdateResult = await User.updateMany(
            { role: { $exists: false } },
            {
                $set: {
                    role: 'user',
                    points: 0,
                    level: 1,
                    badges: [],
                    avatar: null
                }
            }
        );
        console.log(`Updated ${userUpdateResult.modifiedCount} users with default role and stats.`);

        // 2. Migrate Characters
        console.log('Migrating Characters...');
        const charUpdateResult = await Character.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${charUpdateResult.modifiedCount} characters with isVisible: true.`);

        // 3. Migrate Artifacts
        console.log('Migrating Artifacts...');
        const artUpdateResult = await Artifact.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${artUpdateResult.modifiedCount} artifacts with isVisible: true.`);

        // 4. Migrate ForceCards
        console.log('Migrating ForceCards...');
        const fcUpdateResult = await ForceCard.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${fcUpdateResult.modifiedCount} force cards with isVisible: true.`);

        console.log('Database Migration Complete.');
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

if (require.main === module) {
    migrateDB();
}

module.exports = { migrateDB };

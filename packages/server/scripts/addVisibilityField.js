const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Character = require('../src/models/Character');
const Artifact = require('../src/models/Artifact');
const ForceCard = require('../src/models/ForceCard');

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const migrateVisibility = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('Updating Characters...');
        const charResult = await Character.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${charResult.modifiedCount} characters.`);

        console.log('Updating Artifacts...');
        const artResult = await Artifact.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${artResult.modifiedCount} artifacts.`);

        console.log('Updating ForceCards...');
        const cardResult = await ForceCard.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log(`Updated ${cardResult.modifiedCount} force cards.`);

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
};

migrateVisibility();

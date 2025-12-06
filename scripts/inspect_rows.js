require('dotenv').config({ path: './packages/server/.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI;

const checkRows = async () => {
    try {
        console.log('Connecting to DB at:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const characters = await mongoose.connection.db.collection('characters').find({}).limit(15).toArray();
        console.log('\n--- Character Rows Sample ---');
        characters.forEach(c => {
            const pos = c.positioning?.en || 'N/A';
            console.log(`${c.name.en}: Row='${c.row}', Pos='${pos}'`);
        });

        const changelog = await mongoose.connection.db.collection('changelog').find({}).toArray();
        console.log('\n--- Migration Changelog ---');
        changelog.forEach(entry => console.log(`${entry.fileName} (Applied: ${entry.appliedAt})`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRows();

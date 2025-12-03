const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_DEV = 'mongodb://localhost:27019/ssex';

async function checkDev() {
    try {
        const conn = await mongoose.createConnection(MONGO_URI_DEV, { serverSelectionTimeoutMS: 2000 }).asPromise();
        console.log('Connected to DB on 27019');

        const collections = ['characters', 'artifacts', 'forcecards'];

        for (const col of collections) {
            const count = await conn.collection(col).countDocuments();
            console.log(`${col}: ${count}`);
        }

        // Check one image path
        const item = await conn.collection('characters').findOne({ imageUrl: { $ne: '' } });
        console.log('Sample Image:', item?.imageUrl);

        await conn.close();
    } catch (err) {
        console.log('Could not connect to 27019:', err.message);
    }
}

checkDev().catch(console.error);

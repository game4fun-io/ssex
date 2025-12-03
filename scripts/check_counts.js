const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';

async function checkCounts() {
    const conn = await mongoose.createConnection(MONGO_URI_LOCAL).asPromise();
    console.log('Connected to Local DB');

    const collections = ['characters', 'artifacts', 'forcecards'];

    for (const col of collections) {
        const count = await conn.collection(col).countDocuments();
        console.log(`${col}: ${count}`);
    }

    await conn.close();
}

checkCounts().catch(console.error);

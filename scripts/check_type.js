const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';

async function checkType() {
    const conn = await mongoose.createConnection(MONGO_URI_LOCAL).asPromise();
    console.log('Connected to Local DB');

    const col = conn.collection('characters');
    const item = await col.findOne({});

    console.log('ID:', item.id);
    console.log('Type of ID:', typeof item.id);

    await conn.close();
}

checkType().catch(console.error);

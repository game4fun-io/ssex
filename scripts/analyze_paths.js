const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';
const MONGO_URI_PROD_DUMP = MONGO_URI_LOCAL.replace('/ssex', '/ssex_prod_dump');

const GenericSchema = new mongoose.Schema({}, { strict: false });

async function analyze() {
    const connProd = await mongoose.createConnection(MONGO_URI_PROD_DUMP).asPromise();
    console.log('Connected to Prod DB');

    const CharProd = connProd.model('Character', GenericSchema);

    const char = await CharProd.findOne({});
    console.log('Prod Character Sample:', JSON.stringify(char, null, 2));

    await connProd.close();
}

analyze().catch(console.error);

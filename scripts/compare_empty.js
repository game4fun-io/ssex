const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';
const MONGO_URI_PROD_DUMP = MONGO_URI_LOCAL.replace('/ssex', '/ssex_prod_dump');

const ItemSchema = new mongoose.Schema({
    id: Number,
    imageUrl: String,
    avatarUrl: String,
    skills: Array,
    name: mongoose.Schema.Types.Mixed
}, { strict: false });

async function compareEmpty() {
    const connLocal = await mongoose.createConnection(MONGO_URI_LOCAL).asPromise();
    const connProd = await mongoose.createConnection(MONGO_URI_PROD_DUMP).asPromise();

    console.log('Connected to databases');

    const collections = ['characters', 'artifacts', 'forcecards'];
    const models = {
        characters: 'Character',
        artifacts: 'Artifact',
        forcecards: 'ForceCard'
    };

    let totalEmpty = 0;

    for (const col of collections) {
        console.log(`\n--- Analyzing ${col} ---`);
        const ModelLocal = connLocal.model(models[col], ItemSchema, col);
        const ModelProd = connProd.model(models[col], ItemSchema, col);

        const prodItems = await ModelProd.find({});

        for (const prodItem of prodItems) {
            const localItem = await ModelLocal.findOne({ id: prodItem.id });
            if (!localItem) continue;

            if (prodItem.imageUrl && !localItem.imageUrl) {
                console.log(`[EMPTY] ID: ${prodItem.id} Name: ${JSON.stringify(prodItem.name)}`);
                totalEmpty++;
            }
        }
    }

    console.log(`\nTotal empty images in local (present in prod): ${totalEmpty}`);
    await connLocal.close();
    await connProd.close();
}

compareEmpty().catch(console.error);

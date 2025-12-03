const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';
const MONGO_URI_PROD_DUMP = MONGO_URI_LOCAL.replace('/ssex', '/ssex_prod_dump');
const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

// Define schema with explicit id field to avoid Mongoose default 'id' virtual
const ItemSchema = new mongoose.Schema({
    id: Number,
    imageUrl: String,
    name: mongoose.Schema.Types.Mixed
}, { strict: false });

async function compare() {
    const connLocal = await mongoose.createConnection(MONGO_URI_LOCAL).asPromise();
    const connProd = await mongoose.createConnection(MONGO_URI_PROD_DUMP).asPromise();

    console.log('Connected to databases');

    const collections = ['characters', 'artifacts', 'forcecards'];
    const models = {
        characters: 'Character',
        artifacts: 'Artifact',
        forcecards: 'ForceCard'
    };

    for (const col of collections) {
        console.log(`\n--- Analyzing ${col} ---`);
        const ModelLocal = connLocal.model(models[col], ItemSchema, col);
        const ModelProd = connProd.model(models[col], ItemSchema, col);

        const prodItems = await ModelProd.find({});
        console.log(`Found ${prodItems.length} items in Prod`);

        let missingInLocal = 0;
        let pathMismatch = 0;
        let alreadyCorrect = 0;

        for (const prodItem of prodItems) {
            const localItem = await ModelLocal.findOne({ id: prodItem.id });

            if (!localItem) {
                console.log(`[MISSING] ID: ${prodItem.id} Name: ${JSON.stringify(prodItem.name)}`);
                missingInLocal++;
                continue;
            }

            const prodUrl = prodItem.imageUrl || '';
            const localUrl = localItem.imageUrl || '';

            if (!prodUrl) continue;

            const expectedUrl = prodUrl.replace('/assets/', `${CDN_BASE}/`);

            if (localUrl !== expectedUrl) {
                // Only log first 5 mismatches to avoid spam
                if (pathMismatch < 5) {
                    console.log(`[MISMATCH] ID: ${prodItem.id}`);
                    console.log(`  Prod:     ${prodUrl}`);
                    console.log(`  Expected: ${expectedUrl}`);
                    console.log(`  Local:    ${localUrl}`);
                }
                pathMismatch++;
            } else {
                alreadyCorrect++;
            }
        }

        console.log(`Summary for ${col}:`);
        console.log(`  Missing in Local: ${missingInLocal}`);
        console.log(`  Path Mismatch:    ${pathMismatch}`);
        console.log(`  Correct:          ${alreadyCorrect}`);
    }

    await connLocal.close();
    await connProd.close();
}

compare().catch(console.error);

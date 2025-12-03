const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';
const MONGO_URI_PROD_DUMP = MONGO_URI_LOCAL.replace('/ssex', '/ssex_prod_dump');
const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

const ItemSchema = new mongoose.Schema({
    id: Number,
    imageUrl: String,
    avatarUrl: String,
    skills: Array,
    name: mongoose.Schema.Types.Mixed
}, { strict: false });

async function compare() {
    const connLocal = await mongoose.createConnection(MONGO_URI_LOCAL).asPromise();
    const connProd = await mongoose.createConnection(MONGO_URI_PROD_DUMP).asPromise();

    console.log('Connected to databases');

    const collections = ['characters'];
    const models = { characters: 'Character' };

    for (const col of collections) {
        console.log(`\n--- Analyzing ${col} ---`);
        const ModelLocal = connLocal.model(models[col], ItemSchema, col);
        const ModelProd = connProd.model(models[col], ItemSchema, col);

        const prodItems = await ModelProd.find({});

        let issues = 0;

        for (const prodItem of prodItems) {
            const localItem = await ModelLocal.findOne({ id: prodItem.id });
            if (!localItem) continue;

            // Check avatarUrl
            if (prodItem.avatarUrl) {
                const expected = prodItem.avatarUrl.replace('/assets/', `${CDN_BASE}/`);
                if (localItem.avatarUrl !== expected) {
                    console.log(`[MISMATCH] ID: ${prodItem.id} Field: avatarUrl`);
                    console.log(`  Local: ${localItem.avatarUrl}`);
                    console.log(`  Exp:   ${expected}`);
                    issues++;
                }
            }

            // Check skills
            if (prodItem.skills && prodItem.skills.length > 0) {
                for (let i = 0; i < prodItem.skills.length; i++) {
                    const pSkill = prodItem.skills[i];
                    const lSkill = localItem.skills.find(s => s.id === pSkill.id);

                    if (lSkill && pSkill.iconUrl) {
                        const expected = pSkill.iconUrl.replace('/assets/', `${CDN_BASE}/`);
                        if (lSkill.iconUrl !== expected) {
                            console.log(`[MISMATCH] ID: ${prodItem.id} Skill: ${pSkill.id}`);
                            console.log(`  Local: ${lSkill.iconUrl}`);
                            console.log(`  Exp:   ${expected}`);
                            issues++;
                        }
                    }
                }
            }
        }
        console.log(`Total issues found: ${issues}`);
    }

    await connLocal.close();
    await connProd.close();
}

compare().catch(console.error);

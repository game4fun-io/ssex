const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_SIMULATION = 'mongodb://localhost:27020/ssex';
const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

const ItemSchema = new mongoose.Schema({
    id: Number,
    imageUrl: String,
    avatarUrl: String,
    skills: Array,
    name: mongoose.Schema.Types.Mixed
}, { strict: false });

async function verifySimulation() {
    try {
        const conn = await mongoose.createConnection(MONGO_URI_SIMULATION, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log('Connected to Simulation DB (27020)');

        const collections = ['characters', 'artifacts', 'forcecards'];
        const models = {
            characters: 'Character',
            artifacts: 'Artifact',
            forcecards: 'ForceCard'
        };

        let totalBad = 0;
        let totalChecked = 0;

        for (const col of collections) {
            console.log(`\n--- Scanning ${col} ---`);
            const Model = conn.model(models[col], ItemSchema, col);
            const items = await Model.find({});

            for (const item of items) {
                totalChecked++;
                // Check imageUrl
                if (item.imageUrl && !item.imageUrl.startsWith(CDN_BASE)) {
                    console.log(`[BAD] ID: ${item.id} Field: imageUrl Value: ${item.imageUrl}`);
                    totalBad++;
                }

                // Check avatarUrl
                if (item.avatarUrl && !item.avatarUrl.startsWith(CDN_BASE)) {
                    console.log(`[BAD] ID: ${item.id} Field: avatarUrl Value: ${item.avatarUrl}`);
                    totalBad++;
                }

                // Check skills
                if (item.skills && item.skills.length > 0) {
                    for (const skill of item.skills) {
                        if (skill.iconUrl && !skill.iconUrl.startsWith(CDN_BASE)) {
                            console.log(`[BAD] ID: ${item.id} Skill: ${skill.id} Value: ${skill.iconUrl}`);
                            totalBad++;
                        }
                    }
                }
            }
        }

        console.log(`\nTotal items checked: ${totalChecked}`);
        console.log(`Total bad paths found: ${totalBad}`);

        if (totalBad === 0) {
            console.log('SUCCESS: All paths are correct!');
        } else {
            console.log('FAILURE: Found bad paths.');
        }

        await conn.close();
    } catch (err) {
        console.error('Error connecting to simulation DB:', err.message);
    }
}

verifySimulation().catch(console.error);

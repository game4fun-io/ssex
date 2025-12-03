const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27020/ssex';
const CDN_BASE = 'https://cdn.games4fun.io/ssex-images';

// Connect to the database
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const ItemSchema = new mongoose.Schema({
    id: Number,
    imageUrl: String,
    avatarUrl: String,
    skills: Array,
    name: mongoose.Schema.Types.Mixed
}, { strict: false });

const collections = ['characters', 'artifacts', 'forcecards'];
const models = {
    characters: 'Character',
    artifacts: 'Artifact',
    forcecards: 'ForceCard'
};

async function migrate() {
    for (const col of collections) {
        console.log(`\n--- Migrating ${col} ---`);
        const Model = mongoose.model(models[col], ItemSchema, col);
        const items = await Model.find({});

        let updatedCount = 0;

        for (const item of items) {
            let modified = false;

            // Helper to update URL
            const updateUrl = (url) => {
                if (!url) return url;
                if (url.startsWith(CDN_BASE)) return url; // Already correct

                let newUrl = url;

                // Handle absolute old prod URLs
                if (newUrl.includes('seiya2.vercel.app/assets/')) {
                    newUrl = newUrl.replace('https://seiya2.vercel.app/assets/', `${CDN_BASE}/`);
                }
                // Handle relative URLs
                else if (newUrl.startsWith('/assets/')) {
                    newUrl = newUrl.replace('/assets/', `${CDN_BASE}/`);
                }

                return newUrl;
            };

            // Update imageUrl
            if (item.imageUrl) {
                const newUrl = updateUrl(item.imageUrl);
                if (newUrl !== item.imageUrl) {
                    item.imageUrl = newUrl;
                    modified = true;
                }
            }

            // Update avatarUrl
            if (item.avatarUrl) {
                const newUrl = updateUrl(item.avatarUrl);
                if (newUrl !== item.avatarUrl) {
                    item.avatarUrl = newUrl;
                    modified = true;
                }
            }

            // Update skills
            if (item.skills && item.skills.length > 0) {
                item.skills.forEach(skill => {
                    if (skill.iconUrl) {
                        const newUrl = updateUrl(skill.iconUrl);
                        if (newUrl !== skill.iconUrl) {
                            skill.iconUrl = newUrl;
                            modified = true;
                        }
                    }
                });
                // Mark mixed type array as modified if needed, but Mongoose detects deep changes usually.
                // For 'skills' which is Array in schema, we might need markModified if it's Mixed.
                // But here it's defined as Array.
                if (modified) item.markModified('skills');
            }

            if (modified) {
                await item.save();
                updatedCount++;
                console.log(`Updated ID: ${item.id}`);
            }
        }

        console.log(`Updated ${updatedCount} items in ${col}`);
    }

    console.log('\nMigration complete.');
    process.exit(0);
}

migrate().catch(console.error);

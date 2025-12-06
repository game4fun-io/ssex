const mongoose = require('mongoose');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: '/Users/castilho/Developer/poc/ssex/packages/server/.env' });

const Character = require('../packages/server/src/models/Character');

const testDBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Rename Character
        const originalName = 'Perseus Algol';
        const testName = 'Perseus Algol [TEST]';

        await Character.updateOne(
            { 'name.en': originalName },
            { $set: { 'name.en': testName } }
        );
        console.log(`Renamed '${originalName}' to '${testName}' in DB.`);

        // 2. Fetch from API
        const url = 'https://seiyaexcompanion.games4fun.io/api/characters?v=' + Date.now();
        console.log(`Fetching from API: ${url}`);

        https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', async () => {
                const chars = JSON.parse(data);
                const found = chars.find(c => c.name.en === testName);

                if (found) {
                    console.log('SUCCESS: API reflected the name change. DB is correct.');
                    console.log('FactionKey in API:', found.factionKey);
                } else {
                    console.log('FAILURE: API did NOT reflect the name change.');
                    const old = chars.find(c => c.name.en === originalName);
                    if (old) console.log('API returned original name.');
                }

                // 3. Revert
                await Character.updateOne(
                    { 'name.en': testName },
                    { $set: { 'name.en': originalName } }
                );
                console.log('Reverted name in DB.');
                process.exit();
            });
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testDBConnection();

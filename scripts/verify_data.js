const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Character = require('../packages/server/src/models/Character');

dotenv.config({ path: 'packages/server/.env' });

const verify = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ssex');
        const count = await Character.countDocuments();
        console.log(`Total characters: ${count}`);

        // Find a character with bonds and skills to verify
        const sample = await Character.findOne({ rarity: 'UR' });

        if (sample) {
            console.log('Sample character:', sample.name.en);
            console.log('Rarity:', sample.rarity);
            console.log('Stats:', sample.stats);
            console.log('Bonds count:', sample.bonds.length);
            if (sample.bonds.length > 0) {
                console.log('First Bond:', JSON.stringify(sample.bonds[0], null, 2));
            }
            console.log('Skills count:', sample.skills.length);
            if (sample.skills.length > 0) {
                console.log('First Skill:', JSON.stringify(sample.skills[0], null, 2));
            }
        } else {
            console.log('No character found with bonds.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '/Users/castilho/Developer/poc/ssex/packages/server/.env' });

const Character = require('../packages/server/src/models/Character');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const char = await Character.findOne({ 'name.en': 'Perseus Algol' });
        if (char) {
            console.log(`Direct DB Check - ${char.name.en}:`);
            console.log(`  factionKey: '${char.factionKey}'`);
            console.log(`  roleKey: '${char.roleKey}'`);
            console.log(`  attackTypeKey: '${char.attackTypeKey}'`);
        } else {
            console.log('Character not found in DB');
        }

        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();

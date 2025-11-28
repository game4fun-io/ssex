const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Config = require('./src/models/Config');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const config = await Config.findOne();
        console.log('Current Config:', JSON.stringify(config, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkConfig();

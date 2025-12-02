const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Character = require('../src/models/Character');

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const checkData = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);

        const total = await Character.countDocuments();
        const visible = await Character.countDocuments({ isVisible: true });
        const hidden = await Character.countDocuments({ isVisible: false });
        const missing = await Character.countDocuments({ isVisible: { $exists: false } });

        console.log('Total Characters:', total);
        console.log('Visible:', visible);
        console.log('Hidden:', hidden);
        console.log('Missing isVisible:', missing);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();

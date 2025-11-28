const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');

// Load env vars from the same directory as this script
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
            throw new Error('ADMIN_PASSWORD is not defined in .env');
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await user.save();
        console.log(`Admin user created:
        Username: ${username}
        Email: ${email}
        Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();

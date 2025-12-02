const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');

const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
console.log('File exists:', require('fs').existsSync(envPath));
dotenv.config({ path: envPath });

const users = [
    {
        username: 'member',
        email: 'member@test.com',
        password: 'password123',
        role: 'member',
        firstName: 'Test',
        lastName: 'Member'
    },
    {
        username: 'moderator',
        email: 'moderator@test.com',
        password: 'password123',
        role: 'moderator',
        firstName: 'Test',
        lastName: 'Moderator'
    },
    {
        username: 'influencer',
        email: 'influencer@test.com',
        password: 'password123',
        role: 'influencer',
        firstName: 'Test',
        lastName: 'Influencer'
    },
    {
        username: 'admin_test',
        email: 'admin_test@test.com',
        password: 'password123',
        role: 'admin',
        firstName: 'Test',
        lastName: 'Admin'
    }
];

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        for (const userData of users) {
            let user = await User.findOne({ email: userData.email });
            if (user) {
                console.log(`User ${userData.email} already exists`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            user = new User({
                ...userData,
                password: hashedPassword
            });

            await user.save();
            console.log(`User ${userData.email} created with role ${userData.role}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();

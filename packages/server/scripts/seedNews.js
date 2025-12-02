const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const News = require('../src/models/News');

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const newsData = [
    {
        title: 'Server Maintenance Scheduled',
        content: 'We will be performing scheduled maintenance on December 5th from 02:00 to 04:00 UTC. During this time, the game servers will be unavailable. We apologize for any inconvenience.',
        type: 'maintenance',
        minRole: 'user',
        isActive: true,
        publishedAt: new Date('2025-12-01')
    },
    {
        title: 'New Event: Battle for Sanctuary',
        content: 'Join the new "Battle for Sanctuary" event starting next week! Earn exclusive rewards, including the new Sagittarius Aiolos skin. Gather your team and prepare for battle!',
        type: 'event',
        minRole: 'user',
        isActive: true,
        publishedAt: new Date('2025-11-28')
    },
    {
        title: 'Version 1.5.0 Update Notes',
        content: 'Version 1.5.0 is now live! This update brings:\n- New Character: Sagittarius Aiolos\n- New "Community" features\n- Bug fixes and performance improvements\n\nCheck out the full patch notes on our website.',
        type: 'update',
        minRole: 'user',
        isActive: true,
        publishedAt: new Date('2025-11-25')
    },
    {
        title: 'Community Guidelines Update',
        content: 'We have updated our community guidelines to ensure a safe and respectful environment for all players. Please review the new rules in the "Community" section.',
        type: 'general',
        minRole: 'member',
        isActive: true,
        publishedAt: new Date('2025-11-20')
    },
    {
        title: 'Admin Only: Upcoming Features Leak',
        content: 'Confidential: We are planning to release the Poseidon chapter in Q1 2026. Do not share this information with the public yet.',
        type: 'general',
        minRole: 'admin',
        isActive: true,
        publishedAt: new Date('2025-11-15')
    }
];

const seedNews = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('Clearing existing news...');
        await News.deleteMany({});

        console.log('Seeding news...');
        await News.insertMany(newsData);

        console.log('News seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding news:', err);
        process.exit(1);
    }
};

seedNews();

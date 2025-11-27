const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Character = require('./src/models/Character');

dotenv.config();

const characters = [
    {
        name: 'Pegasus Seiya',
        rarity: 'R',
        element: 'Light',
        faction: 'Sanctuary',
        stats: { hp: 1000, atk: 150, def: 80, speed: 100 },
        skills: [
            { name: 'Pegasus Meteor Fist', description: 'Deals damage to all enemies', type: 'Ultimate', cost: 2 },
            { name: 'Comet Fist', description: 'Deals heavy damage to one enemy', type: 'Skill', cost: 1 }
        ],
        imageUrl: 'https://placehold.co/400x600?text=Pegasus+Seiya'
    },
    {
        name: 'Gemini Saga',
        rarity: 'SSR',
        element: 'Dark',
        faction: 'Sanctuary',
        stats: { hp: 2000, atk: 300, def: 150, speed: 120 },
        skills: [
            { name: 'Galaxian Explosion', description: 'Massive AOE damage', type: 'Ultimate', cost: 4 },
            { name: 'Another Dimension', description: 'Banishes an enemy', type: 'Skill', cost: 2 }
        ],
        imageUrl: 'https://placehold.co/400x600?text=Gemini+Saga'
    },
    {
        name: 'Virgo Shaka',
        rarity: 'SSR',
        element: 'Light',
        faction: 'Sanctuary',
        stats: { hp: 1800, atk: 280, def: 160, speed: 115 },
        skills: [
            { name: 'Tenbu Horin', description: 'Silences enemies and deals damage', type: 'Ultimate', cost: 3 },
            { name: 'Om', description: 'Boosts Cosmo', type: 'Skill', cost: 1 }
        ],
        imageUrl: 'https://placehold.co/400x600?text=Virgo+Shaka'
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        await Character.deleteMany({});
        await Character.insertMany(characters);
        console.log('Data Seeded');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

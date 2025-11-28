const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Character = require('./src/models/Character');
const Artifact = require('./src/models/Artifact');
const ForceCard = require('./src/models/ForceCard');

dotenv.config();

const characters = [

    {
        name: 'Sagittarius Aiolos',
        rarity: 'SSR',
        tags: ['Gold Saint', 'Physical Attacker'],
        faction: 'Sanctuary',
        combatPosition: 'Archer',
        positioning: 'Back Row',
        attackType: 'P-ATK',
        description: 'The guardian of the Sagittarius Temple of Golden Zodiac in the Sanctuary. He is the elder brother of Leo Aiolia. Within the Sanctuary, he is considered on par with Saga of Gemini and is also a prominent figure highly regarded as a potential successor to the Pope. During the Saga of Saga, he fought alone to protect Athena and eventually passed away. However, his great will never faded, all of which is entrusted to the Sagittarius Cloth.',
        collection: 'Gold Saints',
        stats: {
            hp: 3500, atk: 550, def: 120, mdef: 100, speed: 130,
            hitRate: 110, dodgeRate: 10, critRate: 25, critResistRate: 5, critDmgReduction: 5, parryRate: 0
        },
        skills: [
            {
                name: 'Golden Arrow',
                description: 'Concentrates Cosmos into a golden arrow that deals massive physical damage to a single enemy.',
                type: 'Ultimate',
                cost: 4,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_10516.png',
                levels: [
                    { level: 1, description: 'Deals 400% P-ATK damage.' },
                    { level: 2, description: 'Deals 450% P-ATK damage.', unlockRequirement: '3 Stars' }
                ]
            },
            {
                name: 'Atomic Thunder Bolt',
                description: 'Unleashes a barrage of light-speed punches dealing damage to enemies.',
                type: 'Skill',
                cost: 2,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_10513.png',
                levels: [
                    { level: 1, description: 'Deals 200% P-ATK damage to random enemies.' }
                ]
            },
            {
                name: 'Charged Shot',
                description: 'Fires a charged shot at the enemy.',
                type: 'Basic',
                cost: 0,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_10515.png',
                levels: [
                    { level: 1, description: 'Deals 100% P-ATK damage.' }
                ]
            },
            {
                name: 'Piercing Light Arrow',
                description: 'Arrows that pierce through defenses.',
                type: 'Passive',
                cost: 0,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_66004.png',
                levels: [
                    { level: 1, description: 'Ignores 15% of enemy Defense.' }
                ]
            },
            {
                name: 'Justice Leader',
                description: 'Inspires allies with his sense of justice.',
                type: 'Passive',
                cost: 0,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_60510.png',
                levels: [
                    { level: 1, description: 'Increases team ATK by 5%.' }
                ]
            },
            {
                name: 'Heart of Sincerity',
                description: 'A pure heart that resists evil.',
                type: 'Passive',
                cost: 0,
                iconUrl: 'https://seiya2.vercel.app/assets/resources/textures/hero/circleherohead/CircleHeroHead_10060.png',
                levels: [
                    { level: 1, description: 'Increases resistance to control effects.' }
                ]
            }
        ],
        bonds: [
            { name: 'Brotherhood', partners: ['Leo Aiolia'], effect: 'ATK +15%' },
            { name: 'Protector of Athena', partners: ['Saori Kido'], effect: 'HP +20%' }
        ],
        imageUrl: 'https://static.wikia.nocookie.net/saintseiya/images/c/cf/Sagittarius_Aiolos.png'
    }
];

const artifacts = [
    {
        name: "Golden Dagger",
        rarity: "SSR",
        type: "Attack",
        stats: { atk: 100, speed: 10 },
        effect: "Increases critical damage by 20%.",
        imageUrl: "https://placehold.co/200x200?text=Golden+Dagger"
    },
    {
        name: "Athena's Shield",
        rarity: "UR",
        type: "Defense",
        stats: { hp: 500, def: 50 },
        effect: "Reduces incoming damage by 15%.",
        imageUrl: "https://placehold.co/200x200?text=Athena+Shield"
    }
];

const forceCards = [
    {
        name: "Pegasus Awakening",
        rarity: "SR",
        stats: { hp: 200, atk: 20 },
        skill: {
            name: "Meteor Storm",
            description: "Boosts Pegasus Seiya's ultimate damage by 30%."
        },
        imageUrl: "https://placehold.co/300x400?text=Pegasus+Card"
    },
    {
        name: "Galaxian Power",
        rarity: "SSR",
        stats: { atk: 50, def: 20 },
        skill: {
            name: "Cosmo Explosion",
            description: "Increases AOE damage for all Gemini Saints."
        },
        imageUrl: "https://placehold.co/300x400?text=Gemini+Card"
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        await Character.deleteMany({});
        await Character.insertMany(characters);
        console.log('Characters Seeded');

        await Artifact.deleteMany({});
        await Artifact.insertMany(artifacts);
        console.log('Artifacts Seeded');

        await ForceCard.deleteMany({});
        await ForceCard.insertMany(forceCards);
        console.log('Force Cards Seeded');

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

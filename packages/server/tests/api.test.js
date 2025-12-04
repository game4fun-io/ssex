const request = require('supertest');
const mongoose = require('mongoose');

// Mock DiscordService
jest.mock('../services/DiscordService', () => ({
    connect: jest.fn()
}));

// Mock Mongoose connection
jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());

// Mock Mongoose models
jest.mock('../src/models/Character', () => {
    return {
        find: jest.fn().mockResolvedValue([
            {
                _id: '1',
                name: { en: 'Thanatos' },
                factionKey: 'hades',
                roleKey: 'fighter',
                row: 'back',
                attackTypeKey: 'physical',
                skills: [
                    { iconUrl: 'https://cdn.games4fun.io/ssex-images/resources/textures/hero/skillicon/texture/SkillIcon_10271.png' }
                ]
            }
        ]),
        sort: jest.fn().mockReturnThis()
    };
});

const app = require('../index'); // Import the app AFTER mocks

describe('GET /api/characters', () => {
    beforeAll(async () => {
        // Suppress console logs during tests
        // jest.spyOn(console, 'log').mockImplementation(() => {});
        // jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return characters with correct keys and clean URLs', async () => {
        const res = await request(app).get('/api/characters');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);

        const char = res.body[0];
        expect(char).toHaveProperty('factionKey', 'hades');
        expect(char).toHaveProperty('roleKey', 'fighter');
        expect(char).toHaveProperty('row', 'back');
        expect(char).toHaveProperty('attackTypeKey', 'physical');

        // Verify URL does not contain seiya2
        expect(char.skills[0].iconUrl).not.toContain('seiya2.vercel.app');
        expect(char.skills[0].iconUrl).toContain('cdn.games4fun.io');
    });
});

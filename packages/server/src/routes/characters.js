const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const { mapCharacterAssets } = require('../utils/assets');
const cache = require('../middleware/cache');

// Get all characters
router.get('/', async (req, res) => {
    try {
        let isAdmin = false;
        const token = req.header('x-auth-token');
        if (token) {
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                if (decoded.user.role === 'admin') isAdmin = true;
            } catch (err) { }
        }

        const query = isAdmin ? {} : { isVisible: true };
        const characters = await Character.find(query);
        res.json(characters.map(mapCharacterAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single character
router.get('/:id', cache(3600), async (req, res) => {
    try {
        const character = await Character.findById(req.params.id)
            .populate('recommendations.cards.cardId')
            .populate('recommendations.artifacts.artifactId');
        if (!character) {
            return res.status(404).json({ msg: 'Character not found' });
        }
        res.json(mapCharacterAssets(character));
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Character not found' });
        }
        res.status(500).send('Server error');
    }
});

// Create character (Simple version without auth middleware for now)
router.post('/', async (req, res) => {
    try {
        const newCharacter = new Character(req.body);
        const character = await newCharacter.save();
        res.json(mapCharacterAssets(character));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

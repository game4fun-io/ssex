const express = require('express');
const router = express.Router();
const Character = require('../models/Character');

// Get all characters
router.get('/', async (req, res) => {
    try {
        const characters = await Character.find();
        res.json(characters);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single character
router.get('/:id', async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ msg: 'Character not found' });
        }
        res.json(character);
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
        res.json(character);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

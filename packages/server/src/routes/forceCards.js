const express = require('express');
const router = express.Router();
const ForceCard = require('../models/ForceCard');

// Get all force cards
router.get('/', async (req, res) => {
    try {
        const cards = await ForceCard.find();
        res.json(cards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

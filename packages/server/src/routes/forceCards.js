const express = require('express');
const router = express.Router();
const ForceCard = require('../models/ForceCard');
const { mapForceCardAssets } = require('../utils/assets');

// Get all force cards
router.get('/', async (req, res) => {
    try {
        const cards = await ForceCard.find();
        res.json(cards.map(mapForceCardAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

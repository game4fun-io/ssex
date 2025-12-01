const express = require('express');
const router = express.Router();
const ForceCard = require('../models/ForceCard');
const { mapForceCardAssets } = require('../utils/assets');
const cache = require('../middleware/cache');

// Get all force cards
router.get('/', cache(3600), async (req, res) => {
    try {
        const cards = await ForceCard.find();
        res.json(cards.map(mapForceCardAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const SharedComp = require('../models/SharedComp');

// Helper to generate random short code
const generateShortCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create a shared comp
router.post('/', async (req, res) => {
    try {
        const { team, name, notes } = req.body;
        if (!team) {
            return res.status(400).json({ msg: 'Team data is required' });
        }

        let shortCode;
        let isUnique = false;

        // Ensure uniqueness (simple retry logic)
        while (!isUnique) {
            shortCode = generateShortCode();
            const existing = await SharedComp.findOne({ shortCode });
            if (!existing) isUnique = true;
        }

        const newShare = new SharedComp({
            shortCode,
            teamData: team,
            name: name || 'Untitled Team',
            notes: notes || ''
        });

        await newShare.save();

        res.json({ shortCode });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a shared comp by short code
router.get('/:shortCode', async (req, res) => {
    try {
        const comp = await SharedComp.findOne({ shortCode: req.params.shortCode });
        if (!comp) {
            return res.status(404).json({ msg: 'Composition not found' });
        }
        res.json(comp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

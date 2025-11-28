const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Config = require('../models/Config');

// @route   GET api/config
// @desc    Get system configuration
// @access  Public
router.get('/', async (req, res) => {
    try {
        const config = await Config.getSingleton();
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/config
// @desc    Update system configuration
// @access  Private/Admin
router.put('/', [auth, admin], async (req, res) => {
    try {
        const { featureFlags, adConfig } = req.body;

        let config = await Config.getSingleton();

        if (featureFlags) config.featureFlags = { ...config.featureFlags, ...featureFlags };
        if (adConfig) config.adConfig = { ...config.adConfig, ...adConfig };

        await config.save();
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

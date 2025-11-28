const express = require('express');
const router = express.Router();
const Artifact = require('../models/Artifact');
const { mapArtifactAssets } = require('../utils/assets');

// Get all artifacts
router.get('/', async (req, res) => {
    try {
        const artifacts = await Artifact.find();
        res.json(artifacts.map(mapArtifactAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

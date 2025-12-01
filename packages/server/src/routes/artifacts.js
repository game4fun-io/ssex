const express = require('express');
const router = express.Router();
const Artifact = require('../models/Artifact');
const { mapArtifactAssets } = require('../utils/assets');
const cache = require('../middleware/cache');

// Get all artifacts
router.get('/', cache(3600), async (req, res) => {
    try {
        const artifacts = await Artifact.find();
        res.json(artifacts.map(mapArtifactAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

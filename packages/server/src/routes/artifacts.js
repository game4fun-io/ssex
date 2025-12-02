const express = require('express');
const router = express.Router();
const Artifact = require('../models/Artifact');
const { mapArtifactAssets } = require('../utils/assets');
const cache = require('../middleware/cache');

// Get all artifacts
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
        const artifacts = await Artifact.find(query);
        res.json(artifacts.map(mapArtifactAssets));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

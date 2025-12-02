const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Character = require('../models/Character');
const Artifact = require('../models/Artifact');
const ForceCard = require('../models/ForceCard');

// @route   PATCH api/admin/visibility
// @desc    Bulk update visibility
// @access  Private (Admin only)
router.patch('/visibility', [auth, role('moderator')], async (req, res) => {
    try {
        const { type, filter, isVisible } = req.body;

        let Model;
        switch (type) {
            case 'character':
                Model = Character;
                break;
            case 'artifact':
                Model = Artifact;
                break;
            case 'forceCard':
                Model = ForceCard;
                break;
            default:
                return res.status(400).json({ msg: 'Invalid type' });
        }

        // Construct query based on filter
        const query = {};
        if (filter) {
            if (filter.rarity) query.rarity = filter.rarity;
            if (filter.faction) {
                // Faction is localized string, so we need to check if any language matches or specific structure
                // Assuming filter sends the ID or a specific language value?
                // The schema says faction: { en: ..., pt: ... }
                // If filter.faction is a string, we might need to search across fields or assume 'en'
                // Or maybe the filter sends { 'faction.en': 'Athena' }
                // Let's assume simple key-value for now, but handle nested if needed.
                // If the user sends "Athena", we might want to search in 'faction.en' or 'faction.id'
                // Let's support direct query object for flexibility or specific logic.
                // For simplicity, let's assume the client sends the correct query structure or we map it.
                // If filter.faction is provided, let's assume it matches 'faction.en' for now.
                query['faction.en'] = filter.faction;
            }
            // Add more filters as needed
        }

        const result = await Model.updateMany(query, { isVisible });

        res.json({ msg: `Updated ${result.modifiedCount} items`, result });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/admin/update/:type/:id
// @desc    Update a specific entity
// @access  Admin
router.patch('/update/:type/:id', [auth, role('moderator')], async (req, res) => {
    try {
        const { type, id } = req.params;
        const updates = req.body;
        let Model;

        switch (type) {
            case 'character':
                Model = require('../models/Character');
                break;
            case 'artifact':
                Model = require('../models/Artifact');
                break;
            case 'forceCard':
                Model = require('../models/ForceCard');
                break;
            default:
                return res.status(400).json({ msg: 'Invalid type' });
        }

        const item = await Model.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

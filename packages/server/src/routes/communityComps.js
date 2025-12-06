const express = require('express');
const router = express.Router();
const CommunityComp = require('../models/CommunityComp');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/community-comps
// @desc    Get all community comps
// @access  Public
router.get('/', async (req, res) => {
    try {
        const comps = await CommunityComp.find()
            .populate('characters.character', 'name imageUrl rarity')
            .populate('characters.relic', 'name imageUrl')
            .populate('characters.cards', 'name imageUrl')
            .sort({ createdAt: -1 });
        res.json(comps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/community-comps/:id
// @desc    Get comp by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const comp = await CommunityComp.findById(req.params.id)
            .populate('characters.character', 'name imageUrl rarity bonds combineSkills')
            .populate('characters.relic', 'name imageUrl effect')
            .populate('characters.cards', 'name imageUrl skill');
        if (!comp) {
            return res.status(404).json({ msg: 'Comp not found' });
        }
        res.json(comp);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comp not found' });
        }
        res.status(500).send('Server Error');
    }
});

const User = require('../models/User');

// @route   POST api/community-comps
// @desc    Create a community comp
// @access  Private
router.post('/', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('characters', 'Characters are required').isArray({ min: 1 })
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('username');
        const authorName = user ? user.username : 'Anonymous';

        const newComp = new CommunityComp({
            title: req.body.title,
            characters: req.body.characters,
            tags: req.body.tags,
            description: req.body.description,
            author: authorName
        });

        const comp = await newComp.save();
        res.json(comp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/community-comps/like/:id
// @desc    Like a comp
// @access  Public
router.put('/like/:id', async (req, res) => {
    try {
        const comp = await CommunityComp.findById(req.params.id);
        if (!comp) {
            return res.status(404).json({ msg: 'Comp not found' });
        }
        comp.likes += 1;
        await comp.save();
        res.json(comp.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/community-comps/:id
// @desc    Update a community comp
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let comp = await CommunityComp.findById(req.params.id);
        if (!comp) {
            return res.status(404).json({ msg: 'Comp not found' });
        }

        // Check user (simple check by username for now as we store author name, 
        // but ideally we should store authorId. 
        // Since we didn't store authorId in previous schema, we might have issues editing old comps.
        // For new comps we can check req.user.username === comp.author
        // Or better, let's rely on the fact that we are adding authorId support implicitly if we wanted, 
        // but for now let's just check if the user matches the author name or if we add an owner field.
        // The current schema has `author` as String. 
        // Let's assume the user can edit if they are the author.

        const user = await User.findById(req.user.id);
        if (comp.author !== user.username && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const { title, description, tags, characters } = req.body;

        if (title) comp.title = title;
        if (description) comp.description = description;
        if (tags) comp.tags = tags;
        if (characters) comp.characters = characters;

        await comp.save();

        // Populate before returning
        const populatedComp = await CommunityComp.findById(req.params.id)
            .populate('characters.character', 'name imageUrl rarity bonds combineSkills')
            .populate('characters.relic', 'name imageUrl effect')
            .populate('characters.cards', 'name imageUrl skill');

        res.json(populatedComp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/community-comps/:id
// @desc    Delete a community comp
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const comp = await CommunityComp.findById(req.params.id);
        if (!comp) {
            return res.status(404).json({ msg: 'Comp not found' });
        }

        const user = await User.findById(req.user.id);
        // Check if user is author or admin
        if (comp.author !== user.username && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await comp.deleteOne();
        res.json({ msg: 'Comp removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/community-comps/:id/comments
// @desc    Add a comment to a comp
// @access  Private
router.post('/:id/comments', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const comp = await CommunityComp.findById(req.params.id);

        if (!comp) {
            return res.status(404).json({ msg: 'Comp not found' });
        }

        const newComment = {
            text: req.body.text,
            username: user.username,
            user: req.user.id
        };

        comp.comments.unshift(newComment);

        await comp.save();
        res.json(comp.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

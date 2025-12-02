const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route   GET api/news
// @desc    Get all active news (filtered by role)
// @access  Public (but filters content)
router.get('/', async (req, res) => {
    try {
        let userRole = 'user'; // Default to lowest role

        // Check for token to get user role
        const token = req.header('x-auth-token');
        if (token) {
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                userRole = decoded.user.role || 'user';
            } catch (err) {
                // Invalid token, treat as guest/user
            }
        }

        const roles = {
            user: 0,
            member: 1,
            influencer: 2,
            moderator: 3,
            admin: 4
        };

        const userRoleValue = roles[userRole] || 0;

        // Fetch all active news and populate author
        const allNews = await News.find({ isActive: true })
            .sort({ publishedAt: -1 })
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar');

        // Filter in memory (easier than complex mongo query with string enums)
        const visibleNews = allNews.filter(item => {
            const itemRoleValue = roles[item.minRole] || 0;
            return userRoleValue >= itemRoleValue;
        });

        res.json(visibleNews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/news
// @desc    Create a news item
// @access  Private (Admin, Moderator, Influencer)
router.post('/', [auth, role(['admin', 'moderator', 'influencer'])], async (req, res) => {
    try {
        const { title, content, thumbnailUrl, type, minRole, language, isActive } = req.body;

        const newNews = new News({
            title,
            content,
            thumbnailUrl,
            type,
            minRole,
            language,
            isActive,
            author: req.user.id
        });

        const news = await newNews.save();
        res.json(news);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/news/:id
// @desc    Update a news item
// @access  Private (Admin only)
router.put('/:id', [auth, role('admin')], async (req, res) => {
    try {
        let news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        const { title, content, thumbnailUrl, type, minRole, language, isActive } = req.body;

        news.title = title || news.title;
        news.content = content || news.content;
        news.thumbnailUrl = thumbnailUrl || news.thumbnailUrl;
        news.type = type || news.type;
        news.minRole = minRole || news.minRole;
        news.language = language || news.language;
        if (isActive !== undefined) news.isActive = isActive;

        await news.save();
        res.json(news);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/news/:id
// @desc    Delete a news item
// @access  Private (Admin only)
router.delete('/:id', [auth, role('admin')], async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        await news.deleteOne();
        res.json({ msg: 'News removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/news/:id/like
// @desc    Like/Unlike a news item
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        // Check if already liked
        if (news.likes.includes(req.user.id)) {
            // Unlike
            news.likes = news.likes.filter(id => id.toString() !== req.user.id);
        } else {
            // Like
            news.likes.push(req.user.id);
        }

        await news.save();
        res.json(news.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/news/:id/comment
// @desc    Add a comment to a news item
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        const newComment = {
            user: req.user.id,
            text: req.body.text,
            createdAt: Date.now()
        };

        news.comments.unshift(newComment);

        await news.save();

        // Populate the user of the new comment to return it fully
        const populatedNews = await News.findById(req.params.id).populate('comments.user', 'username avatar');

        res.json(populatedNews.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

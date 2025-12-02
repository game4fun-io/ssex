const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, country, age } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            username,
            email: normalizedEmail,
            password: hashedPassword,
            firstName,
            lastName,
            country,
            age
        });

        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log('Login attempt:', { email: normalizedEmail, password });

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log('User found:', user.email, user.password);

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/updateDetails
// @desc    Update user details
// @access  Private
router.put('/updateDetails', auth, async (req, res) => {
    try {
        const { username, email, avatar, country, age } = req.body;
        const userFields = {};
        if (username) userFields.username = username;
        if (email) userFields.email = email;
        if (avatar) userFields.avatar = avatar;
        if (country) userFields.country = country;
        if (age) userFields.age = age;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Social Login Callbacks (Placeholders)
router.get('/:provider/callback', (req, res) => {
    const { provider } = req.params;
    res.send(`Callback for ${provider} - Implementation pending`);
});

module.exports = router;

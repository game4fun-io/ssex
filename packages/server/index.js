const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const ASSET_ROUTE = process.env.ASSET_ROUTE || '/assets';
// Default to server-package assets so deployment/CDN swaps are straightforward
const ASSET_DIR = process.env.ASSET_DIR || path.join(__dirname, 'public', 'assets');

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
// app.use(ASSET_ROUTE, express.static(ASSET_DIR)); // serve scraped assets locally

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        await createAdminUser();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Auto-migrate assets to MinIO in development
if (process.env.NODE_ENV === 'development') {
    const { migrate } = require('./scripts/migrateToMinio');
    // Run migration in background so it doesn't block server startup
    migrate().catch(err => console.error('MinIO migration error:', err));
}

const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.log('Admin credentials not provided in environment variables.');
            return;
        }

        let admin = await User.findOne({ email });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (admin) {
            admin.password = hashedPassword;
            admin.role = 'admin'; // Set role to admin
            await admin.save();
            console.log('Admin user updated.');
        } else {
            admin = new User({
                username: 'admin',
                email,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created.');
        }
    } catch (err) {
        console.error('Error creating/updating admin user:', err);
    }
};

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/characters', require('./src/routes/characters'));
app.use('/api/artifacts', require('./src/routes/artifacts'));
app.use('/api/force-cards', require('./src/routes/forceCards'));
app.use('/api/config', require('./src/routes/config'));
app.use('/api/share', require('./src/routes/share'));



// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

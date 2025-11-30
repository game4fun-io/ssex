const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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
app.use(ASSET_ROUTE, express.static(ASSET_DIR)); // serve scraped assets locally

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/characters', require('./src/routes/characters'));
app.use('/api/artifacts', require('./src/routes/artifacts'));
app.use('/api/force-cards', require('./src/routes/forceCards'));
app.use('/api/config', require('./src/routes/config'));
app.use('/api/share', require('./src/routes/share'));

app.get('/', (req, res) => {
    res.send('Saint Seiya EX API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

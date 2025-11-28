const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
    res.send('Saint Seiya EX API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

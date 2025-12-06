const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No'); // Debug log

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const DiscordService = require('./services/DiscordService');

const app = express();
const PORT = process.env.PORT || 5002;
const ASSET_ROUTE = process.env.ASSET_ROUTE || '/assets';
// Default to server-package assets so deployment/CDN swaps are straightforward
const ASSET_DIR = process.env.ASSET_DIR || path.join(__dirname, 'public', 'assets');

// Connect Discord Bot
DiscordService.connect();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_session_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(ASSET_ROUTE, express.static(ASSET_DIR)); // serve scraped assets locally

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        await createAdminUser();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Auto-migrate assets to MinIO in development
// if (process.env.NODE_ENV === 'development') {
//     const { migrate } = require('./scripts/migrateToMinio');
//     // Run migration in background so it doesn't block server startup
//     migrate().catch(err => console.error('MinIO migration error:', err));
// }

const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const getBaseUrl = (req) => {
    const envUrl = process.env.SITE_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    return `${req.protocol}://${req.get('host')}`;
};

const SITEMAP_XMLNS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const SITEMAP_CHANGEFREQ = 'weekly';
const SITEMAP_PRIORITY_HIGH = '1.0';
const SITEMAP_PRIORITY_NORMAL = '0.7';

const sitemapRoutes = [
    '/',
    '/news',
    '/characters',
    '/team-builder',
    '/artifacts',
    '/force-cards',
    '/community-comps',
    '/proposals',
    '/login',
    '/register'
];

const buildSitemapXml = (req) => {
    const base = getBaseUrl(req);
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = `<urlset xmlns="${SITEMAP_XMLNS}">`;
    const urlsetClose = '</urlset>';
    
    const urlEntries = sitemapRoutes.map((route) => {
        const priority = route === '/' ? SITEMAP_PRIORITY_HIGH : SITEMAP_PRIORITY_NORMAL;
        return [
            '  <url>',
            `    <loc>${base}${route}</loc>`,
            `    <changefreq>${SITEMAP_CHANGEFREQ}</changefreq>`,
            `    <priority>${priority}</priority>`,
            '  </url>'
        ].join('\n');
    });
    
    return [
        xmlHeader,
        urlsetOpen,
        ...urlEntries,
        urlsetClose
    ].join('\n');
};

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
app.use('/api/news', require('./src/routes/news'));
app.use('/api/characters', require('./src/routes/characters'));
app.use('/api/artifacts', require('./src/routes/artifacts'));
app.use('/api/force-cards', require('./src/routes/forceCards'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/community', require('./src/routes/community'));
app.use('/api/config', require('./src/routes/config'));
app.use('/api/share', require('./src/routes/share'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/community-comps', require('./src/routes/communityComps'));

app.get('/robots.txt', (req, res) => {
    const base = getBaseUrl(req);
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml').send(buildSitemapXml(req));
});



// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

// Start Server
// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

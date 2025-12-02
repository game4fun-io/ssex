const redis = require('../../services/redis');
const jwt = require('jsonwebtoken');

const cache = (duration) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        let role = 'guest';
        const token = req.header('x-auth-token');
        if (token) {
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                role = decoded.user.role || 'user';
            } catch (err) {
                // Invalid token
            }
        }

        const key = `__express__${req.originalUrl || req.url}__${role}`;

        try {
            const cachedBody = await redis.get(key);
            if (cachedBody) {
                res.send(cachedBody);
                return;
            } else {
                res.sendResponse = res.send;
                res.send = (body) => {
                    // Only cache 200 responses
                    if (res.statusCode === 200) {
                        // If body is an object, stringify it
                        const value = typeof body === 'string' ? JSON.parse(body) : body;
                        redis.set(key, value, duration);
                    }
                    res.sendResponse(body);
                };
                next();
            }
        } catch (err) {
            console.error('Redis cache error:', err);
            next();
        }
    };
};

module.exports = cache;

const redis = require('../../services/redis');

const cache = (duration) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;

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

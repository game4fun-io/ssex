const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
    url: redisUrl
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Connect immediately
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

const DEFAULT_EXPIRATION = 3600; // 1 hour

const get = async (key) => {
    try {
        const data = await client.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`Error getting key ${key} from Redis:`, error);
        return null;
    }
};

const set = async (key, value, expiration = DEFAULT_EXPIRATION) => {
    try {
        await client.setEx(key, expiration, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting key ${key} in Redis:`, error);
    }
};

const del = async (key) => {
    try {
        await client.del(key);
    } catch (error) {
        console.error(`Error deleting key ${key} from Redis:`, error);
    }
};

module.exports = {
    client,
    get,
    set,
    del
};

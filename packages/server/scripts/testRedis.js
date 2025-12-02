const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || process.argv[2];

if (!redisUrl) {
    console.error('Please provide a REDIS_URL environment variable or as a command line argument.');
    process.exit(1);
}

console.log(`Testing connection to Redis...`);
// Mask password in logs
const maskedUrl = redisUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`URL: ${maskedUrl}`);

const client = createClient({
    url: redisUrl
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    // console.error(err); // Uncomment for full error
});

(async () => {
    try {
        await client.connect();
        console.log('Successfully connected to Redis!');

        const ping = await client.ping();
        console.log(`PING response: ${ping}`);

        await client.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Failed to connect:', err.message);
        process.exit(1);
    }
})();

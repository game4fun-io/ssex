const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

class DiscordService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.channelId = null;
        this.token = null;
    }

    async connect() {
        this.token = process.env.DISCORD_BOT_TOKEN;
        this.channelId = process.env.DISCORD_NEWS_CHANNEL_ID;

        if (!this.token || this.token === 'YOUR_BOT_TOKEN') {
            console.warn('DiscordService: No valid token provided. Skipping connection.');
            return;
        }

        try {
            this.client = new Client({
                intents: [GatewayIntentBits.Guilds]
            });

            this.client.once('clientReady', () => {
                console.log(`DiscordService: Logged in as ${this.client.user.tag}`);
                this.isConnected = true;
            });

            await this.client.login(this.token);
        } catch (error) {
            console.error('DiscordService: Failed to connect:', error.message);
        }
    }

    async postNews(newsItem) {
        if (!this.isConnected || !this.channelId) {
            console.warn('DiscordService: Not connected or no channel ID. Skipping post.');
            return;
        }

        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (!channel) {
                console.error('DiscordService: Channel not found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(newsItem.title)
                .setDescription(newsItem.content.substring(0, 200) + (newsItem.content.length > 200 ? '...' : ''))
                .setColor(this.getColorForType(newsItem.type))
                .setURL(`${process.env.CLIENT_URL || 'http://localhost:5173'}/news`)
                .setTimestamp(new Date(newsItem.publishedAt))
                .setFooter({ text: 'Saint Seiya EX News' });

            if (newsItem.thumbnailUrl) {
                embed.setThumbnail(newsItem.thumbnailUrl);
            }

            await channel.send({ embeds: [embed] });
            console.log('DiscordService: News posted to Discord.');
        } catch (error) {
            console.error('DiscordService: Failed to post news:', error.message);
        }
    }

    getColorForType(type) {
        switch (type) {
            case 'update': return 0x3b82f6; // Blue
            case 'event': return 0x22c55e; // Green
            case 'maintenance': return 0xef4444; // Red
            default: return 0x6b7280; // Gray
        }
    }
}

module.exports = new DiscordService();

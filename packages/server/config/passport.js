const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../src/models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI || (
        process.env.NODE_ENV === 'production'
            ? 'https://seiyaexcompanion.games4fun.io/api/auth/discord/callback'
            : 'http://localhost:5002/api/auth/discord/callback'
    ),
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists by Discord ID
        let user = await User.findOne({ discordId: profile.id });

        if (user) {
            // Update tokens and info
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.discordUsername = profile.username;
            user.discordDiscriminator = profile.discriminator;
            user.discordAvatar = profile.avatar;
            await user.save();
            return done(null, user);
        }

        // Check if user exists by email
        user = await User.findOne({ email: profile.email });

        if (user) {
            // Link Discord to existing account
            user.discordId = profile.id;
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.discordUsername = profile.username;
            user.discordDiscriminator = profile.discriminator;
            user.discordAvatar = profile.avatar;
            await user.save();
            return done(null, user);
        }

        // Create new user
        // Note: Password is required by schema, so we generate a random one for OAuth users
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = new User({
            username: profile.username, // Might need to handle duplicates
            email: profile.email,
            password: hashedPassword,
            discordId: profile.id,
            discordUsername: profile.username,
            discordDiscriminator: profile.discriminator,
            discordAvatar: profile.avatar,
            accessToken: accessToken,
            refreshToken: refreshToken
        });

        await user.save();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;

/**
 * Backfills stored asset paths to full public URLs for all entities using MinIO/CDN.
 * Run from packages/server: `node scripts/updateAssetUrls.js`
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Character = require('../src/models/Character');
const Artifact = require('../src/models/Artifact');
const ForceCard = require('../src/models/ForceCard');
const News = require('../src/models/News');

// Load env (server .env preferred, then repo root)
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const isAbsolute = (url = '') => /^https?:\/\//i.test(url);
const forceRewrite = process.env.FORCE_REWRITE_ASSETS === 'true';

const buildPublicUrl = (objectName) => {
    if (!objectName) return objectName;
    if (isAbsolute(objectName) && !forceRewrite) return objectName;

    const protocol = process.env.MINIO_PUBLIC_PROTOCOL
        || (process.env.MINIO_PUBLIC_HOST || process.env.MINIO_ENDPOINT ? 'https' : 'http');
    const host = process.env.MINIO_PUBLIC_HOST || process.env.MINIO_ENDPOINT || 'localhost';
    const bucket = process.env.MINIO_BUCKET || 'ssex-images';
    const port =
        process.env.MINIO_PUBLIC_PORT ||
        process.env.MINIO_API_PORT ||
        process.env.MINIO_PORT ||
        (protocol === 'https' ? 443 : 9000);

    let cleanName = objectName;

    if (isAbsolute(objectName)) {
        try {
            const parsed = new URL(objectName);
            cleanName = parsed.pathname || '';
        } catch (_) {
            // fall back to raw string
        }
    }

    cleanName = cleanName
        .replace(/^https?:\/\//i, '')
        .replace(/^\/+/, '')
        .replace(new RegExp(`^${bucket}/`), '')
        .replace(/^assets\//i, '') // legacy assets prefix
        .replace(new RegExp(`^[^/]+/${bucket}/`), ''); // strip host/bucket if present

    // If a hostname segment remains (e.g., seiya2.vercel.app/...), drop it
    cleanName = cleanName.replace(/^[^/]*\.[^/]+\/(.*)/, '$1');

    // If a nested URL remains, grab the last occurrence after bucket/
    if (cleanName.includes('://')) {
        const idx = cleanName.lastIndexOf(`${bucket}/`);
        if (idx >= 0) {
            cleanName = cleanName.slice(idx + bucket.length + 1);
        }
        cleanName = cleanName
            .replace(/^https?:\/\//i, '')
            .replace(/^\/+/, '')
            .replace(new RegExp(`^${bucket}/`), '')
            .replace(/^assets\//i, '');
    }

    // Final guard: strip any leading assets/ that survived earlier passes
    cleanName = cleanName.replace(/^assets\//i, '');

    const portStr = (port == 80 || port == 443) ? '' : `:${port}`;
    return `${protocol}://${host}${portStr}/${bucket}/${cleanName}`;
};

const updateCharacters = async () => {
    const docs = await Character.find();
    let updated = 0;
    for (const doc of docs) {
        let changed = false;

        if (doc.imageUrl && (forceRewrite || !isAbsolute(doc.imageUrl))) {
            doc.imageUrl = buildPublicUrl(doc.imageUrl);
            changed = true;
        }
        if (doc.avatarUrl && (forceRewrite || !isAbsolute(doc.avatarUrl))) {
            doc.avatarUrl = buildPublicUrl(doc.avatarUrl);
            changed = true;
        }

        if (Array.isArray(doc.skills)) {
            let skillsChanged = false;
            doc.skills = doc.skills.map((skill) => {
                if (skill && skill.iconUrl && (forceRewrite || !isAbsolute(skill.iconUrl))) {
                    skillsChanged = true;
                    return { ...skill.toObject?.() ?? skill, iconUrl: buildPublicUrl(skill.iconUrl) };
                }
                return skill;
            });
            if (skillsChanged) {
                doc.markModified('skills');
                changed = true;
            }
        }

        if (changed) {
            await doc.save();
            updated++;
        }
    }
    console.log(`Characters updated: ${updated}/${docs.length}`);
};

const updateArtifacts = async () => {
    const docs = await Artifact.find();
    let updated = 0;
    for (const doc of docs) {
        if (doc.imageUrl && (forceRewrite || !isAbsolute(doc.imageUrl))) {
            doc.imageUrl = buildPublicUrl(doc.imageUrl);
            await doc.save();
            updated++;
        }
    }
    console.log(`Artifacts updated: ${updated}/${docs.length}`);
};

const updateForceCards = async () => {
    const docs = await ForceCard.find();
    let updated = 0;
    for (const doc of docs) {
        if (doc.imageUrl && (forceRewrite || !isAbsolute(doc.imageUrl))) {
            doc.imageUrl = buildPublicUrl(doc.imageUrl);
            await doc.save();
            updated++;
        }
    }
    console.log(`Force cards updated: ${updated}/${docs.length}`);
};

const updateNews = async () => {
    const docs = await News.find();
    let updated = 0;
    for (const doc of docs) {
        if (doc.thumbnailUrl && (forceRewrite || !isAbsolute(doc.thumbnailUrl))) {
            doc.thumbnailUrl = buildPublicUrl(doc.thumbnailUrl);
            await doc.save();
            updated++;
        }
    }
    console.log(`News updated: ${updated}/${docs.length}`);
};

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        await updateCharacters();
        await updateArtifacts();
        await updateForceCards();
        await updateNews();

        console.log('Asset URL backfill complete.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
};

if (require.main === module) {
    run();
}

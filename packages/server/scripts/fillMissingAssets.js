/**
 * Verifies character/artifact/force card assets exist on the CDN (MinIO) and uploads missing files
 * from the local client build output (packages/client/dist/assets).
 *
 * Usage:
 *   MINIO_* and MONGO_URI must be set to point at the target bucket/DB.
 *   node scripts/fillMissingAssets.js
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const Character = require('../src/models/Character');
const Artifact = require('../src/models/Artifact');
const ForceCard = require('../src/models/ForceCard');
const News = require('../src/models/News');

// MinIO helpers
const { uploadFile, BUCKET_NAME, getFileUrl } = require('../services/minio');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const isAbsolute = (url = '') => /^https?:\/\//i.test(url);

const normalizeObjectName = (url) => {
    if (!url) return null;
    let obj = url;

    if (isAbsolute(url)) {
        try {
            const parsed = new URL(url);
            obj = parsed.pathname || '';
        } catch (_) {
            obj = url;
        }
    }

    return obj
        .replace(/^https?:\/\//i, '')
        .replace(/^\/+/, '')
        .replace(new RegExp(`^${BUCKET_NAME}/`), '')
        .replace(/^assets\//i, '')
        .replace(new RegExp(`^[^/]+/${BUCKET_NAME}/`), '')
        .replace(/^[^/]*\.[^/]+\/(.*)/, '$1') // drop hostname if present
        .replace(/^assets\//i, '');
};

const guessLocalPath = (objectName) => {
    if (!objectName) return null;
    const base = path.join(__dirname, '../../client/dist');
    const candidates = [
        path.join(base, 'assets', objectName),
        path.join(base, objectName),
    ];
    return candidates.find((p) => fs.existsSync(p)) || null;
};

const headExists = async (url) => {
    try {
        const res = await axios.head(url, { validateStatus: () => true, timeout: 5000 });
        return res.status >= 200 && res.status < 400;
    } catch (_) {
        return false;
    }
};

const fetchFromSource = async (objectName) => {
    const base = process.env.SOURCE_ASSET_BASE || 'https://seiyaexcompanion.games4fun.io/assets';
    const url = `${base.replace(/\/+$/, '')}/${objectName}`;
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer', validateStatus: () => true, timeout: 10000 });
        if (res.status >= 200 && res.status < 300 && res.data) {
            return { buffer: Buffer.from(res.data), url };
        }
    } catch (_) {
        // ignore
    }
    return null;
};

const processUrl = async (label, docId, url, updates) => {
    const objectName = normalizeObjectName(url);
    if (!objectName) return null;

    const publicUrl = getFileUrl(objectName);
    const exists = await headExists(publicUrl);
    if (exists) return null;

    let buffer = null;
    let source = null;

    const localPath = guessLocalPath(objectName);
    if (localPath) {
        buffer = fs.readFileSync(localPath);
        source = localPath;
    } else {
        const fetched = await fetchFromSource(objectName);
        if (fetched) {
            buffer = fetched.buffer;
            source = fetched.url;
        }
    }

    if (!buffer) {
        updates.missing.push({ docId, label, objectName, reason: 'file_not_found_locally_or_source' });
        return null;
    }

    const ext = path.extname(localPath || objectName).toLowerCase();
    const mimeMap = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    await uploadFile(objectName, buffer, { 'Content-Type': contentType });
    updates.uploaded.push({ docId, label, objectName, source, publicUrl });
    return publicUrl;
};

const updateCharacters = async (updates) => {
    const docs = await Character.find();
    for (const doc of docs) {
        let changed = false;

        const img = await processUrl('character.imageUrl', doc._id, doc.imageUrl, updates);
        if (img) { doc.imageUrl = img; changed = true; }

        const avatar = await processUrl('character.avatarUrl', doc._id, doc.avatarUrl, updates);
        if (avatar) { doc.avatarUrl = avatar; changed = true; }

        if (Array.isArray(doc.skills)) {
            let skillsChanged = false;
            doc.skills = await Promise.all(doc.skills.map(async (skill) => {
                if (skill && skill.iconUrl) {
                    const icon = await processUrl('character.skills.iconUrl', doc._id, skill.iconUrl, updates);
                    if (icon) {
                        skillsChanged = true;
                        return { ...skill.toObject?.() ?? skill, iconUrl: icon };
                    }
                }
                return skill;
            }));
            if (skillsChanged) {
                doc.markModified('skills');
                changed = true;
            }
        }

        if (changed) await doc.save();
    }
};

const updateArtifacts = async (updates) => {
    const docs = await Artifact.find();
    for (const doc of docs) {
        const img = await processUrl('artifact.imageUrl', doc._id, doc.imageUrl, updates);
        if (img) {
            doc.imageUrl = img;
            await doc.save();
        }
    }
};

const updateForceCards = async (updates) => {
    const docs = await ForceCard.find();
    for (const doc of docs) {
        const img = await processUrl('forcecard.imageUrl', doc._id, doc.imageUrl, updates);
        if (img) {
            doc.imageUrl = img;
            await doc.save();
        }
    }
};

const updateNews = async (updates) => {
    const docs = await News.find();
    for (const doc of docs) {
        const thumb = await processUrl('news.thumbnailUrl', doc._id, doc.thumbnailUrl, updates);
        if (thumb) {
            doc.thumbnailUrl = thumb;
            await doc.save();
        }
    }
};

const run = async () => {
    const updates = { uploaded: [], missing: [] };
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        await updateCharacters(updates);
        await updateArtifacts(updates);
        await updateForceCards(updates);
        await updateNews(updates);

        console.log(`Uploaded ${updates.uploaded.length} missing assets.`);
        console.log(`Still missing ${updates.missing.length} (no local file found).`);
        if (updates.missing.length) {
            console.table(updates.missing.slice(0, 10));
            if (updates.missing.length > 10) {
                console.log(`...and ${updates.missing.length - 10} more`);
            }
        }
    } catch (err) {
        console.error('Error during fillMissingAssets:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
};

if (require.main === module) {
    run();
}

module.exports = { run };

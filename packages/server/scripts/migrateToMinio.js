const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { minioClient, BUCKET_NAME, uploadFile, fileExists } = require('../services/minio');
const { optimizeImage } = require('../services/imageOptimizer');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ASSETS_DIR = path.join(__dirname, '../../client/public/assets');

const walk = function (dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

const migrate = async () => {
    console.log('Starting migration to MinIO...');

    // Ensure bucket exists (it should be handled by service import, but let's wait a bit)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Promise((resolve, reject) => {
        walk(ASSETS_DIR, async (err, files) => {
            if (err) return reject(err);

            console.log(`Found ${files.length} files to migrate.`);

            const BATCH_SIZE = 20;
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                const batch = files.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (file) => {
                    // Get relative path from assets dir
                    const relativePath = path.relative(ASSETS_DIR, file);
                    // Object name in MinIO (keep structure)
                    const objectName = relativePath; // e.g., resources/characters/foo.png

                    // Check if file exists in MinIO
                    const exists = await fileExists(objectName);
                    if (exists) {
                        // console.log(`Skipping ${objectName} (already exists)`);
                        return;
                    }

                    try {
                        const buffer = fs.readFileSync(file);

                        // Optimize if image
                        let finalBuffer = buffer;
                        const ext = path.extname(file).toLowerCase();
                        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                            console.log(`Optimizing ${relativePath}...`);
                            // Determine format based on extension
                            const format = ext.replace('.', '') === 'jpg' ? 'jpeg' : ext.replace('.', '');
                            finalBuffer = await optimizeImage(buffer, {
                                width: 1024,
                                format: format
                            });
                        }

                        await uploadFile(objectName, finalBuffer, {
                            'Content-Type': getContentType(ext)
                        });
                        console.log(`Uploaded ${objectName}`);
                    } catch (e) {
                        console.error(`Failed to upload ${relativePath}:`, e);
                    }
                }));
            }
            console.log('Migration complete.');
            resolve();
        });
    });
};

const getContentType = (ext) => {
    switch (ext) {
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.webp': return 'image/webp';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
};

if (require.main === module) {
    migrate()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { migrate };

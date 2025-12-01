const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { minioClient, BUCKET_NAME, uploadFile } = require('../services/minio');
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

    walk(ASSETS_DIR, async (err, files) => {
        if (err) throw err;

        console.log(`Found ${files.length} files to migrate.`);

        for (const file of files) {
            // Get relative path from assets dir
            const relativePath = path.relative(ASSETS_DIR, file);
            // Object name in MinIO (keep structure)
            const objectName = relativePath; // e.g., resources/characters/foo.png

            try {
                const buffer = fs.readFileSync(file);

                // Optimize if image
                let finalBuffer = buffer;
                const ext = path.extname(file).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    console.log(`Optimizing ${relativePath}...`);
                    finalBuffer = await optimizeImage(buffer, {
                        width: 1024, // Max width example
                        format: 'webp' // Convert to webp
                    });
                    // Change extension to webp for the object name if we converted
                    // But wait, if we change extension, we break DB references.
                    // For now, let's keep original extension or update DB.
                    // Updating DB is complex. Let's just optimize but keep format if possible, 
                    // or just optimize size/quality and keep format.
                    // The optimizer service I wrote converts to webp by default if not specified.
                    // Let's modify the call to respect original format or just use webp and we might need to update DB?
                    // The user said "image optimization".
                    // If I change to webp, I must update DB.
                    // Let's stick to optimizing size but keeping format for now to avoid DB mess, 
                    // unless I want to do a full migration.
                    // Actually, my optimizer defaults to webp.
                    // Let's pass the format explicitly.
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
        }
        console.log('Migration complete.');
        process.exit(0);
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

migrate();

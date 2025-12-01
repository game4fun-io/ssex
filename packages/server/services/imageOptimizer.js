const sharp = require('sharp');

const optimizeImage = async (buffer, options = {}) => {
    try {
        const { width, height, quality = 80, format = 'webp' } = options;

        let pipeline = sharp(buffer);

        if (width || height) {
            pipeline = pipeline.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        if (format === 'webp') {
            pipeline = pipeline.webp({ quality });
        } else if (format === 'jpeg' || format === 'jpg') {
            pipeline = pipeline.jpeg({ quality });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality });
        }

        return await pipeline.toBuffer();
    } catch (err) {
        console.error('Error optimizing image:', err);
        throw err;
    }
};

module.exports = {
    optimizeImage
};

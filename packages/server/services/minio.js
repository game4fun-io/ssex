const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'ssex-images';

// Ensure bucket exists
const ensureBucket = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`Bucket ${BUCKET_NAME} created successfully.`);

            // Set bucket policy to public read
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
            console.log(`Bucket ${BUCKET_NAME} policy set to public read.`);
        }
    } catch (err) {
        console.error('Error ensuring bucket exists:', err);
    }
};

// Initialize bucket on startup
ensureBucket();

const uploadFile = async (objectName, buffer, metaData = {}) => {
    try {
        await minioClient.putObject(BUCKET_NAME, objectName, buffer, metaData);
        // Return the public URL
        // Note: In a real production setup with a domain, this would be different.
        // For local docker-compose, we might need to return a relative path or a proxy path.
        // Assuming the client can access MinIO directly or via a proxy.
        // Let's return a relative path that the client can prefix or a full URL if we know the public endpoint.
        // For now, let's return the object name, and we can construct the URL in the API response or frontend.
        return objectName;
    } catch (err) {
        console.error('Error uploading file to MinIO:', err);
        throw err;
    }
};

const getFileUrl = async (objectName) => {
    try {
        // Presigned URL for temporary access if needed, but we made it public.
        // So we can just construct the URL.
        // If running in docker, 'localhost' might work for the host machine, but 'minio' for internal.
        // We need to know where the client is accessing from.
        // Let's assume the client accesses via the same host/port as configured.
        const protocol = 'http';
        const host = process.env.MINIO_PUBLIC_HOST || 'localhost';
        const port = process.env.MINIO_API_PORT || 9000;
        return `${protocol}://${host}:${port}/${BUCKET_NAME}/${objectName}`;
    } catch (err) {
        console.error('Error getting file URL:', err);
        throw err;
    }
};

const deleteFile = async (objectName) => {
    try {
        await minioClient.removeObject(BUCKET_NAME, objectName);
    } catch (err) {
        console.error('Error deleting file from MinIO:', err);
        throw err;
    }
};

const fileExists = async (objectName) => {
    try {
        await minioClient.statObject(BUCKET_NAME, objectName);
        return true;
    } catch (err) {
        if (err.code === 'NotFound') return false;
        return false;
    }
};

module.exports = {
    minioClient,
    uploadFile,
    getFileUrl,
    deleteFile,
    fileExists,
    BUCKET_NAME
};

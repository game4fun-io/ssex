// Prefer an absolute base so the client (on a different port) hits the API server for assets
const defaultAssetBase = (() => {
    if (process.env.ASSET_BASE_URL) return process.env.ASSET_BASE_URL.replace(/\/+$/, '');
    const route = process.env.ASSET_ROUTE || '/assets';
    const port = process.env.PORT || 5000;
    const normalizedRoute = route.startsWith('http') ? route : `/${route.replace(/^\/+/, '').replace(/\/+$/, '')}`;
    if (normalizedRoute.startsWith('http')) return normalizedRoute.replace(/\/+$/, '');
    // Return relative path by default so client resolves it against its own origin
    return normalizedRoute;
})();

const buildLocalAssetUrl = (url) => {
    if (!url) return url;

    // Strip seiya2 host or duplicated /assets prefixes
    const seiyaHost = /^https?:\/\/seiya2\.vercel\.app\//i;
    let assetPath = null;

    if (seiyaHost.test(url)) {
        assetPath = url.replace(seiyaHost, '');
    }

    if (!assetPath && /^\/?assets\//i.test(url)) {
        assetPath = url.replace(/^\/?assets\//i, '');
    }

    // If still no asset path, and the URL is absolute but same path structure, try removing origin
    if (!assetPath) {
        const parsed = url.match(/^https?:\/\/[^/]+\/(.+)$/i);
        if (parsed && parsed[1]) {
            assetPath = parsed[1];
        }
    }

    if (!assetPath) return url;

    // Remove redundant leading pieces so we don't end up with /assets/assets/...
    assetPath = assetPath.replace(/^\/?assets\//i, '').replace(/^\//, '');

    // Use MinIO URL if configured
    if (process.env.MINIO_ENDPOINT) {
        const protocol = process.env.MINIO_PUBLIC_PROTOCOL || 'http';
        const host = process.env.MINIO_PUBLIC_HOST || 'localhost';
        const port = process.env.MINIO_API_PORT || 9000;
        const bucket = process.env.MINIO_BUCKET || 'ssex-images';
        // If port is 80 or 443, we can omit it for cleaner URLs, but keeping it is safe.
        // However, if using a domain like cdn.example.com, port 9000 might not be exposed directly.
        // Usually behind a reverse proxy, port would be standard.
        // If MINIO_PUBLIC_PORT is defined, use it. If not, and host is localhost, use API port.
        // If host is a domain, maybe we shouldn't append port 9000 by default?
        // Let's stick to the previous logic but allow overriding port for public url.
        const publicPort = process.env.MINIO_PUBLIC_PORT || port;

        // If public port is 80 or 443, don't show it
        const portStr = (publicPort == 80 || publicPort == 443) ? '' : `:${publicPort}`;

        return `${protocol}://${host}${portStr}/${bucket}/${assetPath}`;
    }

    const base = defaultAssetBase || '/assets';
    const normalizedBase = base.startsWith('http')
        ? base.replace(/\/+$/, '')
        : `/${base.replace(/^\/+/, '').replace(/\/+$/, '')}`;

    return `${normalizedBase}/${assetPath}`.replace(/([^:])\/\/+/, '$1/');
};

const cloneDoc = (doc) => {
    if (!doc) return doc;
    if (typeof doc.toObject === 'function') return doc.toObject();
    return JSON.parse(JSON.stringify(doc));
};

const mapCharacterAssets = (character) => {
    const obj = cloneDoc(character);
    if (!obj) return obj;

    obj.imageUrl = buildLocalAssetUrl(obj.imageUrl);
    obj.avatarUrl = buildLocalAssetUrl(obj.avatarUrl);

    if (Array.isArray(obj.skills)) {
        obj.skills = obj.skills.map((skill) => ({
            ...skill,
            iconUrl: buildLocalAssetUrl(skill?.iconUrl)
        }));
    }

    return obj;
};

const mapArtifactAssets = (artifact) => {
    const obj = cloneDoc(artifact);
    if (!obj) return obj;
    obj.imageUrl = buildLocalAssetUrl(obj.imageUrl);
    return obj;
};

const mapForceCardAssets = (card) => {
    const obj = cloneDoc(card);
    if (!obj) return obj;
    obj.imageUrl = buildLocalAssetUrl(obj.imageUrl);
    return obj;
};

module.exports = {
    buildLocalAssetUrl,
    mapCharacterAssets,
    mapArtifactAssets,
    mapForceCardAssets,
};

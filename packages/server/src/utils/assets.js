const { getFileUrl } = require('../../services/minio');

// Convert any stored path/object name to a public URL. Absolute URLs are returned as-is.
const toPublicUrl = (url) => {
    if (!url) return url;
    return getFileUrl(url);
};

const cloneDoc = (doc) => {
    if (!doc) return doc;
    if (typeof doc.toObject === 'function') return doc.toObject();
    return JSON.parse(JSON.stringify(doc));
};

const mapCharacterAssets = (character) => {
    const obj = cloneDoc(character);
    if (!obj) return obj;

    obj.imageUrl = toPublicUrl(obj.imageUrl);
    obj.avatarUrl = toPublicUrl(obj.avatarUrl);

    if (Array.isArray(obj.skills)) {
        obj.skills = obj.skills.map((skill) => ({
            ...skill,
            iconUrl: toPublicUrl(skill?.iconUrl)
        }));
    }

    return obj;
};

const mapArtifactAssets = (artifact) => {
    const obj = cloneDoc(artifact);
    if (!obj) return obj;
    obj.imageUrl = toPublicUrl(obj.imageUrl);
    return obj;
};

const mapForceCardAssets = (card) => {
    const obj = cloneDoc(card);
    if (!obj) return obj;
    obj.imageUrl = toPublicUrl(obj.imageUrl);
    return obj;
};

module.exports = {
    toPublicUrl,
    mapCharacterAssets,
    mapArtifactAssets,
    mapForceCardAssets,
};

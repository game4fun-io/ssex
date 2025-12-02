import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ArtifactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { canEdit } = useAuth();
    const [artifact, setArtifact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedArtifact, setEditedArtifact] = useState(null);
    const [editLang, setEditLang] = useState('en'); // Default editing language

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    // Helper to get localized string for editing
    const getEditLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[editLang] || '';
    };

    const updateLoc = (value, field, obj = editedArtifact) => {
        const currentLoc = obj[field] || {};
        const newLoc = typeof currentLoc === 'string' ? { [editLang]: value, en: currentLoc } : { ...currentLoc, [editLang]: value };
        return newLoc;
    };

    const handleSave = async () => {
        try {
            await api.patch(`/admin/update/artifact/${artifact._id}`, editedArtifact);
            setArtifact(editedArtifact);
            setIsEditing(false);
            alert('Artifact updated successfully!');
        } catch (err) {
            console.error('Error updating artifact:', err);
            alert('Failed to update artifact.');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditedArtifact({ ...editedArtifact, imageUrl: res.data.filePath });
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        }
    };

    const handleChange = (e, field) => {
        setEditedArtifact({ ...editedArtifact, [field]: e.target.value });
    };

    const handleLocChange = (e, field) => {
        setEditedArtifact({ ...editedArtifact, [field]: updateLoc(e.target.value, field) });
    };

    const handleTagChange = (e, index, field) => {
        const newTags = [...editedArtifact.tags];
        if (field === 'name') {
            newTags[index] = { ...newTags[index], name: updateLoc(e.target.value, 'name', newTags[index]) };
        } else {
            newTags[index] = { ...newTags[index], [field]: e.target.value };
        }
        setEditedArtifact({ ...editedArtifact, tags: newTags });
    };

    const handleSkillChange = (e, index, field) => {
        const newSkills = [...editedArtifact.skills];
        newSkills[index] = { ...newSkills[index], [field]: updateLoc(e.target.value, field, newSkills[index]) };
        setEditedArtifact({ ...editedArtifact, skills: newSkills });
    };

    useEffect(() => {
        const fetchArtifact = async () => {
            try {
                // Since we don't have a direct ID endpoint yet, we fetch all and find (optimize later)
                // Or assuming /artifacts/:id endpoint exists. I should probably add it to server.
                // For now, let's assume the list endpoint returns all and we filter client side or add endpoint.
                // Actually, let's add the endpoint to server first or just use list.
                // Using list for now to be safe.
                const res = await api.get('/artifacts');
                const found = res.data.find(a => a.id.toString() === id || a._id === id);
                setArtifact(found);
                setEditedArtifact(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtifact();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!artifact) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Artifact not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/artifacts')} className="text-yellow-500 hover:text-yellow-400 transition">
                        &larr; {t('backToArtifacts')}
                    </button>
                    {canEdit && (
                        <div className="flex gap-4 items-center">
                            {isEditing && (
                                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                                    <span className="text-xs text-gray-400">Editing Lang:</span>
                                    <select
                                        value={editLang}
                                        onChange={(e) => setEditLang(e.target.value)}
                                        className="bg-gray-700 text-white text-xs p-1 rounded border border-gray-600"
                                    >
                                        <option value="en">English</option>
                                        <option value="pt">Portuguese</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="cn">Chinese</option>
                                        <option value="id">Indonesian</option>
                                        <option value="th">Thai</option>
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded font-bold transition ${isEditing ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white`}
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0 relative">
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <img src={editedArtifact.imageUrl} alt="Preview" className="w-64 h-64 object-contain mx-auto border border-gray-600 rounded bg-gray-900" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-64 text-xs text-gray-300"
                                />
                                <input
                                    type="text"
                                    value={editedArtifact.imageUrl}
                                    onChange={(e) => handleChange(e, 'imageUrl')}
                                    className="w-64 bg-gray-700 text-white p-1 rounded text-xs"
                                    placeholder="Image URL"
                                />
                            </div>
                        ) : (
                            artifact.imageUrl ? (
                                <img src={artifact.imageUrl} alt={getLoc(artifact.name)} className="w-64 h-64 object-contain mx-auto" />
                            ) : (
                                <div className="w-64 h-64 bg-gray-700 flex items-center justify-center rounded">No Image</div>
                            )
                        )}
                    </div>

                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={getEditLoc(editedArtifact.name)}
                                    onChange={(e) => handleLocChange(e, 'name')}
                                    className="text-4xl font-bold text-white bg-gray-700 rounded p-2 w-full mr-4"
                                    placeholder={`Name (${editLang})`}
                                />
                            ) : (
                                <h1 className="text-4xl font-bold text-yellow-500">{getLoc(artifact.name)}</h1>
                            )}

                            {isEditing ? (
                                <select
                                    value={editedArtifact.rarity}
                                    onChange={(e) => handleChange(e, 'rarity')}
                                    className="px-3 py-1 rounded text-sm font-bold bg-gray-700 text-white border border-gray-600"
                                >
                                    <option value="UR">UR</option>
                                    <option value="SSR">SSR</option>
                                    <option value="SR">SR</option>
                                    <option value="R">R</option>
                                    <option value="N">N</option>
                                </select>
                            ) : (
                                <span className={`px-3 py-1 rounded text-sm font-bold ${artifact.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                    artifact.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                        artifact.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                            artifact.rarity === 'R' ? 'bg-blue-600 text-white' :
                                                'bg-gray-600 text-white'
                                    }`}>{artifact.rarity}</span>
                            )}
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            {/* Faction Tag (if exists) */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={getEditLoc(editedArtifact.faction)}
                                    onChange={(e) => handleLocChange(e, 'faction')}
                                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 w-32"
                                    placeholder={`Faction (${editLang})`}
                                />
                            ) : (
                                artifact.faction && (
                                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600">
                                        {getLoc(artifact.faction)}
                                    </span>
                                )
                            )}

                            {/* Other Tags */}
                            {isEditing ? (
                                editedArtifact.tags.map((tag, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={getEditLoc(tag.name)}
                                            onChange={(e) => handleTagChange(e, idx, 'name')}
                                            className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 w-24 text-xs"
                                            placeholder="Tag"
                                        />
                                        <input
                                            type="number"
                                            value={tag.style}
                                            onChange={(e) => handleTagChange(e, idx, 'style')}
                                            className="bg-gray-700 text-white px-1 py-1 rounded border border-gray-600 w-12 text-xs"
                                            placeholder="Style"
                                        />
                                    </div>
                                ))
                            ) : (
                                artifact.tags && artifact.tags.map((tag, idx) => {
                                    let styleClass = "bg-gray-600 text-gray-400 border-gray-500";
                                    if (tag.style === 3) styleClass = "bg-green-700 text-white border-green-600"; // Green
                                    if (tag.style === 1) styleClass = "bg-yellow-700 text-white border-yellow-600"; // Dark Yellow

                                    return (
                                        <span key={idx} className={`px-3 py-1 rounded border ${styleClass}`}>
                                            {getLoc(tag.name)}
                                        </span>
                                    );
                                })
                            )}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">{t('artifactEffect')}</h2>
                            {isEditing ? (
                                <textarea
                                    value={getEditLoc(editedArtifact.effect)}
                                    onChange={(e) => handleLocChange(e, 'effect')}
                                    className="w-full bg-gray-700 text-white p-2 rounded h-32"
                                    placeholder={`Effect Description (${editLang})`}
                                />
                            ) : (
                                <p className="text-gray-300 text-lg leading-relaxed">{getLoc(artifact.effect)}</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">{t('artifactProgression')}</h2>
                            {artifact.skills && artifact.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {editedArtifact.skills.map((skill, idx) => (
                                        <div key={idx} className="bg-gray-700 p-4 rounded border border-gray-600">
                                            <h3 className="text-yellow-500 font-bold mb-1">{skill.level} Star{skill.level > 1 ? 's' : ''}</h3>
                                            {isEditing ? (
                                                <textarea
                                                    value={getEditLoc(skill.description)}
                                                    onChange={(e) => handleSkillChange(e, idx, 'description')}
                                                    className="w-full bg-gray-800 text-white p-2 rounded text-sm"
                                                    placeholder={`Skill Description (${editLang})`}
                                                />
                                            ) : (
                                                <p className="text-gray-300">{getLoc(skill.description)}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-700 p-4 rounded text-gray-400 italic">
                                    No progression data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtifactDetail;

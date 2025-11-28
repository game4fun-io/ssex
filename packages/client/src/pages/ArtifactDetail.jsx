import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const ArtifactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [artifact, setArtifact] = useState(null);
    const [loading, setLoading] = useState(true);

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
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
                <button onClick={() => navigate('/artifacts')} className="mb-6 text-yellow-500 hover:text-yellow-400 transition">
                    &larr; {t('backToArtifacts')}
                </button>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        {artifact.imageUrl ? (
                            <img src={artifact.imageUrl} alt={getLoc(artifact.name)} className="w-64 h-64 object-contain mx-auto" />
                        ) : (
                            <div className="w-64 h-64 bg-gray-700 flex items-center justify-center rounded">No Image</div>
                        )}
                    </div>

                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl font-bold text-yellow-500">{getLoc(artifact.name)}</h1>
                            <span className={`px-3 py-1 rounded text-sm font-bold ${artifact.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                artifact.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                    artifact.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                        artifact.rarity === 'R' ? 'bg-blue-600 text-white' :
                                            'bg-gray-600 text-white'
                                }`}>{artifact.rarity}</span>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            {/* Faction Tag (if exists) */}
                            {artifact.faction && (
                                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600">
                                    {getLoc(artifact.faction)}
                                </span>
                            )}

                            {/* Other Tags */}
                            {artifact.tags && artifact.tags.map((tag, idx) => {
                                let styleClass = "bg-gray-600 text-gray-400 border-gray-500";
                                if (tag.style === 3) styleClass = "bg-green-700 text-white border-green-600"; // Green
                                if (tag.style === 1) styleClass = "bg-yellow-700 text-white border-yellow-600"; // Dark Yellow

                                return (
                                    <span key={idx} className={`px-3 py-1 rounded border ${styleClass}`}>
                                        {getLoc(tag.name)}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">{t('artifactEffect')}</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">{getLoc(artifact.effect)}</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">{t('artifactProgression')}</h2>
                            {artifact.skills && artifact.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {artifact.skills.map((skill, idx) => (
                                        <div key={idx} className="bg-gray-700 p-4 rounded border border-gray-600">
                                            <h3 className="text-yellow-500 font-bold mb-1">{skill.level} Star{skill.level > 1 ? 's' : ''}</h3>
                                            <p className="text-gray-300">{getLoc(skill.description)}</p>
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

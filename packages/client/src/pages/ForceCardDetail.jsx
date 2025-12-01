import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const ForceCardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await api.get('/force-cards');
                const found = res.data.find(c => c.id.toString() === id || c._id === id);
                setCard(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!card) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Force Card not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <button onClick={() => navigate('/force-cards')} className="mb-6 text-yellow-500 hover:text-yellow-400 transition">
                    &larr; {t('backToForceCards')}
                </button>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                        {card.imageUrl ? (
                            <img src={card.imageUrl} alt={getLoc(card.name)} className="w-64 h-64 object-contain mx-auto" />
                        ) : (
                            <div className="w-64 h-64 bg-gray-700 flex items-center justify-center rounded">No Image</div>
                        )}
                    </div>

                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl font-bold text-yellow-500">{getLoc(card.name)}</h1>
                            <span className={`px-3 py-1 rounded text-sm font-bold ${['UR', 'SSR', 'Legendary'].includes(card.rarity) ? 'bg-red-900 text-white border border-red-700' :
                                    ['SR', 'Epic'].includes(card.rarity) ? 'bg-purple-600 text-white' :
                                        ['R', 'Rare'].includes(card.rarity) ? 'bg-blue-600 text-white' :
                                            ['N', 'Uncommon'].includes(card.rarity) ? 'bg-green-600 text-white' :
                                                'bg-gray-600 text-white'
                                }`}>{card.rarity}</span>
                        </div>

                        <div className="mb-6 space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex flex-wrap gap-4 border-b border-gray-700 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Level:</span>
                                    <span className="text-white font-bold text-lg">{card.level || 1}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Stars:</span>
                                    <span className="text-yellow-500 font-bold text-lg">{'★'.repeat(card.stars || 0)}</span>
                                </div>
                                {card.tags && card.tags.length > 0 && (
                                    <div className="flex gap-2">
                                        {card.tags.map((tag, i) => (
                                            <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300 border border-gray-600 flex items-center">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-900/50 p-2 rounded text-center">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">HP</p>
                                    <p className="text-white font-bold">{card.stats?.hp || 0}</p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded text-center">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">ATK</p>
                                    <p className="text-white font-bold">{card.stats?.atk || 0}</p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded text-center">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">P.DEF</p>
                                    <p className="text-white font-bold">{card.stats?.pdef || 0}</p>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded text-center">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">M.DEF</p>
                                    <p className="text-white font-bold">{card.stats?.mdef || 0}</p>
                                </div>
                            </div>
                        </div>



                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">{t('artifactEffect')}</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">{getLoc(card.skill.description)}</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">{t('artifactProgression')}</h2>
                            {card.skills && card.skills.length > 0 ? (
                                <div className="space-y-4">
                                    {card.skills.map((skill, idx) => (
                                        <div key={idx} className="bg-gray-700 p-4 rounded border border-gray-600">
                                            <h3 className="text-yellow-500 font-bold mb-1">{skill.level} Star{skill.level > 1 ? 's' : ''}</h3>
                                            <p className="text-gray-300">{getLoc(skill.description)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No progression data available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForceCardDetail;

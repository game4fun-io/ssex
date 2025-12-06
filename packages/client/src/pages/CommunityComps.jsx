import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';

const CommunityComps = () => {
    const { t } = useTranslation();
    const [comps, setComps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComps = async () => {
            try {
                const res = await api.get('/community-comps');
                setComps(res.data);
            } catch (err) {
                console.error('Error fetching comps:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComps();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20 pt-20">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-yellow-500">{t('visualGuide.title')}</h1>
                    <Link to="/team-builder" className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold transition">
                        + {t('visualGuide.createComp')}
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">{t('loading')}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {comps.map((comp, idx) => (
                            <motion.div
                                key={comp._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition shadow-lg"
                            >
                                <Link to={`/community-comps/${comp._id}`} className="block p-6">
                                    <h2 className="text-xl font-bold text-white mb-2">{comp.title}</h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {comp.tags.map((tag, i) => (
                                            <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex -space-x-2 mb-4 overflow-hidden">
                                        {comp.characters.slice(0, 5).map((entry, i) => (
                                            <img
                                                key={i}
                                                src={entry.character?.imageUrl}
                                                alt={entry.character?.name?.en || 'Char'}
                                                className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover"
                                            />
                                        ))}
                                        {comp.characters.length > 5 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white">
                                                +{comp.characters.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-400">
                                        <span>{t('visualGuide.byAuthor', { author: comp.author })}</span>
                                        <span className="flex items-center gap-1">🔥 {comp.likes}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AdUnit slot="community-comps-bottom" />
            </div>
        </div>
    );
};

export default CommunityComps;

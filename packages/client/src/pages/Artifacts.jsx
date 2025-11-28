import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const Artifacts = () => {
    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchArtifacts = async () => {
            try {
                const res = await api.get('/artifacts');
                setArtifacts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtifacts();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">Artifacts</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artifacts.map(art => (
                        <div key={art._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition">
                            <h2 className="text-xl font-bold text-white mb-2">{art.name}</h2>
                            <span className="bg-purple-600 text-xs font-bold px-2 py-1 rounded mb-4 inline-block">{art.rarity}</span>
                            <p className="text-gray-400 text-sm mb-2"><span className="text-yellow-500">Type:</span> {art.type}</p>
                            <p className="text-gray-300 text-sm">{art.effect}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Artifacts;

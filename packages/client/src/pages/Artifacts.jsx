import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const Artifacts = () => {
    const [artifacts, setArtifacts] = useState([]);
    const [filteredArtifacts, setFilteredArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        rarity: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [options, setOptions] = useState({
        rarities: [],
        types: []
    });

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    useEffect(() => {
        const fetchArtifacts = async () => {
            try {
                const res = await api.get('/artifacts');
                const order = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
                const sorted = (res.data || []).slice().sort((a, b) => (order[b.rarity] || 0) - (order[a.rarity] || 0));
                setArtifacts(sorted);
                setFilteredArtifacts(sorted);

                const uniqueRarities = [...new Set(res.data.map(a => a.rarity))].filter(Boolean).sort();
                setOptions({
                    rarities: uniqueRarities
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtifacts();
    }, [i18n.language]);

    useEffect(() => {
        let result = artifacts;

        if (searchTerm.length >= 3) {
            result = result.filter(a => getLoc(a.name).toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filters.rarity) result = result.filter(a => a.rarity === filters.rarity);
        if (filters.rarity) result = result.filter(a => a.rarity === filters.rarity);

        setFilteredArtifacts(result);
    }, [filters, artifacts, searchTerm, i18n.language]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearFilters = () => {
        setFilters({ rarity: '' });
        setSearchTerm('');
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('artifacts')}</h1>

                {/* Filters */}
                <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700 space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder={t('searchArtifactsPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('rarity')}</label>
                            <select name="rarity" value={filters.rarity} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none min-w-[100px]">
                                <option value="">{t('all')}</option>
                                {options.rarities.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <button onClick={clearFilters} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm border border-gray-600 transition h-[38px]">{t('clear')}</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArtifacts.map(art => (
                        <div key={art._id}
                            onClick={() => navigate(`/artifacts/${art.id}`)}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition flex flex-col h-full cursor-pointer relative">

                            {/* Rarity Badge - Top Right */}
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${art.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                    art.rarity === 'SSR' ? 'bg-yellow-600 text-white border border-yellow-500' :
                                        art.rarity === 'SR' ? 'bg-purple-600 text-white border border-purple-500' :
                                            art.rarity === 'R' ? 'bg-blue-600 text-white border border-blue-500' :
                                                'bg-gray-600 text-white border border-gray-500'
                                }`}>
                                {art.rarity}
                            </span>

                            {art.imageUrl && (
                                <div className="flex justify-center mb-4">
                                    <img src={art.imageUrl} alt={getLoc(art.name)} className="w-24 h-24 object-contain" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-white">{getLoc(art.name)}</h2>
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2">
                                {/* Faction Tag (if exists) */}
                                {art.faction && (
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
                                        {getLoc(art.faction)}
                                    </span>
                                )}

                                {/* Other Tags */}
                                {art.tags && art.tags.map((tag, idx) => {
                                    let styleClass = "bg-gray-600 text-gray-400 border-gray-500";
                                    if (tag.style === 3) styleClass = "bg-green-700 text-white border-green-600"; // Green
                                    if (tag.style === 1) styleClass = "bg-yellow-700 text-white border-yellow-600"; // Dark Yellow

                                    return (
                                        <span key={idx} className={`text-xs px-2 py-1 rounded border ${styleClass}`}>
                                            {getLoc(tag.name)}
                                        </span>
                                    );
                                })}
                            </div>

                            <div className="flex-grow">
                                <p className="text-gray-400 text-sm line-clamp-3">{getLoc(art.effect)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Artifacts;

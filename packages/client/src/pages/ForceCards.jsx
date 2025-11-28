import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ForceCards = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    const [filters, setFilters] = useState({
        rarity: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [options, setOptions] = useState({
        rarities: []
    });

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await api.get('/force-cards');
                setCards(res.data);
                setFilteredCards(res.data);

                const uniqueRarities = [...new Set(res.data.map(c => c.rarity))].filter(Boolean).sort();
                setOptions({
                    rarities: uniqueRarities
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, [i18n.language]);

    useEffect(() => {
        let result = cards;

        if (searchTerm.length >= 3) {
            result = result.filter(c => getLoc(c.name).toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filters.rarity) result = result.filter(c => c.rarity === filters.rarity);

        setFilteredCards(result);
    }, [filters, cards, searchTerm, i18n.language]);

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
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('forceCards')}</h1>

                {/* Filters */}
                <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700 space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder={t('searchForceCardsPlaceholder')}
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
                    {filteredCards.map(card => (
                        <div key={card._id}
                            onClick={() => navigate(`/force-cards/${card.id}`)}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition flex flex-col h-full cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-white">{getLoc(card.name)}</h2>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${card.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                    card.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                        card.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                            card.rarity === 'R' ? 'bg-blue-600 text-white' :
                                                'bg-gray-600 text-white'
                                    }`}>{card.rarity}</span>
                            </div>

                            {card.imageUrl && (
                                <div className="mb-4 flex justify-center">
                                    <img src={card.imageUrl} alt={getLoc(card.name)} className="h-24 object-contain" />
                                </div>
                            )}

                            <div className="mb-4 space-y-1">
                                {card.stats.hp > 0 && <p className="text-gray-400 text-xs">HP: <span className="text-white">{card.stats.hp}</span></p>}
                                {card.stats.atk > 0 && <p className="text-gray-400 text-xs">ATK: <span className="text-white">{card.stats.atk}</span></p>}
                                {card.stats.def > 0 && <p className="text-gray-400 text-xs">DEF: <span className="text-white">{card.stats.def}</span></p>}
                            </div>

                            <div className="flex-grow border-t border-gray-700 pt-4 mt-2">
                                <h3 className="text-yellow-500 font-bold text-sm mb-1">{getLoc(card.skill.name)}</h3>
                                <p className="text-gray-300 text-xs">{getLoc(card.skill.description)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ForceCards;

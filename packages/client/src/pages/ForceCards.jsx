import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ForceCards = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const { canEdit } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ rarity: '' });
    const [options, setOptions] = useState({ rarities: [] });

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await api.get('/force-cards');
                setCards(res.data);
                setFilteredCards(res.data);
                const uniqueRarities = [...new Set(res.data.map(c => c.rarity))].filter(Boolean).sort();
                setOptions({ rarities: uniqueRarities });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    useEffect(() => {
        let result = cards;
        if (searchTerm.length >= 3) {
            result = result.filter(c => getLoc(c.name).toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filters.rarity) {
            result = result.filter(c => c.rarity === filters.rarity);
        }
        setFilteredCards(result);
    }, [searchTerm, filters, cards, i18n.language]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const clearFilters = () => {
        setFilters({ rarity: '' });
        setSearchTerm('');
    };

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };
    const toggleVisibility = async (e, card) => {
        e.stopPropagation(); // Prevent navigation
        if (!canEdit) return;

        try {
            const newVisibility = !card.isVisible;
            await api.patch(`/admin/update/force-card/${card._id}`, { isVisible: newVisibility });

            // Update local state
            const updateList = (list) => list.map(c => c._id === card._id ? { ...c, isVisible: newVisibility } : c);
            setCards(prev => updateList(prev));
            setFilteredCards(prev => updateList(prev));
        } catch (err) {
            console.error('Error updating visibility:', err);
            alert('Failed to update visibility');
        }
    };

    // ... (existing useEffects and handlers)

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
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition flex flex-col h-full cursor-pointer relative">
                            {/* Rarity Badge - Top Right */}
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${['UR', 'SSR', 'Legendary'].includes(card.rarity) ? 'bg-red-900 text-white border border-red-700' :
                                ['SR', 'Epic'].includes(card.rarity) ? 'bg-purple-600 text-white' :
                                    ['R', 'Rare'].includes(card.rarity) ? 'bg-blue-600 text-white' :
                                        ['N', 'Uncommon'].includes(card.rarity) ? 'bg-green-600 text-white' :
                                            'bg-gray-600 text-white'
                                }`}>{card.rarity}</span>

                            {canEdit && (
                                <button
                                    onClick={(e) => toggleVisibility(e, card)}
                                    className={`absolute top-2 left-2 p-1.5 rounded text-xs font-bold ${card.isVisible ? 'bg-green-600/80 hover:bg-green-500' : 'bg-red-600/80 hover:bg-red-500'} text-white shadow-md transition backdrop-blur-sm z-10`}
                                    title={card.isVisible ? "Hide from users" : "Show to users"}
                                >
                                    {card.isVisible ? '👁️' : '🚫'}
                                </button>
                            )}
                            {!card.isVisible && !canEdit && (
                                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                                    👁️‍🗨️ Hidden
                                </div>
                            )}

                            {card.imageUrl && (
                                <div className="mb-4 flex justify-center mt-8">
                                    <img src={card.imageUrl} alt={getLoc(card.name)} className="h-24 object-contain" />
                                </div>
                            )}

                            <div className="mb-2 text-center">
                                <h2 className="text-xl font-bold text-white">{getLoc(card.name)}</h2>
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';
import { useAuth } from '../context/AuthContext';

const Characters = () => {
    const [characters, setCharacters] = useState([]);
    const [filteredCharacters, setFilteredCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const { canEdit } = useAuth();

    // Filters
    const [filters, setFilters] = useState({
        rarity: '',
        faction: '',
        positioning: '',
        combatPosition: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Dynamic Filter Options
    const [options, setOptions] = useState({
        rarities: [],
        factions: [],
        positionings: [],
        combatPositions: [],
        attackTypes: []
    });

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await api.get('/characters?v=1.6.12');
                const order = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
                const sorted = (res.data || []).slice().sort((a, b) => (order[b.rarity] || 0) - (order[a.rarity] || 0));
                setCharacters(sorted);

                setFilteredCharacters(sorted);

                // Extract unique values for filters based on current language
                const uniqueRarities = ['N', 'R', 'SR', 'SSR', 'UR'];
                // We use stable keys now, but for the UI dropdowns we might want to iterate over available keys or just hardcode the known ones
                // For now, let's use the keys present in the data to be safe, or hardcode if we want specific order
                const uniqueFactions = [...new Set(res.data.map(c => c.factionKey))].filter(Boolean).sort();
                const uniquePositionings = ['front', 'mid', 'back']; // Stable rows
                const uniqueCombatPositions = [...new Set(res.data.map(c => c.roleKey))].filter(Boolean).sort();
                const uniqueAttackTypes = [...new Set(res.data.map(c => c.attackTypeKey))].filter(Boolean).sort();

                setOptions({
                    rarities: uniqueRarities,
                    factions: uniqueFactions,
                    positionings: uniquePositionings,
                    combatPositions: uniqueCombatPositions,
                    attackTypes: uniqueAttackTypes
                });

            } catch (err) {
                console.error('Error fetching characters:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [i18n.language]); // Re-run when language changes to update filter options

    useEffect(() => {
        let result = characters;


        // Search Filter (>= 3 chars)
        if (searchTerm.length >= 3) {
            result = result.filter(c => getLoc(c.name).toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filters.rarity) result = result.filter(c => c.rarity === filters.rarity);
        if (filters.faction) {

            result = result.filter(c => c.factionKey === filters.faction);
        }
        if (filters.positioning) {

            result = result.filter(c => c.row === filters.positioning); // Using row for positioning
        }
        if (filters.combatPosition) {

            result = result.filter(c => c.roleKey === filters.combatPosition);
        }


        setFilteredCharacters(result);
    }, [filters, characters, searchTerm, i18n.language]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearFilters = () => {
        setFilters({ rarity: '', faction: '', positioning: '', combatPosition: '' });
        setSearchTerm('');
    };

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        // Strict fallback: Current Lang -> English -> Empty (No random languages)
        return (data[lang] && data[lang].trim()) ? data[lang] : (data['en'] || '');
    };

    const toggleVisibility = async (e, char) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        if (!canEdit) return;

        try {
            const newVisibility = !char.isVisible;
            await api.patch(`/admin/update/character/${char._id}`, { isVisible: newVisibility });

            // Update local state
            const updateList = (list) => list.map(c => c._id === char._id ? { ...c, isVisible: newVisibility } : c);
            setCharacters(prev => updateList(prev));
            setFilteredCharacters(prev => updateList(prev));
        } catch (err) {
            console.error('Error updating visibility:', err);
            alert('Failed to update visibility');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('characters')}</h1>

                {/* Filters & Search */}
                <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700 space-y-4">
                    {/* Search Bar */}
                    <div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
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
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('faction')}</label>
                            <select name="faction" value={filters.faction} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none min-w-[120px]">
                                <option value="">{t('all')}</option>
                                {options.factions.map(opt => <option key={opt} value={opt}>{t(`factions.${opt}`) || opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('position')}</label>
                            <select name="positioning" value={filters.positioning} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none min-w-[120px]">
                                <option value="">{t('all')}</option>
                                {options.positionings.map(opt => <option key={opt} value={opt}>{t(`rows.${opt}`) || opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('role')}</label>
                            <select name="combatPosition" value={filters.combatPosition} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none min-w-[120px]">
                                <option value="">{t('all')}</option>
                                {options.combatPositions.map(opt => <option key={opt} value={opt}>{t(`roles.${opt}`) || opt}</option>)}
                            </select>
                        </div>
                        <button onClick={clearFilters} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm border border-gray-600 transition h-[38px]">{t('clear')}</button>
                    </div>
                </div>

                <AdUnit slot="characters-list-top" />

                {filteredCharacters.length === 0 ? (
                    <p className="text-gray-400">{t('noCharacters')}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCharacters.map((char) => (
                            <Link to={`/characters/${char._id}`} key={char._id} className="block group">
                                <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700 group-hover:border-yellow-500 transition h-full flex flex-col">
                                    <div className="h-48 bg-gray-800 flex items-center justify-center relative overflow-hidden p-4">
                                        {char.imageUrl ? (
                                            <img src={char.imageUrl} alt={getLoc(char.name)} className="h-full w-full object-contain group-hover:scale-110 transition duration-500" />
                                        ) : (
                                            <span className="text-gray-500">No Image</span>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${char.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                                char.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                                    char.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                                        char.rarity === 'R' ? 'bg-blue-600 text-white' :
                                                            'bg-gray-600 text-white'
                                                }`}>
                                                {char.rarity}
                                            </span>
                                        </div>
                                        {canEdit && (
                                            <button
                                                onClick={(e) => toggleVisibility(e, char)}
                                                className={`absolute top-2 left-2 p-1.5 rounded text-xs font-bold ${char.isVisible ? 'bg-green-600/80 hover:bg-green-500' : 'bg-red-600/80 hover:bg-red-500'} text-white shadow-md transition backdrop-blur-sm z-10`}
                                                title={char.isVisible ? "Hide from users" : "Show to users"}
                                            >
                                                {char.isVisible ? '👁️' : '🚫'}
                                            </button>
                                        )}
                                        {!char.isVisible && !canEdit && (
                                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                <span>👁️‍🗨️ Hidden</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition">{getLoc(char.name)}</h2>

                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {char.tags && char.tags.map((tag, idx) => (
                                                <span key={idx} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                <span className="truncate" title={t('faction')}>{getLoc(char.faction)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="truncate" title={t('role')}>{getLoc(char.combatPosition)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                <span className="truncate" title={t('position')}>{getLoc(char.positioning)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                <span className="truncate" title={t('attackType')}>{getLoc(char.attackType)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Characters;

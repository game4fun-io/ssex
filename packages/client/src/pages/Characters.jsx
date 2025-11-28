import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';

const Characters = () => {
    const [characters, setCharacters] = useState([]);
    const [filteredCharacters, setFilteredCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    // Filters
    const [filters, setFilters] = useState({
        rarity: '',
        faction: '',
        positioning: '',
        combatPosition: ''
    });

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await api.get('/characters');
                setCharacters(res.data);
                setFilteredCharacters(res.data);
            } catch (err) {
                console.error('Error fetching characters:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    useEffect(() => {
        let result = characters;
        if (filters.rarity) result = result.filter(c => c.rarity === filters.rarity);
        if (filters.faction) result = result.filter(c => getLoc(c.faction) === filters.faction);
        if (filters.positioning) result = result.filter(c => c.positioning === filters.positioning);
        if (filters.combatPosition) result = result.filter(c => getLoc(c.combatPosition) === filters.combatPosition);
        setFilteredCharacters(result);
    }, [filters, characters, i18n.language]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ rarity: '', faction: '', positioning: '', combatPosition: '' });
    };

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('characters')}</h1>

                {/* Filters */}
                <div className="bg-gray-800 p-4 rounded-lg mb-8 flex flex-wrap gap-4 items-end border border-gray-700">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Rarity</label>
                        <select name="rarity" value={filters.rarity} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none">
                            <option value="">All</option>
                            <option value="SSR">SSR</option>
                            <option value="SR">SR</option>
                            <option value="R">R</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Faction</label>
                        <select name="faction" value={filters.faction} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none">
                            <option value="">All</option>
                            <option value="Sanctuary">Sanctuary</option>
                            <option value="Asgard">Asgard</option>
                            <option value="Poseidon">Poseidon</option>
                            <option value="Hades">Hades</option>
                            <option value="Athena">Athena</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Position</label>
                        <select name="positioning" value={filters.positioning} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none">
                            <option value="">All</option>
                            <option value="Front Row">Front Row</option>
                            <option value="Mid Row">Mid Row</option>
                            <option value="Back Row">Back Row</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Role</label>
                        <select name="combatPosition" value={filters.combatPosition} onChange={handleFilterChange} className="bg-gray-700 text-white p-2 rounded text-sm border border-gray-600 focus:border-yellow-500 outline-none">
                            <option value="">All</option>
                            <option value="Tank">Tank</option>
                            <option value="Warrior">Warrior</option>
                            <option value="Archer">Archer</option>
                            <option value="Supporter">Supporter</option>
                        </select>
                    </div>
                    <button onClick={clearFilters} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm border border-gray-600 transition">Clear Filters</button>
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
                                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${char.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                                char.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                                    char.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                                        char.rarity === 'R' ? 'bg-blue-600 text-white' :
                                                            'bg-gray-600 text-white'
                                                }`}>
                                                {char.rarity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition">{getLoc(char.name)}</h2>

                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {char.tags && char.tags.map((tag, idx) => (
                                                <span key={idx} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-gray-400">
                                            <div className="flex items-center gap-1" title="Faction">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                {getLoc(char.faction)}
                                            </div>
                                            <div className="flex items-center gap-1" title="Role">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                {getLoc(char.combatPosition)}
                                            </div>
                                            <div className="flex items-center gap-1" title="Position">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                {getLoc(char.positioning)}
                                            </div>
                                            <div className="flex items-center gap-1" title="Attack Type">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                {getLoc(char.attackType)}
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

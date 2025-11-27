import { useState, useEffect } from 'react';
import api from '../api/axios';

const Characters = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await api.get('/characters');
                setCharacters(res.data);
            } catch (err) {
                console.error('Error fetching characters:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">Characters</h1>

                {characters.length === 0 ? (
                    <p className="text-gray-400">No characters found. Database might be empty.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {characters.map((char) => (
                            <div key={char._id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-yellow-500 transition">
                                <div className="h-48 bg-gray-700 flex items-center justify-center">
                                    {char.imageUrl ? (
                                        <img src={char.imageUrl} alt={char.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500">No Image</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-xl font-bold text-white">{char.name}</h2>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${char.rarity === 'SSR' ? 'bg-yellow-600 text-white' :
                                                char.rarity === 'SR' ? 'bg-purple-600 text-white' :
                                                    'bg-blue-600 text-white'
                                            }`}>
                                            {char.rarity}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">Element: {char.element}</p>
                                    <p className="text-gray-400 text-sm">Faction: {char.faction}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Characters;

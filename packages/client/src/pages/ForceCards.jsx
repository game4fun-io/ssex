import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const ForceCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await api.get('/force-cards');
                setCards(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">Force Cards</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cards.map(card => (
                        <div key={card._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition">
                            <h2 className="text-xl font-bold text-white mb-2">{card.name}</h2>
                            <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded mb-4 inline-block">{card.rarity}</span>
                            <div className="mb-4">
                                <h3 className="text-yellow-500 font-bold text-sm">Stats</h3>
                                <p className="text-gray-400 text-xs">HP: {card.stats.hp} | ATK: {card.stats.atk}</p>
                            </div>
                            <div>
                                <h3 className="text-yellow-500 font-bold text-sm">{card.skill.name}</h3>
                                <p className="text-gray-300 text-xs">{card.skill.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ForceCards;

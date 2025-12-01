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

    const [level, setLevel] = useState(1);
    const [stars, setStars] = useState(0);
    const [activeTab, setActiveTab] = useState('attributes');

    // Mock data if missing
    const progression = card?.progression || Array.from({ length: 16 }, (_, i) => ({
        star: i,
        effect: i === 0 ? 'Base Effect' : `Enhanced Effect Level ${i}`,
        copies_needed: i > 0 ? 1 : 0,
        refund: i > 0 ? 10 : 0,
        cost: i * 1000
    }));

    const expTable = card?.exp_table || Array.from({ length: 90 }, (_, i) => ({
        level: i + 1,
        exp_needed: (i + 1) * 100
    }));

    const getGrowthFactor = (rarity, starLvl) => {
        let base = 1.0;
        if (['UR', 'SSR', 'Legendary'].includes(rarity)) base = 1.5;
        if (['SR', 'Epic'].includes(rarity)) base = 1.2;
        if (['R', 'Rare'].includes(rarity)) base = 1.0;
        if (['N', 'Uncommon'].includes(rarity)) base = 0.8;
        return base + (starLvl * 0.1);
    };

    const calculateStat = (base, lvl, starLvl, growthStat) => {
        if (!base) return 0;
        const growth = getGrowthFactor(card.rarity, starLvl);
        // If we have specific growth stats, use them, otherwise estimate
        const perLevel = growthStat || (base * 0.05 * growth);
        return Math.floor(base + ((lvl - 1) * perLevel));
    };

    const statsList = [
        { key: 'hp', label: 'HP' },
        { key: 'atk', label: 'ATK' },
        { key: 'pdef', label: 'P.DEF' },
        { key: 'mdef', label: 'M.DEF' },
        { key: 'phys_pen', label: 'Phys Pen' },
        { key: 'mag_pen', label: 'Mag Pen' }
    ];

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!card) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Force Card not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <button onClick={() => navigate('/force-cards')} className="mb-6 text-yellow-500 hover:text-yellow-400 transition">
                    &larr; {t('backToForceCards')}
                </button>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 flex flex-col md:flex-row gap-8 mb-8">
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

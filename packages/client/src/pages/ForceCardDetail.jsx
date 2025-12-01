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

    // Mock data if missing or empty
    const progression = (card?.progression && card.progression.length > 0) ? card.progression : Array.from({ length: 16 }, (_, i) => ({
        star: i,
        effect: i === 0 ? 'Base Effect' : `Enhanced Effect Level ${i}`,
        copies_needed: i > 0 ? 1 : 0,
        refund: i > 0 ? 10 : 0,
        cost: i * 1000
    }));

    const expTable = (card?.exp_table && card.exp_table.length > 0) ? card.exp_table : Array.from({ length: 90 }, (_, i) => ({
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
                            <span className={`px-3 py-1 rounded text-sm font-bold ${['UR', 'SSR', 'Legendary'].includes(card.rarity) ? 'bg-red-900 text-white border border-red-700' :
                                ['SR', 'Epic'].includes(card.rarity) ? 'bg-purple-600 text-white' :
                                    ['R', 'Rare'].includes(card.rarity) ? 'bg-blue-600 text-white' :
                                        ['N', 'Uncommon'].includes(card.rarity) ? 'bg-green-600 text-white' :
                                            'bg-gray-600 text-white'
                                }`}>{card.rarity}</span>
                        </div>
                        <p className="text-gray-300 text-lg mb-6">{getLoc(card.skill.description)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('attributes')}
                        className={`px-6 py-3 font-bold transition ${activeTab === 'attributes' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Attributes Growth
                    </button>
                    <button
                        onClick={() => setActiveTab('progression')}
                        className={`px-6 py-3 font-bold transition ${activeTab === 'progression' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Progression
                    </button>
                    <button
                        onClick={() => setActiveTab('exp')}
                        className={`px-6 py-3 font-bold transition ${activeTab === 'exp' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Experience
                    </button>
                </div>

                {/* Attributes Tab */}
                {activeTab === 'attributes' && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-gray-400 mb-2">Level: <span className="text-white font-bold">{level}</span></label>
                                <input
                                    type="range" min="1" max="90" value={level}
                                    onChange={(e) => setLevel(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Stars: <span className="text-yellow-500 font-bold">{'★'.repeat(stars)}</span> ({stars})</label>
                                <input
                                    type="range" min="0" max="15" value={stars}
                                    onChange={(e) => setStars(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                        <th className="py-2 px-4">Attribute</th>
                                        <th className="py-2 px-4">Base</th>
                                        <th className="py-2 px-4">+ Per Lv</th>
                                        <th className="py-2 px-4 text-yellow-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statsList.map(stat => {
                                        const base = card.stats?.[stat.key] || 0;
                                        // Calculate dynamic growth based on stars
                                        // If growth_stats exists, treat it as base growth (at 0 stars/base rarity factor)
                                        // Otherwise estimate from base stat
                                        const baseGrowth = card.growth_stats?.[stat.key] || (base * 0.05);
                                        const growthFactor = getGrowthFactor(card.rarity, stars);
                                        const growth = baseGrowth * growthFactor;

                                        // Total = Base + (Level - 1) * Growth
                                        const total = Math.floor(base + ((level - 1) * growth));

                                        if (base === 0 && total === 0) return null;

                                        return (
                                            <tr key={stat.key} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                                <td className="py-3 px-4 text-gray-300">{stat.label}</td>
                                                <td className="py-3 px-4 text-gray-400">{base}</td>
                                                <td className="py-3 px-4 text-green-400">+{Math.floor(growth)}</td>
                                                <td className="py-3 px-4 font-bold text-white">{total}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Progression Tab */}
                {activeTab === 'progression' && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900 text-gray-400 text-sm">
                                    <th className="py-3 px-4">Star</th>
                                    <th className="py-3 px-4">Effect</th>
                                    <th className="py-3 px-4">Copies Needed</th>
                                    <th className="py-3 px-4">Refund</th>
                                    <th className="py-3 px-4">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progression.map((p, idx) => (
                                    <tr key={idx} className={`border-b border-gray-700 ${idx === stars ? 'bg-yellow-900/20' : ''}`}>
                                        <td className="py-3 px-4 text-yellow-500 font-bold">{p.star} ★</td>
                                        <td className="py-3 px-4 text-gray-300">{typeof p.effect === 'object' ? getLoc(p.effect) : p.effect}</td>
                                        <td className="py-3 px-4 text-gray-400">{p.copies_needed}</td>
                                        <td className="py-3 px-4 text-gray-400">{p.refund}</td>
                                        <td className="py-3 px-4 text-gray-400">{p.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'exp' && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900 text-gray-400 text-sm">
                                    <th className="py-3 px-4">Level</th>
                                    <th className="py-3 px-4">Exp Needed for Next Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expTable.map((e, idx) => (
                                    <tr key={idx} className={`border-b border-gray-700 ${idx + 1 === level ? 'bg-yellow-900/20' : ''}`}>
                                        <td className="py-3 px-4 text-white font-bold">Lv. {e.level}</td>
                                        <td className="py-3 px-4 text-gray-400">{e.exp_needed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForceCardDetail;

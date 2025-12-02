import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ForceCardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { canEdit } = useAuth();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCard, setEditedCard] = useState(null);
    const [editLang, setEditLang] = useState('en');



    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await api.get('/force-cards');
                const found = res.data.find(c => c.id.toString() === id || c._id === id);
                setCard(found);
                setEditedCard(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [id]);

    // Helper to get localized string for display
    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    // Helper to get localized string for editing
    const getEditLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[editLang] || '';
    };

    const updateLoc = (value, field, obj = editedCard) => {
        const currentLoc = obj[field] || {};
        const newLoc = typeof currentLoc === 'string' ? { [editLang]: value, en: currentLoc } : { ...currentLoc, [editLang]: value };
        return newLoc;
    };

    const handleSave = async () => {
        try {
            await api.patch(`/admin/update/force-card/${card._id}`, editedCard);
            setCard(editedCard);
            setIsEditing(false);
            alert('Force Card updated successfully!');
        } catch (err) {
            console.error('Error updating force card:', err);
            alert('Failed to update force card.');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditedCard({ ...editedCard, imageUrl: res.data.filePath });
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        }
    };

    const handleChange = (e, field) => {
        setEditedCard({ ...editedCard, [field]: e.target.value });
    };

    const handleLocChange = (e, field) => {
        setEditedCard({ ...editedCard, [field]: updateLoc(e.target.value, field) });
    };

    const handleSkillChange = (e, field) => {
        setEditedCard({
            ...editedCard,
            skill: {
                ...editedCard.skill,
                [field]: updateLoc(e.target.value, field, editedCard.skill)
            }
        });
    };

    const handleStatChange = (e, statKey) => {
        setEditedCard({
            ...editedCard,
            stats: {
                ...editedCard.stats,
                [statKey]: parseInt(e.target.value) || 0
            }
        });
    };

    const handleProgressionChange = (e, index, field) => {
        const newProgression = [...(editedCard.progression || [])];
        // Ensure the item exists (though map usually iterates existing)
        if (!newProgression[index]) return;

        if (field === 'effect') {
            newProgression[index] = {
                ...newProgression[index],
                effect: updateLoc(e.target.value, 'effect', newProgression[index])
            };
        } else {
            newProgression[index] = { ...newProgression[index], [field]: e.target.value };
        }
        setEditedCard({ ...editedCard, progression: newProgression });
    };

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
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/force-cards')} className="text-yellow-500 hover:text-yellow-400 transition">
                        &larr; {t('backToForceCards')}
                    </button>
                    {canEdit && (
                        <div className="flex gap-4 items-center">
                            {isEditing && (
                                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                                    <span className="text-xs text-gray-400">Editing Lang:</span>
                                    <select
                                        value={editLang}
                                        onChange={(e) => setEditLang(e.target.value)}
                                        className="bg-gray-700 text-white text-xs p-1 rounded border border-gray-600"
                                    >
                                        <option value="en">English</option>
                                        <option value="pt">Portuguese</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="cn">Chinese</option>
                                        <option value="id">Indonesian</option>
                                        <option value="th">Thai</option>
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded font-bold transition ${isEditing ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white`}
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 flex flex-col md:flex-row gap-8 mb-8">
                    <div className="flex-shrink-0 relative">
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <img src={editedCard.imageUrl} alt="Preview" className="w-64 h-64 object-contain mx-auto border border-gray-600 rounded bg-gray-900" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-64 text-xs text-gray-300"
                                />
                                <input
                                    type="text"
                                    value={editedCard.imageUrl}
                                    onChange={(e) => handleChange(e, 'imageUrl')}
                                    className="w-64 bg-gray-700 text-white p-1 rounded text-xs"
                                    placeholder="Image URL"
                                />
                            </div>
                        ) : (
                            card.imageUrl ? (
                                <img src={card.imageUrl} alt={getLoc(card.name)} className="w-64 h-64 object-contain mx-auto" />
                            ) : (
                                <div className="w-64 h-64 bg-gray-700 flex items-center justify-center rounded">No Image</div>
                            )
                        )}
                    </div>

                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={getEditLoc(editedCard.name)}
                                    onChange={(e) => handleLocChange(e, 'name')}
                                    className="text-4xl font-bold text-white bg-gray-700 rounded p-2 w-full mr-4"
                                    placeholder={`Name (${editLang})`}
                                />
                            ) : (
                                <h1 className="text-4xl font-bold text-yellow-500">{getLoc(card.name)}</h1>
                            )}

                            {isEditing ? (
                                <select
                                    value={editedCard.rarity}
                                    onChange={(e) => handleChange(e, 'rarity')}
                                    className="px-3 py-1 rounded text-sm font-bold bg-gray-700 text-white border border-gray-600"
                                >
                                    <option value="UR">UR</option>
                                    <option value="SSR">SSR</option>
                                    <option value="SR">SR</option>
                                    <option value="R">R</option>
                                    <option value="N">N</option>
                                </select>
                            ) : (
                                <span className={`px-3 py-1 rounded text-sm font-bold ${['UR', 'SSR', 'Legendary'].includes(card.rarity) ? 'bg-red-900 text-white border border-red-700' :
                                    ['SR', 'Epic'].includes(card.rarity) ? 'bg-purple-600 text-white' :
                                        ['R', 'Rare'].includes(card.rarity) ? 'bg-blue-600 text-white' :
                                            ['N', 'Uncommon'].includes(card.rarity) ? 'bg-green-600 text-white' :
                                                'bg-gray-600 text-white'
                                    }`}>{card.rarity}</span>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={getEditLoc(editedCard.skill.name)}
                                    onChange={(e) => handleSkillChange(e, 'name')}
                                    className="w-full bg-gray-700 text-yellow-500 font-bold p-2 rounded"
                                    placeholder={`Skill Name (${editLang})`}
                                />
                                <textarea
                                    value={getEditLoc(editedCard.skill.description)}
                                    onChange={(e) => handleSkillChange(e, 'description')}
                                    className="w-full bg-gray-700 text-white p-2 rounded h-24"
                                    placeholder={`Skill Description (${editLang})`}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-300 text-lg mb-6">{getLoc(card.skill.description)}</p>
                        )}
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
                                                <td className="py-3 px-4 text-gray-400">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editedCard.stats?.[stat.key] || 0}
                                                            onChange={(e) => handleStatChange(e, stat.key)}
                                                            className="bg-gray-700 text-white p-1 rounded w-20 text-right"
                                                        />
                                                    ) : (
                                                        base
                                                    )}
                                                </td>
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
                                        <td className="py-3 px-4 text-gray-300">
                                            {isEditing ? (
                                                <textarea
                                                    value={getEditLoc(editedCard.progression?.[idx]?.effect || p.effect)}
                                                    onChange={(e) => handleProgressionChange(e, idx, 'effect')}
                                                    className="w-full bg-gray-700 text-white p-1 rounded text-sm h-16"
                                                    placeholder={`Effect (${editLang})`}
                                                />
                                            ) : (
                                                typeof p.effect === 'object' ? getLoc(p.effect) : p.effect
                                            )}
                                        </td>
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

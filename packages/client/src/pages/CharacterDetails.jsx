import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';

const CharacterDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const res = await api.get(`/characters/${id}`);
                setCharacter(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCharacter();
    }, [id]);

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    // Helper to parse Unity-style rich text tags
    const parseRichText = (text) => {
        if (!text) return '';

        let processed = text
            // Replace color tags
            .replace(/<color=(#[0-9A-Fa-f]{6})>(.*?)<\/color>/g, '<span style="color: $1">$2</span>')
            // Replace link tags
            .replace(/<link=\d+>(.*?)<\/link>/g, '$1')
            // Replace newlines
            .replace(/\\n/g, '<br/>');

        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!character) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Character not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            {/* Header Section */}
            <div className="relative h-[400px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 z-0" />
                <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-8 gap-8">
                    <motion.img
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        src={character.imageUrl}
                        alt={getLoc(character.name)}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover object-top rounded-full border-4 border-yellow-500 shadow-2xl"
                    />
                    <div className="mb-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-2"
                        >
                            {getLoc(character.name)}
                        </motion.h1>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded text-sm font-bold ${character.rarity === 'SSR' ? 'bg-yellow-600' :
                                character.rarity === 'SR' ? 'bg-purple-600' : 'bg-blue-600'
                                }`}>{character.rarity}</span>
                            {character.tags && character.tags.map((tag, idx) => (
                                <span key={idx} className="bg-gray-700 px-3 py-1 rounded text-sm border border-gray-600">{tag}</span>
                            ))}
                            <span className="bg-gray-700 px-3 py-1 rounded text-sm">{character.faction}</span>
                            <span className="bg-gray-700 px-3 py-1 rounded text-sm">{character.combatPosition}</span>
                            <span className="bg-gray-700 px-3 py-1 rounded text-sm">{character.positioning}</span>
                            <span className="bg-red-900 px-3 py-1 rounded text-sm">{character.attackType}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Bonds */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Basic Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Basic Stats</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-400">HP</span><span>{character.stats.hp}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">ATK</span><span>{character.stats.atk}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">DEF</span><span>{character.stats.def}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">M-DEF</span><span>{character.stats.mdef}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Speed</span><span>{character.stats.speed}</span></div>
                        </div>
                    </motion.div>

                    {/* Special Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Special Stats</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-400 block">Hit Rate</span>{character.stats.hitRate}%</div>
                            <div><span className="text-gray-400 block">Dodge Rate</span>{character.stats.dodgeRate}%</div>
                            <div><span className="text-gray-400 block">Crit Rate</span>{character.stats.critRate}%</div>
                            <div><span className="text-gray-400 block">Crit Resist</span>{character.stats.critResistRate}%</div>
                        </div>
                    </motion.div>

                    {/* Bonds */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Bonds</h2>
                        <div className="space-y-4">
                            {character.bonds.map((bond, idx) => (
                                <div key={idx} className="border-b border-gray-700 pb-2 last:border-0">
                                    <h3 className="font-bold text-white">{getLoc(bond.name)}</h3>
                                    <p className="text-xs text-gray-400 mb-1">Partners: {bond.partners.map(p => getLoc(p)).join(', ')}</p>
                                    <p className="text-sm text-yellow-400">{parseRichText(getLoc(bond.effect))}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <AdUnit slot="character-details-sidebar" format="rectangle" />
                </div>

                {/* Right Column: Skills & Bio */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">Biography</h2>
                        <p className="text-gray-300 leading-relaxed">{parseRichText(getLoc(character.description))}</p>
                        <p className="text-sm text-gray-500 mt-2">Collection: {character.collection}</p>
                        {getLoc(character.constellation) && <p className="text-sm text-gray-500">Constellation: {getLoc(character.constellation)}</p>}
                        {getLoc(character.cv_name) && <p className="text-sm text-gray-500">CV: {getLoc(character.cv_name)}</p>}
                    </motion.div>

                    {/* Skills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold text-yellow-500 mb-6">Skills</h2>
                        <div className="space-y-6">
                            {character.skills.map((skill, idx) => (
                                <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-yellow-500 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-4">
                                            {skill.iconUrl && <img src={skill.iconUrl} alt={getLoc(skill.name)} className="w-12 h-12 rounded border border-gray-600" />}
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{getLoc(skill.name)}</h3>
                                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 mr-2">{skill.type}</span>
                                                {skill.cost > 0 && <span className="text-xs bg-blue-900 px-2 py-1 rounded text-blue-200">Cost: {skill.cost}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mb-4">{parseRichText(getLoc(skill.description))}</p>

                                    {/* Skill Levels */}
                                    <div className="bg-gray-900 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-gray-400 mb-2">Level Up Effects</h4>
                                        <ul className="space-y-2">
                                            {skill.levels.map((lvl, lIdx) => (
                                                <li key={lIdx} className="text-sm text-gray-400 flex gap-2">
                                                    <span className="text-yellow-500 font-bold">Lv.{lvl.level}</span>
                                                    <span>{getLoc(lvl.description)}</span>
                                                    {lvl.unlockRequirement && <span className="text-xs text-gray-600 ml-auto">({lvl.unlockRequirement})</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
            <AdUnit slot="character-details-bottom" />
        </div>
    );
};

export default CharacterDetails;

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';
import { useAuth } from '../context/AuthContext';
import AdminEditModal from '../components/AdminEditModal';
import BondDisplay from '../components/BondDisplay';

const CharacterDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAdmin, canEdit, token } = useAuth();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCharacter, setEditedCharacter] = useState(null);
    const [allCharacters, setAllCharacters] = useState([]); // For bond lookup
    const [forceCards, setForceCards] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [activeTab, setActiveTab] = useState('stats'); // stats, guide


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current character and ALL characters for bond lookup in parallel
                // Use Promise.all
                const [charRes, allRes] = await Promise.all([
                    api.get(`/characters/${id}`),
                    api.get(`/characters`) // This is cached by browser/store usually, or we trust browser cache
                ]);

                setCharacter(charRes.data);
                setEditedCharacter(charRes.data); // Keep this for editing purposes
                setAllCharacters(allRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (isEditing && forceCards.length === 0) {
            const fetchData = async () => {
                try {
                    const [cardsRes, artifactsRes] = await Promise.all([
                        api.get('/force-cards'),
                        api.get('/artifacts')
                    ]);
                    setForceCards(cardsRes.data);
                    setArtifacts(artifactsRes.data);
                } catch (err) {
                    console.error('Error fetching data for editing:', err);
                }
            };
            fetchData();
        }
    }, [isEditing, forceCards.length]);

    const handleSave = async () => {
        try {
            await api.patch(`/admin/update/character/${character._id}`, editedCharacter);
            setCharacter(editedCharacter);
            setIsEditing(false);
            alert('Character updated successfully!');
        } catch (err) {
            console.error('Error updating character:', err);
            alert('Failed to update character.');
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
            setEditedCharacter({ ...editedCharacter, imageUrl: res.data.filePath });
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        }
    };

    const handleChange = (e, field) => {
        setEditedCharacter({ ...editedCharacter, [field]: e.target.value });
    };

    const handleNestedChange = (e, parent, field) => {
        setEditedCharacter({
            ...editedCharacter,
            [parent]: { ...editedCharacter[parent], [field]: e.target.value }
        });
    };

    const handleArrayChange = (e, index, field, arrayName) => {
        const newArray = [...editedCharacter[arrayName]];
        newArray[index] = { ...newArray[index], [field]: e.target.value };
        setEditedCharacter({ ...editedCharacter, [arrayName]: newArray });
    };

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        // Strict fallback: Current Lang -> English -> Empty
        return (data[lang] && data[lang].trim()) ? data[lang] : (data['en'] || '');
    };

    const updateLoc = (value, field, obj = editedCharacter) => {
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        const currentLoc = obj[field] || {};
        // If it's a string, convert to object
        const newLoc = typeof currentLoc === 'string' ? { [lang]: value, en: currentLoc } : { ...currentLoc, [lang]: value };
        return newLoc;
    };

    const handleLocChange = (e, field) => {
        setEditedCharacter({ ...editedCharacter, [field]: updateLoc(e.target.value, field) });
    };

    const handleNestedLocChange = (e, parent, field) => {
        setEditedCharacter({
            ...editedCharacter,
            [parent]: { ...editedCharacter[parent], [field]: updateLoc(e.target.value, field, editedCharacter[parent]) }
        });
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
            {/* Header Section */}
            <div className="container mx-auto px-4 pt-4 flex justify-between items-center">
                <Link to="/characters" className="text-yellow-500 hover:text-yellow-400 transition mb-4 inline-block">
                    &larr; {t('backToCharacters')}
                </Link>
                <div className="flex gap-2">
                    {canEdit && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded font-bold transition mb-4 ${isEditing ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white`}
                        >
                            {isEditing ? 'Cancel Editing' : 'Edit Character'}
                        </button>
                    )}
                    {isEditing && (
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition mb-4"
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
            <div className="relative h-[400px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 z-0" />
                <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-8 gap-8">
                    <motion.img
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        src={isEditing ? editedCharacter.imageUrl : character.imageUrl}
                        alt={getLoc(character.name)}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover object-top rounded-full border-4 border-yellow-500 shadow-2xl"
                    />
                    {isEditing && (
                        <div className="absolute bottom-32 left-4 bg-gray-800 p-2 rounded border border-gray-600">
                            <label className="block text-xs text-gray-400 mb-1">{t('imageUpload')}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="bg-gray-700 text-white p-1 rounded text-xs w-full mb-2"
                            />
                            <input
                                type="text"
                                value={editedCharacter.imageUrl}
                                onChange={(e) => handleChange(e, 'imageUrl')}
                                className="bg-gray-700 text-white p-1 rounded text-xs w-full"
                                placeholder={t('imageUrlPlaceholder')}
                            />
                        </div>
                    )}
                    <div className="mb-4 flex-grow">
                        <div className="flex justify-between items-end mb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={getLoc(editedCharacter.name)}
                                    onChange={(e) => handleLocChange(e, 'name')}
                                    className="text-4xl md:text-6xl font-bold text-white bg-gray-700 rounded p-2 w-full mr-4"
                                />
                            ) : (
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl md:text-6xl font-bold text-white"
                                >
                                    {getLoc(character.name)}
                                </motion.h1>
                            )}

                            {isEditing ? (
                                <select
                                    value={editedCharacter.rarity}
                                    onChange={(e) => handleChange(e, 'rarity')}
                                    className="px-3 py-1 rounded text-xl font-bold bg-gray-700 text-white border border-gray-600"
                                >
                                    <option value="UR">UR</option>
                                    <option value="SSR">SSR</option>
                                    <option value="SR">SR</option>
                                    <option value="R">R</option>
                                    <option value="N">N</option>
                                </select>
                            ) : (
                                <span className={`px-3 py-1 rounded text-xl font-bold ${character.rarity === 'UR' ? 'bg-red-900 text-white border border-red-700' :
                                    character.rarity === 'SSR' ? 'bg-yellow-600 text-white border border-yellow-500' :
                                        character.rarity === 'SR' ? 'bg-purple-600 text-white border border-purple-500' :
                                            character.rarity === 'R' ? 'bg-blue-600 text-white border border-blue-500' :
                                                'bg-gray-600 text-white border-gray-500'
                                    }`}>
                                    {character.rarity}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Tags editing could be complex, skipping for now or simple text input */}
                            {character.tags && character.tags.map((tag, idx) => (
                                <span key={idx} className="bg-gray-700 px-3 py-1 rounded text-sm border border-gray-600">{tag}</span>
                            ))}

                            {isEditing ? (
                                <>
                                    <select value={getLoc(editedCharacter.faction)} onChange={(e) => handleLocChange(e, 'faction')} className="bg-gray-700 px-3 py-1 rounded text-sm w-24">
                                        <option value="">Faction</option>
                                        <option value="Athena">Athena</option>
                                        <option value="Poseidon">Poseidon</option>
                                        <option value="Hades">Hades</option>
                                    </select>
                                    <select value={getLoc(editedCharacter.combatPosition)} onChange={(e) => handleLocChange(e, 'combatPosition')} className="bg-gray-700 px-3 py-1 rounded text-sm w-24">
                                        <option value="">Role</option>
                                        <option value="Tank">Tank</option>
                                        <option value="Warrior">Warrior</option>
                                        <option value="Assassin">Assassin</option>
                                        <option value="Support">Support</option>
                                        <option value="Mage">Mage</option>
                                    </select>
                                    <select value={getLoc(editedCharacter.positioning)} onChange={(e) => handleLocChange(e, 'positioning')} className="bg-gray-700 px-3 py-1 rounded text-sm w-24">
                                        <option value="">Position</option>
                                        <option value="Front">Front</option>
                                        <option value="Middle">Middle</option>
                                        <option value="Back">Back</option>
                                    </select>
                                    <select value={getLoc(editedCharacter.attackType)} onChange={(e) => handleLocChange(e, 'attackType')} className="bg-red-900 px-3 py-1 rounded text-sm w-24">
                                        <option value="">Type</option>
                                        <option value="Physical">Physical</option>
                                        <option value="Cosmic">Cosmic</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <span className="bg-gray-700 px-3 py-1 rounded text-sm">{t(`factions.${character.factionKey}`)}</span>
                                    <span className="bg-gray-700 px-3 py-1 rounded text-sm">{t(`roles.${character.roleKey}`)}</span>
                                    <span className="bg-gray-700 px-3 py-1 rounded text-sm">{t(`rows.${character.row}`)}</span>
                                    <span className="bg-red-900 px-3 py-1 rounded text-sm">{t(`attackTypes.${character.attackTypeKey}`)}</span>
                                </>
                            )}

                            {!character.isVisible && !isEditing && (
                                <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-bold border border-gray-500 flex items-center gap-1">
                                    👁️‍🗨️ Hidden
                                </span>
                            )}
                            {isEditing && (
                                <label className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editedCharacter.isVisible}
                                        onChange={(e) => setEditedCharacter({ ...editedCharacter, isVisible: e.target.checked })}
                                    />
                                    Visible
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 mt-8 border-b border-gray-700">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 font-bold border-b-2 transition ${activeTab === 'stats' ? 'text-yellow-500 border-yellow-500' : 'text-gray-400 border-transparent hover:text-white'}`}
                    >
                        {t('statsAndSkills')}
                    </button>
                </div>
            </div>

            {
                activeTab === 'stats' && (
                    <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Stats & Bonds */}
                        {/* Left Column: Stats & Bonds */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Basic Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                            >
                                <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('basicStats')}</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">HP</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.hp} onChange={(e) => handleNestedChange(e, 'stats', 'hp')} className="bg-gray-700 text-white p-1 rounded w-20 text-right" />
                                        ) : <span>{character.stats.hp}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">ATK</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.atk} onChange={(e) => handleNestedChange(e, 'stats', 'atk')} className="bg-gray-700 text-white p-1 rounded w-20 text-right" />
                                        ) : <span>{character.stats.atk}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">DEF</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.def} onChange={(e) => handleNestedChange(e, 'stats', 'def')} className="bg-gray-700 text-white p-1 rounded w-20 text-right" />
                                        ) : <span>{character.stats.def}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">M-DEF</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.mdef} onChange={(e) => handleNestedChange(e, 'stats', 'mdef')} className="bg-gray-700 text-white p-1 rounded w-20 text-right" />
                                        ) : <span>{character.stats.mdef}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Speed</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.speed} onChange={(e) => handleNestedChange(e, 'stats', 'speed')} className="bg-gray-700 text-white p-1 rounded w-20 text-right" />
                                        ) : <span>{character.stats.speed}</span>}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Special Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                            >
                                <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('specialStats')}</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400 block">Hit Rate</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.hitRate} onChange={(e) => handleNestedChange(e, 'stats', 'hitRate')} className="bg-gray-700 text-white p-1 rounded w-full" />
                                        ) : <span>{character.stats.hitRate}%</span>}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Dodge Rate</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.dodgeRate} onChange={(e) => handleNestedChange(e, 'stats', 'dodgeRate')} className="bg-gray-700 text-white p-1 rounded w-full" />
                                        ) : <span>{character.stats.dodgeRate}%</span>}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Crit Rate</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.critRate} onChange={(e) => handleNestedChange(e, 'stats', 'critRate')} className="bg-gray-700 text-white p-1 rounded w-full" />
                                        ) : <span>{character.stats.critRate}%</span>}
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Crit Resist</span>
                                        {isEditing ? (
                                            <input type="number" value={editedCharacter.stats.critResistRate} onChange={(e) => handleNestedChange(e, 'stats', 'critResistRate')} className="bg-gray-700 text-white p-1 rounded w-full" />
                                        ) : <span>{character.stats.critResistRate}%</span>}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Bonds */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                            >
                                <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('bonds')}</h2>
                                <BondDisplay character={character} getLoc={getLoc} allCharacters={allCharacters} />
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
                                <h2 className="text-xl font-bold text-yellow-500 mb-2">{t('biography')}</h2>
                                {isEditing ? (
                                    <textarea
                                        value={getLoc(editedCharacter.description)}
                                        onChange={(e) => handleLocChange(e, 'description')}
                                        className="w-full bg-gray-700 text-white p-2 rounded h-32"
                                    />
                                ) : (
                                    <p className="text-gray-300 leading-relaxed">{parseRichText(getLoc(character.description))}</p>
                                )}

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Collection</label>
                                        {isEditing ? (
                                            <input type="text" value={editedCharacter.collection} onChange={(e) => handleChange(e, 'collection')} className="w-full bg-gray-700 text-white p-1 rounded text-sm" />
                                        ) : <p className="text-sm text-gray-500">{character.collection}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Constellation</label>
                                        {isEditing ? (
                                            <input type="text" value={getLoc(editedCharacter.constellation)} onChange={(e) => handleLocChange(e, 'constellation')} className="w-full bg-gray-700 text-white p-1 rounded text-sm" />
                                        ) : <p className="text-sm text-gray-500">{getLoc(character.constellation)}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">CV Name</label>
                                        {isEditing ? (
                                            <input type="text" value={getLoc(editedCharacter.cv_name)} onChange={(e) => handleLocChange(e, 'cv_name')} className="w-full bg-gray-700 text-white p-1 rounded text-sm" />
                                        ) : <p className="text-sm text-gray-500">{getLoc(character.cv_name)}</p>}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Skills */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-yellow-500 mb-6">{t('skills')}</h2>
                                <div className="space-y-6">
                                    {editedCharacter.skills.map((skill, idx) => (
                                        <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-yellow-500 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-4 w-full">
                                                    {skill.iconUrl && <img src={skill.iconUrl} alt={getLoc(skill.name)} className="w-12 h-12 rounded border border-gray-600" />}
                                                    <div className="w-full">
                                                        {isEditing ? (
                                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                                <input
                                                                    type="text"
                                                                    value={getLoc(skill.name)}
                                                                    onChange={(e) => {
                                                                        const newSkills = [...editedCharacter.skills];
                                                                        newSkills[idx].name = updateLoc(e.target.value, 'name', newSkills[idx]);
                                                                        setEditedCharacter({ ...editedCharacter, skills: newSkills });
                                                                    }}
                                                                    className="bg-gray-700 text-white p-1 rounded font-bold"
                                                                    placeholder="Skill Name"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={skill.type}
                                                                    onChange={(e) => handleArrayChange(e, idx, 'type', 'skills')}
                                                                    className="bg-gray-700 text-white p-1 rounded text-xs"
                                                                    placeholder="Type"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={skill.cost}
                                                                    onChange={(e) => handleArrayChange(e, idx, 'cost', 'skills')}
                                                                    className="bg-gray-700 text-white p-1 rounded text-xs"
                                                                    placeholder="Cost"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h3 className="text-xl font-bold text-white">{getLoc(skill.name)}</h3>
                                                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 mr-2">{skill.type}</span>
                                                                {skill.cost > 0 && <span className="text-xs bg-blue-900 px-2 py-1 rounded text-blue-200">Cost: {skill.cost}</span>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <textarea
                                                    value={getLoc(skill.description)}
                                                    onChange={(e) => {
                                                        const newSkills = [...editedCharacter.skills];
                                                        newSkills[idx].description = updateLoc(e.target.value, 'description', newSkills[idx]);
                                                        setEditedCharacter({ ...editedCharacter, skills: newSkills });
                                                    }}
                                                    className="w-full bg-gray-700 text-white p-2 rounded h-20 text-sm mb-4"
                                                    placeholder="Description"
                                                />
                                            ) : (
                                                <p className="text-gray-300 mb-4">{parseRichText(getLoc(skill.description))}</p>
                                            )}

                                            {/* Skill Levels */}
                                            <div className="bg-gray-900 p-4 rounded-lg">
                                                <h4 className="text-sm font-bold text-gray-400 mb-2">Level Up Effects</h4>
                                                <ul className="space-y-2">
                                                    {skill.levels.map((lvl, lIdx) => (
                                                        <li key={lIdx} className="text-sm text-gray-400 flex gap-2 flex-col">
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-yellow-500 font-bold">Lv.{lvl.level}</span>
                                                                {isEditing ? (
                                                                    <textarea
                                                                        value={getLoc(lvl.description)}
                                                                        onChange={(e) => {
                                                                            const newSkills = [...editedCharacter.skills];
                                                                            newSkills[idx].levels[lIdx].description = updateLoc(e.target.value, 'description', newSkills[idx].levels[lIdx]);
                                                                            setEditedCharacter({ ...editedCharacter, skills: newSkills });
                                                                        }}
                                                                        className="w-full bg-gray-700 text-white p-1 rounded text-xs"
                                                                    />
                                                                ) : (
                                                                    <span>{parseRichText(getLoc(lvl.description))}</span>
                                                                )}
                                                            </div>
                                                            {getLoc(lvl.unlockRequirement) && !isEditing && <span className="text-xs text-gray-600 ml-auto">({getLoc(lvl.unlockRequirement)})</span>}
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
                )}

            {
                activeTab === 'guide' && (
                    <div className="container mx-auto px-4 mt-8">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-2xl font-bold text-yellow-500 mb-6">Recommended Build</h2>

                            {/* Force Cards Section */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-yellow-400">🎴</span> Force Cards
                                </h3>
                                {(!isEditing && (!character.recommendations?.cards || character.recommendations.cards.length === 0)) && (
                                    <p className="text-gray-400 italic mb-4">No recommendations available.</p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(isEditing ? editedCharacter.recommendations?.cards : character.recommendations?.cards)?.map((rec, idx) => (
                                        <div key={idx} className="bg-gray-700 p-4 rounded-lg border border-gray-600 relative">
                                            {isEditing && (
                                                <button
                                                    onClick={() => {
                                                        const newRecs = [...editedCharacter.recommendations.cards];
                                                        newRecs.splice(idx, 1);
                                                        setEditedCharacter({
                                                            ...editedCharacter,
                                                            recommendations: { ...editedCharacter.recommendations, cards: newRecs }
                                                        });
                                                    }}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                                                >
                                                    ✖
                                                </button>
                                            )}
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-16 h-16 bg-gray-900 rounded border border-gray-500 flex items-center justify-center text-xs text-center overflow-hidden">
                                                    {/* We need to find the card name from the ID if we are in view mode and it's populated, or look it up in the list if we have it */}
                                                    {rec.cardId?.name ? getLoc(rec.cardId.name) : (forceCards.find(c => c._id === rec.cardId)?.name ? getLoc(forceCards.find(c => c._id === rec.cardId).name) : 'Card')}
                                                </div>
                                                <div className="flex-grow">
                                                    {isEditing ? (
                                                        <select
                                                            value={rec.cardId?._id || rec.cardId}
                                                            onChange={(e) => {
                                                                const newRecs = [...editedCharacter.recommendations.cards];
                                                                newRecs[idx].cardId = e.target.value;
                                                                setEditedCharacter({
                                                                    ...editedCharacter,
                                                                    recommendations: { ...editedCharacter.recommendations, cards: newRecs }
                                                                });
                                                            }}
                                                            className="w-full bg-gray-800 text-white p-1 rounded mb-1 text-sm"
                                                        >
                                                            <option value="">Select Card</option>
                                                            {forceCards.map(c => (
                                                                <option key={c._id} value={c._id}>{getLoc(c.name)}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <h4 className="font-bold text-white">{rec.cardId?.name ? getLoc(rec.cardId.name) : (forceCards.find(c => c._id === rec.cardId)?.name ? getLoc(forceCards.find(c => c._id === rec.cardId).name) : 'Unknown Card')}</h4>
                                                    )}

                                                    <div className="flex items-center gap-2 mt-1">
                                                        {isEditing ? (
                                                            <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rec.isF2P}
                                                                    onChange={(e) => {
                                                                        const newRecs = [...editedCharacter.recommendations.cards];
                                                                        newRecs[idx].isF2P = e.target.checked;
                                                                        setEditedCharacter({
                                                                            ...editedCharacter,
                                                                            recommendations: { ...editedCharacter.recommendations, artifacts: newRecs }
                                                                        });
                                                                    }}
                                                                />
                                                                F2P Friendly
                                                            </label>
                                                        ) : (
                                                            rec.isF2P && <span className="bg-green-900 text-green-200 text-xs px-2 py-0.5 rounded border border-green-700">F2P</span>
                                                        )}

                                                        {isEditing ? (
                                                            <select
                                                                value={rec.priority}
                                                                onChange={(e) => {
                                                                    const newRecs = [...editedCharacter.recommendations.artifacts];
                                                                    newRecs[idx].priority = parseInt(e.target.value);
                                                                    setEditedCharacter({
                                                                        ...editedCharacter,
                                                                        recommendations: { ...editedCharacter.recommendations, artifacts: newRecs }
                                                                    });
                                                                }}
                                                                className="bg-gray-800 text-white text-xs p-0.5 rounded"
                                                            >
                                                                <option value={0}>Core</option>
                                                                <option value={1}>Alternative</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${rec.priority === 0 ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-gray-600 text-gray-300 border-gray-500'}`}>
                                                                {rec.priority === 0 ? 'Core' : 'Alternative'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <textarea
                                                    value={getLoc(rec.note)}
                                                    onChange={(e) => {
                                                        const newRecs = [...editedCharacter.recommendations.artifacts];
                                                        newRecs[idx].note = updateLoc(e.target.value, 'note', newRecs[idx]);
                                                        setEditedCharacter({
                                                            ...editedCharacter,
                                                            recommendations: { ...editedCharacter.recommendations, artifacts: newRecs }
                                                        });
                                                    }}
                                                    className="w-full bg-gray-800 text-white p-2 rounded text-xs h-16"
                                                    placeholder="Note..."
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-300 italic">{getLoc(rec.note)}</p>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                const newRecs = [...(editedCharacter.recommendations?.artifacts || [])];
                                                newRecs.push({ artifactId: '', note: {}, isF2P: false, priority: 0 });
                                                setEditedCharacter({
                                                    ...editedCharacter,
                                                    recommendations: { ...editedCharacter.recommendations, artifacts: newRecs }
                                                });
                                            }}
                                            className="bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center p-8 hover:bg-gray-600 transition text-gray-400 hover:text-white"
                                        >
                                            + Add Artifact
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <AdUnit slot="character-details-bottom" />

            <AdminEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                entity={character}
                type="character"
                onUpdate={setCharacter}
            />
        </div >
    );
};

export default CharacterDetails;

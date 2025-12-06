import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import AdUnit from '../components/AdUnit';
import AuthContext from '../context/AuthContext';

const CompDetail = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [comp, setComp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' });

    useEffect(() => {
        const fetchComp = async () => {
            try {
                const res = await api.get(`/community-comps/${id}`);
                setComp(res.data);
                setEditForm({
                    title: res.data.title,
                    description: typeof res.data.description === 'string' ? res.data.description : (res.data.description?.en || ''),
                    tags: res.data.tags.join(', ')
                });
            } catch (err) {
                console.error('Error fetching comp:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComp();
    }, [id]);

    const handleLike = async () => {
        try {
            const res = await api.put(`/community-comps/like/${id}`);
            setComp({ ...comp, likes: res.data });
        } catch (err) {
            console.error('Error liking comp:', err);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`/community-comps/${id}`, {
                title: editForm.title,
                description: editForm.description,
                tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            setComp(res.data);
            setIsEditMode(false);
        } catch (err) {
            console.error('Error updating comp:', err);
        }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        try {
            const res = await api.post(`/community-comps/${id}/comments`, { text: comment });
            setComp({ ...comp, comments: res.data });
            setComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this composition?')) return;
        try {
            await api.delete(`/community-comps/${id}`);
            navigate('/community-comps');
        } catch (err) {
            console.error('Error deleting comp:', err);
        }
    };

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return (data[lang] && data[lang].trim()) ? data[lang] : (data['en'] || '');
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{t('loading')}</div>;
    if (!comp) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Comp not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20 pt-20">
            <div className="container mx-auto px-4">
                <Link to="/community-comps" className="text-yellow-500 hover:text-yellow-400 transition mb-4 inline-block">
                    &larr; {t('visualGuide.backToComps')}
                </Link>

                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            {isEditMode ? (
                                <div className="space-y-2 mb-4">
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white font-bold text-2xl"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.tags}
                                        onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm text-gray-300"
                                        placeholder="Tags (comma separated)"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">{comp.title}</h1>
                                    <p className="text-gray-400">{t('visualGuide.byAuthor', { author: comp.author })} • {new Date(comp.createdAt).toLocaleDateString()}</p>
                                    <div className="flex gap-2 mt-2">
                                        {comp.tags.map((tag, i) => (
                                            <span key={i} className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">{tag}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded transition font-bold"
                            >
                                🔥 {comp.likes}
                            </button>
                            {user && (user.username === comp.author || user.role === 'admin') && (
                                <div className="flex gap-2">
                                    {isEditMode ? (
                                        <>
                                            <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm">Save</button>
                                            <button onClick={() => setIsEditMode(false)} className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsEditMode(true)} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Edit Details</button>
                                            <button onClick={() => navigate(`/team-builder?edit=${comp._id}`)} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm">Edit Team</button>
                                            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm">Delete</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('visualGuide.teamComposition')}</h2>

                        {/* Grid Layout */}
                        <div className="flex flex-col gap-4">
                            {['front', 'mid', 'back'].map(row => {
                                const rowChars = comp.characters.filter(c => c.slot.startsWith(row));
                                if (rowChars.length === 0) return null;
                                return (
                                    <div key={row} className="flex flex-col gap-2">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-700 pb-1">{t(`rows.${row}`) || row}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {rowChars.map((entry, idx) => (
                                                <div key={idx} className="bg-gray-700 p-3 rounded-lg border border-gray-600 flex gap-3 items-start relative group">
                                                    {/* Character */}
                                                    <div className="flex-shrink-0">
                                                        <Link to={`/characters/${entry.character._id}`}>
                                                            <img src={entry.character.imageUrl} alt={getLoc(entry.character.name)} className="w-16 h-16 rounded-lg object-cover border border-gray-500 hover:border-yellow-500 transition" />
                                                        </Link>
                                                        <div className="text-[10px] text-center mt-1 font-bold text-gray-300 truncate w-16">{getLoc(entry.character.name)}</div>
                                                    </div>

                                                    {/* Build Info */}
                                                    <div className="flex-grow flex flex-col gap-2">
                                                        {/* Relic */}
                                                        {entry.relic && (
                                                            <div className="group/relic relative">
                                                                <div className="flex items-center gap-2 bg-gray-800 p-1.5 rounded border border-gray-700 cursor-help">
                                                                    <img src={entry.relic.imageUrl} alt="" className="w-6 h-6 object-contain" />
                                                                    <span className="text-xs text-gray-300 truncate">{getLoc(entry.relic.name)}</span>
                                                                </div>
                                                                {/* Relic Tooltip */}
                                                                <div className="absolute z-10 bottom-full left-0 mb-2 w-64 bg-gray-900 border border-yellow-500 p-3 rounded shadow-xl hidden group-hover/relic:block pointer-events-none">
                                                                    <h4 className="text-yellow-500 font-bold text-xs mb-1">{getLoc(entry.relic.name)}</h4>
                                                                    <p className="text-[10px] text-gray-300">{getLoc(entry.relic.effect)}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Cards */}
                                                        {entry.cards && entry.cards.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {entry.cards.map((card, cIdx) => (
                                                                    <div key={cIdx} className="group/card relative">
                                                                        <div className="w-6 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center cursor-help">
                                                                            {card.imageUrl ? <img src={card.imageUrl} alt="" className="w-full h-full object-contain" /> : <span className="text-[8px]">C</span>}
                                                                        </div>
                                                                        {/* Card Tooltip */}
                                                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-64 bg-gray-900 border border-blue-500 p-3 rounded shadow-xl hidden group-hover/card:block pointer-events-none">
                                                                            <h4 className="text-blue-400 font-bold text-xs mb-1">{getLoc(card.name)}</h4>
                                                                            <p className="text-[10px] text-gray-300">{getLoc(card.skill?.description)}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Support */}
                            {comp.characters.some(c => c.slot.startsWith('support')) && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-bold text-blue-400 uppercase border-b border-blue-900/50 pb-1 mb-2">{t('support')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {comp.characters.filter(c => c.slot.startsWith('support')).map((entry, idx) => (
                                            <div key={idx} className="bg-gray-700 p-3 rounded-lg border border-blue-900/30 flex gap-3 items-center">
                                                <Link to={`/characters/${entry.character._id}`}>
                                                    <img src={entry.character.imageUrl} alt={getLoc(entry.character.name)} className="w-12 h-12 rounded-full object-cover border border-blue-500" />
                                                </Link>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-200">{getLoc(entry.character.name)}</div>
                                                    <div className="text-xs text-gray-400">{t('support')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Bonds */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('visualGuide.activeBonds')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                const normalize = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                                const teamChars = comp.characters.map(c => c.character);

                                const bonds = [];
                                const skills = [];



                                // Get unique characters from the team (in case of duplicates in comp.characters)
                                const uniqueChars = Array.from(new Map(teamChars.map(char => [char._id, char])).values());

                                const isPartnerInTeam = (partnerLoc) => {
                                    if (!partnerLoc) return false;
                                    const pNames = Object.values(partnerLoc).filter(n => n && typeof n === 'string');

                                    return uniqueChars.some(char => {
                                        const cNames = Object.values(char.name || {}).filter(n => n && typeof n === 'string');
                                        return cNames.some(cName =>
                                            pNames.some(pName =>
                                                normalize(cName).includes(normalize(pName)) && normalize(pName).length > 1
                                            )
                                        );
                                    });
                                };

                                const getPartnerChar = (partnerLoc) => {
                                    if (!partnerLoc) return { name: partnerLoc, imageUrl: '' };
                                    const pNames = Object.values(partnerLoc).filter(n => n && typeof n === 'string');

                                    const match = uniqueChars.find(char => {
                                        const cNames = Object.values(char.name || {}).filter(n => n && typeof n === 'string');
                                        return cNames.some(cName =>
                                            pNames.some(pName =>
                                                normalize(cName).includes(normalize(pName)) && normalize(pName).length > 1
                                            )
                                        );
                                    });
                                    return match || { name: partnerLoc, imageUrl: '' };
                                };

                                teamChars.forEach(char => {
                                    // 1. Status Bonds
                                    if (char.bonds && char.bonds.length) {
                                        char.bonds.forEach(bond => {
                                            const partners = bond.partners || [];
                                            if (partners.length === 0) return;

                                            const allPartnersPresent = partners.every(partnerLoc => isPartnerInTeam(partnerLoc));

                                            if (allPartnersPresent) {
                                                const partnersData = partners.map(pLoc => getPartnerChar(pLoc));
                                                bonds.push({
                                                    charName: getLoc(char.name),
                                                    bondName: getLoc(bond.name),
                                                    effect: getLoc(bond.effect),
                                                    partnersData
                                                });
                                            }
                                        });
                                    }

                                    // 2. Combine Skills
                                    if (char.combineSkills && char.combineSkills.length) {
                                        char.combineSkills.forEach(skill => {
                                            const partners = skill.partners || [];
                                            if (partners.length === 0) return;

                                            const allPartnersPresent = partners.every(partnerLoc => isPartnerInTeam(partnerLoc));

                                            if (allPartnersPresent) {
                                                const partnersData = partners.map(pLoc => getPartnerChar(pLoc));
                                                skills.push({
                                                    charName: getLoc(char.name),
                                                    skillName: getLoc(skill.name),
                                                    description: getLoc(skill.description),
                                                    iconUrl: skill.iconUrl,
                                                    partnersData
                                                });
                                            }
                                        });
                                    }
                                });

                                // Deduplicate Bonds
                                const uniqueBonds = [];
                                const seenBonds = new Set();
                                bonds.forEach(b => {
                                    const key = `${b.bondName}-${b.effect}`;
                                    if (!seenBonds.has(key)) {
                                        seenBonds.add(key);
                                        uniqueBonds.push(b);
                                    }
                                });

                                // Deduplicate Skills
                                const uniqueSkills = [];
                                const seenSkills = new Set();
                                skills.forEach(s => {
                                    const key = `${s.skillName}-${s.description}`;
                                    if (!seenSkills.has(key)) {
                                        seenSkills.add(key);
                                        uniqueSkills.push(s);
                                    }
                                });

                                if (uniqueBonds.length === 0 && uniqueSkills.length === 0) {
                                    return <p className="text-gray-500 italic">{t('visualGuide.noActiveBonds')}</p>;
                                }

                                return (
                                    <div className="space-y-6">
                                        {/* Combine Skills */}
                                        {uniqueSkills.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-bold text-yellow-500 mb-3">{t('activeCombineSkills') || 'Active Combine Skills'}</h4>
                                                <div className="space-y-4">
                                                    {uniqueSkills.map((skill, idx) => (
                                                        <div key={idx} className="bg-gray-800 border border-yellow-600/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4">
                                                            {skill.iconUrl && (
                                                                <div className="flex-shrink-0 mx-auto sm:mx-0">
                                                                    <img src={skill.iconUrl} alt={skill.skillName} className="w-16 h-16 rounded border border-gray-600" />
                                                                </div>
                                                            )}
                                                            <div className="flex-grow">
                                                                <h4 className="font-bold text-yellow-400 text-lg mb-1">{skill.skillName}</h4>
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {skill.partnersData.map((p, i) => (
                                                                        <div key={i} className="flex items-center gap-1 bg-gray-700 px-2 py-0.5 rounded border border-gray-600">
                                                                            {p.imageUrl && <img src={p.imageUrl} alt="" className="w-4 h-4 rounded-full" />}
                                                                            <span className="text-[10px] text-gray-300">{getLoc(p.name)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: skill.description ? skill.description.replace(/\\n/g, '<br/>') : '' }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attribute Bonds */}
                                        {uniqueBonds.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-bold text-blue-400 mb-3">{t('activeBonds') || 'Attribute Bonds'}</h4>
                                                <div className="space-y-3">
                                                    {uniqueBonds.map((bond, idx) => (
                                                        <div key={idx} className="bg-gray-800 border border-blue-900/30 p-4 rounded-lg flex gap-3">
                                                            <div className="text-2xl">🔗</div>
                                                            <div>
                                                                <h4 className="font-bold text-blue-400 text-sm">{bond.bondName} <span className="text-gray-500 text-xs">({bond.charName})</span></h4>
                                                                <p className="text-xs text-gray-300 mt-1">{bond.effect}</p>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {bond.partnersData.map((p, i) => (
                                                                        <div key={i} className="flex items-center gap-1 bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">
                                                                            {p.imageUrl ? (
                                                                                <img src={p.imageUrl} alt={getLoc(p.name)} className="w-5 h-5 rounded-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-[10px] text-gray-400">{getLoc(p.name)}</span>
                                                                            )}
                                                                            <span className="text-[10px] text-gray-300">{getLoc(p.name)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">{t('visualGuide.descriptionStrategy')}</h2>
                        <div className="bg-gray-700 p-6 rounded-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {isEditMode ? (
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full h-40 bg-gray-800 border border-gray-600 rounded p-2 text-white"
                                />
                            ) : (
                                getLoc(comp.description)
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Comments</h2>
                        {user ? (
                            <div className="mb-6 flex gap-2">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none"
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                />
                                <button onClick={handleComment} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded font-bold">Post</button>
                            </div>
                        ) : (
                            <div className="mb-6 text-gray-400 text-sm">Please <Link to="/login" className="text-yellow-500 hover:underline">login</Link> to comment.</div>
                        )}

                        <div className="space-y-4">
                            {comp.comments && comp.comments.length > 0 ? (
                                comp.comments.map((c, i) => (
                                    <div key={i} className="bg-gray-800 p-4 rounded border border-gray-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-yellow-500 text-sm">{c.username}</span>
                                            <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{c.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No comments yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <AdUnit slot="comp-detail-bottom" />
            </div>
        </div>
    );
};

export default CompDetail;

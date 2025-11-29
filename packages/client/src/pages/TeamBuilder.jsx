import { useEffect, useState, useRef, useContext, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const rarityScore = (rarity) => {
    const order = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
    return order[rarity] || 0;
};

const CharacterCard = ({ char, getLoc, onAddMain, onAddSupport, disabled }) => (
    <div
        className={`
            flex-shrink-0 w-24 h-32 bg-gray-800 rounded-lg border border-gray-700 
            hover:border-yellow-500 transition-all relative group
            flex flex-col items-center justify-center p-2 gap-1
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
    >
        {char.imageUrl ? (
            <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full" />
        ) : (
            <div className="w-16 h-16 bg-gray-600 rounded-full" />
        )}
        <span className="text-[10px] text-center leading-tight line-clamp-2 w-full">{getLoc(char.name)}</span>
        <div className="absolute top-1 right-1 text-[8px] px-1 bg-black/50 rounded text-gray-300">
            {char.rarity}
        </div>

        {/* Hover Overlay */}
        {!disabled && (
            <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-10">
                <button
                    onClick={() => onAddMain(char)}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] py-1.5 rounded font-bold"
                >
                    MAIN
                </button>
                <button
                    onClick={() => onAddSupport(char)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1.5 rounded font-bold"
                >
                    SUPPORT
                </button>
            </div>
        )}
    </div>
);

const SlotCard = ({ slot, label, getLoc, onRemove, relics, cards, onRelicChange, onCardsChange, relicLabel, cardsLabel, noneLabel, clearLabel }) => {
    const char = slot?.character;
    const relicId = slot?.relicId || '';
    const cardIds = slot?.cardIds || [];
    const [openRelic, setOpenRelic] = useState(false);
    const [openCards, setOpenCards] = useState(false);

    if (!char) {
        return (
            <div className="w-48 h-72 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg flex items-center justify-center text-gray-600 text-sm font-bold">
                {label}
            </div>
        );
    }

    return (
        <div className="w-48 min-h-[288px] bg-gray-800 border border-gray-600 rounded-lg flex flex-col items-center p-3 gap-3 relative group shadow-lg">
            <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 shadow-md"
            >
                ✕
            </button>

            <div className="relative mt-2">
                {char.imageUrl ? (
                    <img src={char.imageUrl} alt={getLoc(char.name)} className="w-24 h-24 object-cover rounded-full border-2 border-gray-600 shadow-md" />
                ) : (
                    <div className="w-24 h-24 bg-gray-600 rounded-full border-2 border-gray-600 shadow-md" />
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-0.5 rounded text-xs whitespace-nowrap border border-gray-700 shadow-sm z-10 font-bold">
                    {getLoc(char.name)}
                </div>
            </div>

            {/* Equipment Section */}
            <div className="w-full mt-4 flex flex-col gap-3">
                {/* Relic Selector */}
                <div className="relative">
                    <label className="text-[10px] text-gray-400 ml-1 mb-0.5 block font-semibold">{relicLabel}</label>
                    <button
                        onClick={() => { setOpenRelic(!openRelic); setOpenCards(false); }}
                        className={`w-full text-xs p-2.5 rounded border flex items-center gap-2 transition-colors ${relicId ? 'bg-gray-700 border-yellow-500/50 text-yellow-400' : 'bg-gray-700/30 border-gray-600 text-gray-500 hover:border-gray-500'}`}
                    >
                        {relicId ? (() => {
                            const r = relics.find(x => (x._id || x.id) === relicId);
                            return (
                                <>
                                    {r?.imageUrl && <img src={r.imageUrl} alt="" className="w-6 h-6 object-contain" />}
                                    <span className="truncate flex-1 text-left font-medium">{getLoc(r?.name)}</span>
                                </>
                            );
                        })() : <span className="text-gray-500 italic">{noneLabel}</span>}
                    </button>

                    {openRelic && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-gray-900 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto scrollbar-themed shadow-xl">
                            <button className="w-full text-left p-2 text-xs text-gray-400 hover:bg-gray-800 border-b border-gray-800" onClick={() => { onRelicChange(''); setOpenRelic(false); }}>{noneLabel}</button>
                            {relics.map(r => (
                                <button
                                    key={r._id || r.id}
                                    className="w-full text-left p-2 text-xs text-white hover:bg-gray-800 flex items-center gap-2 border-b border-gray-800 last:border-0"
                                    onClick={() => { onRelicChange(r._id || r.id); setOpenRelic(false); }}
                                >
                                    {r.imageUrl && <img src={r.imageUrl} alt="" className="w-6 h-6 object-contain" />}
                                    <span className="truncate">{getLoc(r.name)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cards Selector */}
                <div className="relative">
                    <div className="flex justify-between items-center px-1 mb-0.5">
                        <label className="text-[10px] text-gray-400 font-semibold">{cardsLabel}</label>
                        <span className={`text-[10px] ${cardIds.length === 5 ? 'text-green-400' : 'text-gray-500'}`}>{cardIds.length}/5</span>
                    </div>

                    <button
                        onClick={() => { setOpenCards(!openCards); setOpenRelic(false); }}
                        className={`w-full text-xs p-2.5 rounded border flex flex-wrap gap-1 min-h-[42px] transition-colors ${cardIds.length ? 'bg-gray-700 border-blue-500/50' : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'}`}
                    >
                        {cardIds.length === 0 ? <span className="text-gray-500 italic w-full text-left">{noneLabel}</span> : (
                            cardIds.map(cid => {
                                const c = cards.find(x => (x._id || x.id) === cid);
                                return (
                                    <div key={cid} className="w-6 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center" title={getLoc(c?.name)}>
                                        {c?.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-contain" /> : <span className="text-[8px]">{cid.slice(0, 2)}</span>}
                                    </div>
                                );
                            })
                        )}
                    </button>

                    {openCards && (
                        <div
                            className="absolute top-full left-0 right-0 z-30 bg-gray-900 border border-gray-600 rounded mt-1 max-h-56 overflow-y-auto scrollbar-themed shadow-xl min-w-[200px]"
                            onMouseLeave={() => setOpenCards(false)}
                        >
                            <div className="p-2 border-b border-gray-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400">{cardsLabel}</span>
                                <button className="text-[10px] text-red-400 hover:text-red-300" onClick={() => onCardsChange([])}>{clearLabel || 'Clear'}</button>
                            </div>
                            {cards.map(c => {
                                const id = c._id || c.id;
                                const selected = cardIds.includes(id);
                                return (
                                    <button
                                        key={id}
                                        className={`w-full text-left p-2 text-xs hover:bg-gray-800 flex items-center gap-2 border-b border-gray-800 last:border-0 ${selected ? 'bg-gray-800/50' : ''}`}
                                        onClick={() => {
                                            const next = selected ? cardIds.filter(x => x !== id) : [...cardIds, id].slice(0, 5);
                                            onCardsChange(next);
                                        }}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' : 'border-gray-600'}`}>
                                            {selected && '✓'}
                                        </div>
                                        {c.imageUrl && <img src={c.imageUrl} alt="" className="w-6 h-6 object-contain" />}
                                        <span className={`truncate ${selected ? 'text-yellow-400' : 'text-white'}`}>{getLoc(c.name)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BondModal = ({ bond, onClose, getLoc }) => {
    if (!bond) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-yellow-600 rounded-lg p-6 max-w-md w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
                <h3 className="text-xl font-bold text-yellow-500 mb-2">{bond.bondName}</h3>
                <div className="bg-gray-800 p-3 rounded border border-gray-700 mb-4">
                    <p className="text-sm text-gray-200">{bond.effect || 'Check seiya2.vercel.app'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {bond.partnersData.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                            {p.imageUrl && <img src={p.imageUrl} alt="" className="w-6 h-6 rounded-full" />}
                            <span className="text-xs text-gray-300">{getLoc(p.name)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TeamBuilder = () => {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const { hash } = useParams();
    const location = useLocation();

    // Data States
    const [characters, setCharacters] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [cards, setCards] = useState([]);

    // Filter States
    const [filters, setFilters] = useState({
        rarity: '',
        faction: '',
        positioning: '',
        combatPosition: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState({
        rarities: [],
        factions: [],
        positionings: [],
        combatPositions: []
    });

    // UI States
    const [toast, setToast] = useState(null);
    const [compName, setCompName] = useState('');
    const [notes, setNotes] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [viewMode, setViewMode] = useState(false);
    const [showMyComps, setShowMyComps] = useState(false);
    const [savedComps, setSavedComps] = useState([]);
    const [selectedBond, setSelectedBond] = useState(null);

    // Team State
    const [team, setTeam] = useState({
        front1: null, front2: null, front3: null,
        mid1: null, mid2: null, mid3: null,
        back1: null, back2: null, back3: null,
        support1: null, support2: null
    });

    // Helpers
    const getLoc = useCallback((data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    }, [i18n.language]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [charRes, artRes, cardRes] = await Promise.all([
                    api.get('/characters'),
                    api.get('/artifacts'),
                    api.get('/force-cards')
                ]);

                const sortedChars = (charRes.data || []).slice().sort((a, b) => rarityScore(b.rarity) - rarityScore(a.rarity));
                const sortedArts = (artRes.data || []).slice().sort((a, b) => rarityScore(b.rarity) - rarityScore(a.rarity));
                const sortedCards = (cardRes.data || []).slice().sort((a, b) => rarityScore(b.rarity) - rarityScore(a.rarity));

                setCharacters(sortedChars);
                setArtifacts(sortedArts);
                setCards(sortedCards);

                // Extract Options
                const uniqueRarities = [...new Set(sortedChars.map(c => c.rarity))].filter(Boolean).sort();
                const uniqueFactions = [...new Set(sortedChars.map(c => getLoc(c.faction)))].filter(Boolean).sort();
                const uniquePositionings = [...new Set(sortedChars.map(c => getLoc(c.positioning)))].filter(Boolean).sort();
                const uniqueCombatPositions = [...new Set(sortedChars.map(c => getLoc(c.combatPosition)))].filter(Boolean).sort();

                setOptions({
                    rarities: uniqueRarities,
                    factions: uniqueFactions,
                    positionings: uniquePositionings,
                    combatPositions: uniqueCombatPositions
                });

            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [i18n.language, getLoc]);

    // Load Saved Comps
    useEffect(() => {
        if (!user) { setSavedComps([]); return; }
        const key = `comps_${user._id || user.id || 'user'}`;
        try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            setSavedComps(data);
        } catch (e) {
            setSavedComps([]);
        }
    }, [user]);

    // Handle Share Link
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const share = hash || params.get('share');
        if (share) {
            const payload = decodeSharePayload(share);
            if (payload && payload.team) {
                setTeam(hydrateTeamFromPayload(payload.team));
                if (payload.notes) setNotes(payload.notes);
                if (payload.name) setCompName(payload.name);
                setViewMode(true);
                setToast(t('viewOnlyShare'));
            }
        }
    }, [hash, location.search, characters]); // eslint-disable-line

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2200);
    };

    const getMainTeamCount = () => {
        const slots = ['front1', 'front2', 'front3', 'mid1', 'mid2', 'mid3', 'back1', 'back2', 'back3'];
        return slots.reduce((count, slot) => team[slot]?.character ? count + 1 : count, 0);
    };

    // --- Team Logic ---
    const normalizeRow = (positioning) => {
        const value = (positioning || '').toLowerCase();
        if (value.includes('front') || value.includes('frente') || value.includes('avant')) return 'front';
        if (value.includes('mid') || value.includes('meio') || value.includes('medio') || value.includes('centre') || value.includes('centro')) return 'mid';
        if (value.includes('back') || value.includes('trás') || value.includes('tras') || value.includes('arrière') || value.includes('fundo')) return 'back';
        return 'front';
    };

    const getRowSlots = (row) => {
        if (row === 'front') return ['front1', 'front2', 'front3'];
        if (row === 'mid') return ['mid1', 'mid2', 'mid3'];
        return ['back1', 'back2', 'back3'];
    };

    const rebalanceRow = (rowSlots, charsInRow) => {
        const updates = {};
        // Clear all slots first
        rowSlots.forEach(slot => updates[slot] = null);

        if (charsInRow.length === 1) {
            // 1 char -> Middle (Slot 2)
            updates[rowSlots[1]] = charsInRow[0];
        } else if (charsInRow.length === 2) {
            // 2 chars -> Extremes (Slot 1 & 3)
            updates[rowSlots[0]] = charsInRow[0];
            updates[rowSlots[2]] = charsInRow[1];
        } else if (charsInRow.length === 3) {
            // 3 chars -> Slot 1, Slot 3, Slot 2 (3rd char goes to middle)
            updates[rowSlots[0]] = charsInRow[0];
            updates[rowSlots[2]] = charsInRow[1];
            updates[rowSlots[1]] = charsInRow[2];
        }
        return updates;
    };

    const autoAddCharacter = (char, isSupport = false) => {
        // 1. Check if already in team
        const existingSlot = Object.entries(team).find(([_, val]) => val?.character?._id === (char._id || char.id));
        if (existingSlot) {
            notify(t('alreadyInTeam'));
            return;
        }

        if (isSupport) {
            if (!team.support1) {
                setTeam(prev => ({ ...prev, support1: { character: char, relicId: '', cardIds: [] } }));
                return;
            }
            if (!team.support2) {
                setTeam(prev => ({ ...prev, support2: { character: char, relicId: '', cardIds: [] } }));
                return;
            }
            notify(t('supportTeamFull') || 'Support team full');
            return;
        }

        // Main Team Logic
        const row = normalizeRow(getLoc(char.positioning));
        const slots = getRowSlots(row);

        // Get existing chars in this row (preserving order is tricky if we just grab from slots, 
        // but we can infer order based on current count/position or just grab them left-to-right and append)
        // Actually, to support "add 3rd goes to middle", we need to know which was 1st and 2nd.
        // But simpler is: Grab all chars in row, append new one.
        // If we grab left-to-right:
        // Count 1 (Mid): [null, c1, null] -> [c1]
        // Count 2 (Ext): [c1, null, c2] -> [c1, c2]
        // Count 3 (Full): [c1, c3, c2] -> [c1, c3, c2] (Wait, if we read left-to-right, we get c1, c3, c2. 
        // If we append c4? Full.
        // If we remove c3 (Mid)? We get [c1, c2]. Rebalance -> [c1, null, c2]. Correct.
        // So reading left-to-right works for maintaining set, but for "3rd goes to middle", 
        // we just need to handle the *placement* of the list of 3 chars.
        // The list `charsInRow` will be `[c1, c2, c3]`.
        // Logic:
        // 1: [null, c1, null]
        // 2: [c1, null, c2]
        // 3: [c1, c3, c2]  <-- Note: c3 is at index 1 in slots, but index 2 in our list? 
        // No, `rebalanceRow` handles the mapping.
        // If we have 2 chars: `[c1, c2]`. Add `c3`. List: `[c1, c2, c3]`.
        // `rebalanceRow` puts `c1` at Slot 0, `c2` at Slot 2, `c3` at Slot 1.
        // Result: `[c1, c3, c2]`. Correct.

        const currentChars = slots.map(s => team[s]).filter(Boolean);

        if (currentChars.length >= 3) {
            notify(t('rowFull', { row: row.toUpperCase() }));
            return;
        }

        if (getMainTeamCount() >= 5) {
            notify(t('mainTeamFull'));
            return;
        }

        const newChars = [...currentChars, { character: char, relicId: '', cardIds: [] }];
        const updates = rebalanceRow(slots, newChars);

        setTeam(prev => ({ ...prev, ...updates }));
    };

    const removeFromTeam = (slotId) => {
        // If support, just remove
        if (slotId.includes('support')) {
            setTeam(prev => ({ ...prev, [slotId]: null }));
            return;
        }

        // If main row, we need to rebalance
        let row = 'front';
        if (slotId.includes('mid')) row = 'mid';
        if (slotId.includes('back')) row = 'back';

        const slots = getRowSlots(row);
        // Get all chars EXCEPT the one being removed
        // We must read them in slot order (1, 2, 3) to maintain relative order of remaining?
        // Or should we try to preserve "insertion order"?
        // If we have `[c1, c3, c2]` (Slots: 1, 2, 3).
        // Remove `c3` (Slot 2). Remaining from slots: `c1`, `c2`.
        // List: `[c1, c2]`.
        // Rebalance 2 chars: `[c1, null, c2]`. Correct.
        // Remove `c1` (Slot 1). Remaining: `c3`, `c2`.
        // List: `[c3, c2]`.
        // Rebalance: `[c3, null, c2]`. Correct.

        const currentChars = slots.map(s => team[s]).filter(entry => entry && s !== slotId);
        const updates = rebalanceRow(slots, currentChars);

        setTeam(prev => ({ ...prev, ...updates }));
    };

    const handleRelicChange = (slotId, relicId) => {
        setTeam(prev => ({ ...prev, [slotId]: prev[slotId] ? { ...prev[slotId], relicId } : null }));
    };

    const handleCardsChange = (slotId, cardIds) => {
        setTeam(prev => ({ ...prev, [slotId]: prev[slotId] ? { ...prev[slotId], cardIds } : null }));
    };

    // --- Bonds Logic ---
    const activeBonds = useMemo(() => {
        const active = [];
        const teamChars = Object.values(team).filter(slot => slot?.character).map(slot => slot.character);
        const normalize = (s) => s ? s.toLowerCase().replace(/\s+/g, '') : '';

        teamChars.forEach(char => {
            if (!char.bonds || !char.bonds.length) return;

            char.bonds.forEach(bond => {
                const partners = bond.partners || [];
                if (partners.length === 0) return;

                const allPartnersPresent = partners.every(partnerLoc => {
                    return teamChars.some(teamChar => {
                        const langs = ['en', 'pt', 'es', 'fr', 'cn', 'th'];
                        return langs.some(lang => {
                            const pName = partnerLoc[lang];
                            const cName = teamChar.name[lang];
                            return pName && cName && normalize(cName).includes(normalize(pName));
                        });
                    });
                });

                if (allPartnersPresent) {
                    // Find partner character objects for icons
                    const partnersData = partners.map(pLoc => {
                        // Find the character in the team that matched
                        const matchedChar = teamChars.find(tc => {
                            const langs = ['en', 'pt', 'es', 'fr', 'cn', 'th'];
                            return langs.some(lang => {
                                const pName = pLoc[lang];
                                const cName = tc.name[lang];
                                return pName && cName && normalize(cName).includes(normalize(pName));
                            });
                        });
                        return matchedChar || { name: pLoc, imageUrl: '' };
                    });

                    active.push({
                        charName: getLoc(char.name),
                        bondName: getLoc(bond.name),
                        effect: getLoc(bond.effect),
                        partnersData
                    });
                }
            });
        });

        const uniqueBonds = [];
        const seen = new Set();
        active.forEach(b => {
            const key = `${b.bondName}-${b.effect}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBonds.push(b);
            }
        });

        return uniqueBonds;
    }, [team, getLoc]);

    // --- Saving / Sharing Logic ---
    const saveComp = () => {
        if (!user) return notify(t('loginToSave'));
        const key = `comps_${user._id || user.id || 'user'}`;
        const payload = { id: Date.now(), name: compName || t('untitledComp'), notes, team };
        const updated = [...savedComps, payload];
        localStorage.setItem(key, JSON.stringify(updated));
        setSavedComps(updated);
        notify(t('compSaved'));
    };

    const serializeTeamForShare = (currentTeam) => {
        const serialized = {};
        Object.keys(currentTeam).forEach(slot => {
            const entry = currentTeam[slot];
            if (!entry?.character) return;
            const c = entry.character;
            serialized[slot] = {
                characterId: c._id || c.id,
                relicId: entry.relicId || '',
                cardIds: entry.cardIds || [],
                fallback: { id: c._id || c.id, name: c.name, rarity: c.rarity, imageUrl: c.imageUrl }
            };
        });
        return serialized;
    };

    const encodeShare = () => {
        const payload = { team: serializeTeamForShare(team), notes, name: compName || t('untitledComp') };
        const json = JSON.stringify(payload);
        return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const decodeSharePayload = (raw) => {
        try {
            const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(base64);
            return JSON.parse(json);
        } catch (e) { return null; }
    };

    const hydrateTeamFromPayload = (payloadTeam) => {
        const hydrated = { ...team };
        Object.keys(payloadTeam).forEach(slot => {
            const entry = payloadTeam[slot];
            const char = characters.find(c => (c._id || c.id) === entry.characterId) || entry.fallback;
            if (char) {
                hydrated[slot] = { character: char, relicId: entry.relicId, cardIds: entry.cardIds };
            }
        });
        return hydrated;
    };

    const generateShareLink = async () => {
        const hash = encodeShare();
        const link = `${window.location.origin}/team-builder/share/${hash}`;
        setShareLink(link);
        try { await navigator.clipboard.writeText(link); notify(t('linkCopied')); } catch (e) { notify('Error copying link'); }
    };

    // --- Filtering ---
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredCharacters = characters.filter(c => {
        const nameMatch = getLoc(c.name).toLowerCase().includes(searchTerm.toLowerCase());
        const rarityMatch = filters.rarity ? c.rarity === filters.rarity : true;
        const factionMatch = filters.faction ? getLoc(c.faction) === filters.faction : true;
        const posMatch = filters.positioning ? getLoc(c.positioning) === filters.positioning : true;
        const roleMatch = filters.combatPosition ? getLoc(c.combatPosition) === filters.combatPosition : true;
        return nameMatch && rarityMatch && factionMatch && posMatch && roleMatch;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-yellow-500">{t('teamBuilder')}</h1>
                        <p className="text-gray-400 text-xs">{t('buildYourDreamTeam')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={saveComp} disabled={!user || viewMode} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('save')}
                        </button>
                        <button onClick={generateShareLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition-colors">
                            {t('share')}
                        </button>
                        {user && (
                            <button onClick={() => setShowMyComps(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold transition-colors">
                                {t('load')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Sidebar: Metadata & Filters & List */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">

                        {/* Metadata */}
                        <div className="bg-gray-800 p-4 rounded-lg flex flex-col gap-3 border border-gray-700">
                            <input
                                type="text"
                                value={compName}
                                onChange={e => setCompName(e.target.value)}
                                placeholder={t('compositionName')}
                                className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                            />
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={t('notes')}
                                className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none h-24 resize-none"
                            />
                        </div>

                        {/* Filters */}
                        <div className="bg-gray-800 p-4 rounded-lg flex flex-col gap-3 border border-gray-700">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select name="rarity" value={filters.rarity} onChange={handleFilterChange} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:border-yellow-500 outline-none">
                                    <option value="">{t('allRarities')}</option>
                                    {options.rarities.map(r => (
                                        <option key={r} value={r} className={r === 'UR' ? 'text-red-500 font-bold' : r === 'SSR' ? 'text-yellow-500 font-bold' : r === 'SR' ? 'text-purple-400' : 'text-gray-300'}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <select name="faction" value={filters.faction} onChange={handleFilterChange} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:border-yellow-500 outline-none">
                                    <option value="">{t('allFactions')}</option>
                                    {options.factions.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select name="positioning" value={filters.positioning} onChange={handleFilterChange} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:border-yellow-500 outline-none">
                                    <option value="">{t('allPositions')}</option>
                                    {options.positionings.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <select name="combatPosition" value={filters.combatPosition} onChange={handleFilterChange} className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:border-yellow-500 outline-none">
                                    <option value="">{t('allRoles')}</option>
                                    {options.combatPositions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Character List */}
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-1 min-h-[400px] flex flex-col">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">{t('availableSaints')}</h3>
                            <div className="flex-1 overflow-y-auto scrollbar-themed pr-2 grid grid-cols-3 sm:grid-cols-4 gap-2 content-start">
                                {filteredCharacters.map(char => (
                                    <CharacterCard
                                        key={char._id || char.id}
                                        char={char}
                                        getLoc={getLoc}
                                        onAddMain={() => autoAddCharacter(char, false)}
                                        onAddSupport={() => autoAddCharacter(char, true)}
                                        disabled={viewMode}
                                    />
                                ))}
                                {filteredCharacters.length === 0 && (
                                    <div className="col-span-full text-gray-500 text-sm italic text-center py-8">{t('noSaintsFound')}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Team Grid & Bonds */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">

                        {/* Team Grid */}
                        <div className="flex flex-col gap-6">
                            {/* Front */}
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('front')}</div>
                                <div className="flex gap-4 flex-1 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                                    {['front1', 'front2', 'front3'].map(slot => (
                                        <SlotCard key={slot} slot={team[slot]} label={t('front')} getLoc={getLoc} onRemove={() => removeFromTeam(slot)} relics={artifacts} cards={cards} onRelicChange={(id) => handleRelicChange(slot, id)} onCardsChange={(ids) => handleCardsChange(slot, ids)} relicLabel={t('relic')} cardsLabel={t('cards')} noneLabel={t('none')} clearLabel={t('clear')} />
                                    ))}
                                </div>
                            </div>

                            {/* Mid */}
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('mid')}</div>
                                <div className="flex gap-4 flex-1 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                                    {['mid1', 'mid2', 'mid3'].map(slot => (
                                        <SlotCard key={slot} slot={team[slot]} label={t('mid')} getLoc={getLoc} onRemove={() => removeFromTeam(slot)} relics={artifacts} cards={cards} onRelicChange={(id) => handleRelicChange(slot, id)} onCardsChange={(ids) => handleCardsChange(slot, ids)} relicLabel={t('relic')} cardsLabel={t('cards')} noneLabel={t('none')} clearLabel={t('clear')} />
                                    ))}
                                </div>
                            </div>

                            {/* Back */}
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('back')}</div>
                                <div className="flex gap-4 flex-1 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                                    {['back1', 'back2', 'back3'].map(slot => (
                                        <SlotCard key={slot} slot={team[slot]} label={t('back')} getLoc={getLoc} onRemove={() => removeFromTeam(slot)} relics={artifacts} cards={cards} onRelicChange={(id) => handleRelicChange(slot, id)} onCardsChange={(ids) => handleCardsChange(slot, ids)} relicLabel={t('relic')} cardsLabel={t('cards')} noneLabel={t('none')} clearLabel={t('clear')} />
                                    ))}
                                </div>
                            </div>

                            {/* Support */}
                            <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-800">
                                <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-blue-500 uppercase">{t('support')}</div>
                                <div className="flex gap-4 flex-1 justify-center bg-blue-900/10 p-4 rounded-lg border border-blue-900/30 flex-wrap">
                                    {['support1', 'support2'].map(slot => (
                                        <SlotCard key={slot} slot={team[slot]} label={t('support')} getLoc={getLoc} onRemove={() => removeFromTeam(slot)} relics={artifacts} cards={cards} onRelicChange={(id) => handleRelicChange(slot, id)} onCardsChange={(ids) => handleCardsChange(slot, ids)} relicLabel={t('relic')} cardsLabel={t('cards')} noneLabel={t('none')} clearLabel={t('clear')} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Active Bonds */}
                        {activeBonds.length > 0 && (
                            <div className="w-full mt-4">
                                <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-gray-800 pb-2">{t('activeBonds') || 'Active Bonds'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {activeBonds.map((bond, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-800 border border-gray-700 rounded p-3 shadow-sm cursor-pointer hover:border-yellow-500 transition"
                                            onClick={() => setSelectedBond(bond)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex -space-x-2">
                                                    {bond.partnersData.slice(0, 3).map((p, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 overflow-hidden">
                                                            {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                    ))}
                                                    {bond.partnersData.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                                                            +{bond.partnersData.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-yellow-400 text-sm truncate">{bond.bondName}</div>
                                            </div>
                                            <div className="text-xs text-gray-400 line-clamp-2">{bond.effect || 'Check seiya2.vercel.app'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded shadow-lg border border-yellow-600 max-w-sm text-sm z-50 animate-fade-in-up">
                    {toast}
                </div>
            )}

            {selectedBond && (
                <BondModal bond={selectedBond} onClose={() => setSelectedBond(null)} getLoc={getLoc} />
            )}

            {showMyComps && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold">{t('myComps')}</h3>
                            <button onClick={() => setShowMyComps(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {savedComps.length === 0 ? <p className="text-gray-500 text-sm text-center">{t('noSavedComps')}</p> : (
                                savedComps.map(comp => (
                                    <div key={comp.id} className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm">{comp.name}</div>
                                            <div className="text-[10px] text-gray-500">{new Date(comp.id).toLocaleDateString()}</div>
                                        </div>
                                        <button
                                            onClick={() => { setTeam(comp.team); setCompName(comp.name); setNotes(comp.notes); setShowMyComps(false); }}
                                            className="text-xs bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded text-white"
                                        >
                                            {t('load')}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamBuilder;

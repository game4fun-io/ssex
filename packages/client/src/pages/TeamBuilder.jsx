import { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const rarityScore = (rarity) => {
    const order = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
    return order[rarity] || 0;
};

const CharacterCard = ({ char, getLoc, onAddMain, onAddSupport, disabled, addFormationLabel, addSupportLabel }) => (
    <div className={`bg-gray-800 p-2 rounded border border-gray-600 hover:border-yellow-500 w-full flex flex-col items-center text-xs text-white relative group ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
        {char.imageUrl ? (
            <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1" />
        ) : (
            <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
        )}
        <span className="truncate w-full text-center">{getLoc(char.name)}</span>
        <span className="text-[10px] text-gray-400">{char.rarity}</span>
        <span className="text-[10px] text-gray-400">{getLoc(char.positioning) || char.positioning}</span>

        {!disabled && (
        <div className="absolute inset-0 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition flex flex-col justify-center gap-2 p-2">
            <button
                type="button"
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 rounded"
                onClick={() => onAddMain(char)}
            >
                {addFormationLabel}
            </button>
            <button
                type="button"
                className="w-full bg-blue-700 hover:bg-blue-600 text-white text-xs py-1 rounded"
                onClick={() => onAddSupport(char)}
            >
                {addSupportLabel}
            </button>
        </div>
        )}
    </div>
);

const SlotCard = ({ slot, label, getLoc, onRemove, relics, cards, onRelicChange, onCardsChange, relicLabel, cardsLabel, noneLabel }) => {
    const char = slot?.character;
    const relicId = slot?.relicId || '';
    const cardIds = slot?.cardIds || [];
    const [openRelic, setOpenRelic] = useState(false);
    const [openCards, setOpenCards] = useState(false);
    const cardsTimeoutRef = useRef(null);

    return (
        <div className="w-48 min-h-[240px] bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center p-2 gap-2 relative">
            {char ? (
                <>
                    <div className="flex flex-col items-center relative w-full">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
                        )}
                        <span className="text-xs font-bold text-center leading-tight">{getLoc(char.name)}</span>
                        <button onClick={onRemove} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500">x</button>
                    </div>

                    <div className="w-full text-left">
                        <label className="block text-[10px] text-gray-400 mb-1">{label} • {relicLabel}</label>
                        <button
                            type="button"
                            onClick={() => { setOpenRelic(!openRelic); setOpenCards(false); }}
                            className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 text-left flex items-center gap-2 hover:border-yellow-500"
                        >
                            {relicId ? (() => {
                                const art = relics.find(a => (a._id || a.id) === relicId);
                                return (
                                    <>
                                        {art?.imageUrl && <img src={art.imageUrl} alt={getLoc(art?.name)} className="w-6 h-6 object-contain" />}
                                        <span className="truncate">{getLoc(art?.name)}</span>
                                        <span className="text-[10px] text-gray-400 ml-auto">{art?.rarity}</span>
                                    </>
                                );
                            })() : <span className="text-gray-400">{noneLabel}</span>}
                        </button>
                        {openRelic && (
                            <div className="absolute z-30 left-2 right-2 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto scrollbar-themed mt-1 p-2">
                                <button className="text-[10px] text-yellow-400 mb-2" onClick={() => { onRelicChange(''); setOpenRelic(false); }}>{noneLabel}</button>
                                {relics.map((art) => (
                                    <button
                                        key={art._id || art.id}
                                        className="w-full flex items-center gap-2 text-left text-xs text-white p-2 rounded hover:bg-gray-800"
                                        onClick={() => { onRelicChange(art._id || art.id); setOpenRelic(false); }}
                                    >
                                        {art.imageUrl && <img src={art.imageUrl} alt={getLoc(art.name)} className="w-8 h-8 object-contain" />}
                                        <span className="flex-1 truncate">{getLoc(art.name)}</span>
                                        <span className="text-[10px] text-gray-400">{art.rarity}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full text-left">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                            <span>{cardsLabel} ({cardIds.length}/5)</span>
                            <button
                                type="button"
                                className="text-[10px] text-yellow-400 hover:text-yellow-300"
                                onClick={() => onCardsChange([])}
                            >{noneLabel}</button>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setOpenCards(!openCards); setOpenRelic(false); }}
                            className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 text-left flex flex-wrap gap-1 min-h-[44px] hover:border-yellow-500"
                        >
                            {cardIds.length === 0 ? <span className="text-gray-400">{noneLabel}</span> : (
                                cardIds.map((cid) => {
                                    const card = cards.find(c => (c._id || c.id) === cid);
                                    return (
                                        <span key={cid} className="flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600 text-[10px]">
                                            {card?.imageUrl && <img src={card.imageUrl} alt={getLoc(card?.name)} className="w-5 h-5 object-contain" />}
                                            {getLoc(card?.name) || cid}
                                        </span>
                                    );
                                })
                            )}
                        </button>
                        {openCards && (
                            <div
                                className="absolute z-30 left-0 right-0 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto scrollbar-themed mt-1 p-2"
                                onMouseEnter={() => { if (cardsTimeoutRef.current) clearTimeout(cardsTimeoutRef.current); }}
                                onMouseLeave={() => { cardsTimeoutRef.current = setTimeout(() => setOpenCards(false), 1200); }}
                            >
                                {cards.map((card) => {
                                    const idVal = card._id || card.id;
                                    const selected = cardIds.includes(idVal);
                                    const canAdd = selected || cardIds.length < 5;
                                    return (
                                        <button
                                            key={idVal}
                                            className={`w-full flex items-center gap-2 text-left text-xs p-2 rounded ${selected ? 'bg-gray-800 border border-yellow-500' : 'hover:bg-gray-800 border border-transparent'} ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => {
                                                if (!selected && !canAdd) return;
                                                const next = selected ? cardIds.filter(c => c !== idVal) : [...cardIds, idVal].slice(0, 5);
                                                onCardsChange(next);
                                            }}
                                        >
                                            {card.imageUrl && <img src={card.imageUrl} alt={getLoc(card.name)} className="w-8 h-8 object-contain" />}
                                            <span className="flex-1 truncate">{getLoc(card.name)}</span>
                                            <span className="text-[10px] text-gray-400">{card.rarity}</span>
                                        </button>
                                    );
                                })}
                                <div className="flex justify-end mt-2">
                                    <button className="text-[11px] text-yellow-400" onClick={() => setOpenCards(false)}>Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-gray-500 text-xs text-center leading-tight w-full h-full flex items-center justify-center">{label}</div>
            )}
        </div>
    );
};

const TeamBuilder = () => {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const { hash } = useParams();
    const location = useLocation();
    const [characters, setCharacters] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [cards, setCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowFilter, setRowFilter] = useState('');
    const [rarityFilter, setRarityFilter] = useState('');
    const [toast, setToast] = useState(null);
    const [compName, setCompName] = useState('');
    const [notes, setNotes] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [viewMode, setViewMode] = useState(false);
    const [showMyComps, setShowMyComps] = useState(false);
    const [savedComps, setSavedComps] = useState([]);
    const [team, setTeam] = useState({
        front1: null, front2: null, front3: null,
        mid1: null, mid2: null, mid3: null,
        back1: null, back2: null, back3: null,
        support1: null, support2: null
    });

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
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Load saved comps for user
        const loadSaved = () => {
            if (!user) { setSavedComps([]); return; }
            const key = `comps_${user._id || user.id || 'user'}`;
            try {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                setSavedComps(data);
            } catch (e) {
                setSavedComps([]);
            }
        };
        loadSaved();
    }, [user]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const share = hash || params.get('share');
        if (share) {
            try {
                const json = decodeURIComponent(atob(share));
                const payload = JSON.parse(json);
                if (payload.team) setTeam(payload.team);
                if (payload.notes) setNotes(payload.notes);
                if (payload.name) setCompName(payload.name);
                setViewMode(true);
                setToast(t('viewOnlyShare'));
            } catch (e) {
                console.error('Invalid share payload');
            }
        }
    }, [hash, location.search, t]);

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    const getMainTeamCount = () => {
        const slots = ['front1', 'front2', 'front3', 'mid1', 'mid2', 'mid3', 'back1', 'back2', 'back3'];
        return slots.reduce((count, slot) => team[slot]?.character ? count + 1 : count, 0);
    };

    const getMainTeamCountFromState = (state = team) => {
        const slots = ['front1', 'front2', 'front3', 'mid1', 'mid2', 'mid3', 'back1', 'back2', 'back3'];
        return slots.reduce((count, slot) => state[slot]?.character ? count + 1 : count, 0);
    };

    const getSupportCount = (state = team) => {
        return ['support1', 'support2'].reduce((count, slot) => state[slot]?.character ? count + 1 : count, 0);
    };

    const saveComp = () => {
        if (!user) {
            notify(t('loginToSave'));
            return;
        }
        const key = `comps_${user._id || user.id || 'user'}`;
        const payload = { id: Date.now(), name: compName || t('untitledComp'), notes, team };
        const updated = [...(savedComps || []), payload];
        localStorage.setItem(key, JSON.stringify(updated));
        setSavedComps(updated);
        notify(t('compSaved'));
    };

    const encodeShare = () => {
        const payload = { team, notes, name: compName || t('untitledComp') };
        return btoa(encodeURIComponent(JSON.stringify(payload)));
    };

    const generateShareLink = async () => {
        const hash = encodeShare();
        const link = `${window.location.origin}/team-builder?share=${hash}`;
        setShareLink(link);
        try {
            await navigator.clipboard.writeText(link);
            notify(t('linkCopied'));
        } catch (e) {
            notify(link);
        }
    };

    const loadSavedComp = (comp) => {
        setTeam(comp.team || team);
        setNotes(comp.notes || '');
        setCompName(comp.name || '');
        setViewMode(false);
        setShowMyComps(false);
    };

    const findSlotsByChar = (charId) => {
        return Object.entries(team)
            .filter(([, value]) => value?.character?._id === charId || value?.character?.id === charId)
            .map(([k]) => k);
    };

    const normalizeRow = (positioning) => {
        const value = (positioning || '').toLowerCase();
        if (value.includes('front') || value.includes('frente') || value.includes('avant')) return 'front';
        if (value.includes('mid') || value.includes('meio') || value.includes('medio') || value.includes('centre') || value.includes('centro')) return 'mid';
        if (value.includes('back') || value.includes('trás') || value.includes('tras') || value.includes('arrière') || value.includes('fundo')) return 'back';
        return 'front';
    };

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2200);
    };

    const getRowSlots = (row) => {
        if (row === 'front') return ['front1', 'front2', 'front3']; // left, mid, right
        if (row === 'mid') return ['mid1', 'mid2', 'mid3'];
        return ['back1', 'back2', 'back3'];
    };

    const placeWithRule = (state, entry) => {
        const { left, mid, right } = state;
        if (!left && !mid && !right) return { left, mid: entry, right };
        if (mid && !left && !right) return { left: mid, mid: null, right: entry };
        if (left && right && !mid) return { left, mid: entry, right };
        if (!left) return { left: entry, mid, right };
        if (!mid) return { left, mid: entry, right };
        if (!right) return { left, mid, right: entry };
        return { left, mid, right }; // full
    };

    const reflowRow = (row, baseTeam) => {
        const slots = getRowSlots(row);
        const entries = slots
            .map((slot) => baseTeam[slot])
            .filter(Boolean)
            .map((entry) => ({ ...entry }));

        let state = { left: null, mid: null, right: null };
        entries.forEach((entry) => {
            state = placeWithRule(state, entry);
        });

        return {
            [slots[0]]: state.left,
            [slots[1]]: state.mid,
            [slots[2]]: state.right
        };
    };

    const placeInRow = (row, char, baseTeam = team) => {
        const slots = getRowSlots(row);
        const state = {
            left: baseTeam[slots[0]],
            mid: baseTeam[slots[1]],
            right: baseTeam[slots[2]]
        };
        const next = placeWithRule(state, { character: char, relicId: '', cardIds: [] });
        if (next.left === state.left && next.mid === state.mid && next.right === state.right) return null;
        return {
            [slots[0]]: next.left,
            [slots[1]]: next.mid,
            [slots[2]]: next.right
        };
    };

    const autoAddCharacter = (char, asSupport = false) => {
        const row = normalizeRow(getLoc(char.positioning));

        // remove existing placements of this char
        let nextTeam = { ...team };
        findSlotsByChar(char._id || char.id).forEach((slotId) => {
            nextTeam[slotId] = null;
        });

        // reflow rows affected by removal
        ['front', 'mid', 'back'].forEach((r) => {
            nextTeam = { ...nextTeam, ...reflowRow(r, nextTeam) };
        });

        if (asSupport) {
            if (!nextTeam.support1?.character) {
                setTeam({ ...nextTeam, support1: { character: char, relicId: '', cardIds: [] } });
                return;
            }
            if (!nextTeam.support2?.character) {
                setTeam({ ...nextTeam, support2: { character: char, relicId: '', cardIds: [] } });
                return;
            }
            notify(t('noSpaceForSaint'));
            return;
        }

        const placement = placeInRow(row, char, nextTeam);

        const mainCount = getMainTeamCountFromState(nextTeam);
        if (placement) {
            if (mainCount >= 5) {
                notify(t('mainTeamFull'));
                return;
            }
            setTeam({ ...nextTeam, ...placement });
            return;
        }

        notify(t('noSpaceForSaint'));
    };

    const removeFromTeam = (slotId) => {
        const row = slotId.startsWith('front') ? 'front' : slotId.startsWith('mid') ? 'mid' : slotId.startsWith('back') ? 'back' : null;
        let nextTeam = { ...team, [slotId]: null };
        if (row) {
            nextTeam = { ...nextTeam, ...reflowRow(row, nextTeam) };
        }
        setTeam(nextTeam);
    };

    const handleRelicChange = (slotId, relicId) => {
        setTeam(prev => ({
            ...prev,
            [slotId]: prev[slotId] ? { ...prev[slotId], relicId } : null
        }));
    };

    const handleCardsChange = (slotId, cardIds) => {
        setTeam(prev => ({
            ...prev,
            [slotId]: prev[slotId] ? { ...prev[slotId], cardIds } : null
        }));
    };

    const filteredCharacters = characters.filter((c) => {
        const nameMatch = getLoc(c.name).toLowerCase().includes(searchTerm.trim().toLowerCase());
        const rowMatch = rowFilter ? normalizeRow(getLoc(c.positioning)) === rowFilter : true;
        const rarityMatch = rarityFilter ? c.rarity === rarityFilter : true;
        return nameMatch && rowMatch && rarityMatch;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-4">{t('teamBuilder')}</h1>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <input
                            type="text"
                            value={compName}
                            onChange={(e) => setCompName(e.target.value)}
                            placeholder={t('compName')}
                            disabled={viewMode}
                            className="bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-yellow-500 outline-none"
                        />
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('notesPlaceholder')}
                            disabled={!user || viewMode}
                            className="bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-yellow-500 outline-none min-h-[60px]"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                        <button
                            type="button"
                            onClick={saveComp}
                            disabled={!user || viewMode}
                            className={`px-4 py-2 rounded font-semibold text-sm border ${user && !viewMode ? 'bg-yellow-600 hover:bg-yellow-500 border-yellow-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'}`}
                        >
                            {t('saveComp')}
                        </button>
                        <button
                            type="button"
                            onClick={generateShareLink}
                            className="px-4 py-2 rounded font-semibold text-sm border bg-blue-700 hover:bg-blue-600 border-blue-500 text-white"
                        >
                            {t('shareComp')}
                        </button>
                        {user && (
                            <button
                                type="button"
                                onClick={() => setShowMyComps(true)}
                                className="px-4 py-2 rounded font-semibold text-sm border bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                            >
                                {t('myComps')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Character List */}
                    <div className="lg:col-span-1 bg-gray-900 border border-gray-700 p-0 rounded-lg h-[640px] overflow-y-auto overflow-x-hidden scrollbar-themed relative">
                        <div className="sticky top-0 z-10 bg-gray-900 p-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold mb-2 text-gray-300">{t('availableSaints')}</h2>
                            <p className="text-xs text-gray-500 mb-3">{t('clickToAdd')}</p>

                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 focus:border-yellow-500 outline-none"
                                />
                                <div className="flex gap-2 text-xs">
                                    <select
                                        value={rowFilter}
                                        onChange={(e) => setRowFilter(e.target.value)}
                                        className="bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-yellow-500 w-1/2"
                                    >
                                        <option value="">{t('all')}</option>
                                        <option value="front">{t('frontRow')}</option>
                                        <option value="mid">{t('midRow')}</option>
                                        <option value="back">{t('backRow')}</option>
                                    </select>
                                    <select
                                        value={rarityFilter}
                                        onChange={(e) => setRarityFilter(e.target.value)}
                                        className="bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-yellow-500 w-1/2"
                                    >
                                        <option value="">{t('all')}</option>
                                        {['UR','SSR','SR','R','N'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-4">
                            {filteredCharacters.map(char => (
                                <CharacterCard
                                    key={char._id || char.id}
                                    char={char}
                                    getLoc={getLoc}
                                    onAddMain={(c) => !viewMode && autoAddCharacter(c, false)}
                                    onAddSupport={(c) => !viewMode && autoAddCharacter(c, true)}
                                    disabled={viewMode}
                                    addFormationLabel={t('addFormation')}
                                    addSupportLabel={t('addSupport')}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Formation */}
                    <div className="lg:col-span-2 bg-gray-800 p-8 rounded-lg flex flex-col gap-6">
                        <div className="flex justify-between w-full items-center">
                            <h2 className="text-2xl font-bold text-yellow-500">{t('formation')}</h2>
                            <span className={`text-lg font-bold ${getMainTeamCount() === 5 ? 'text-red-500' : 'text-green-500'}`}>
                                {getMainTeamCount()}/5 Main
                            </span>
                        </div>

                            <div className="flex gap-4 w-full flex-wrap">
                                <div className="flex flex-col gap-4 flex-1 min-w-0">
                                {[['front', t('frontRow') || 'Front'], ['mid', t('midRow') || 'Middle'], ['back', t('backRow') || 'Back']].map(([rowKey, rowLabel]) => (
                                    <div key={rowKey} className="flex gap-3 items-start">
                                        <div className="w-16 text-gray-500 font-bold text-sm pt-4 text-right">{rowLabel.toUpperCase()}</div>
                                        <div className="flex gap-3">
                                            {getRowSlots(rowKey).map((slotId, idx) => (
                                                <SlotCard
                                                    key={slotId}
                                                    slot={team[slotId]}
                                                    label={`${rowLabel} ${idx === 0 ? 'L' : idx === 1 ? 'M' : 'R'}`}
                                                    getLoc={getLoc}
                                                    onRemove={() => removeFromTeam(slotId)}
                                                    relics={artifacts}
                                                    cards={cards}
                                                    onRelicChange={(val) => handleRelicChange(slotId, val)}
                                                    onCardsChange={(vals) => handleCardsChange(slotId, vals)}
                                                    relicLabel={t('relicLabel')}
                                                    cardsLabel={t('ultimateCardsLabel')}
                                                    noneLabel={t('noneOption')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-bold text-blue-400 text-center mb-3">{t('support')}</h3>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <SlotCard slot={team.support1} label={t('support')} getLoc={getLoc} onRemove={() => removeFromTeam('support1')} relics={artifacts} cards={cards} onRelicChange={(val) => handleRelicChange('support1', val)} onCardsChange={(vals) => handleCardsChange('support1', vals)} relicLabel={t('relicLabel')} cardsLabel={t('ultimateCardsLabel')} noneLabel={t('noneOption')} />
                                <SlotCard slot={team.support2} label={t('support')} getLoc={getLoc} onRemove={() => removeFromTeam('support2')} relics={artifacts} cards={cards} onRelicChange={(val) => handleRelicChange('support2', val)} onCardsChange={(vals) => handleCardsChange('support2', vals)} relicLabel={t('relicLabel')} cardsLabel={t('ultimateCardsLabel')} noneLabel={t('noneOption')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded shadow-lg border border-yellow-600 max-w-sm text-sm">
                    {toast}
                </div>
            )}

            {showMyComps && user && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-themed">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">{t('myComps')}</h3>
                            <button className="text-gray-400 hover:text-white" onClick={() => setShowMyComps(false)}>✕</button>
                        </div>
                        {savedComps.length === 0 ? (
                            <p className="text-gray-400 text-sm">{t('noComps')}</p>
                        ) : (
                            <div className="space-y-3">
                                {savedComps.map((comp) => (
                                    <div key={comp.id} className="border border-gray-700 rounded p-3 bg-gray-800">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-semibold">{comp.name}</p>
                                                <p className="text-[11px] text-gray-500">{new Date(comp.id).toLocaleString()}</p>
                                            </div>
                                            <button className="text-yellow-400 text-sm" onClick={() => loadSavedComp(comp)}>{t('load')}</button>
                                        </div>
                                        {comp.notes && <p className="text-xs text-gray-300 mt-2 line-clamp-2">{comp.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamBuilder;

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const DraggableCharacter = ({ char, onClick, getLoc }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: char._id,
        data: char,
        activationConstraint: { distance: 8 }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => { e.preventDefault(); onClick(char); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(char); } }}
            className="bg-gray-800 p-2 rounded cursor-grab hover:bg-gray-700 border border-gray-600 w-24 h-28 flex flex-col items-center justify-center text-xs text-center relative group select-none"
        >
            {char.imageUrl ? (
                <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1 pointer-events-none" />
            ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
            )}
            <span className="truncate w-full">{getLoc(char.name)}</span>
            <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition">
                {getLoc(char.positioning) || char.positioning}
            </div>
        </div>
    );
};

const DroppableSlot = ({ id, slot, onRemove, label, getLoc, artifacts, cards, onRelicChange, onCardsChange, relicLabel, cardsLabel, noneLabel }) => {
    const { isOver, setNodeRef } = useDroppable({ id });

    const style = {
        borderColor: isOver ? '#EAB308' : '#4B5563',
    };

    const char = slot?.character;
    const relicId = slot?.relicId || '';
    const cardIds = slot?.cardIds || [];

    return (
        <div ref={setNodeRef} style={style} className="w-40 min-h-[220px] bg-gray-800 border-2 border-dashed rounded-lg flex flex-col items-center justify-start relative p-2 gap-2">
            {char ? (
                <>
                    <div className="flex flex-col items-center">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
                        )}
                        <span className="text-xs font-bold text-center leading-tight">{getLoc(char.name)}</span>
                        <button onClick={() => onRemove(id)} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500">x</button>
                    </div>

                    <div className="w-full">
                        <label className="block text-[10px] text-gray-400">{label} • {relicLabel}</label>
                        <select
                            className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600"
                            value={relicId}
                            onChange={(e) => onRelicChange(id, e.target.value)}
                        >
                            <option value="">{noneLabel}</option>
                            {artifacts.map((art) => (
                                <option key={art._id || art.id} value={art._id || art.id}>{getLoc(art.name)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span>{cardsLabel} ({cardIds.length}/5)</span>
                            <button
                                type="button"
                                className="text-[10px] text-yellow-400 hover:text-yellow-300"
                                onClick={() => onCardsChange(id, [])}
                            >{noneLabel}</button>
                        </div>
                        <select
                            multiple
                            size={Math.min(6, cards.length || 6)}
                            className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 min-h-[88px]"
                            value={cardIds}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions).map((o) => o.value).slice(0, 5);
                                onCardsChange(id, selected);
                            }}
                        >
                            {cards.map((card) => (
                                <option key={card._id || card.id} value={card._id || card.id}>{getLoc(card.name)}</option>
                            ))}
                        </select>
                        {cardIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {cardIds.map((cid) => {
                                    const card = cards.find(c => (c._id || c.id) === cid);
                                    return <span key={cid} className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">{getLoc(card?.name) || cid}</span>;
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <span className="text-gray-500 text-xs text-center leading-tight">{label || `Slot`}</span>
            )}
        </div>
    );
};

const TeamBuilder = () => {
    const { t, i18n } = useTranslation();
    const [characters, setCharacters] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [cards, setCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowFilter, setRowFilter] = useState('');
    const [rarityFilter, setRarityFilter] = useState('');
    const [activeChar, setActiveChar] = useState(null);
    const [team, setTeam] = useState({
        front1: null, front2: null, front3: null,
        mid1: null, mid2: null, mid3: null,
        back1: null, back2: null, back3: null,
        support1: null, support2: null
    });

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await api.get('/characters');
                setCharacters(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchArtifacts = async () => {
            try {
                const res = await api.get('/artifacts');
                setArtifacts(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchCards = async () => {
            try {
                const res = await api.get('/force-cards');
                setCards(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCharacters();
        fetchArtifacts();
        fetchCards();
    }, []);

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

    const normalizeRow = (positioning) => {
        const value = (positioning || '').toLowerCase();
        if (value.includes('front') || value.includes('frente') || value.includes('avant')) return 'front';
        if (value.includes('mid') || value.includes('meio') || value.includes('medio') || value.includes('centre') || value.includes('centro')) return 'mid';
        if (value.includes('back') || value.includes('trás') || value.includes('tras') || value.includes('arrière') || value.includes('fundo')) return 'back';
        return 'front';
    };

    const handleDragStart = (event) => {
        const { active } = event;
        if (active?.data?.current) {
            setActiveChar(active.data.current);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveChar(null);

        if (over && active.data.current) {
            const char = active.data.current;
            const slotId = over.id;
            const isSupportSlot = slotId.startsWith('support');

            const charRow = normalizeRow(getLoc(char.positioning));
            const targetRow = slotRow(slotId);
            if (!isSupportSlot && targetRow !== charRow) {
                alert(`${getLoc(char.name)} prefers the ${charRow} row.`);
                return;
            }

            // Check limits
            if (!isSupportSlot && getMainTeamCount() >= 5 && !team[slotId]?.character) {
                alert("Main team is limited to 5 characters!");
                return;
            }

            setTeam(prev => ({
                ...prev,
                [slotId]: { character: char, relicId: '', cardIds: [] }
            }));
        }
    };

    const getRowSlots = (row) => {
        if (row === 'front') return ['front1', 'front2', 'front3'];
        if (row === 'mid') return ['mid1', 'mid2', 'mid3'];
        return ['back1', 'back2', 'back3'];
    };

    const slotRow = (slotId) => {
        if (slotId.startsWith('front')) return 'front';
        if (slotId.startsWith('mid')) return 'mid';
        if (slotId.startsWith('back')) return 'back';
        return 'support';
    };

    const autoAddCharacter = (char) => {
        const row = normalizeRow(getLoc(char.positioning));
        const targetSlots = getRowSlots(row);

        let added = false;
        for (const slot of targetSlots) {
            if (!team[slot]?.character) {
                if (getMainTeamCount() < 5) {
                    setTeam(prev => ({ ...prev, [slot]: { character: char, relicId: '', cardIds: [] } }));
                    added = true;
                } else {
                    alert("Main team is full (5/5)!");
                    return;
                }
                break;
            }
        }

        if (!added) {
            if (!team.support1?.character) setTeam(prev => ({ ...prev, support1: { character: char, relicId: '', cardIds: [] } }));
            else if (!team.support2?.character) setTeam(prev => ({ ...prev, support2: { character: char, relicId: '', cardIds: [] } }));
            else alert(`No space in ${row} or Support slots!`);
        }
    };

    const removeFromTeam = (slotId) => {
        setTeam(prev => ({ ...prev, [slotId]: null }));
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
        const rarityMatch = rarityFilter ? (c.rarity === rarityFilter) : true;
        return nameMatch && rowMatch && rarityMatch;
    });

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('teamBuilder')}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Character List */}
                        <div className="lg:col-span-1 bg-gray-900 border border-gray-700 p-4 rounded-lg h-[640px] overflow-y-auto scrollbar-themed">
                            <h2 className="text-xl font-bold mb-4 text-gray-300">{t('availableSaints')}</h2>
                            <p className="text-xs text-gray-500 mb-4">{t('clickToAdd')}</p>

                            <div className="flex flex-col gap-2 mb-4">
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
                                        {[...new Set(characters.map(c => c.rarity).filter(Boolean))].sort().map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {filteredCharacters.map(char => (
                                    <DraggableCharacter key={char._id} char={char} onClick={autoAddCharacter} getLoc={getLoc} />
                                ))}
                            </div>
                        </div>

                        {/* Formation Area */}
                        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-lg flex flex-col items-center justify-center gap-8">
                            <div className="flex justify-between w-full items-center">
                                <h2 className="text-2xl font-bold text-yellow-500">{t('formation')}</h2>
                                <span className={`text-lg font-bold ${getMainTeamCount() === 5 ? 'text-red-500' : 'text-green-500'}`}>
                                    {getMainTeamCount()}/5 Main
                                </span>
                            </div>

                            <div className="flex gap-6 w-full">
                                <div className="flex flex-col gap-4 w-full">
                                    {[['front', t('frontRow') || 'Front'], ['mid', t('midRow') || 'Middle'], ['back', t('backRow') || 'Back']].map(([rowKey, rowLabel]) => (
                                        <div key={rowKey} className="flex gap-3 items-start">
                                            <div className="w-16 text-gray-500 font-bold text-sm pt-4 text-right">{rowLabel.toUpperCase()}</div>
                                            <div className="flex gap-3">
                                                {getRowSlots(rowKey).map((slotId) => (
                                                    <DroppableSlot
                                                        key={slotId}
                                                        id={slotId}
                                                        slot={team[slotId]}
                                                        onRemove={removeFromTeam}
                                                        label={rowLabel}
                                                        getLoc={getLoc}
                                                        artifacts={artifacts}
                                                        cards={cards}
                                                        onRelicChange={handleRelicChange}
                                                        onCardsChange={handleCardsChange}
                                                        relicLabel={t('relicLabel')}
                                                        cardsLabel={t('ultimateCardsLabel')}
                                                        noneLabel={t('noneOption')}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-48 shrink-0 bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-3">
                                    <h3 className="text-lg font-bold text-blue-400 text-center">{t('support')}</h3>
                                    <DroppableSlot id="support1" slot={team.support1} onRemove={removeFromTeam} label={t('support')} getLoc={getLoc} artifacts={artifacts} cards={cards} onRelicChange={handleRelicChange} onCardsChange={handleCardsChange} relicLabel={t('relicLabel')} cardsLabel={t('ultimateCardsLabel')} noneLabel={t('noneOption')} />
                                    <DroppableSlot id="support2" slot={team.support2} onRemove={removeFromTeam} label={t('support')} getLoc={getLoc} artifacts={artifacts} cards={cards} onRelicChange={handleRelicChange} onCardsChange={handleCardsChange} relicLabel={t('relicLabel')} cardsLabel={t('ultimateCardsLabel')} noneLabel={t('noneOption')} />
                                </div>
                            </div>

                            {/* Basic Stats Summary */}
                            {/* Placeholder for future stats; hidden for now */}
                        </div>
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeChar ? (
                    <div className="bg-gray-800 p-2 rounded border border-yellow-500 shadow-2xl">
                        {activeChar.imageUrl ? (
                            <img src={activeChar.imageUrl} alt={getLoc(activeChar.name)} className="w-16 h-16 object-cover rounded-full" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-600 rounded-full" />
                        )}
                        <div className="text-xs font-bold text-yellow-400 mt-1 text-center">{getLoc(activeChar.name)}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TeamBuilder;

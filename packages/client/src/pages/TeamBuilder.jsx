import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const DraggableCharacter = ({ char, onClick, getLoc }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: char._id,
        data: char
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
            onClick={() => onClick(char)}
            className="bg-gray-800 p-2 rounded cursor-grab hover:bg-gray-700 border border-gray-600 w-24 h-24 flex flex-col items-center justify-center text-xs text-center relative group"
        >
            {char.imageUrl ? (
                <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1 pointer-events-none" />
            ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
            )}
            <span className="truncate w-full">{getLoc(char.name)}</span>
            <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition">
                {char.positioning}
            </div>
        </div>
    );
};

const DroppableSlot = ({ id, char, onRemove, label, getLoc }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        borderColor: isOver ? '#EAB308' : '#4B5563',
    };

    return (
        <div ref={setNodeRef} style={style} className="w-28 h-28 bg-gray-800 border-2 border-dashed rounded-lg flex items-center justify-center relative">
            {char ? (
                <div className="flex flex-col items-center">
                    {char.imageUrl ? (
                        <img src={char.imageUrl} alt={getLoc(char.name)} className="w-16 h-16 object-cover rounded-full mb-1" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-600 rounded-full mb-1" />
                    )}
                    <span className="text-xs font-bold text-center leading-tight">{getLoc(char.name)}</span>
                    <button onClick={() => onRemove(id)} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500">x</button>
                </div>
            ) : (
                <span className="text-gray-500 text-xs">{label || `Slot`}</span>
            )}
        </div>
    );
};

const TeamBuilder = () => {
    const { t, i18n } = useTranslation();
    const [characters, setCharacters] = useState([]);
    const [team, setTeam] = useState({
        front1: null, front2: null,
        mid1: null, mid2: null,
        back1: null, back2: null,
        support1: null, support2: null // Added support slots
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
        fetchCharacters();
    }, []);

    const getLoc = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    };

    const getMainTeamCount = () => {
        const slots = ['front1', 'front2', 'mid1', 'mid2', 'back1', 'back2'];
        return slots.reduce((count, slot) => team[slot] ? count + 1 : count, 0);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.data.current) {
            const char = active.data.current;
            const slotId = over.id;
            const isSupportSlot = slotId.startsWith('support');

            // Check limits
            if (!isSupportSlot && getMainTeamCount() >= 5 && !team[slotId]) {
                alert("Main team is limited to 5 characters!");
                return;
            }

            setTeam(prev => ({
                ...prev,
                [slotId]: char
            }));
        }
    };

    const autoAddCharacter = (char) => {
        // Determine target slots based on positioning
        let targetSlots = [];
        if (char.combatPosition === 'Supporter') {
            // Prefer support slots for supporters? Or just based on positioning?
            // User asked for "ability to add support chars as well". 
            // Let's assume Support combat position can go anywhere, but we have dedicated support slots too.
            // For auto-add, let's try to fit them in their 'positioning' first.
        }

        if (char.positioning === 'Front Row') targetSlots = ['front1', 'front2'];
        else if (char.positioning === 'Mid Row') targetSlots = ['mid1', 'mid2'];
        else if (char.positioning === 'Back Row') targetSlots = ['back1', 'back2'];

        // Try to find an empty slot in the preferred row
        let added = false;
        for (const slot of targetSlots) {
            if (!team[slot]) {
                if (getMainTeamCount() < 5) {
                    setTeam(prev => ({ ...prev, [slot]: char }));
                    added = true;
                } else {
                    alert("Main team is full (5/5)!");
                    return;
                }
                break;
            }
        }

        // If row is full, maybe try support slots?
        if (!added) {
            if (!team.support1) setTeam(prev => ({ ...prev, support1: char }));
            else if (!team.support2) setTeam(prev => ({ ...prev, support2: char }));
            else alert(`No space in ${char.positioning} or Support slots!`);
        }
    };

    const removeFromTeam = (slotId) => {
        setTeam(prev => ({ ...prev, [slotId]: null }));
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-yellow-500 mb-8">{t('teamBuilder')}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Character List */}
                        <div className="lg:col-span-1 bg-gray-900 border border-gray-700 p-4 rounded-lg h-[600px] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4 text-gray-300">Available Saints</h2>
                            <p className="text-xs text-gray-500 mb-2">Click to auto-add or drag to slot.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {characters.map(char => (
                                    <DraggableCharacter key={char._id} char={char} onClick={autoAddCharacter} getLoc={getLoc} />
                                ))}
                            </div>
                        </div>

                        {/* Formation Area */}
                        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-lg flex flex-col items-center justify-center gap-8">
                            <div className="flex justify-between w-full items-center">
                                <h2 className="text-2xl font-bold text-yellow-500">Formation</h2>
                                <span className={`text-lg font-bold ${getMainTeamCount() === 5 ? 'text-red-500' : 'text-green-500'}`}>
                                    {getMainTeamCount()}/5 Main
                                </span>
                            </div>

                            <div className="flex gap-8 relative">
                                {/* Lane Labels */}
                                <div className="absolute -left-16 top-0 h-full flex flex-col justify-around text-gray-500 font-bold text-sm">
                                    <span>FRONT</span>
                                    <span>MID</span>
                                    <span>BACK</span>
                                </div>

                                {/* Grid Layout: 2-2-2 visual but logic enforces 5 max */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <DroppableSlot id="front1" char={team.front1} onRemove={removeFromTeam} label="Front" getLoc={getLoc} />
                                        <DroppableSlot id="front2" char={team.front2} onRemove={removeFromTeam} label="Front" getLoc={getLoc} />
                                    </div>
                                    <div className="flex gap-4">
                                        <DroppableSlot id="mid1" char={team.mid1} onRemove={removeFromTeam} label="Mid" getLoc={getLoc} />
                                        <DroppableSlot id="mid2" char={team.mid2} onRemove={removeFromTeam} label="Mid" getLoc={getLoc} />
                                    </div>
                                    <div className="flex gap-4">
                                        <DroppableSlot id="back1" char={team.back1} onRemove={removeFromTeam} label="Back" getLoc={getLoc} />
                                        <DroppableSlot id="back2" char={team.back2} onRemove={removeFromTeam} label="Back" getLoc={getLoc} />
                                    </div>
                                </div>
                            </div>

                            {/* Support Slots */}
                            <div className="w-full border-t border-gray-700 pt-6 mt-2">
                                <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">Support</h3>
                                <div className="flex justify-center gap-4">
                                    <DroppableSlot id="support1" char={team.support1} onRemove={removeFromTeam} label="Support" getLoc={getLoc} />
                                    <DroppableSlot id="support2" char={team.support2} onRemove={removeFromTeam} label="Support" getLoc={getLoc} />
                                </div>
                            </div>

                            {/* Basic Stats Summary */}
                            <div className="mt-4 p-4 bg-gray-900 rounded w-full">
                                <h3 className="text-xl font-bold text-yellow-500 mb-2">Team Stats</h3>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <div>
                                        <span className="block text-gray-400 text-sm">Total HP</span>
                                        <span className="text-xl font-bold">{Object.values(team).reduce((acc, char) => acc + (char?.stats?.hp || 0), 0)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-sm">Total ATK</span>
                                        <span className="text-xl font-bold">{Object.values(team).reduce((acc, char) => acc + (char?.stats?.atk || 0), 0)}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
};

export default TeamBuilder;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const rarityScore = (rarity) => {
    const order = { UR: 5, SSR: 4, SR: 3, R: 2, N: 1 };
    return order[rarity] || 0;
};

const teamSlots = ['front1', 'front2', 'front3', 'mid1', 'mid2', 'mid3', 'back1', 'back2', 'back3', 'support1', 'support2'];

const SharedComp = () => {
    const { hash } = useParams();
    const { t, i18n } = useTranslation();
    const [characters, setCharacters] = useState([]);
    const [sharePayload, setSharePayload] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const getLoc = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return value[lang] || value.en || '';
    };

    const urlSafeBase64Decode = (raw) => {
        if (!raw) return null;
        try {
            const normalized = raw.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
            const binary = atob(padded);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            const json = new TextDecoder().decode(bytes);
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    };

    const decodeSharePayload = (raw) => {
        if (!raw) return null;
        try {
            const decodedHash = (() => {
                try { return decodeURIComponent(raw); } catch (e) { return raw; }
            })();
            return urlSafeBase64Decode(decodedHash);
        } catch (e) {
            return null;
        }
    };

    const hydrateTeamFromPayload = (payloadTeam = {}) => {
        const hydrated = {
            front1: null, front2: null, front3: null,
            mid1: null, mid2: null, mid3: null,
            back1: null, back2: null, back3: null,
            support1: null, support2: null
        };

        const findCharacter = (id, fallback) => {
            if (!id && fallback?.id) id = fallback.id;
            const match = characters.find((c) => c._id === id || c.id === id || c.characterId === id);
            if (match) return match;
            if (fallback) return fallback;
            return null;
        };

        teamSlots.forEach((slot) => {
            const entry = payloadTeam[slot];
            if (!entry) return;
            if (entry.character) {
                hydrated[slot] = { character: entry.character, relicId: entry.relicId || '', cardIds: entry.cardIds || [] };
                return;
            }
            const character = findCharacter(entry.characterId, entry.fallbackCharacter);
            if (!character) return;
            hydrated[slot] = {
                character,
                relicId: entry.relicId || '',
                cardIds: entry.cardIds || []
            };
        });

        return hydrated;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const charRes = await api.get('/characters');
                const sortedChars = (charRes.data || []).slice().sort((a, b) => rarityScore(b.rarity) - rarityScore(a.rarity));
                setCharacters(sortedChars);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!hash) return;
        const payload = decodeSharePayload(hash);
        if (!payload) { setError(t('invalidShare')); return; }
        setSharePayload(payload);
    }, [hash, t]);

    useEffect(() => {
        if (!sharePayload) return;
        const hydrated = hydrateTeamFromPayload(sharePayload.team || {});
        setData({ ...sharePayload, team: hydrated });
    }, [sharePayload, characters]);

    const getRowSlots = (rowKey) => {
        if (rowKey === 'front') return ['front1', 'front2', 'front3'];
        if (rowKey === 'mid') return ['mid1', 'mid2', 'mid3'];
        return ['back1', 'back2', 'back3'];
    };

    if (error) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{error}</div>;
    }

    if (!data) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;
    }

    const { team = {}, notes = '', name = t('untitledComp') } = data;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-yellow-500">{name}</h1>
                        <p className="text-sm text-gray-400">{t('viewOnlyShare')}</p>
                    </div>
                    <div className="text-sm text-gray-400">{t('shareComp')}</div>
                </div>

                {notes && (
                    <div className="bg-gray-800 border border-gray-700 rounded p-4">
                        <h3 className="text-lg font-bold text-white mb-2">{t('notesLabel') || 'Notes'}</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{notes}</p>
                    </div>
                )}

                <div className="bg-gray-800 border border-gray-700 rounded p-6">
                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">{t('formation')}</h2>
                    <div className="flex flex-col gap-4">
                        {['front', 'mid', 'back'].map((rowKey) => (
                            <div key={rowKey} className="flex gap-3 items-start">
                                <div className="w-16 text-gray-500 font-bold text-sm pt-4 text-right">{(t(`${rowKey}Row`) || rowKey).toUpperCase()}</div>
                                <div className="flex gap-3">
                                    {getRowSlots(rowKey).map((slotId) => {
                                        const entry = team[slotId];
                                        if (!entry?.character) {
                                            return <div key={slotId} className="w-32 h-32 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-600 text-xs">{t('noneOption')}</div>;
                                        }
                                        return (
                                            <div key={slotId} className="w-32 h-32 bg-gray-900 border border-gray-700 rounded p-2 flex flex-col items-center text-center text-xs">
                                                {entry.character.imageUrl ? (
                                                    <img src={entry.character.imageUrl} alt={getLoc(entry.character.name)} className="w-14 h-14 object-cover rounded-full mb-1" />
                                                ) : (
                                                    <div className="w-14 h-14 bg-gray-700 rounded-full mb-1" />
                                                )}
                                                <span className="text-white font-semibold truncate w-full">{getLoc(entry.character.name)}</span>
                                                <span className="text-[10px] text-gray-400">{entry.character.rarity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-700 mt-6 pt-4">
                        <h3 className="text-lg font-bold text-blue-400 mb-3 text-center">{t('support')}</h3>
                        <div className="flex gap-3 justify-center flex-wrap">
                            {['support1', 'support2'].map((slotId) => {
                                const entry = team[slotId];
                                if (!entry?.character) {
                                    return <div key={slotId} className="w-32 h-32 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-600 text-xs">{t('noneOption')}</div>;
                                }
                                return (
                                    <div key={slotId} className="w-32 h-32 bg-gray-900 border border-gray-700 rounded p-2 flex flex-col items-center text-center text-xs">
                                        {entry.character.imageUrl ? (
                                            <img src={entry.character.imageUrl} alt={getLoc(entry.character.name)} className="w-14 h-14 object-cover rounded-full mb-1" />
                                        ) : (
                                            <div className="w-14 h-14 bg-gray-700 rounded-full mb-1" />
                                        )}
                                        <span className="text-white font-semibold truncate w-full">{getLoc(entry.character.name)}</span>
                                        <span className="text-[10px] text-gray-400">{entry.character.rarity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedComp;

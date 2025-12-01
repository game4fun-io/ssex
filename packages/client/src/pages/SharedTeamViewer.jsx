import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const ReadOnlySlotCard = ({ slot, label, getLoc, relics, cards }) => {
    const char = slot?.character || slot?.fallback;
    const relicId = slot?.relicId;
    const cardIds = slot?.cardIds || [];

    if (!char) {
        return (
            <div className="w-full md:w-48 h-48 md:h-72 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg flex items-center justify-center text-gray-600 text-xs md:text-sm font-bold">
                {label}
            </div>
        );
    }

    return (
        <div className="w-full md:w-48 min-h-[200px] md:min-h-[288px] bg-gray-800 border border-gray-600 rounded-lg flex flex-col items-center p-2 md:p-3 gap-2 md:gap-3 relative group shadow-lg">
            <Link to={`/characters/${char._id || char.id}`} className="relative group cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-20 h-24 md:w-24 md:h-32 bg-gray-800 rounded-lg border border-gray-700 relative overflow-hidden">
                    {char.imageUrl ? (
                        <img src={char.imageUrl} alt={getLoc(char.name)} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-1">
                            {getLoc(char.name)}
                        </div>
                    )}
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold text-white ${char.rarity === 'UR' ? 'bg-red-600' :
                        char.rarity === 'SSR' ? 'bg-yellow-600' :
                            char.rarity === 'SR' ? 'bg-purple-600' :
                                'bg-blue-600'
                        }`}>
                        {char.rarity}
                    </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-0.5 rounded text-[10px] md:text-xs whitespace-nowrap border border-gray-700 shadow-sm z-10 font-bold max-w-[90%] truncate">
                    {getLoc(char.name)}
                </div>
            </Link>

            {/* Equipment Section (Read Only) */}
            <div className="w-full mt-2 md:mt-4 flex flex-col gap-2 md:gap-3">
                {/* Relic */}
                <div className="relative">
                    <label className="text-[9px] md:text-[10px] text-gray-400 ml-1 mb-0.5 block font-semibold">{getLoc('relic')}</label>
                    <div className={`w-full text-[10px] md:text-xs p-1.5 md:p-2.5 rounded border flex items-center gap-2 ${relicId ? 'bg-gray-700 border-yellow-500/50 text-yellow-400' : 'bg-gray-700/30 border-gray-600 text-gray-500'}`}>
                        {relicId ? (() => {
                            const r = relics.find(x => (x._id || x.id) === relicId);
                            return (
                                <>
                                    {r?.imageUrl && <img src={r.imageUrl} alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />}
                                    <span className="truncate flex-1 text-left font-medium">{getLoc(r?.name) || relicId}</span>
                                </>
                            );
                        })() : <span className="text-gray-500 italic">{getLoc('none')}</span>}
                    </div>
                </div>

                {/* Cards */}
                <div className="relative">
                    <div className="flex justify-between items-center px-1 mb-0.5">
                        <label className="text-[9px] md:text-[10px] text-gray-400 font-semibold">{getLoc('cards')}</label>
                        <span className={`text-[9px] md:text-[10px] ${cardIds.length === 5 ? 'text-green-400' : 'text-gray-500'}`}>{cardIds.length}/5</span>
                    </div>

                    <div className={`w-full text-[10px] md:text-xs p-1.5 md:p-2.5 rounded border flex flex-wrap gap-1 min-h-[36px] md:min-h-[42px] ${cardIds.length ? 'bg-gray-700 border-blue-500/50' : 'bg-gray-700/30 border-gray-600'}`}>
                        {cardIds.length === 0 ? <span className="text-gray-500 italic w-full text-left">{getLoc('none')}</span> : (
                            cardIds.map(cid => {
                                const c = cards.find(x => (x._id || x.id) === cid);
                                return (
                                    <div key={cid} className="w-5 h-5 md:w-6 md:h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center" title={getLoc(c?.name)}>
                                        {c?.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-contain" /> : <span className="text-[8px]">{cid.slice(0, 2)}</span>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SharedTeamViewer = () => {
    const { shortCode } = useParams();
    const { t, i18n } = useTranslation();
    const [comp, setComp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [cards, setCards] = useState([]);

    const getLoc = useCallback((data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    }, [i18n.language]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, charsRes, artsRes, cardsRes] = await Promise.all([
                    api.get(`/share/${shortCode}`),
                    api.get('/characters'),
                    api.get('/artifacts'),
                    api.get('/force-cards')
                ]);
                setComp(compRes.data);
                setCharacters(charsRes.data);
                setArtifacts(artsRes.data);
                setCards(cardsRes.data);
            } catch (err) {
                console.error(err);
                setError('Composition not found or expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [shortCode]);

    // Calculate Bonds
    const activeBonds = useMemo(() => {
        if (!comp || !characters.length) return [];
        const { teamData } = comp;
        const active = [];
        // Resolve characters from teamData (using fallback or matching ID with fetched chars)
        const teamChars = Object.values(teamData).filter(slot => slot?.character || slot?.fallback).map(slot => {
            // Try to find full char data from fetched characters list using ID
            const id = slot.character?._id || slot.character?.id || slot.fallback?.id;
            const fullChar = characters.find(c => (c._id || c.id) === id);
            return fullChar || slot.character || slot.fallback;
        });

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
                    const partnersData = partners.map(pLoc => {
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
    }, [comp, characters, getLoc]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">{error}</div>;
    if (!comp) return null;

    const { teamData, name, notes } = comp;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-yellow-500">{name}</h1>
                        <p className="text-gray-400 text-xs">{t('sharedCompSubtitle')}</p>
                    </div>
                    <Link to="/team-builder" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition-colors">
                        {t('createYourOwn')}
                    </Link>
                </div>

                {/* Notes */}
                {notes && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{t('notes')}</h3>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{notes}</p>
                    </div>
                )}

                {/* Team Grid */}
                <div className="flex flex-col gap-6 items-center">
                    {/* Front */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('front')}</div>
                        <div className="w-full flex-1 bg-gray-800/30 p-2 md:p-4 rounded-lg border border-gray-800/50">
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {['front1', 'front2', 'front3'].map(slot => (
                                    <ReadOnlySlotCard key={slot} slot={teamData[slot]} label={t('front')} getLoc={getLoc} relics={artifacts} cards={cards} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mid */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('mid')}</div>
                        <div className="w-full flex-1 bg-gray-800/30 p-2 md:p-4 rounded-lg border border-gray-800/50">
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {['mid1', 'mid2', 'mid3'].map(slot => (
                                    <ReadOnlySlotCard key={slot} slot={teamData[slot]} label={t('mid')} getLoc={getLoc} relics={artifacts} cards={cards} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('back')}</div>
                        <div className="w-full flex-1 bg-gray-800/30 p-2 md:p-4 rounded-lg border border-gray-800/50">
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {['back1', 'back2', 'back3'].map(slot => (
                                    <ReadOnlySlotCard key={slot} slot={teamData[slot]} label={t('back')} getLoc={getLoc} relics={artifacts} cards={cards} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-800 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-blue-500 uppercase">{t('support')}</div>
                        <div className="w-full flex-1 bg-blue-900/10 p-2 md:p-4 rounded-lg border border-blue-900/30">
                            <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-md mx-auto md:mx-0">
                                {['support1', 'support2'].map(slot => (
                                    <ReadOnlySlotCard key={slot} slot={teamData[slot]} label={t('support')} getLoc={getLoc} relics={artifacts} cards={cards} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Bonds */}
                {activeBonds.length > 0 && (
                    <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <span className="text-xl">🔗</span> {t('activeBonds')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeBonds.map((bond, idx) => (
                                <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                                        <span className="text-yellow-400 font-bold text-sm">{bond.bondName}</span>
                                    </div>
                                    <p className="text-gray-300 text-xs">{bond.effect}</p>
                                    <div className="flex items-center gap-2 mt-auto pt-2">
                                        {bond.partnersData.map((p, i) => (
                                            <div key={i} className="relative group" title={getLoc(p.name)}>
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={getLoc(p.name)} className="w-8 h-8 rounded-full border border-gray-600 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[8px] border border-gray-600">
                                                        {getLoc(p.name).slice(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedTeamViewer;

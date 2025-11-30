import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const ReadOnlySlotCard = ({ slot, label, getLoc }) => {
    const char = slot?.character;
    const relicId = slot?.relicId;
    const cardIds = slot?.cardIds || [];

    if (!char) {
        return (
            <div className="w-48 h-72 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg flex items-center justify-center text-gray-600 text-sm font-bold">
                {label}
            </div>
        );
    }

    return (
        <div className="w-48 min-h-[288px] bg-gray-800 border border-gray-600 rounded-lg flex flex-col items-center p-3 gap-3 relative group shadow-lg">
            <Link to={`/characters/${char._id || char.id}`} className="relative group cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-700 relative overflow-hidden">
                    {char.imageUrl ? (
                        <img src={char.imageUrl} alt={getLoc(char.name)} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-1">
                            {getLoc(char.name)}
                        </div>
                    )}
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${char.rarity === 'UR' ? 'bg-red-600' :
                        char.rarity === 'SSR' ? 'bg-yellow-600' :
                            char.rarity === 'SR' ? 'bg-purple-600' :
                                'bg-blue-600'
                        }`}>
                        {char.rarity}
                    </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-0.5 rounded text-xs whitespace-nowrap border border-gray-700 shadow-sm z-10 font-bold">
                    {getLoc(char.name)}
                </div>
            </Link>

            {/* Equipment Section (Read Only) */}
            <div className="w-full mt-4 flex flex-col gap-3">
                {/* Relic */}
                <div className="relative">
                    <label className="text-[10px] text-gray-400 ml-1 mb-0.5 block font-semibold">Relic</label>
                    <div className={`w-full text-xs p-2.5 rounded border flex items-center gap-2 ${relicId ? 'bg-gray-700 border-yellow-500/50 text-yellow-400' : 'bg-gray-700/30 border-gray-600 text-gray-500'}`}>
                        {relicId ? (
                            <span className="truncate flex-1 text-left font-medium">Relic ID: {relicId}</span>
                        ) : <span className="text-gray-500 italic">None</span>}
                    </div>
                </div>

                {/* Cards */}
                <div className="relative">
                    <div className="flex justify-between items-center px-1 mb-0.5">
                        <label className="text-[10px] text-gray-400 font-semibold">Cards</label>
                        <span className={`text-[10px] ${cardIds.length === 5 ? 'text-green-400' : 'text-gray-500'}`}>{cardIds.length}/5</span>
                    </div>

                    <div className={`w-full text-xs p-2.5 rounded border flex flex-wrap gap-1 min-h-[42px] ${cardIds.length ? 'bg-gray-700 border-blue-500/50' : 'bg-gray-700/30 border-gray-600'}`}>
                        {cardIds.length === 0 ? <span className="text-gray-500 italic w-full text-left">None</span> : (
                            cardIds.map(cid => (
                                <div key={cid} className="w-6 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                                    <span className="text-[8px]">{cid.slice(0, 2)}</span>
                                </div>
                            ))
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

    const getLoc = useCallback((data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
        return data[lang] || data['en'] || '';
    }, [i18n.language]);

    useEffect(() => {
        const fetchComp = async () => {
            try {
                const res = await api.get(`/share/${shortCode}`);
                setComp(res.data);
            } catch (err) {
                setError('Composition not found or expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchComp();
    }, [shortCode]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">{error}</div>;
    if (!comp) return null;

    const { team, name, notes } = comp;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-yellow-500">{name}</h1>
                        <p className="text-gray-400 text-xs">Shared Composition • Read Only</p>
                    </div>
                    <Link to="/team-builder" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition-colors">
                        Create Your Own
                    </Link>
                </div>

                {/* Notes */}
                {notes && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Notes</h3>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{notes}</p>
                    </div>
                )}

                {/* Team Grid */}
                <div className="flex flex-col gap-6 items-center">
                    {/* Front */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('front')}</div>
                        <div className="flex gap-4 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                            {['front1', 'front2', 'front3'].map(slot => (
                                <ReadOnlySlotCard key={slot} slot={team.teamData[slot]} label={t('front')} getLoc={getLoc} />
                            ))}
                        </div>
                    </div>

                    {/* Mid */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('mid')}</div>
                        <div className="flex gap-4 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                            {['mid1', 'mid2', 'mid3'].map(slot => (
                                <ReadOnlySlotCard key={slot} slot={team.teamData[slot]} label={t('mid')} getLoc={getLoc} />
                            ))}
                        </div>
                    </div>

                    {/* Back */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-gray-500 uppercase">{t('back')}</div>
                        <div className="flex gap-4 justify-center bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 flex-wrap">
                            {['back1', 'back2', 'back3'].map(slot => (
                                <ReadOnlySlotCard key={slot} slot={team.teamData[slot]} label={t('back')} getLoc={getLoc} />
                            ))}
                        </div>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-800 w-full justify-center">
                        <div className="w-full md:w-16 text-center md:text-right text-sm font-bold text-blue-500 uppercase">{t('support')}</div>
                        <div className="flex gap-4 justify-center bg-blue-900/10 p-4 rounded-lg border border-blue-900/30 flex-wrap">
                            {['support1', 'support2'].map(slot => (
                                <ReadOnlySlotCard key={slot} slot={team.teamData[slot]} label={t('support')} getLoc={getLoc} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedTeamViewer;

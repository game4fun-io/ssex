import React from 'react';

const BondDisplay = ({ character, getLoc, activeTeam = null, allCharacters = [] }) => {
    if (!character) return null;

    // Helper to check if a bond is active based on the team
    const isActive = (partners) => {
        if (!activeTeam) return true; // If no team provided, always show

        // Logic to check if all partners are in activeTeam
        // For simplicity in this display component, we rely on parent or just render all
        return true;
    };

    // Helper to resolve partner images
    const resolvePartners = (partners) => {
        if (!partners) return [];
        return partners.map(partnerLoc => {
            const partnerName = getLoc(partnerLoc);
            // normalization for flexible matching
            const normalize = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            const normalizedPName = normalize(partnerName);

            // Try to find in allCharacters
            // We search by name (localized) - robust partial match
            const match = allCharacters.find(c => {
                const cName = getLoc(c.name);
                return cName && normalizedPName.length > 1 && normalize(cName).includes(normalizedPName);
            });

            return {
                name: partnerName,
                imageUrl: match ? match.imageUrl : null,
                id: match ? (match._id || match.id) : null
            };
        });
    };

    const parseRichText = (text) => {
        if (!text) return '';
        let processed = text
            .replace(/<color=(#[0-9A-Fa-f]{6})>(.*?)<\/color>/g, '<span style="color: $1">$2</span>')
            .replace(/<link=\d+>(.*?)<\/link>/g, '$1')
            .replace(/\\n/g, '<br/>');
        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    return (
        <div className="space-y-6">
            {/* Combine Skills Section */}
            {character.combineSkills && character.combineSkills.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
                        <span>⚔️</span> {getLoc({ en: "Combine Skills", pt: "Habilidades Combinadas", es: "Habilidades Combinadas" })}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {character.combineSkills.map((skill, idx) => {
                            const partnerObjs = resolvePartners(skill.partners);
                            return (
                                <div key={`combine-${idx}`} className="bg-gray-800 border border-yellow-900/50 p-4 rounded-lg flex flex-col gap-3">
                                    <div className="flex gap-4">
                                        {skill.iconUrl && (
                                            <div className="flex-shrink-0">
                                                <img src={skill.iconUrl} alt={getLoc(skill.name)} className="w-16 h-16 rounded-lg border border-gray-600 object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-white text-lg">{getLoc(skill.name)}</h4>
                                            <div className="flex flex-wrap gap-2 my-2">
                                                {partnerObjs.map((p, pIdx) => (
                                                    <div key={pIdx} className="flex items-center gap-2 bg-gray-700/50 rounded-full pr-3 border border-gray-600">
                                                        {p.imageUrl ? (
                                                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-full border border-gray-500 object-cover" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-gray-400">?</div>
                                                        )}
                                                        <span className="text-xs text-yellow-400 font-medium">
                                                            {p.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed border-t border-gray-700/50 pt-2">
                                        {parseRichText(getLoc(skill.description))}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Status Bonds Section */}
            {character.bonds && character.bonds.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <span>🔗</span> {getLoc({ en: "Attribute Bonds", pt: "Laços de Atributos", es: "Lazos de Atributo" })}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {character.bonds.map((bond, idx) => {
                            const partnerObjs = resolvePartners(bond.partners);
                            return (
                                <div key={`bond-${idx}`} className="bg-gray-800/50 border border-gray-700 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-200">{getLoc(bond.name)}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {partnerObjs.map((p, pIdx) => (
                                            <div key={pIdx} className="relative group">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg border border-gray-600 object-cover" title={p.name} />
                                                ) : (
                                                    <span className="text-[10px] bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded border border-gray-800 block">
                                                        {p.name}
                                                    </span>
                                                )}
                                                {/* Tooltip for image */}
                                                {p.imageUrl && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                                        {p.name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-blue-300">
                                        {parseRichText(getLoc(bond.effect))}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BondDisplay;

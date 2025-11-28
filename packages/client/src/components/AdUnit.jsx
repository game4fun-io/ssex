import React, { useContext } from 'react';
import ConfigContext from '../context/ConfigContext';

const AdUnit = ({ slot, format = 'banner', className = '' }) => {
    const { config, loading } = useContext(ConfigContext);
    const isVertical = format === 'rectangle' || format === 'vertical';

    if (loading || !config || !config.featureFlags.enableAds) {
        return null;
    }

    const adContent = config.adConfig[slot.replace(/-/g, '').replace(/(\w)(\w*)/g, function (g0, g1, g2) { return g1.toLowerCase() + g2.toLowerCase(); }).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()] || config.adConfig[Object.keys(config.adConfig).find(key => key.toLowerCase() === slot.replace(/-/g, '').toLowerCase())] || 'Ad Space';

    // Helper to map slot names to config keys
    const getConfigValue = (slotName) => {
        // Simple mapping based on known slots
        const map = {
            'home-top-banner': 'homeTop',
            'home-bottom-banner': 'homeBottom',
            'characters-list-top': 'charactersListTop',
            'character-details-sidebar': 'characterDetailsSidebar',
            'character-details-bottom': 'characterDetailsBottom'
        };
        return config.adConfig[map[slotName]] || 'Ad Space';
    };

    const isUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const content = getConfigValue(slot);
    const hasUrl = isUrl(content);

    return (
        <div
            className={`bg-gray-800 border border-gray-700 flex flex-col items-center justify-center text-gray-500 text-sm p-4 my-8 ${className} overflow-hidden relative`}
            style={{
                width: isVertical ? '100%' : '100%',
                maxWidth: isVertical ? '300px' : '728px',
                height: isVertical ? '250px' : '90px',
                margin: '2rem auto'
            }}
        >
            {hasUrl ? (
                <img src={content} alt="Advertisement" className="w-full h-full object-cover" />
            ) : (
                <>
                    <span className="font-bold mb-1">ADVERTISEMENT</span>
                    <span className="text-xs">{content}</span>
                </>
            )}
        </div>
    );
};

export default AdUnit;

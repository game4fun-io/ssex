import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ConfigContext from '../context/ConfigContext';

const AnnouncementBanner = () => {
    const { config } = useContext(ConfigContext);
    const { t } = useTranslation();

    if (!config?.featureFlags?.announcementBanner) return null;

    return (
        <div className="bg-gradient-to-r from-yellow-900/90 via-yellow-800/90 to-yellow-900/90 border-b border-yellow-600/50 text-yellow-100 px-4 py-2 text-center text-xs md:text-sm relative z-50 shadow-lg backdrop-blur-sm">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4">
                <span className="font-bold text-yellow-400 uppercase tracking-wider">⚠️ {t('workInProgress')}</span>
                <span className="hidden md:inline text-yellow-600">•</span>
                <span>{t('bannerMessage')}</span>
                <span className="hidden md:inline text-yellow-600">•</span>
                <span className="text-yellow-500/80 text-[10px] md:text-xs">
                    {t('copyrightNotice')}
                </span>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

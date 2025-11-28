import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import pt from './locales/pt/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import cn from './locales/cn/translation.json';
import id from './locales/id/translation.json';
import th from './locales/th/translation.json';
// Import other languages as needed

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en,
            pt,
            es,
            fr,
            cn,
            id,
            th
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

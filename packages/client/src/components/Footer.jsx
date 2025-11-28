import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        console.log('Changing language to:', lng);
        i18n.changeLanguage(lng);
    };

    return (
        <footer className="bg-gray-900 text-white p-6 mt-8">
            <div className="container mx-auto flex flex-col items-center">
                <div className="flex space-x-4 mb-4">
                    <button onClick={() => changeLanguage('en')} className="hover:opacity-80 transition-opacity cursor-pointer" title="English">
                        <span className="fi fi-us text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('pt')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Português">
                        <span className="fi fi-br text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('es')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Español">
                        <span className="fi fi-es text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('fr')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Français">
                        <span className="fi fi-fr text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('cn')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Chinese">
                        <span className="fi fi-cn text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('id')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Indonesian">
                        <span className="fi fi-id text-2xl"></span>
                    </button>
                    <button onClick={() => changeLanguage('th')} className="hover:opacity-80 transition-opacity cursor-pointer" title="Thai">
                        <span className="fi fi-th text-2xl"></span>
                    </button>
                </div>
                <div className="text-gray-400 text-sm text-center">
                    <p>{t('copyright', { year: new Date().getFullYear() })}</p>
                    <p>{t('gameBy')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

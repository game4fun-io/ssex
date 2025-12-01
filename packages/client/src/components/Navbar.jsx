import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';
import ConfigContext from '../context/ConfigContext';
const assetBase = (import.meta.env.VITE_ASSET_BASE || 'http://localhost:5000/assets').replace(/\/+$/, '');
const logoSrc = '/logo.png';

const Navbar = () => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const { config } = useContext(ConfigContext);
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menus = config?.featureFlags?.menus || {};

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Left Side: Logo + Main Menu */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <img src={logoSrc} alt="Saint Seiya EX" className="h-16 md:h-20 w-auto drop-shadow-lg group-hover:scale-[1.02] transition" />
                        <span className="sr-only">Saint Seiya EX</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="hover:text-yellow-400 font-medium">{t('home')}</Link>
                        {menus.characters && <Link to="/characters" className="hover:text-yellow-400 font-medium">{t('characters')}</Link>}
                        {menus.artifacts && <Link to="/artifacts" className="hover:text-yellow-400 font-medium">{t('artifacts')}</Link>}
                        {menus.forceCards && <Link to="/force-cards" className="hover:text-yellow-400 font-medium">{t('forceCards')}</Link>}
                        {menus.teamBuilder && <Link to="/team-builder" className="hover:text-yellow-400 font-medium">{t('teamBuilder')}</Link>}
                    </div>
                </div>

                {/* Right Side: Auth / User (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            {isAdmin && <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 font-bold">{t('admin')}</Link>}
                            <span className="text-gray-400">{t('welcomeUser')}</span>
                            <button onClick={logout} className="hover:text-red-400">{t('logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-yellow-400 font-medium">{t('login')}</Link>
                            <Link to="/register" className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-full font-bold transition shadow-md">{t('register')}</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-4 bg-gray-800 rounded-lg p-4 flex flex-col space-y-4 border border-gray-700 shadow-xl animate-fade-in-down">
                    <Link to="/" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
                    {menus.characters && <Link to="/characters" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('characters')}</Link>}
                    {menus.artifacts && <Link to="/artifacts" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('artifacts')}</Link>}
                    {menus.forceCards && <Link to="/force-cards" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('forceCards')}</Link>}
                    {menus.teamBuilder && <Link to="/team-builder" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('teamBuilder')}</Link>}

                    <div className="pt-2 flex flex-col space-y-3">
                        {user ? (
                            <>
                                {isAdmin && <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 font-bold" onClick={() => setIsMobileMenuOpen(false)}>{t('admin')}</Link>}
                                <span className="text-gray-400">{t('welcomeUser')}</span>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left hover:text-red-400">{t('logout')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-yellow-400 font-medium" onClick={() => setIsMobileMenuOpen(false)}>{t('login')}</Link>
                                <Link to="/register" className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-full font-bold transition shadow-md text-center" onClick={() => setIsMobileMenuOpen(false)}>{t('register')}</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

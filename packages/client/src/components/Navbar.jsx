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
                        {menus.news && <Link to="/news" className="hover:text-yellow-400 font-medium">{t('news.title')}</Link>}
                        {menus.characters && <Link to="/characters" className="hover:text-yellow-400 font-medium">{t('characters')}</Link>}
                        {menus.artifacts && <Link to="/artifacts" className="hover:text-yellow-400 font-medium">{t('artifacts')}</Link>}
                        {menus.forceCards && <Link to="/force-cards" className="hover:text-yellow-400 font-medium">{t('forceCards')}</Link>}
                        {menus.teamBuilder && <Link to="/team-builder" className="hover:text-yellow-400 font-medium">{t('teamBuilder')}</Link>}
                        <a href="https://discord.gg/placeholder" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 font-medium flex items-center gap-1">
                            <span>Discord</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                        </a>
                    </div>
                </div>

                {/* Right Side: Auth / User (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            {isAdmin && <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 font-bold">{t('admin.title')}</Link>}
                            <Link to="/profile" className="text-gray-400 hover:text-white transition">{t('welcomeUser')}</Link>
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
                    {menus.news && <Link to="/news" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('news.title')}</Link>}
                    {menus.characters && <Link to="/characters" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('characters')}</Link>}
                    {menus.artifacts && <Link to="/artifacts" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('artifacts')}</Link>}
                    {menus.forceCards && <Link to="/force-cards" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('forceCards')}</Link>}
                    {menus.teamBuilder && <Link to="/team-builder" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2" onClick={() => setIsMobileMenuOpen(false)}>{t('teamBuilder')}</Link>}
                    <a href="https://discord.gg/placeholder" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 font-medium border-b border-gray-700 pb-2 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <span>Discord</span>
                    </a>

                    <div className="pt-2 flex flex-col space-y-3">
                        {user ? (
                            <>
                                {isAdmin && <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 font-bold" onClick={() => setIsMobileMenuOpen(false)}>{t('admin.title')}</Link>}
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

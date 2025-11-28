import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';
import ConfigContext from '../context/ConfigContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const { config } = useContext(ConfigContext);
    const { t } = useTranslation();



    const menus = config?.featureFlags?.menus || {};

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-yellow-500">Saint Seiya EX</Link>
                <div className="flex items-center space-x-4">
                    <Link to="/" className="hover:text-yellow-400">{t('home')}</Link>

                    {menus.characters && <Link to="/characters" className="hover:text-yellow-400">{t('characters')}</Link>}
                    {menus.teamBuilder && <Link to="/team-builder" className="hover:text-yellow-400">{t('teamBuilder')}</Link>}
                    {menus.artifacts && <Link to="/artifacts" className="hover:text-yellow-400">Artifacts</Link>}
                    {menus.forceCards && <Link to="/force-cards" className="hover:text-yellow-400">Force Cards</Link>}



                    {user ? (
                        <>
                            {isAdmin && <Link to="/admin" className="text-yellow-500 hover:text-yellow-400 font-bold">Admin</Link>}
                            <span className="text-gray-400">{t('welcomeUser')}</span>
                            <button onClick={logout} className="hover:text-red-400">{t('logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-yellow-400">{t('login')}</Link>
                            <Link to="/register" className="hover:text-yellow-400">{t('register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

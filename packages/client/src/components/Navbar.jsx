import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-yellow-500">Saint Seiya EX</Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:text-yellow-400">Home</Link>
                    <Link to="/characters" className="hover:text-yellow-400">Characters</Link>
                    {user ? (
                        <>
                            <span className="text-gray-400">Welcome</span>
                            <button onClick={logout} className="hover:text-red-400">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-yellow-400">Login</Link>
                            <Link to="/register" className="hover:text-yellow-400">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error('Error fetching user:', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        await fetchUser();
        return res.data;
    };

    const register = async (username, email, password, firstName, lastName, country, age) => {
        const res = await api.post('/auth/register', { username, email, password, firstName, lastName, country, age });
        localStorage.setItem('token', res.data.token);
        await fetchUser();
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator' || isAdmin; // Moderators have subset of admin powers, or check explicitly
    // Actually, usually isModerator check should be: role === 'moderator' OR role === 'admin'.
    // But let's be explicit:
    // const isModerator = ['admin', 'moderator'].includes(user?.role);

    const canEdit = ['admin', 'moderator'].includes(user?.role);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin, isModerator: canEdit, canEdit }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;

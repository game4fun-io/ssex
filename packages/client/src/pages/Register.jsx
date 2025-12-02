import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        country: '',
        age: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.country,
                formData.age
            );
            navigate('/');
        } catch (err) {
            setError('Registration failed. User might already exist.');
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 py-12">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">{t('auth.registerTitle')}</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={t('auth.firstName')}
                            className="w-1/2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder={t('auth.lastName')}
                            className="w-1/2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('auth.username')}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder={t('auth.email')}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder={t('auth.password')}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={t('auth.country')}
                            className="w-2/3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder={t('auth.age')}
                            className="w-1/3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded transition">
                        {t('auth.registerButton')}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400">Or sign up with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <button
                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/discord`}
                            className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                            Sign up with Discord
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

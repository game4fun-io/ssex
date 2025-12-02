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

    const handleSocialLogin = (provider) => {
        // Placeholder for social login logic
        console.log(`Login with ${provider}`);
        // window.location.href = \`http://localhost:5000/api/auth/\${provider}\`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 py-12">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">{t('auth.registerTitle')}</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {['Discord', 'Google', 'Microsoft', 'Twitch', 'Steam', 'Instagram'].map((provider) => (
                            <button
                                key={provider}
                                onClick={() => handleSocialLogin(provider.toLowerCase())}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-xs font-medium text-gray-300 hover:bg-gray-700"
                            >
                                {provider}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

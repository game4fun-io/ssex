import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError('Registration failed. User might already exist.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">Register</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 outline-none"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded transition">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;

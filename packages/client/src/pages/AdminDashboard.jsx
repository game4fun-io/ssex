import { useState, useContext, useEffect } from 'react';
import ConfigContext from '../context/ConfigContext';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { config, updateConfig, loading } = useContext(ConfigContext);
    const { t } = useTranslation();
    const [formData, setFormData] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (config) {
            setFormData(JSON.parse(JSON.stringify(config)));
        }
    }, [config]);

    const handleChange = (section, key, value, subKey = null) => {
        setFormData(prev => {
            if (subKey) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [key]: {
                            ...prev[section][key],
                            [subKey]: value
                        }
                    }
                };
            }
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateConfig({
                featureFlags: formData.featureFlags,
                adConfig: formData.adConfig
            });
            setMessage('Configuration updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating configuration');
        }
    };

    if (loading || !formData) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-yellow-500 mb-8">Admin Dashboard</h1>

                {message && (
                    <div className={`p-4 rounded mb-4 ${message.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Feature Flags */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Feature Flags</h2>
                        <div className="space-y-4">
                            <div className="border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">Menus</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400">Characters</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featureFlags.menus?.characters ?? true}
                                            onChange={(e) => handleChange('featureFlags', 'menus', e.target.checked, 'characters')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400">Team Builder</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featureFlags.menus?.teamBuilder ?? true}
                                            onChange={(e) => handleChange('featureFlags', 'menus', e.target.checked, 'teamBuilder')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400">Artifacts</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featureFlags.menus?.artifacts ?? true}
                                            onChange={(e) => handleChange('featureFlags', 'menus', e.target.checked, 'artifacts')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400">Force Cards</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featureFlags.menus?.forceCards ?? true}
                                            onChange={(e) => handleChange('featureFlags', 'menus', e.target.checked, 'forceCards')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-gray-400">Announcement Banner</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featureFlags.announcementBanner ?? true}
                                            onChange={(e) => handleChange('featureFlags', 'announcementBanner', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-gray-300">Enable Ads</label>
                                <input
                                    type="checkbox"
                                    checked={formData.featureFlags.enableAds}
                                    onChange={(e) => handleChange('featureFlags', 'enableAds', e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ad Configuration */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Ad Configuration</h2>
                        <div className="space-y-4">
                            {Object.keys(formData.adConfig).map((key) => (
                                <div key={key}>
                                    <label className="block text-sm text-gray-400 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <input
                                        type="text"
                                        value={formData.adConfig[key]}
                                        onChange={(e) => handleChange('adConfig', key, e.target.value)}
                                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded transition"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;

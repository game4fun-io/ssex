import React, { useState } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const CreateNewsModal = ({ onClose, onCreated }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        minRole: 'user',
        thumbnailUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/news', formData);
            onCreated();
            onClose();
        } catch (err) {
            console.error('Error creating news:', err);
            alert('Failed to create news');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">{t('news.createTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('news.formTitle')}</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('news.formContent')}</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 h-32"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">{t('news.formType')}</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                            >
                                <option value="general">General</option>
                                <option value="update">Update</option>
                                <option value="event">Event</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">{t('news.formMinRole')}</label>
                            <select
                                name="minRole"
                                value={formData.minRole}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                            >
                                <option value="user">All Users</option>
                                <option value="member">Members+</option>
                                <option value="influencer">Influencers+</option>
                                <option value="moderator">Moderators+</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('news.formThumbnail')}</label>
                        <input
                            type="text"
                            name="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 600x400px</p>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold transition"
                        >
                            {t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNewsModal;

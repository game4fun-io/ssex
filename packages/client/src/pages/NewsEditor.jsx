import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const NewsEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        minRole: 'user',
        language: 'all',
        thumbnailUrl: ''
    });

    useEffect(() => {
        if (id) {
            const fetchNews = async () => {
                try {
                    const res = await api.get(`/news/${id}`); // We might need a specific endpoint for fetching single news by ID if not exists, but usually GET /news returns all. 
                    // Actually, the current API GET /news returns a list. We don't have GET /news/:id. 
                    // I should check if I need to add GET /news/:id to the backend. 
                    // For now, I'll assume I might need to filter from the list or add the endpoint.
                    // Let's add the endpoint to the backend in the next step if it's missing.
                    // For now, let's assume it exists or I'll add it.
                    // Wait, I see PUT /news/:id and DELETE /news/:id, but not GET /news/:id in the previous file view.
                    // I will need to add GET /news/:id to the backend.
                } catch (err) {
                    console.error('Error fetching news:', err);
                }
            };
            fetchNews();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            setLoading(true);
            const res = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Insert image markdown at cursor position or append
            const imageMarkdown = `![Image](${res.data.filePath})`;
            setFormData(prev => ({ ...prev, content: prev.content + '\n' + imageMarkdown }));
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            setLoading(true);
            const res = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, thumbnailUrl: res.data.filePath }));
        } catch (err) {
            console.error('Error uploading thumbnail:', err);
            alert('Failed to upload thumbnail');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (id) {
                await api.put(`/news/${id}`, formData);
            } else {
                await api.post('/news', formData);
            }
            navigate('/news');
        } catch (err) {
            console.error('Error saving news:', err);
            alert('Failed to save news');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{id ? t('news.editTitle') : t('news.createTitle')}</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold transition disabled:opacity-50"
                >
                    {loading ? t('saving') : t('save')}
                </button>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                {/* Editor Column */}
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('news.formTitle')}
                        className="bg-gray-800 p-3 rounded border border-gray-700 focus:border-yellow-500 outline-none text-xl font-bold"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="bg-gray-800 p-2 rounded border border-gray-700"
                        >
                            <option value="general">{t('news.types.general')}</option>
                            <option value="update">{t('news.types.update')}</option>
                            <option value="event">{t('news.types.event')}</option>
                            <option value="maintenance">{t('news.types.maintenance')}</option>
                        </select>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="bg-gray-800 p-2 rounded border border-gray-700"
                        >
                            <option value="all">{t('allLanguages')}</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="pt">Português</option>
                            <option value="fr">Français</option>
                            <option value="cn">中文</option>
                            <option value="id">Bahasa Indonesia</option>
                            <option value="th">ไทย</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            name="minRole"
                            value={formData.minRole}
                            onChange={handleChange}
                            className="bg-gray-800 p-2 rounded border border-gray-700"
                        >
                            <option value="user">{t('news.roles.user')}</option>
                            <option value="member">{t('news.roles.member')}</option>
                            <option value="influencer">{t('news.roles.influencer')}</option>
                            <option value="moderator">{t('news.roles.moderator')}</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 transition text-sm">
                                📷 {t('news.uploadThumbnail')}
                                <input type="file" onChange={handleThumbnailUpload} className="hidden" accept="image/*" />
                            </label>
                            {formData.thumbnailUrl && <span className="text-xs text-green-400">✓ {t('news.uploaded')}</span>}
                        </div>
                    </div>

                    <div className="flex-grow relative">
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder={t('news.contentPlaceholder')}
                            className="w-full h-full bg-gray-800 p-4 rounded border border-gray-700 focus:border-yellow-500 outline-none resize-none font-mono"
                        />
                        <label className="absolute bottom-4 right-4 cursor-pointer bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 transition text-sm shadow-lg opacity-80 hover:opacity-100">
                            🖼️ {t('news.insertImage')}
                            <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="bg-gray-800 p-6 rounded border border-gray-700 overflow-y-auto">
                    <h1 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">{formData.title || t('news.previewTitle')}</h1>
                    {formData.thumbnailUrl && (
                        <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full max-h-64 object-cover rounded mb-6" />
                    )}
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || `*${t('news.noContent')}*`}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default NewsEditor;

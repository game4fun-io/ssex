
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [languageFilter, setLanguageFilter] = useState('all');

    const { user, canEdit } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data);
        } catch (err) {
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [user]);

    // Filter news based on selected language
    const filteredNews = news.filter(item => {
        if (languageFilter === 'all') return true;
        return item.language === 'all' || item.language === languageFilter;
    });

    const handleLike = async (newsId) => {
        try {
            const res = await api.post(`/news/${newsId}/like`);
            setNews(news.map(item =>
                item._id === newsId ? { ...item, likes: res.data } : item
            ));
        } catch (err) {
            console.error('Error liking news:', err);
        }
    };

    const handleCommentSubmit = async (e, newsId) => {
        e.preventDefault();
        const text = commentInputs[newsId];
        if (!text?.trim()) return;

        try {
            const res = await api.post(`/news/${newsId}/comment`, { text });
            setNews(news.map(item =>
                item._id === newsId ? { ...item, comments: res.data } : item
            ));
            setCommentInputs({ ...commentInputs, [newsId]: '' });
        } catch (err) {
            console.error('Error commenting:', err);
        }
    };

    const toggleComments = (newsId) => {
        setExpandedComments({ ...expandedComments, [newsId]: !expandedComments[newsId] });
    };

    const getBadgeColor = (type) => {
        switch (type) {
            case 'update': return 'bg-blue-500';
            case 'event': return 'bg-green-500';
            case 'maintenance': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const canCreate = user && (user.role === 'admin' || user.role === 'moderator' || user.role === 'influencer');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">{t('news.title')}</h1>

                <div className="flex gap-4 items-center">
                    <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded border border-gray-700"
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

                    {canCreate && (
                        <button
                            onClick={() => navigate('/news/create')}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold transition"
                        >
                            {t('news.createButton')}
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-white">{t('loading')}</div>
            ) : (
                <div className="grid gap-6">
                    {filteredNews.map((item) => (
                        <div key={item._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 relative group">
                            {canCreate && (
                                <button
                                    onClick={() => navigate(`/news/edit/${item._id}`)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                    title={t('edit')}
                                >
                                    ✏️
                                </button>
                            )}

                            <div className="flex items-center justify-between mb-4 pr-8">
                                <div className="flex items-center gap-3">
                                    <span className={`${getBadgeColor(item.type)} text-white text-xs px-2 py-1 rounded uppercase`}>
                                        {t(`news.types.${item.type}`, item.type)}
                                    </span>
                                    {item.language !== 'all' && (
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded uppercase">
                                            {item.language}
                                        </span>
                                    )}
                                    {item.author && (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <span>by</span>
                                            {item.author.avatar && (
                                                <img src={item.author.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                                            )}
                                            <span className="text-yellow-500">{item.author.username}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-gray-400 text-sm">
                                    {new Date(item.publishedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>

                            {item.thumbnailUrl && (
                                <img src={item.thumbnailUrl} alt={item.title} className="w-full max-h-96 object-cover rounded mb-4" />
                            )}

                            <div className="text-gray-300 mb-4 prose prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                            </div>

                            <div className="flex items-center gap-6 border-t border-gray-700 pt-4">
                                <button
                                    onClick={() => handleLike(item._id)}
                                    className={`flex items-center gap-2 transition ${item.likes.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                >
                                    <span>{item.likes.includes(user?._id) ? '❤️' : '🤍'}</span>
                                    <span>{item.likes.length}</span>
                                </button>
                                <button
                                    onClick={() => toggleComments(item._id)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                                >
                                    <span>💬</span>
                                    <span>{item.comments.length}</span>
                                </button>
                                {item.minRole !== 'user' && (
                                    <div className="ml-auto text-xs text-yellow-500 flex items-center">
                                        <span className="mr-1">🔒</span>
                                        {t('news.visibleTo', { role: item.minRole })}
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            {expandedComments[item._id] && (
                                <div className="mt-4 pt-4 border-t border-gray-700 bg-gray-900/50 p-4 rounded">
                                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                        {item.comments.length === 0 ? (
                                            <p className="text-gray-500 text-sm italic">{t('news.noComments')}</p>
                                        ) : (
                                            item.comments.map((comment, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    {comment.user?.avatar ? (
                                                        <img src={comment.user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs">?</div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-500 text-sm font-bold">{comment.user?.username || 'Unknown'}</span>
                                                            <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {user && (
                                        <form onSubmit={(e) => handleCommentSubmit(e, item._id)} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={commentInputs[item._id] || ''}
                                                onChange={(e) => setCommentInputs({ ...commentInputs, [item._id]: e.target.value })}
                                                placeholder={t('news.commentPlaceholder')}
                                                className="flex-grow bg-gray-700 text-white p-2 rounded text-sm border border-gray-600"
                                            />
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold">
                                                {t('send')}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredNews.length === 0 && (
                        <div className="text-gray-400 text-center py-8">
                            {t('news.noNews')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default News;

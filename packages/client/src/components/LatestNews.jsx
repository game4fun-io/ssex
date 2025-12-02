import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const NewsItem = ({ title, publishedAt, type }) => {
    const { t } = useTranslation();
    return (
        <div className="border-b border-gray-800 py-4 hover:bg-gray-800/50 transition px-4 rounded">
            <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${type === 'update' ? 'bg-blue-900 text-blue-300' :
                        type === 'event' ? 'bg-green-900 text-green-300' :
                            type === 'maintenance' ? 'bg-red-900 text-red-300' :
                                'bg-gray-700 text-gray-300'
                    }`}>{t(`news.types.${type}`, type)}</span>
                <span className="text-gray-500 text-sm">{new Date(publishedAt).toLocaleDateString()}</span>
            </div>
            <h4 className="text-lg font-semibold text-white hover:text-yellow-400 cursor-pointer">{title}</h4>
        </div>
    );
};

const LatestNews = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                setNews(res.data.slice(0, 3)); // Show top 3
            } catch (err) {
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return null;

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-white border-l-4 border-yellow-500 pl-4">{t('news.latest')}</h2>
                        <Link to="/news" className="text-yellow-500 hover:text-yellow-400 font-bold text-sm">{t('news.viewAll')} &rarr;</Link>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {news.length > 0 ? (
                            news.map((n) => (
                                <NewsItem key={n._id} {...n} />
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">{t('news.noNews')}</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LatestNews;

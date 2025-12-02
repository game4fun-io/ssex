import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const NewsItem = ({ title, publishedAt, type, thumbnailUrl, content }) => {
    const { t } = useTranslation();
    const excerpt = content ? content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...' : '';

    return (
        <Link to="/news" className="block bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition duration-300 shadow-lg border border-gray-700 group h-full flex flex-col">
            <div className="h-48 overflow-hidden relative">
                <img
                    src={thumbnailUrl || '/assets/news-placeholder.jpg'}
                    alt={title}
                    className="w-full h-full object-cover group-hover:brightness-110 transition"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a1a1a/gold?text=Saint+Seiya+EX'; }}
                />
                <div className="absolute top-2 right-2">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded shadow-md ${type === 'update' ? 'bg-blue-600 text-white' :
                        type === 'event' ? 'bg-green-600 text-white' :
                            type === 'maintenance' ? 'bg-red-600 text-white' :
                                'bg-gray-600 text-white'
                        }`}>{t(`news.types.${type}`, type)}</span>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <span className="text-gray-400 text-xs mb-2 block">{new Date(publishedAt).toLocaleDateString()}</span>
                <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition">{title}</h4>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">{excerpt}</p>
                <div className="text-yellow-500 text-sm font-bold mt-auto flex items-center gap-1">
                    {t('readMore')} <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
            </div>
        </Link>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {news.length > 0 ? (
                            news.map((n) => (
                                <NewsItem key={n._id} {...n} />
                            ))
                        ) : (
                            <div className="col-span-3 p-8 text-center text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">{t('news.noNews')}</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LatestNews;

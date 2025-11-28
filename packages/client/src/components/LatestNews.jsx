import { motion } from 'framer-motion';

const NewsItem = ({ title, date, category }) => (
    <div className="border-b border-gray-800 py-4 hover:bg-gray-800/50 transition px-4 rounded">
        <div className="flex justify-between items-center mb-1">
            <span className="text-yellow-500 text-sm font-bold uppercase">{category}</span>
            <span className="text-gray-500 text-sm">{date}</span>
        </div>
        <h4 className="text-lg font-semibold text-white hover:text-yellow-400 cursor-pointer">{title}</h4>
    </div>
);

const LatestNews = () => {
    const news = [
        { title: "New SSR Character: God Cloth Seiya Arrives!", date: "Nov 27, 2025", category: "Event" },
        { title: "Maintenance Notice: Server Update v1.2", date: "Nov 25, 2025", category: "System" },
        { title: "PvP Season 5 Rewards Announced", date: "Nov 20, 2025", category: "Arena" }
    ];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-yellow-500 pl-4">Latest News</h2>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {news.map((n, i) => (
                            <NewsItem key={i} {...n} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LatestNews;

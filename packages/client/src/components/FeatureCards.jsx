import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, link, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition duration-300"
    >
        <h3 className="text-2xl font-bold text-yellow-500 mb-4">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>
        <Link to={link} className="text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2">
            Explore &rarr;
        </Link>
    </motion.div>
);

const FeatureCards = () => {
    const { t } = useTranslation();

    const features = [
        {
            title: t('characters'),
            description: "Browse the complete database of Saints, view stats, skills, and evolution paths.",
            link: "/characters",
            delay: 0.2
        },
        {
            title: t('teamBuilder'),
            description: "Construct the ultimate team formation and analyze synergy bonuses.",
            link: "/team-builder", // To be implemented
            delay: 0.4
        },
        {
            title: "Artifacts", // Needs translation key
            description: "Discover powerful artifacts to enhance your Saints' Cosmo.",
            link: "/artifacts", // To be implemented
            delay: 0.6
        }
    ];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, index) => (
                        <FeatureCard key={index} {...f} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureCards;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const { t } = useTranslation();

    return (
        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Background Gradient/Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 z-0" />

            {/* Animated Content */}
            <div className="relative z-10 text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg"
                >
                    {t('welcome')}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto"
                >
                    {t('subtitle')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex justify-center gap-6"
                >
                    <Link to="/characters" className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300">
                        {t('viewCharacters')}
                    </Link>
                    <Link to="/register" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full border border-gray-600 hover:border-yellow-500 shadow-lg transform hover:scale-105 transition duration-300">
                        {t('joinNow')}
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const assetBase = (import.meta.env.VITE_ASSET_BASE || 'http://localhost:5000/assets').replace(/\/+$/, '');
const logoSrc = '/logo.png';

const HeroSection = () => {
    const { t } = useTranslation();

    return (
        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Background Gradient/Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 z-0" />

            {/* Animated Content */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between h-full">
                {/* Text Content */}
                <div className="w-full md:w-1/2 text-center md:text-left mt-8 md:mt-0">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl md:text-3xl text-gray-300 mb-6 font-light tracking-wide"
                    >
                        {t('subtitle')}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="text-base md:text-lg text-gray-400 mb-10 max-w-xl mx-auto md:mx-0"
                    >
                        {t('heroBenefits')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex justify-center md:justify-start gap-6"
                    >
                        <Link to="/characters" className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300">
                            {t('viewCharacters')}
                        </Link>
                        <Link to="/register" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full border border-gray-600 hover:border-yellow-500 shadow-lg transform hover:scale-105 transition duration-300">
                            {t('joinNow')}
                        </Link>
                    </motion.div>
                </div>

                {/* Logo Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-1/2 flex justify-center md:justify-end"
                >
                    <img src={logoSrc} alt="Saint Seiya EX" className="h-64 md:h-[32rem] w-auto drop-shadow-2xl" />
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;

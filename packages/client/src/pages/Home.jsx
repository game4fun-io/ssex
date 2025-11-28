import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import LatestNews from '../components/LatestNews';
import AdUnit from '../components/AdUnit';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <HeroSection />
            <AdUnit slot="home-top-banner" />
            <FeatureCards />
            <LatestNews />
            <AdUnit slot="home-bottom-banner" />
        </div>
    );
};

export default Home;

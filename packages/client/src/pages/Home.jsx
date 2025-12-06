import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import LatestNews from '../components/LatestNews';
import AdUnit from '../components/AdUnit';
import SEO from '../components/SEO';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <SEO
                title="Saint Seiya EX Companion - Teams, Characters, and Artifacts"
                description="Build optimized teams, browse character stats, and stay updated with the latest Saint Seiya EX news."
                path="/"
                image="/logo.png"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'Saint Seiya EX Companion',
                    url: (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: `${(import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')}/characters?q={search_term_string}`,
                        'query-input': 'required name=search_term_string'
                    }
                }}
            />
            <HeroSection />
            <AdUnit slot="home-top-banner" />
            <FeatureCards />
            <LatestNews />
            <AdUnit slot="home-bottom-banner" />
        </div>
    );
};

export default Home;

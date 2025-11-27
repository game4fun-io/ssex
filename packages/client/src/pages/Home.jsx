import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-5xl font-bold text-yellow-500 mb-6">Welcome to Saint Seiya EX Database</h1>
                <p className="text-xl text-gray-300 mb-8">
                    The ultimate consulting tool for Saint Seiya EX mobile game.
                    Explore characters, skills, and build your dream team.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/characters" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg transition">
                        View Characters
                    </Link>
                    <Link to="/register" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        Join Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;

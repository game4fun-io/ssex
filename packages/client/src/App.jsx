import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import News from './pages/News';
import NewsEditor from './pages/NewsEditor';
import Characters from './pages/Characters';
import CharacterDetails from './pages/CharacterDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamBuilder from './pages/TeamBuilder';
import SharedComp from './pages/SharedComp';
import SharedTeamViewer from './pages/SharedTeamViewer';
import Artifacts from './pages/Artifacts';
import ArtifactDetail from './pages/ArtifactDetail';
import ForceCards from './pages/ForceCards';
import ForceCardDetail from './pages/ForceCardDetail';
import Proposals from './pages/Proposals';
import Profile from './pages/Profile';

import { ConfigProvider } from './context/ConfigContext';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AnnouncementBanner from './components/AnnouncementBanner';

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Force reload to update auth state or use context if possible (reload is safer for now)
      window.location.href = '/';
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <div className="min-h-screen bg-gray-800">
            <AnnouncementBanner />
            <Navbar />
            <TokenHandler />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/create" element={<ProtectedRoute><NewsEditor /></ProtectedRoute>} />
              <Route path="/news/edit/:id" element={<ProtectedRoute><NewsEditor /></ProtectedRoute>} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/characters/:id" element={<CharacterDetails />} />
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/team-builder/share/:hash" element={<SharedComp />} />
              <Route path="/share/:shortCode" element={<SharedTeamViewer />} />
              <Route path="/artifacts" element={<Artifacts />} />
              <Route path="/artifacts/:id" element={<ArtifactDetail />} />
              <Route path="/force-cards" element={<ForceCards />} />
              <Route path="/force-cards/:id" element={<ForceCardDetail />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetails from './pages/CharacterDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamBuilder from './pages/TeamBuilder';
import Artifacts from './pages/Artifacts';
import ForceCards from './pages/ForceCards';

import { ConfigProvider } from './context/ConfigContext';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <div className="min-h-screen bg-gray-800">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/characters/:id" element={<CharacterDetails />} />
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/artifacts" element={<Artifacts />} />
              <Route path="/force-cards" element={<ForceCards />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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

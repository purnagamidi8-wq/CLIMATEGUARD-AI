import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineProvider } from './contexts/OfflineContext';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import OfflineBanner from './components/offline/OfflineBanner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import RiskMap from './pages/RiskMap';
import Checklists from './pages/Checklists';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Methodology from './pages/Methodology';
import SOSModal from './components/emergency/SOSModal';
import HelplinesModal from './components/emergency/HelplinesModal';
import { useState } from 'react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/methodology" element={<Methodology />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><RiskMap /></ProtectedRoute>} />
      <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  const [isGlobalSOSOpen, setIsGlobalSOSOpen] = useState(false);
  const [isGlobalHelplinesOpen, setIsGlobalHelplinesOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <OfflineProvider>
              <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
                <Navbar
                  onOpenSOS={() => setIsGlobalSOSOpen(true)}
                  onOpenHelplines={() => setIsGlobalHelplinesOpen(true)}
                />
                <OfflineBanner />

                {/* pb-16 leaves room for MobileNav on small screens */}
                <div className="flex-1 pb-16 md:pb-0">
                  <AppRoutes />
                </div>

                {/* Sticky mobile bottom navigation (hidden on md+) */}
                <MobileNav onSOSClick={() => setIsGlobalSOSOpen(true)} />

                <SOSModal
                  isOpen={isGlobalSOSOpen}
                  onClose={() => setIsGlobalSOSOpen(false)}
                />
                <HelplinesModal
                  isOpen={isGlobalHelplinesOpen}
                  onClose={() => setIsGlobalHelplinesOpen(false)}
                />
              </div>
            </OfflineProvider>
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

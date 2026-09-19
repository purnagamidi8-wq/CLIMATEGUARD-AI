import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../../contexts/LanguageContext';
import { useOffline } from '../../contexts/OfflineContext';
import { useState } from 'react';

export default function Navbar({ onOpenSOS, onOpenHelplines }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline } = useOffline();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 text-white shadow-xl sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto px-4 flex items-center justify-between h-16">
        {/* Left: Brand + Online pill */}
        <div className="flex items-center gap-3">
          <Link to="/" className="font-extrabold text-lg md:text-xl tracking-wide flex items-center gap-2">
            <span className="text-2xl drop-shadow">🌍</span>
            <span className="bg-gradient-to-r from-white via-blue-100 to-teal-200 bg-clip-text text-transparent font-black">
              {t('app_name')}
            </span>
          </Link>
          
          {/* Online/Offline Status Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            {isOnline ? t('online') : t('offline')}
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-teal-200 transition">{t('dashboard')}</Link>
              <Link to="/map" className="hover:text-teal-200 transition">{t('risk_map')}</Link>
              <Link to="/chat" className="hover:text-teal-200 transition">{t('chat')}</Link>
              <Link to="/checklists" className="hover:text-teal-200 transition">{t('checklists')}</Link>
              <Link to="/alerts" className="hover:text-teal-200 transition">{t('alerts')}</Link>
            </>
          )}
          <Link to="/methodology" className="hover:text-teal-200 transition">{t('methodology')}</Link>
        </div>

        {/* Right: Emergency SOS, Helplines, Lang Selector, Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Helplines button */}
          <button
            onClick={onOpenHelplines}
            aria-label="Open emergency helplines directory"
            className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-400/30 flex items-center gap-1.5 transition shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          >
            <span>🏛️</span>
            <span className="hidden sm:inline">112 / Helplines</span>
          </button>

          {/* Prominent SOS Trigger */}
          <button
            onClick={onOpenSOS}
            aria-label="Trigger emergency SOS broadcast"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse transition focus:ring-2 focus:ring-white focus:outline-none"
          >
            <span>🚨</span>
            <span>SOS</span>
          </button>

          {/* 7-Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select interface language"
            className="bg-blue-950/80 text-white text-xs rounded-lg px-2.5 py-1.5 border border-blue-500/40 font-medium focus:ring-2 focus:ring-teal-400 focus:outline-none"
          >
            {AVAILABLE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-gray-900 text-white">
                {l.native}
              </option>
            ))}
          </select>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="bg-teal-600 hover:bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black shadow-md border border-teal-300/40"
                title={user.name}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
              <button onClick={handleLogout} className="hidden md:inline text-xs text-blue-200 hover:text-white">
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs hover:text-blue-200 font-medium">{t('login')}</Link>
              <Link to="/register" className="bg-white text-blue-900 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-50 shadow-sm">{t('register')}</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden text-white p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-blue-950 px-4 py-3 border-t border-blue-800 space-y-2 text-sm">
          {user && (
            <>
              <Link to="/dashboard" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('dashboard')}</Link>
              <Link to="/map" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('risk_map')}</Link>
              <Link to="/chat" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('chat')}</Link>
              <Link to="/checklists" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('checklists')}</Link>
              <Link to="/alerts" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('alerts')}</Link>
              <Link to="/profile" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('profile')}</Link>
            </>
          )}
          <Link to="/methodology" className="block py-1.5 hover:text-teal-200" onClick={() => setMenuOpen(false)}>{t('methodology')}</Link>
        </div>
      )}
    </nav>
  );
}

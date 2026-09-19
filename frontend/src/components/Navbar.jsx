import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-teal-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="font-bold text-xl tracking-wide flex items-center gap-2">
          <span className="text-2xl">&#127758;</span> {t('app_name')}
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-blue-200 transition">{t('dashboard')}</Link>
              <Link to="/map" className="hover:text-blue-200 transition">{t('risk_map')}</Link>
              <Link to="/chat" className="hover:text-blue-200 transition">{t('chat')}</Link>
              <Link to="/checklists" className="hover:text-blue-200 transition">{t('checklists')}</Link>
              <Link to="/alerts" className="hover:text-blue-200 transition">{t('alerts')}</Link>
            </>
          )}
          <Link to="/methodology" className="hover:text-blue-200 transition">{t('methodology')}</Link>
        </div>

        <div className="flex items-center gap-3">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-blue-800 text-white text-sm rounded px-2 py-1 border border-blue-500">
            <option value="en">EN</option>
            <option value="te">TE</option>
            <option value="hi">HI</option>
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-blue-900">{user.name?.[0]?.toUpperCase() || 'U'}</Link>
              <button onClick={handleLogout} className="text-sm hover:text-blue-200">{t('logout')}</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hover:text-blue-200 text-sm">{t('login')}</Link>
              <Link to="/register" className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-50">{t('register')}</Link>
            </div>
          )}

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-blue-800 px-4 pb-3">
          {user && (
            <>
              <Link to="/dashboard" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('dashboard')}</Link>
              <Link to="/map" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('risk_map')}</Link>
              <Link to="/chat" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('chat')}</Link>
              <Link to="/checklists" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('checklists')}</Link>
              <Link to="/alerts" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('alerts')}</Link>
            </>
          )}
          <Link to="/methodology" className="block py-2 hover:text-blue-200" onClick={() => setMenuOpen(false)}>{t('methodology')}</Link>
        </div>
      )}
    </nav>
  );
}

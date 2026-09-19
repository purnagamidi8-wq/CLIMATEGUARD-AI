import { Link, useLocation as useRouteLocation } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Sidebar({ risks, onOpenSOS, onOpenSafePlaces, onOpenContacts }) {
  const { location, locationName, permissionState, isLiveTracking, toggleLiveTracking, detectLocation } = useLocation();
  const { t } = useLanguage();
  const routeLocation = useRouteLocation();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: '📊' },
    { path: '/map', label: t('risk_map'), icon: '🗺️' },
    { path: '/chat', label: t('chat'), icon: '🤖' },
    { path: '/checklists', label: t('checklists'), icon: '📋' },
    { path: '/alerts', label: t('alerts'), icon: '⚠️' },
    { path: '/profile', label: t('profile'), icon: '👤' },
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'SEVERE': return 'text-red-600 font-bold';
      case 'HIGH': return 'text-orange-600 font-bold';
      case 'MODERATE': return 'text-yellow-600 font-bold';
      default: return 'text-emerald-600 font-medium';
    }
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-5 shrink-0">
      {/* 1. Active Location Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
            <span className="text-sm">📍</span> {t('active_location')}
          </span>
          <button
            onClick={detectLocation}
            title={t('refresh_location')}
            className="text-xs bg-white hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-300 font-semibold shadow-xs"
          >
            🔄
          </button>
        </div>

        <p className="font-bold text-gray-900 text-sm truncate">{locationName}</p>
        <p className="text-[11px] text-gray-500 font-mono">
          {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
        </p>

        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={toggleLiveTracking}
            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${isLiveTracking ? 'bg-emerald-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <span>📡</span> {isLiveTracking ? 'GPS Tracking Active' : 'Enable Live GPS'}
          </button>
          {permissionState === 'denied' && (
            <span className="text-[10px] text-red-600 font-semibold">GPS Denied</span>
          )}
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">Navigation</span>
        {navItems.map((item) => {
          const isActive = routeLocation.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50/80 hover:text-blue-700'}`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Quick Risk Summary */}
      {risks && (
        <div className="bg-gray-50 border rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Hazard Summary</span>
            <span className={`text-xs px-2 py-0.5 rounded font-black ${risks.overall_risk_level === 'SEVERE' ? 'bg-red-100 text-red-700' : risks.overall_risk_level === 'HIGH' ? 'bg-orange-100 text-orange-700' : risks.overall_risk_level === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {risks.overall_risk_level}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            {risks.hazards?.slice(0, 4).map((h) => (
              <div key={h.hazard_type} className="flex justify-between items-center py-0.5 border-b border-gray-200/60 last:border-0">
                <span className="capitalize text-gray-700">{h.hazard_type.replace('_', ' ')}</span>
                <span className={getRiskColor(h.risk_level)}>{h.risk_level} ({Math.round(h.risk_score)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Quick Actions */}
      <div className="mt-auto space-y-2 pt-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">Quick Protection</span>
        <button
          onClick={onOpenSafePlaces}
          className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <span>🛡️</span> {t('find_shelter')}
        </button>
        <button
          onClick={onOpenContacts}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <span>👥</span> {t('contacts')}
        </button>
      </div>
    </aside>
  );
}

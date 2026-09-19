import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/map',       icon: '🗺️', label: 'Map'  },
  { path: '/chat',      icon: '🤖', label: 'AI'   },
  { path: '/alerts',    icon: '🔔', label: 'Alerts'},
  { path: '/checklists',icon: '📋', label: 'Prep' },
];

export default function MobileNav({ onSOSClick, hasSevereAlert }) {
  const [sosPressing, setSosPressing] = useState(false);
  const navigate = useNavigate();

  const handleSOS = () => {
    if (onSOSClick) onSOSClick();
    else navigate('/dashboard?sos=1');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex items-stretch md:hidden safe-bottom">
      {/* First 2 nav items */}
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold transition ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800'
            }`
          }
        >
          <span className="text-xl leading-none mb-0.5">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Central SOS button */}
      <div className="flex items-center justify-center px-2 relative -top-4">
        <button
          onMouseDown={() => setSosPressing(true)}
          onMouseUp={() => setSosPressing(false)}
          onMouseLeave={() => setSosPressing(false)}
          onTouchStart={() => setSosPressing(true)}
          onTouchEnd={() => { setSosPressing(false); handleSOS(); }}
          onClick={handleSOS}
          aria-label="Emergency SOS"
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl font-black text-[9px] tracking-wide transition select-none
            ${sosPressing
              ? 'bg-red-700 scale-95 shadow-inner'
              : 'bg-gradient-to-br from-red-500 to-rose-700 text-white scale-100 hover:scale-105 active:scale-95'}
            ${hasSevereAlert ? 'ring-4 ring-red-400 ring-offset-1 animate-pulse' : ''}
          `}
        >
          <span className="text-base leading-none">🆘</span>
          <span className="text-[9px] text-white/90 font-black">SOS</span>
        </button>
      </div>

      {/* Last 2 nav items */}
      {NAV_ITEMS.slice(2).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold transition ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-800'
            }`
          }
        >
          <span className="text-xl leading-none mb-0.5">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

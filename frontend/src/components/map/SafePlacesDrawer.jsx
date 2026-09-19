import { useLanguage } from '../../contexts/LanguageContext';

export default function SafePlacesDrawer({ safePlaces, hazardType, isOpen, onClose }) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🛡️</span> {t('safe_places')}
            </h2>
            <p className="text-xs text-teal-100">Ranked by Distance, Verified Capacity & Hazard Relevance ({hazardType?.toUpperCase() || 'GENERAL'})</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(!safePlaces || safePlaces.length === 0) ? (
            <div className="text-center py-8 text-sm text-gray-500">Searching for emergency shelters within 15 km...</div>
          ) : (
            safePlaces.map((sp) => (
              <div key={sp.id} className="bg-gray-50 hover:bg-teal-50/50 border rounded-xl p-4 transition space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">{sp.name}</h4>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold uppercase">{sp.place_type.replace('_', ' ')}</span>
                      {sp.is_verified && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Verified</span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{sp.address || `${sp.city}, ${sp.state}`}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-teal-700">{sp.distance_km} km</span>
                    <p className="text-[10px] text-gray-500">🚶 {sp.estimated_time_walk_min} min • 🚗 {sp.estimated_time_drive_min} min</p>
                  </div>
                </div>

                {/* Facilities & Capacity */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 pt-1">
                  {sp.capacity && (
                    <span className="bg-gray-200/80 px-2 py-0.5 rounded">
                      Capacity: <b>{sp.capacity}</b> (Occupancy: {sp.current_occupancy !== null ? sp.current_occupancy : 'Unknown'})
                    </span>
                  )}
                  {sp.facilities?.map((f, i) => (
                    <span key={i} className="bg-white border px-1.5 py-0.5 rounded text-[11px]">
                      ✓ {f}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200/60">
                  {sp.contact_phone && (
                    <a
                      href={`tel:${sp.contact_phone}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                    >
                      <span>📞</span> {sp.contact_phone}
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${sp.latitude},${sp.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <span>🗺️</span> {t('directions')}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

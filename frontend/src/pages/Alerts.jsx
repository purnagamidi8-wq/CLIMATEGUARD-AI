import { useState, useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { alertAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Alerts() {
  const { location, locationName, detectLocation } = useLocation();
  const { t } = useLanguage();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [hazardFilter, setHazardFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) detectLocation();
  }, [location, detectLocation]);

  useEffect(() => {
    if (location) fetchAlerts();
  }, [location, hazardFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [liveRes, histRes] = await Promise.all([
        alertAPI.check(location.latitude, location.longitude, true),
        alertAPI.getHistory(hazardFilter === 'all' ? null : hazardFilter, null),
      ]);
      setActiveAlerts(liveRes.data?.alerts || []);
      setHistoryAlerts(histRes.data || []);
    } catch (err) {
      console.error('Alert fetch error:', err);
    }
    setLoading(false);
  };

  const displayedList = activeTab === 'active' ? activeAlerts : historyAlerts;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span>⚠️</span> {t('alerts')}
          </h1>
          <p className="text-xs text-gray-500">Live Hazard Warnings • Official Warning Feeds • Historical Log</p>
        </div>
        <div className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
          📍 {locationName}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'active' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span>🚨</span> Active Warnings ({activeAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span>📜</span> Historical Audit Log ({historyAlerts.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning active disaster risk threshold triggers..." />
      ) : displayedList.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-2">
          <span className="text-4xl">✅</span>
          <p className="text-emerald-900 font-bold text-base">No active hazard alerts for {locationName}</p>
          <p className="text-emerald-700 text-xs">All monitored climate metrics are within normal safe limits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((alert, i) => {
            const isSevere = alert.severity === 'SEVERE';
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 p-5 shadow-sm space-y-3 ${isSevere ? 'bg-red-50/80 border-red-400' : 'bg-orange-50/80 border-orange-400'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-black text-base ${isSevere ? 'text-red-950' : 'text-orange-950'}`}>
                        {alert.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${isSevere ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-900'}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hazard Category: <b className="capitalize">{alert.hazard_type}</b> • Source: {alert.source_feed || 'ClimateGuard Assessment'}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono shrink-0">
                    {alert.timestamp || (alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'Live')}
                  </span>
                </div>

                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  {alert.message}
                </p>

                {alert.factors && alert.factors.length > 0 && (
                  <div className="bg-white/80 border border-gray-200 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                      Key Driving Factors:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                      {alert.factors.map((f, j) => (
                        <li key={j}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

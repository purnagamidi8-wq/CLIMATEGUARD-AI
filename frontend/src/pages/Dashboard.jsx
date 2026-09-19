import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { weatherAPI, riskAPI, safePlacesAPI, alertAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import DemoScenarioSelector from '../components/risk/DemoScenarioSelector';
import VisualHazardGuide from '../components/risk/VisualHazardGuide';
import RiskGauge from '../components/RiskGauge';
import WeatherCard from '../components/WeatherCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SOSModal from '../components/emergency/SOSModal';
import HelplinesModal from '../components/emergency/HelplinesModal';
import TrustedContactsModal from '../components/emergency/TrustedContactsModal';
import ShareLocationModal from '../components/emergency/ShareLocationModal';
import SafePlacesDrawer from '../components/map/SafePlacesDrawer';
import { alertSound } from '../utils/alerts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { location, locationName, detectLocation } = useLocation();
  const { t } = useLanguage();
  const { isOnline } = useOffline();

  const [weather, setWeather] = useState(null);
  const [risks, setRisks] = useState(null);
  const [safePlaces, setSafePlaces] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Scenario Simulator State
  const [demoMode, setDemoMode] = useState(true);
  const [scenario, setScenario] = useState('flood');

  // Modal Control States
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isHelplinesOpen, setIsHelplinesOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isShareLocationOpen, setIsShareLocationOpen] = useState(false);
  const [isSafePlacesOpen, setIsSafePlacesOpen] = useState(false);

  useEffect(() => {
    if (!location) detectLocation();
  }, [location, detectLocation]);

  useEffect(() => {
    if (location) {
      fetchDashboardData();
    }
  }, [location, demoMode, scenario]);

  const fetchDashboardData = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const [wRes, rRes, spRes, aRes] = await Promise.all([
        weatherAPI.getCurrent(location.latitude, location.longitude, demoMode, scenario),
        riskAPI.assess(location.latitude, location.longitude, demoMode, scenario),
        safePlacesAPI.getNearby(location.latitude, location.longitude, scenario, 'all', 15.0),
        alertAPI.check(location.latitude, location.longitude, demoMode, scenario)
      ]);
      setWeather(wRes.data);
      setRisks(rRes.data);
      setSafePlaces(spRes.data || []);
      setActiveAlerts(aRes.data?.alerts || []);
      setLastUpdated(new Date());

      // Trigger emergency audio chime & vibration if risk is severe
      if (rRes.data?.overall_risk_level === 'SEVERE') {
        alertSound.playChime('severe');
        alertSound.vibrate([300, 150, 300]);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
    setLoading(false);
  };

  const chartData = risks?.hazards?.map((h) => ({
    name: h.hazard_type.replace('_', ' ').toUpperCase(),
    score: Math.round(h.risk_score),
    fill: h.risk_level === 'SEVERE' ? '#dc2626' : h.risk_level === 'HIGH' ? '#ea580c' : h.risk_level === 'MODERATE' ? '#eab308' : '#10b981',
  })) || [];

  const topHazard = risks?.hazards ? [...risks.hazards].sort((a, b) => b.risk_score - a.risk_score)[0] : null;

  return (
    <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-4 md:py-6">
      {/* 3-ZONE PROFESSIONAL APPLICATION LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT PANEL: Navigation, Active Location, Risk Summary */}
        <Sidebar
          risks={risks}
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenSafePlaces={() => setIsSafePlacesOpen(true)}
          onOpenContacts={() => setIsContactsOpen(true)}
        />

        {/* CENTER MAIN WORKING AREA */}
        <main className="flex-1 w-full space-y-5 min-w-0">
          {/* Climate Scenario Simulator */}
          <DemoScenarioSelector
            currentScenario={scenario}
            isDemoMode={demoMode}
            onSelectScenario={(s) => { setScenario(s); setDemoMode(true); }}
            onToggleDemoMode={() => setDemoMode(!demoMode)}
          />

          {loading ? (
            <LoadingSpinner message="Calculating active location climate risk assessment..." />
          ) : (
            <>
              {/* Overall Risk Banner */}
              {risks && (
                <div className={`rounded-2xl p-5 border-2 shadow-sm transition flex items-start justify-between flex-wrap gap-4 ${risks.overall_risk_level === 'SEVERE' ? 'bg-red-50 border-red-500 text-red-950' : risks.overall_risk_level === 'HIGH' ? 'bg-orange-50 border-orange-500 text-orange-950' : risks.overall_risk_level === 'MODERATE' ? 'bg-yellow-50 border-yellow-500 text-yellow-950' : 'bg-emerald-50 border-emerald-500 text-emerald-950'}`}>
                  <div className="flex items-start gap-3.5">
                    <span className="text-4xl drop-shadow">
                      {risks.overall_risk_level === 'SEVERE' ? '🔴' : risks.overall_risk_level === 'HIGH' ? '🟠' : risks.overall_risk_level === 'MODERATE' ? '🟡' : '🟢'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold tracking-tight">
                          {t('overall_risk')}: {risks.overall_risk_level} ({Math.round(risks.overall_risk_score)}/100)
                        </h2>
                        <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold shadow-xs">
                          {risks.data_mode}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mt-1">
                        Active Area: <b>{locationName}</b> • Primary Concern: <b className="capitalize">{topHazard?.hazard_type.replace('_', ' ')}</b> • Source: {risks.data_source}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setIsSafePlacesOpen(true)}
                      className="bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs border transition"
                    >
                      🛡️ {t('view_safe_places')}
                    </button>
                    <button
                      onClick={() => setIsSOSOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
                    >
                      🚨 SOS
                    </button>
                  </div>
                </div>
              )}

              {/* Weather & Multi-Hazard Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <WeatherCard
                    weather={weather?.current}
                    locationName={locationName}
                    lastUpdated={lastUpdated}
                    onRefresh={fetchDashboardData}
                  />
                </div>
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">
                      Multi-Hazard Risk Index (0-100)
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {lastUpdated ? `Computed ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Deterministic Engine'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {risks?.hazards?.map((h) => (
                      <RiskGauge key={h.hazard_type} score={Math.round(h.risk_score)} level={h.risk_level} hazard={h.hazard_type} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recharts Hazard Overview */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">
                      Hazard Threat Distribution
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">0 = Safe, 100 = Catastrophic</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <rect key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Nearby Safe Places Carousel Cards */}
              <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">
                      Nearby Emergency Shelters & Medical Response
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSafePlacesOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    View All ({safePlaces.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safePlaces.slice(0, 3).map((sp) => (
                    <div key={sp.id} className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 border border-teal-200 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold uppercase">{sp.place_type.replace('_', ' ')}</span>
                          <span className="font-black text-xs text-teal-700">{sp.distance_km} km</span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 mt-1.5 line-clamp-1">{sp.name}</h4>
                        <p className="text-[11px] text-gray-500">🚶 {sp.estimated_time_walk_min} min walk • 🚗 {sp.estimated_time_drive_min} min drive</p>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-teal-200/60">
                        {sp.contact_phone && (
                          <a
                            href={`tel:${sp.contact_phone}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          >
                            📞 Call
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${sp.latitude},${sp.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex-1 text-center"
                        >
                          🗺️ Directions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Hazard Preparedness Guide (All 7 Climate Scenarios) */}
              <VisualHazardGuide activeScenario={scenario} />
            </>
          )}
        </main>

        {/* RIGHT PANEL: AI Assistant, Active Alerts, Speed Dial 112 */}
        <RightPanel
          activeAlerts={activeAlerts}
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenHelplines={() => setIsHelplinesOpen(true)}
          onOpenShareLocation={() => setIsShareLocationOpen(true)}
          onOpenContacts={() => setIsContactsOpen(true)}
        />
      </div>

      {/* Emergency Modals */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        overallRisk={risks?.overall_risk_level}
        hazardType={topHazard?.hazard_type}
      />
      <HelplinesModal
        isOpen={isHelplinesOpen}
        onClose={() => setIsHelplinesOpen(false)}
      />
      <TrustedContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />
      <ShareLocationModal
        isOpen={isShareLocationOpen}
        onClose={() => setIsShareLocationOpen(false)}
        overallRisk={risks?.overall_risk_level}
        hazardType={topHazard?.hazard_type}
      />
      <SafePlacesDrawer
        safePlaces={safePlaces}
        hazardType={topHazard?.hazard_type}
        isOpen={isSafePlacesOpen}
        onClose={() => setIsSafePlacesOpen(false)}
      />
    </div>
  );
}

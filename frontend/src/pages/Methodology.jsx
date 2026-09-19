import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const RISK_LEVELS = [
  { level: 'LOW', score: '0–24', color: 'emerald', meaning: 'All meteorological metrics are within normal safe limits. Routine monitoring continues.' },
  { level: 'MODERATE', score: '25–49', color: 'yellow', meaning: 'Early-warning conditions detected. Precautionary awareness and review of preparedness checklists advised.' },
  { level: 'HIGH', score: '50–74', color: 'orange', meaning: 'Significant hazard indicators confirmed. Activate disaster preparedness plan and monitor authority advisories.' },
  { level: 'SEVERE', score: '75–100', color: 'red', meaning: 'Critical hazard conditions. Immediate protective action required. Follow all official evacuation and shelter orders.' },
];

const HAZARD_METHODS = [
  {
    hazard: 'Flood',
    icon: '🌊',
    variables: ['Real-time precipitation (mm/hr)', 'Forecasted 24-hour rainfall accumulation', 'Current soil moisture saturation', 'Weather code severity (WMO)'],
    thresholds: '>50mm/hr rainfall (+50pts), >100mm 24h forecast (+40pts), saturated soil moisture >0.40 (+15pts), heavy rain WMO code (+20pts)',
    sources: ['Open-Meteo Precipitation API', 'IMD Rain Gauge Network'],
  },
  {
    hazard: 'Heatwave',
    icon: '🌡️',
    variables: ['Ambient temperature (°C)', 'Apparent/feels-like temperature', 'UV radiation index', 'Atmospheric humidity'],
    thresholds: '>44°C ambient (+50pts), feels-like >45°C (+40pts), UV Index >10 (+15pts), low humidity compound risk',
    sources: ['Open-Meteo Temperature API', 'IMD Heat Action Plan thresholds'],
  },
  {
    hazard: 'Cyclone & Gale',
    icon: '🌀',
    variables: ['10m sustained wind speed (km/h)', 'Wind gust velocity (km/h)', 'Atmospheric pressure drop', 'Precipitation intensity'],
    thresholds: 'Sustained wind >90km/h (+60pts), gusts >105km/h (+30pts), pressure <990hPa (+15pts)',
    sources: ['Open-Meteo Wind API', 'NDRF Cyclone Category Definitions (IMD)'],
  },
  {
    hazard: 'Lightning Storm',
    icon: '⚡',
    variables: ['WMO weather code (thunderstorm classification)', 'Atmospheric instability indicators', 'Precipitation associated with storm'],
    thresholds: 'WMO Code 99 (thunderstorm + heavy hail): +80pts, Code 96: +70pts, Code 95: +60pts',
    sources: ['WMO Weather Code Standard Table', 'Open-Meteo Hourly Codes'],
  },
  {
    hazard: 'Drought',
    icon: '🌾',
    variables: ['Current precipitation (mm)', '7-day precipitation forecast', 'Soil moisture content', 'Air temperature anomaly'],
    thresholds: 'Zero precipitation + soil moisture <0.08 (+65pts), temperature >38°C (+25pts), sustained dry forecast (+20pts)',
    sources: ['Open-Meteo Soil Variables API', 'IMD Meteorological Drought Definitions'],
  },
  {
    hazard: 'Wildfire',
    icon: '🔥',
    variables: ['Temperature (°C)', 'Relative humidity (%)', 'Wind speed (km/h)', 'Soil/vegetation moisture'],
    thresholds: 'Temp >36°C + Humidity <20% + Wind >25km/h — Triple compound trigger = +75pts',
    sources: ['Canadian Fire Weather Index Methodology', 'NDMA Forest Fire Risk Guidelines'],
  },
];

const DATA_SOURCES = [
  { name: 'Open-Meteo', desc: 'Free meteorological API providing real-time temperature, wind, precipitation, soil moisture, and UV data without requiring API keys.', url: 'open-meteo.com', icon: '🌤️' },
  { name: 'OpenStreetMap / Nominatim', desc: 'Geocoding and reverse geocoding to resolve coordinates to city, district, and state identifiers for localized risk reporting.', url: 'nominatim.openstreetmap.org', icon: '🗺️' },
  { name: 'OSM Overpass API', desc: 'Queries live geospatial data for emergency facilities — hospitals, fire stations, cyclone shelters, and police control rooms — within defined radius.', url: 'overpass-api.de', icon: '🏥' },
  { name: 'Gemini API (RAG-Enhanced)', desc: 'Generative AI with Retrieval-Augmented Generation from a seeded ChromaDB vector store of NDMA and IMD official safety documents.', url: 'ai.google.dev', icon: '🤖' },
  { name: 'NDMA India Guidelines', desc: 'National Disaster Management Authority preparedness checklists, evacuation protocols, and state-specific response frameworks.', url: 'ndma.gov.in', icon: '🏛️' },
  { name: 'MHA — ERSS 112', desc: 'Ministry of Home Affairs Emergency Response Support System. All helpline numbers verified from official MHA and NDMA published directories.', url: 'mha.gov.in', icon: '🚨' },
];

export default function Methodology() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
          SCIENTIFIC TRANSPARENCY
        </span>
        <h1 className="text-3xl font-black text-gray-900">{t('methodology')}</h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          How ClimateGuard AI calculates risk scores, sources real-time data, locates emergency shelters, and delivers AI-generated safety guidance — openly and accountably.
        </p>
      </div>

      {/* Risk Level Definitions */}
      <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span>📊</span> Risk Level Classification (0–100 Scale)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RISK_LEVELS.map((rl) => (
            <div
              key={rl.level}
              className={`rounded-xl p-4 border-2 ${rl.color === 'emerald' ? 'border-emerald-300 bg-emerald-50' : rl.color === 'yellow' ? 'border-yellow-300 bg-yellow-50' : rl.color === 'orange' ? 'border-orange-300 bg-orange-50' : 'border-red-300 bg-red-50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-black text-sm ${rl.color === 'emerald' ? 'text-emerald-900' : rl.color === 'yellow' ? 'text-yellow-900' : rl.color === 'orange' ? 'text-orange-900' : 'text-red-900'}`}>
                  {rl.level} RISK
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${rl.color === 'emerald' ? 'bg-emerald-200 text-emerald-800' : rl.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' : rl.color === 'orange' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'}`}>
                  Score: {rl.score}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{rl.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hazard Scoring Methods */}
      <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span>⚙️</span> Hazard-Specific Scoring Engine
        </h2>
        <p className="text-xs text-gray-500">Each hazard uses a deterministic additive point system based on field-validated meteorological thresholds from NDMA, IMD, and international weather agencies. Points are capped at 100.</p>

        <div className="space-y-4">
          {HAZARD_METHODS.map((h) => (
            <div key={h.hazard} className="border rounded-xl p-4 hover:bg-gray-50/60 transition space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{h.icon}</span>
                <h3 className="font-extrabold text-gray-900 text-sm">{h.hazard} Risk Module</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 rounded-lg p-2.5 space-y-1">
                  <span className="font-bold text-blue-900 uppercase tracking-wide text-[10px]">Input Variables</span>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {h.variables.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-2.5 space-y-1">
                  <span className="font-bold text-orange-900 uppercase tracking-wide text-[10px]">Trigger Thresholds</span>
                  <p className="text-gray-700 leading-relaxed">{h.thresholds}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {h.sources.map((s, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                    📚 {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <span>🔗</span> Data Sources & APIs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DATA_SOURCES.map((ds) => (
            <div key={ds.name} className="border rounded-xl p-4 space-y-2 hover:border-blue-300 hover:bg-blue-50/30 transition">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ds.icon}</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{ds.name}</h3>
                  <p className="text-[11px] text-blue-600 font-mono">{ds.url}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{ds.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-black text-amber-900 flex items-center gap-2">
          <span>⚠️</span> Important Safety Disclaimer
        </h2>
        <div className="text-xs text-amber-800 space-y-2 leading-relaxed">
          <p><strong>This system is an educational demonstration prototype</strong> developed as a student/hackathon project. It is NOT a certified or officially authorized disaster warning system.</p>
          <p>In the event of any actual climate emergency, always:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Dial <strong>112</strong> for immediate emergency assistance.</li>
            <li>Follow official instructions from district administration, NDMA, and IMD.</li>
            <li>Monitor official All India Radio (AIR) and Doordarshan broadcasts during power outages.</li>
            <li>Obey mandatory evacuation orders immediately without delay.</li>
          </ul>
          <p>Risk scores are derived from threshold-based heuristics and are NOT probabilistic forecasts. They supplement but cannot replace professional meteorological services.</p>
        </div>
      </section>

      <div className="text-center">
        <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-sm transition inline-block shadow-md">
          Back to Dashboard →
        </Link>
      </div>
    </div>
  );
}

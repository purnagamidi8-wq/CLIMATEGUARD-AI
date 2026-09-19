export const DEMO_SCENARIOS_LIST = [
  { id: 'flood', name: '🌊 Flood Emergency', hazard: 'flood', desc: 'Heavy monsoon downpour (55mm/hr), saturated soil, river overflow' },
  { id: 'heatwave', name: '🌡️ Extreme Heat', hazard: 'heatwave', desc: '45.2°C ambient, dangerous heat index (49.5°C), high UV' },
  { id: 'cyclone', name: '🌀 Cyclone & Gale', hazard: 'cyclone', desc: '105 km/h storm-force winds, 145 km/h gusts, intense rain' },
  { id: 'lightning', name: '⚡ Severe Lightning', hazard: 'lightning', desc: 'Active thunderstorm with severe hail and convective lightning' },
  { id: 'drought', name: '🌾 Drought Spell', hazard: 'drought', desc: '0mm rainfall, acute soil moisture depletion (0.04), high heat' },
  { id: 'wildfire', name: '🔥 Wildfire Hazard', hazard: 'wildfire', desc: 'Scorching 41°C, low humidity (14%), strong dry wind' },
  { id: 'normal', name: '☀️ Normal Weather', hazard: 'normal', desc: 'Mild 28.5°C, comfortable humidity, safe baseline' },
];

export default function DemoScenarioSelector({ currentScenario, isDemoMode, onSelectScenario, onToggleDemoMode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Climate Scenario Simulator</h3>
            <p className="text-xs text-gray-500">Test multi-hazard risk engine, shelters, alerts & AI response</p>
          </div>
        </div>

        <button
          onClick={onToggleDemoMode}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${isDemoMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}
        >
          <span>{isDemoMode ? '🟡 DEMO MODE' : '🟢 LIVE API'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DEMO_SCENARIOS_LIST.map((s) => {
          const isSelected = isDemoMode && currentScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              className={`p-2 rounded-xl text-left text-xs font-bold border transition flex flex-col justify-between gap-1 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              <span>{s.name}</span>
              <span className={`text-[10px] font-normal line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                {s.hazard}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

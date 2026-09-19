import { useLanguage } from '../contexts/LanguageContext';

export default function WeatherCard({ weather, locationName, lastUpdated, onRefresh }) {
  const { t } = useLanguage();
  if (!weather) return null;

  const { temperature, feels_like, humidity, wind_speed, rain, weather_text, data_mode } = weather;

  // Format freshness
  const formatTime = (date) => {
    if (!date) return 'Live';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📍</span>
              <h3 className="text-base font-bold text-gray-800 line-clamp-1">{locationName || 'Current Location'}</h3>
            </div>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{weather_text || 'Observation'}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {data_mode === 'DEMO' ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">SIMULATION</span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh Weather"
                className="text-gray-400 hover:text-blue-600 p-1 rounded-md transition"
              >
                🔄
              </button>
            )}
          </div>
        </div>

        {/* Big Temperature Display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl sm:text-5xl font-black text-blue-900 tracking-tight">
            {temperature !== undefined ? `${Math.round(temperature)}°C` : '--'}
          </span>
          <span className="text-xs font-semibold text-gray-500">
            Feels like {feels_like !== undefined ? `${Math.round(feels_like)}°C` : '--'}
          </span>
        </div>

        {/* Meteorological Metric Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
            <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wider block mb-0.5">Humidity</span>
            <span className="font-extrabold text-blue-950 text-sm">{humidity !== undefined ? `${humidity}%` : '--'}</span>
          </div>

          <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2.5">
            <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wider block mb-0.5">Wind Speed</span>
            <span className="font-extrabold text-teal-950 text-sm">{wind_speed !== undefined ? `${wind_speed} km/h` : '--'}</span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5">
            <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wider block mb-0.5">Rainfall</span>
            <span className="font-extrabold text-indigo-950 text-sm">{rain !== undefined ? `${rain} mm` : '0 mm'}</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
            <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wider block mb-0.5">Conditions</span>
            <span className="font-extrabold text-amber-950 text-xs line-clamp-1">{weather_text || 'Standard'}</span>
          </div>
        </div>
      </div>

      {/* Data Freshness Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>Source: Open-Meteo API</span>
        </span>
        <span>
          {lastUpdated ? `Refreshed ${formatTime(lastUpdated)}` : 'Realtime Sync'}
        </span>
      </div>
    </div>
  );
}

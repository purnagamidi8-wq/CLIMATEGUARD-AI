export default function RiskGauge({ score, level, hazard, calculationTime }) {
  const colors = {
    LOW: 'bg-emerald-500',
    MODERATE: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    SEVERE: 'bg-red-600',
  };
  const textColors = {
    LOW: 'text-emerald-700',
    MODERATE: 'text-yellow-700',
    HIGH: 'text-orange-700',
    SEVERE: 'text-red-700',
  };
  const bgLight = {
    LOW: 'bg-emerald-50/70 border-emerald-200',
    MODERATE: 'bg-yellow-50/70 border-yellow-200',
    HIGH: 'bg-orange-50/70 border-orange-200',
    SEVERE: 'bg-red-50/70 border-red-200',
  };
  const badgeColors = {
    LOW: 'bg-emerald-100 text-emerald-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    SEVERE: 'bg-red-100 text-red-800',
  };
  const icons = {
    flood: '🌊',
    heatwave: '🌡️',
    cyclone: '🌀',
    lightning: '⚡',
    drought: '🌾',
    wildfire: '🔥',
  };

  return (
    <div className={`rounded-xl p-3.5 shadow-xs border transition hover:shadow-sm ${bgLight[level] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl" role="img" aria-label={hazard}>{icons[hazard] || '⚠️'}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeColors[level] || 'bg-gray-200 text-gray-800'}`}>
          {level}
        </span>
      </div>

      <h3 className="font-extrabold text-xs text-gray-900 capitalize mb-1 line-clamp-1">
        {hazard?.replace('_', ' ')}
      </h3>

      <div className="w-full bg-black/10 rounded-full h-2 mb-1.5 overflow-hidden">
        <div
          className={`${colors[level] || 'bg-blue-600'} h-2 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-black ${textColors[level] || 'text-gray-700'}`}>
          {score}<span className="text-[9px] font-normal text-gray-500">/100</span>
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          {score >= 75 ? 'Critical' : score >= 50 ? 'Warning' : score >= 25 ? 'Advisory' : 'Normal'}
        </span>
      </div>
    </div>
  );
}

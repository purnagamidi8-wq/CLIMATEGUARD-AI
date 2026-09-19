import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { checklistAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HAZARD_META = {
  flood:    { icon: '🌊', color: 'blue',   label: 'Flood Preparedness' },
  heatwave: { icon: '🌡️', color: 'orange', label: 'Heatwave Safety' },
  cyclone:  { icon: '🌀', color: 'cyan',   label: 'Cyclone Readiness' },
  lightning:{ icon: '⚡', color: 'violet', label: 'Lightning Storm' },
  drought:  { icon: '🌾', color: 'yellow', label: 'Drought Preparedness' },
  wildfire: { icon: '🔥', color: 'red',    label: 'Wildfire Resilience' },
};

const COLOR_CLASSES = {
  blue:   { tab: 'bg-blue-600 text-white',   card: 'border-blue-300 bg-blue-50', bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-900' },
  orange: { tab: 'bg-orange-500 text-white', card: 'border-orange-300 bg-orange-50', bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-900' },
  cyan:   { tab: 'bg-cyan-600 text-white',   card: 'border-cyan-300 bg-cyan-50', bar: 'bg-cyan-500',   badge: 'bg-cyan-100 text-cyan-900' },
  violet: { tab: 'bg-violet-600 text-white', card: 'border-violet-300 bg-violet-50', bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-900' },
  yellow: { tab: 'bg-yellow-500 text-white', card: 'border-yellow-300 bg-yellow-50', bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-900' },
  red:    { tab: 'bg-red-600 text-white',    card: 'border-red-300 bg-red-50',  bar: 'bg-red-500',    badge: 'bg-red-100 text-red-900' },
};

export default function Checklists() {
  const { t } = useLanguage();
  const [checklists, setChecklists] = useState({});
  const [activeHazard, setActiveHazard] = useState('flood');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const res = await checklistAPI.getAll();
      setChecklists(res.data);
      const firstKey = Object.keys(res.data || {})[0];
      if (firstKey) setActiveHazard(firstKey);
    } catch (err) {
      console.error('Checklist fetch error:', err);
    }
    setLoading(false);
  };

  const toggleItem = async (hazard, itemId, completed) => {
    try {
      const res = await checklistAPI.toggle({ hazard_type: hazard, item_id: itemId, completed });
      setChecklists((prev) => ({ ...prev, [hazard]: res.data.items }));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const items = checklists[activeHazard] || [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  const meta = HAZARD_META[activeHazard] || { icon: '⚠️', color: 'blue', label: activeHazard };
  const colors = COLOR_CLASSES[meta.color] || COLOR_CLASSES.blue;

  if (loading) return <LoadingSpinner message="Loading preparedness checklists..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <span>📋</span> {t('checklists')}
        </h1>
        <p className="text-xs text-gray-500">Verified disaster preparedness checklists based on NDMA (National Disaster Management Authority) guidelines</p>
      </div>

      {/* Hazard Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(checklists).map((hazard) => {
          const m = HAZARD_META[hazard] || {};
          const c = COLOR_CLASSES[m.color || 'blue'] || COLOR_CLASSES.blue;
          const isActive = activeHazard === hazard;
          return (
            <button
              key={hazard}
              onClick={() => setActiveHazard(hazard)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shadow-xs
                ${isActive ? c.tab + ' border-transparent shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
              <span>{m.icon || '⚠️'}</span>
              {m.label || hazard.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Active Hazard Header & Progress Card */}
      <div className={`rounded-2xl border-2 p-5 space-y-3 ${colors.card}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{meta.icon}</span>
            <div>
              <h2 className="font-black text-base text-gray-900">{meta.label}</h2>
              <p className="text-xs text-gray-600">Emergency preparedness steps recommended by NDMA of India</p>
            </div>
          </div>
          <span className={`text-sm font-black px-3 py-1 rounded-full ${colors.badge}`}>
            {completedCount}/{totalCount} done
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Preparedness Progress</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/80 rounded-full h-3 border border-gray-200">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Completion celebration */}
        {isComplete && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span>Excellent! You have completed all {meta.label} preparedness steps. You are ready.</span>
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-2xl shadow-sm border divide-y">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No checklist items found. Ensure the backend server is running and data is loaded.</div>
        ) : (
          items.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition group"
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(activeHazard, item.id, !item.completed)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm leading-relaxed ${
                    item.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-800 group-hover:text-gray-900 font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </div>
              {item.completed && (
                <span className="text-emerald-500 text-base shrink-0 self-start pt-0.5">✓</span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Source attribution */}
      <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
        <span>📚</span>
        <span>Checklist source: National Disaster Management Authority (NDMA), Government of India • IMD Disaster Preparedness Circulars</span>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const HAZARD_GUIDES = {
  flood: {
    key: 'flood',
    title: 'Flood Preparedness & Evacuation',
    image: '/images/flood-preparedness.svg',
    color: 'blue',
    icon: '🌊',
    badge: 'NDMA Water Safety',
    tips: [
      'Avoid walking or driving through moving water; 6 inches can knock you down',
      'Keep waterproof go-bag with identity docs, medicines, and flashlight',
      'Turn off main electricity switches and gas valves before evacuating',
    ],
  },
  heatwave: {
    key: 'heatwave',
    title: 'Extreme Heat & Sun Stroke Safety',
    image: '/images/heatwave-safety.svg',
    color: 'amber',
    icon: '🌡️',
    badge: 'IMD Heat Action Plan',
    tips: [
      'Stay indoors during peak radiation hours (11:00 AM – 4:00 PM)',
      'Hydrate with ORS, coconut water, or buttermilk even when not thirsty',
      'Wear loose, light-colored cotton garments and wide-brim headgear',
    ],
  },
  cyclone: {
    key: 'cyclone',
    title: 'Cyclone & Gale Force Readiness',
    image: '/images/cyclone-safety.svg',
    color: 'cyan',
    icon: '🌀',
    badge: 'NDRF Coastal Protocol',
    tips: [
      'Secure or dismantle rooftop tin sheets, hoardings, and loose antennas',
      'Keep a battery-operated transistor radio tuned to local All India Radio',
      'Evacuate promptly when SDMA or district authorities issue orders',
    ],
  },
  lightning: {
    key: 'lightning',
    title: 'Lightning & Thunderstorm Safety',
    image: '/images/lightning-safety.svg',
    color: 'violet',
    icon: '⚡',
    badge: 'NDMA Lightning Advisory',
    tips: [
      'Apply 30-30 Rule: If thunder sound arrives <30s after flash, seek shelter',
      'Never stand under isolated tall trees, power towers, or open fields',
      'Unplug sensitive electronics and avoid metal plumbing fixtures indoors',
    ],
  },
  drought: {
    key: 'drought',
    title: 'Drought & Agricultural Water Resilience',
    image: '/images/drought-preparedness.svg',
    color: 'yellow',
    icon: '🌾',
    badge: 'Krishi Vigyan Advisory',
    tips: [
      'Store minimum 3 days of potable water in clean covered food-grade drums',
      'Implement drip and sprinkler micro-irrigation to conserve soil moisture',
      'Report acute village water tank depletion to local revenue administration',
    ],
  },
  wildfire: {
    key: 'wildfire',
    title: 'Wildfire & Forest Brush Resilience',
    image: '/images/wildfire-safety.svg',
    color: 'red',
    icon: '🔥',
    badge: 'Forest Fire Guidelines',
    tips: [
      'Maintain 30-foot combustible-free defensible space around structures',
      'Equip household with N95 smoke respirators and safety goggles',
      'Extinguish all farm residue and backyard cooking embers completely',
    ],
  },
  normal: {
    key: 'normal',
    title: 'Baseline Readiness & Fair Weather Monitoring',
    image: '/images/normal-weather.svg',
    color: 'emerald',
    icon: '🌤️',
    badge: 'Routine Preparedness',
    tips: [
      'Conduct monthly inspections of family first-aid supplies and medicines',
      'Save ERSS 112 and district disaster helpline numbers in speed dial',
      'Verify nearest certified cyclone or emergency shelter location on map',
    ],
  },
};

export default function VisualHazardGuide({ activeScenario }) {
  const { t } = useLanguage();
  const [selectedHazard, setSelectedHazard] = useState(activeScenario || 'flood');

  // Automatically update selected hazard when active scenario changes in simulator
  useEffect(() => {
    if (activeScenario && HAZARD_GUIDES[activeScenario]) {
      setSelectedHazard(activeScenario);
    }
  }, [activeScenario]);

  const guide = HAZARD_GUIDES[selectedHazard] || HAZARD_GUIDES.flood;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖼️</span>
          <div>
            <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">
              {t('educational_examples')} & Action Guides
            </h3>
            <p className="text-xs text-gray-500">
              Verified NDMA & IMD visual preparedness protocols for all 7 climate scenarios
            </p>
          </div>
        </div>

        {/* Hazard Selector Pills */}
        <div className="flex flex-wrap gap-1">
          {Object.values(HAZARD_GUIDES).map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedHazard(item.key)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 border
                ${selectedHazard === item.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
              <span>{item.icon}</span>
              <span className="capitalize">{item.key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Active Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
        <div className="md:col-span-5 overflow-hidden rounded-xl bg-white shadow-xs border">
          <img
            src={guide.image}
            alt={guide.title}
            className="w-full h-48 sm:h-56 object-contain p-2 hover:scale-102 transition duration-300"
          />
        </div>

        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{guide.icon}</span>
            <div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {guide.badge}
              </span>
              <h4 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                {guide.title}
              </h4>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
              Critical Action Directives:
            </p>
            <ul className="space-y-1.5">
              {guide.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                  <span className="text-emerald-600 font-black text-sm shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 text-[11px] text-gray-500 flex items-center gap-1.5 border-t border-gray-200/70">
            <span>🏛️</span>
            <span>Guideline Reference: National Disaster Management Authority (NDMA) Standard Operating Procedure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

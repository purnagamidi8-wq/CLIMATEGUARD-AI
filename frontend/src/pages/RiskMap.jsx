import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { riskAPI, safePlacesAPI, locationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RISK_COLORS = {
  LOW: '#10b981',
  MODERATE: '#eab308',
  HIGH: '#ea580c',
  SEVERE: '#dc2626',
};

const TILE_PROVIDERS = {
  osm: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  positron: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  topo: {
    name: 'Topography',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
  },
};

// Custom Marker Icons
const createPlaceIcon = (type) => {
  let emoji = '🛡️';
  let bg = '#0d9488'; // teal

  switch (type) {
    case 'hospital':
      emoji = '🏥';
      bg = '#e11d48'; // rose/red
      break;
    case 'fire_station':
      emoji = '🚒';
      bg = '#ea580c'; // orange
      break;
    case 'police_station':
      emoji = '🚓';
      bg = '#2563eb'; // blue
      break;
    case 'cyclone_shelter':
      emoji = '🌀';
      bg = '#0891b2'; // cyan
      break;
    case 'emergency_shelter':
    default:
      emoji = '🛡️';
      bg = '#059669'; // emerald
      break;
  }

  return L.divIcon({
    className: 'custom-safe-place-icon',
    html: `<div style="
      background-color: ${bg};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      border: 2px solid white;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="position: relative; width: 28px; height: 28px;">
    <div style="position: absolute; inset: 0; background: rgba(37,99,235,0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: absolute; inset: 4px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 10px; color: white;">📍</div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Map helper to center on demand
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

export default function RiskMap() {
  const { location, locationName, detectLocation, setManualLocation } = useLocation();
  const { t } = useLanguage();
  const [risks, setRisks] = useState(null);
  const [safePlaces, setSafePlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [tileLayerKey, setTileLayerKey] = useState('osm');
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (!location) detectLocation();
  }, [location, detectLocation]);

  useEffect(() => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
      fetchMapData();
    }
  }, [location, filterType]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [rRes, spRes] = await Promise.all([
        riskAPI.assess(location.latitude, location.longitude, true),
        safePlacesAPI.getNearby(location.latitude, location.longitude, null, filterType === 'all' ? null : filterType, 25.0),
      ]);
      setRisks(rRes.data);
      setSafePlaces(spRes.data || []);
    } catch (err) {
      console.error('Map data error:', err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    try {
      const res = await locationAPI.search(searchQuery);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const selectSearchResult = (result) => {
    setManualLocation(result.latitude, result.longitude, result.name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  const overallColor = risks ? RISK_COLORS[risks.overall_risk_level] || '#10b981' : '#10b981';

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span>🗺️</span> {t('risk_map')} & Safe Havens
          </h1>
          <p className="text-xs text-gray-500">
            Interactive GIS evacuation perimeter, emergency shelters, and hospital logistics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print/Export Action */}
          <button
            onClick={handlePrintBriefing}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-gray-300 shadow-xs"
            title="Print or export emergency shelter briefing"
          >
            <span>🖨️</span> Print Briefing
          </button>

          {/* Search location bar */}
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('search_location')}
                aria-label="Search city or district"
                className="border rounded-xl px-3.5 py-1.5 text-xs w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectSearchResult(r)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b last:border-0 font-medium"
                  >
                    {r.display_name || r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Controls: Resource Filter Tabs & Tile Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border shadow-xs">
        {/* Resource Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mr-1">Shelters:</span>
          {[
            { id: 'all', label: 'All Resources', icon: '📍' },
            { id: 'cyclone_shelter', label: 'Cyclone Shelters', icon: '🌀' },
            { id: 'emergency_shelter', label: 'Relief Shelters', icon: '🛡️' },
            { id: 'hospital', label: 'Hospitals', icon: '🏥' },
            { id: 'fire_station', label: 'Fire Stations', icon: '🚒' },
            { id: 'police_station', label: 'Police', icon: '🚓' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border
                ${filterType === type.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Tile Style Switcher + Recenter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mr-1">Layer:</span>
          {Object.entries(TILE_PROVIDERS).map(([key, prov]) => (
            <button
              key={key}
              onClick={() => setTileLayerKey(key)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition border
                ${tileLayerKey === key
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {prov.name}
            </button>
          ))}

          {location && (
            <button
              onClick={() => setMapCenter([location.latitude, location.longitude])}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-0.5 rounded-md border border-blue-200 text-xs ml-1 transition"
              title="Fly back to active location"
            >
              🎯 Recenter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Rendering GIS geospatial layers and safe place coordinates..." />
      ) : (
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Map Box */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-md border overflow-hidden relative" style={{ height: '620px' }}>
            {location && (
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                {mapCenter && <MapRecenter coords={mapCenter} />}

                <TileLayer
                  url={TILE_PROVIDERS[tileLayerKey].url}
                  attribution={TILE_PROVIDERS[tileLayerKey].attribution}
                />

                {/* User Active Perimeter (6km radius circle) */}
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={6000}
                  pathOptions={{ color: overallColor, fillColor: overallColor, fillOpacity: 0.16 }}
                />

                {/* User Location Marker with custom pulse icon */}
                <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <b className="text-sm text-blue-900">{locationName}</b><br />
                      <span>Active Risk: <b style={{ color: overallColor }}>{risks?.overall_risk_level || 'N/A'} ({Math.round(risks?.overall_risk_score || 0)}/100)</b></span><br />
                      <span className="font-mono text-[10px] text-gray-500">
                        GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </Popup>
                </Marker>

                {/* Safe Places Markers with category-specific badges */}
                {safePlaces.map((sp) => (
                  <Marker
                    key={sp.id}
                    position={[sp.latitude, sp.longitude]}
                    icon={createPlaceIcon(sp.place_type)}
                  >
                    <Popup>
                      <div className="p-1 text-xs space-y-1.5 min-w-[200px]">
                        <div className="font-black text-sm text-gray-900">{sp.name}</div>
                        <span className="inline-block bg-teal-100 text-teal-900 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          {sp.place_type.replace('_', ' ')}
                        </span>
                        <div className="text-gray-700">
                          <span>Distance: <b>{sp.distance_km} km</b></span><br />
                          <span>Walking: <b>{sp.estimated_time_walk_min} min</b> • Driving: <b>{sp.estimated_time_drive_min} min</b></span>
                        </div>
                        {sp.contact_phone && (
                          <div>
                            <a
                              href={`tel:${sp.contact_phone}`}
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              📞 {sp.contact_phone}
                            </a>
                          </div>
                        )}
                        <div className="pt-1 border-t">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${sp.latitude},${sp.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-center block text-[11px] shadow-xs"
                          >
                            Get GPS Directions →
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Right Resource & Safe Havens Sidebar */}
          <div className="space-y-4">
            {/* Active Perimeter Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-500">Location Status</h3>
              <p className="text-base font-extrabold text-gray-900 line-clamp-1">{locationName}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                  risks?.overall_risk_level === 'SEVERE'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : risks?.overall_risk_level === 'HIGH'
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : risks?.overall_risk_level === 'MODERATE'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {risks?.overall_risk_level} ({Math.round(risks?.overall_risk_score || 0)}/100)
                </span>
                <span className="text-[11px] text-gray-400 font-mono">6km Safe Zone</span>
              </div>
            </div>

            {/* List of Nearest Havens */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <span>🛡️</span> Discovered Facilities ({safePlaces.length})
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">Ranked by distance</span>
              </div>

              <div className="space-y-2 max-h-[440px] overflow-y-auto divide-y divide-gray-100 pr-1">
                {safePlaces.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No matching facilities within 25 km filter.
                  </div>
                ) : (
                  safePlaces.map((sp) => (
                    <div key={sp.id} className="pt-2 text-xs space-y-1 hover:bg-slate-50 p-1.5 rounded-xl transition">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-gray-900 line-clamp-1">{sp.name}</span>
                        <span className="font-black text-teal-700 shrink-0">{sp.distance_km} km</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="capitalize">{sp.place_type.replace('_', ' ')}</span>
                        <span>🚶 {sp.estimated_time_walk_min}m • 🚗 {sp.estimated_time_drive_min}m</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        {sp.contact_phone ? (
                          <a href={`tel:${sp.contact_phone}`} className="text-emerald-700 font-bold hover:underline text-[11px]">
                            📞 Call
                          </a>
                        ) : <span />}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${sp.latitude},${sp.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-extrabold hover:underline text-[11px]"
                        >
                          Navigate →
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { helplinesAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HelplinesModal({ isOpen, onClose }) {
  const [helplines, setHelplines] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      helplinesAPI.getAll(filterType === 'all' ? null : filterType, null, search)
        .then((res) => setHelplines(res.data || []))
        .catch(() => setHelplines([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, filterType, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🏛️</span> {t('helplines')}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">Verified Official Emergency Numbers — Ministry of Home Affairs & NDMA</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-2 items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search helpline (e.g. NDRF, 112, Police, Ambulance)..."
            className="flex-1 min-w-[200px] border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All Categories</option>
            <option value="emergency">General Emergency (112)</option>
            <option value="disaster">Disaster (NDRF/SDMA)</option>
            <option value="medical">Medical (108)</option>
            <option value="fire">Fire Rescue (101)</option>
            <option value="police">Police (100)</option>
            <option value="weather">Farmer Advisory (1551)</option>
            <option value="women">Women Safety (1091)</option>
            <option value="child">Childline (1098)</option>
          </select>
        </div>

        {/* Helplines List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading verified helplines...</div>
          ) : helplines.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No helplines matching criteria.</div>
          ) : (
            helplines.map((h) => (
              <div key={h.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-blue-50/50 px-2 rounded-lg transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm">{h.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold uppercase">{h.scope}</span>
                    {h.is_toll_free && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">Toll Free</span>}
                  </div>
                  <p className="text-xs text-gray-600">{h.description}</p>
                  <p className="text-[10px] text-gray-400">Source: {h.source_url} • Verified: {h.verified_at}</p>
                </div>
                <a
                  href={`tel:${h.number}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>📞</span> {h.number}
                </a>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 border-t text-center text-xs text-gray-500">
          In any life-threatening emergency, always dial <b>112</b> nationwide.
        </div>
      </div>
    </div>
  );
}

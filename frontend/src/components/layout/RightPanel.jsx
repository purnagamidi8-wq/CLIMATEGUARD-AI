import { useState, useRef, useEffect } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { chatAPI } from '../../services/api';

export default function RightPanel({ activeAlerts, onOpenSOS, onOpenHelplines, onOpenShareLocation, onOpenContacts }) {
  const { location, locationName } = useLocation();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am ClimateGuard AI. Ask me about active hazards, preparedness steps, or nearest protection shelters.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await chatAPI.send({
        message: userMsg,
        location: location ? { latitude: location.latitude, longitude: location.longitude, name: locationName } : null,
        language,
        profile_type: 'general',
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process your request right now.' }]);
    }
    setLoading(false);
  };

  return (
    <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-4 shrink-0">
      {/* 1. Emergency 1-Tap Action Card */}
      <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>🚨</span> EMERGENCY DISPATCH
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">24x7 Verified</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:112"
            className="bg-white hover:bg-gray-100 text-red-700 font-extrabold py-2 px-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1 shadow-sm"
          >
            <span>📞</span> {t('call_112')}
          </a>
          <button
            onClick={onOpenSOS}
            className="bg-red-950 hover:bg-black text-white font-extrabold py-2 px-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1 shadow-sm"
          >
            <span>🚨</span> TRIGGER SOS
          </button>
        </div>

        <button
          onClick={onOpenShareLocation}
          className="w-full bg-white/15 hover:bg-white/25 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
        >
          <span>📍</span> {t('share_location')}
        </button>
      </div>

      {/* 2. Active Alert Notice Banner */}
      {activeAlerts && activeAlerts.length > 0 ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
              <span>⚠️</span> {t('active_alerts_count')} ({activeAlerts.length})
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">LIVE</span>
          </div>
          <p className="text-xs font-semibold text-amber-950">{activeAlerts[0].title}</p>
          <p className="text-[11px] text-amber-800 line-clamp-2">{activeAlerts[0].message}</p>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <span>✅</span>
          <span className="font-medium">{t('no_active_alerts')}</span>
        </div>
      )}

      {/* 3. AI Safety Assistant Embedded Panel */}
      <div className="flex-1 flex flex-col min-h-[300px] bg-gray-50 border rounded-xl p-3 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
            <span>🤖</span> {t('chat')}
          </span>
          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded font-bold">RAG Safety Base</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 py-2 text-xs">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2.5 rounded-xl max-w-[88%] whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800 shadow-xs'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="bg-white border rounded-xl p-2 text-xs text-gray-500 italic">
              AI Analyzing climate risk factors...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="pt-2 flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ask_ai')}
            className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
          >
            {t('send')}
          </button>
        </form>
      </div>

      {/* 4. Quick Helplines Drawer Button */}
      <div className="space-y-1.5 pt-1">
        <button
          onClick={onOpenHelplines}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border"
        >
          <span>🏛️</span> {t('helplines')} (NDRF / SDMA)
        </button>
      </div>
    </aside>
  );
}

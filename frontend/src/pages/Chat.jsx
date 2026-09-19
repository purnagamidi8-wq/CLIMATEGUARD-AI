import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { chatAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Chat() {
  const { user } = useAuth();
  const { location, locationName, detectLocation } = useLocation();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am ClimateGuard AI, your location-aware climate risk and safety assistant. Ask me about active hazard risks, safe evacuation shelters, emergency preparedness steps, or helpline numbers.',
      sources: ['NDMA Guidelines', 'IMD Safety Protocols'],
      hazards: [],
      recommendations: [],
      safe_places: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!location) detectLocation();
  }, [location, detectLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QUICK_QUESTIONS = [
    'What are the active climate risks for my area?',
    'Where is the nearest cyclone / flood relief shelter?',
    'What emergency steps should I take right now?',
    'What should farmers do during extreme heat and drought?',
    'Show me the verified emergency helplines for flood rescue',
  ];

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.send({
        message: msg,
        location: location ? { latitude: location.latitude, longitude: location.longitude, name: locationName } : null,
        language,
        profile_type: user?.profile_type || 'general',
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.response,
          sources: res.data.sources,
          hazards: res.data.hazards_detected,
          recommendations: res.data.recommendations,
          safe_places: res.data.safe_places || []
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I apologize, but I encountered an issue processing your query. Please check your network or try again.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 85px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 bg-white p-4 rounded-2xl shadow-xs border">
        <div>
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <span>🤖</span> {t('chat')}
          </h1>
          <p className="text-xs text-gray-500">Location-Aware RAG Safety Guidance • NDMA / IMD Guidelines</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
            📍 {locationName}
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border p-4 mb-3 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>

              {/* Structured Safe Places Cards if returned by AI */}
              {m.safe_places && m.safe_places.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-2">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                    <span>🛡️</span> Nearby Recommended Safe Centers:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.safe_places.map((sp, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-2.5 text-xs shadow-2xs space-y-1">
                        <div className="font-bold text-gray-900 line-clamp-1">{sp.name}</div>
                        <div className="text-teal-700 font-bold">{sp.distance_km} km away</div>
                        {sp.contact_phone && (
                          <a href={`tel:${sp.contact_phone}`} className="text-emerald-600 font-bold hover:underline block">
                            📞 {sp.contact_phone}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources Citation */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-gray-200/60 text-[11px] opacity-75">
                  📚 <b>Verified Sources:</b> {m.sources.join(' • ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border rounded-2xl px-4 py-3 text-xs text-gray-500 italic">
              AI Analyzing active climate risk context & generating localized response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-100 transition border border-blue-200 font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ask_ai')}
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-sm disabled:opacity-50 transition shadow-sm"
        >
          {t('send')}
        </button>
      </form>
    </div>
  );
}

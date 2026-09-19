import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Landing() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const features = [
    { icon: '📍', title: 'Live Active Location', desc: 'Real-time GPS tracking with reverse geocoding to dynamically drive risk models and shelter discovery.' },
    { icon: '🛡️', title: 'Nearby Safe Places', desc: 'Discovers and ranks emergency shelters, relief camps, hospitals, and police desks within 15 km.' },
    { icon: '🤖', title: 'AI Safety Assistant', desc: 'Location-aware generative AI with RAG safety guidance from NDMA & IMD official guidelines.' },
    { icon: '🚨', title: '1-Tap SOS Dispatch', desc: 'Instant 112 emergency calling and broadcast location sharing with enrolled trusted contacts.' },
    { icon: '🏛️', title: 'Government Helplines', desc: 'Verified 24x7 official directory for NDRF, SDMA, DDMA, Ambulance (108), Fire (101), and Police (100).' },
    { icon: '🌐', title: '7-Language Multilingual', desc: 'Native support for English, Telugu, Hindi, Tamil, Kannada, Malayalam, and Marathi.' },
    { icon: '📶', title: 'Offline PWA Resilience', desc: 'Cached weather, risk assessments, contacts, and safety instructions accessible without internet.' },
    { icon: '🎛️', title: '7 Climate Scenarios', desc: 'Simulate and test Flood, Heatwave, Cyclone, Lightning, Drought, Wildfire, and Normal conditions.' },
  ];

  return (
    <div className="min-h-[90vh] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3.5 py-1 rounded-full text-xs font-bold border border-teal-400/30">
            <span>🛡️</span> <span>Official Safety Intelligence & Preparedness Agent</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Protecting Lives with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              AI-Driven Climate Safety
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
            {t('tagline')}. Location-aware hazard scoring, verified emergency shelters, instant 112 SOS dispatch, and offline resilience.
          </p>

          <div className="flex gap-3.5 justify-center flex-wrap pt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-teal-400 hover:bg-teal-300 text-blue-950 px-8 py-3.5 rounded-2xl font-black text-sm md:text-base transition shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span>📊</span> Go to Live Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-teal-400 hover:bg-teal-300 text-blue-950 px-8 py-3.5 rounded-2xl font-black text-sm md:text-base transition shadow-xl hover:scale-105"
                >
                  {t('register')} Free
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white/60 hover:border-white text-white px-8 py-3.5 rounded-2xl font-bold text-sm md:text-base hover:bg-white/10 transition"
                >
                  {t('login')}
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-blue-200/80">
            <span>✓ 100% Free & Open Source</span>
            <span>✓ No API Keys Required for Demo</span>
            <span>✓ PWA Offline Ready</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              End-to-End Climate Safety Architecture
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Detect danger early, discover immediate shelter, and alert loved ones within seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-5 border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition space-y-2"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-extrabold text-sm text-gray-900">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 px-4 text-center text-xs space-y-3">
        <p className="font-semibold text-gray-300 text-sm">ClimateGuard AI — Location-Aware Climate Risk & Emergency Resilience Platform</p>
        <p>Data Sources: Open-Meteo • OpenStreetMap Nominatim & Overpass • Ministry of Home Affairs (ERSS 112) • NDMA Guidelines</p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Disclaimer: This system is a student/hackathon demonstration prototype. In active disasters, always follow official emergency broadcast instructions from district disaster management authorities and local administration.
        </p>
      </footer>
    </div>
  );
}

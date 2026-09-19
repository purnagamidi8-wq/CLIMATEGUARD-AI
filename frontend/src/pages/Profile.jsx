import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../contexts/LanguageContext';
import { notificationAPI } from '../services/api';
import { alertSound } from '../utils/alerts';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    preferred_language: user?.preferred_language || 'en',
    profile_type: user?.profile_type || 'general'
  });

  const [notifPrefs, setNotifPrefs] = useState({
    browser_notifications: true,
    sound_alerts: true,
    vibration_alerts: true,
    min_severity: 'HIGH',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '06:00'
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      notificationAPI.getPreferences()
        .then((res) => { if (res.data) setNotifPrefs(res.data); })
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      setLanguage(form.preferred_language);
      await notificationAPI.updatePreferences(notifPrefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <span>👤</span> {t('profile')} & Preferences
        </h1>
        <p className="text-xs text-gray-500">Personalize your hazard profile, notification channels, and language</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>✅</span> Profile and notification preferences updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-1 border-b">
            Account Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full border rounded-xl px-3.5 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Vulnerability / Profile Type</label>
              <select
                value={form.profile_type}
                onChange={(e) => setForm({ ...form, profile_type: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
              >
                <option value="general">General Public</option>
                <option value="farmer">Farmer (Agri Advisory)</option>
                <option value="student">Student / Campus</option>
                <option value="elderly">Senior Citizen (Priority Care)</option>
                <option value="business">Business / Commercial Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred UI Language (7 Languages)</label>
              <select
                value={form.preferred_language}
                onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
              >
                {AVAILABLE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-1 border-b">
            Disaster Alert & Notification Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifPrefs.browser_notifications}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, browser_notifications: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs font-medium text-gray-700">Enable in-browser push alerts</span>
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.sound_alerts}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, sound_alerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-xs font-medium text-gray-700">Audio chime on severe warning</span>
              </label>
              <button
                type="button"
                onClick={() => alertSound.playChime('severe')}
                className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition flex items-center gap-1"
                title="Test Audio Chime"
              >
                <span>🔊</span> Test Chime
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.vibration_alerts}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, vibration_alerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-xs font-medium text-gray-700">Device vibration on urgent SOS</span>
              </label>
              <button
                type="button"
                onClick={() => alertSound.vibrate()}
                className="text-[11px] bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1"
                title="Test Device Vibration"
              >
                <span>📳</span> Test Vibe
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Alert Severity Trigger</label>
            <select
              value={notifPrefs.min_severity}
              onChange={(e) => setNotifPrefs({ ...notifPrefs, min_severity: e.target.value })}
              className="w-full border rounded-xl px-3.5 py-2 text-sm"
            >
              <option value="MODERATE">Moderate Risk (Score ≥ 25)</option>
              <option value="HIGH">High Risk (Score ≥ 50)</option>
              <option value="SEVERE">Severe Risk Only (Score ≥ 75)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition"
        >
          {loading ? 'Saving Preferences...' : 'Save Profile & Notification Settings'}
        </button>
      </form>
    </div>
  );
}

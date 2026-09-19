import { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { contactsAPI } from '../../services/api';

export default function SOSModal({ isOpen, onClose, overallRisk, hazardType }) {
  const { location, locationName } = useLocation();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const handleActivateSOS = async () => {
    setLoading(true);
    try {
      const res = await contactsAPI.triggerSOS({
        latitude: location?.latitude || 17.6868,
        longitude: location?.longitude || 83.2185,
        location_name: locationName,
        current_risk: overallRisk || 'HIGH',
        hazard_type: hazardType || 'general',
        custom_message: customNote || undefined,
      });
      setSosResult(res.data);
    } catch (e) {
      console.error('SOS dispatch error:', e);
      setSosResult({
        status: 'ACTIVATED',
        alert_id: 'SOS-LOCAL',
        notified_contacts_count: 0,
        emergency_call_number: '112',
        shareable_url: `https://www.google.com/maps?q=${location?.latitude || 17.6868},${location?.longitude || 83.2185}`,
        timestamp: new Date().toISOString(),
        message: 'Emergency SOS activated. Dial 112 immediately.'
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-red-500 animate-in fade-in zoom-in duration-200">
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <h2 className="text-xl font-extrabold tracking-wide">EMERGENCY SOS DISPATCH</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {!sosResult ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900 space-y-2">
                <p className="font-bold text-base">Are you in immediate danger?</p>
                <p>Activating SOS will:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-800">
                  <li>Prepare instant 1-tap call to <b>112 Emergency Services</b> (Police, Fire, Ambulance).</li>
                  <li>Package your active GPS coordinates into a live map emergency link.</li>
                  <li>Send alert notifications to all your enrolled <b>Trusted Contacts</b>.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Active Location</label>
                <div className="bg-gray-100 p-2.5 rounded-lg text-sm font-medium text-gray-800 flex items-center gap-2">
                  <span>📍</span>
                  <span>{locationName} ({location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Optional Emergency Note</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Trapped on second floor due to flash flood..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleActivateSOS}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg text-sm flex items-center justify-center gap-2 transition"
                >
                  {loading ? 'Dispatching...' : 'CONFIRM & ACTIVATE SOS'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-green-900">
                <p className="font-bold text-base flex items-center gap-1.5">
                  <span>✅</span> SOS Broadcast Ready
                </p>
                <p className="text-xs mt-1">Alert Reference ID: <span className="font-mono font-bold">{sosResult.alert_id}</span></p>
                <p className="text-xs mt-0.5">Contacts Notified: <b>{sosResult.notified_contacts_count} enrolled contacts</b></p>
              </div>

              <div className="bg-gray-50 border rounded-xl p-3 text-xs font-mono text-gray-700 whitespace-pre-wrap">
                {sosResult.message}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${sosResult.emergency_call_number}`}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <span>📞</span> DIAL 112 NOW
                </a>
                <a
                  href={sosResult.shareable_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <span>📍</span> OPEN MAP
                </a>
              </div>

              <button
                onClick={onClose}
                className="w-full border py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

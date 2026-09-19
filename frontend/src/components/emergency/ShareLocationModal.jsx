import { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ShareLocationModal({ isOpen, onClose, overallRisk, hazardType }) {
  const { location, locationName } = useLocation();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const lat = location?.latitude || 17.6868;
  const lon = location?.longitude || 83.2185;
  const mapUrl = `https://www.google.com/maps?q=${lat.toFixed(5)},${lon.toFixed(5)}`;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const shareText = `🚨 ClimateGuard AI Alert - My Location Status:\n` +
    `📍 Area: ${locationName}\n` +
    `⚠️ Current Risk: ${overallRisk || 'MODERATE'} (${hazardType?.toUpperCase() || 'GENERAL'})\n` +
    `🕒 Time: ${timeStr}\n` +
    `🗺️ Live Map: ${mapUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📍</span> {t('share_location')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        <div className="bg-gray-50 border rounded-xl p-3.5 text-xs text-gray-800 font-mono whitespace-pre-wrap">
          {shareText}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCopy}
            className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5"
          >
            {copied ? '✅ Copied' : '📋 Copy Text'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleSMS}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5"
          >
            📱 SMS
          </button>
        </div>
      </div>
    </div>
  );
}

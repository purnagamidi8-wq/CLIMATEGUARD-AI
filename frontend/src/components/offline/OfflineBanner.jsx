import { useOffline } from '../../contexts/OfflineContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OfflineBanner() {
  const { isOnline, lastSyncTime } = useOffline();
  const { t } = useLanguage();

  if (isOnline) return null;

  const formattedTime = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today';

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-sm shadow-md flex items-center justify-between flex-wrap gap-2 sticky top-16 z-40">
      <div className="flex items-center gap-2">
        <span className="font-bold flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-200 animate-ping"></span>
          🟠 {t('offline')}
        </span>
        <span>— {t('offline_notice')}</span>
      </div>
      <div className="text-xs bg-amber-600 px-2 py-0.5 rounded font-medium">
        {t('last_sync')}: {formattedTime}
      </div>
    </div>
  );
}

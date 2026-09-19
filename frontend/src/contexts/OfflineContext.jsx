import { createContext, useContext, useState, useEffect } from 'react';
import { offlineStorage } from '../services/offlineStorage';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(offlineStorage.getLastSyncTime());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const time = new Date().toISOString();
      setLastSyncTime(time);
      offlineStorage.saveSyncMetadata({ event: 'network_online', time });
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, lastSyncTime }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);

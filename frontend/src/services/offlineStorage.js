// Robust client-side offline storage helper
const DB_NAME = 'ClimateGuardOfflineDB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cachedData')) {
        db.createObjectStore('cachedData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('trustedContacts')) {
        db.createObjectStore('trustedContacts', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('helplines')) {
        db.createObjectStore('helplines', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('safePlaces')) {
        db.createObjectStore('safePlaces', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  async set(storeName, key, value) {
    try {
      const db = await openDB();
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put({ key, value, timestamp: new Date().toISOString() });
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      localStorage.setItem(`cg_${storeName}_${key}`, JSON.stringify(value));
      return true;
    }
  },

  async get(storeName, key) {
    try {
      const db = await openDB();
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      return new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result?.value || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const val = localStorage.getItem(`cg_${storeName}_${key}`);
      return val ? JSON.parse(val) : null;
    }
  },

  async saveSyncMetadata(data) {
    localStorage.setItem('cg_last_sync_time', new Date().toISOString());
    localStorage.setItem('cg_last_sync_data', JSON.stringify(data));
  },

  getLastSyncTime() {
    return localStorage.getItem('cg_last_sync_time') || null;
  }
};

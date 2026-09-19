import axios from 'axios';
import { offlineStorage } from './offlineStorage';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Automatically cache critical emergency responses for offline resilience
    if (res.config.url?.includes('/weather/current')) {
      offlineStorage.set('cachedData', 'latest_weather', res.data);
    } else if (res.config.url?.includes('/risk/assess')) {
      offlineStorage.set('cachedData', 'latest_risk', res.data);
    } else if (res.config.url?.includes('/helplines')) {
      offlineStorage.set('cachedData', 'helplines', res.data);
    } else if (res.config.url?.includes('/safe-places')) {
      offlineStorage.set('cachedData', 'safe_places', res.data);
    } else if (res.config.url?.includes('/trusted-contacts') && (!res.config.method || res.config.method.toLowerCase() === 'get')) {
      offlineStorage.set('cachedData', 'trusted_contacts', res.data);
    }
    offlineStorage.saveSyncMetadata({ url: res.config.url, time: new Date().toISOString() });
    return res;
  },
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

export const weatherAPI = {
  getCurrent: async (lat, lon, demo = false, scenario = 'flood') => {
    try {
      return await api.get('/weather/current', { params: { lat, lon, demo, scenario } });
    } catch (e) {
      const cached = await offlineStorage.get('cachedData', 'latest_weather');
      if (cached) return { data: cached, isOfflineCached: true };
      throw e;
    }
  },
  getForecast: (lat, lon, demo = false) =>
    api.get('/weather/forecast', { params: { lat, lon, demo } }),
};

export const riskAPI = {
  assess: async (lat, lon, demo = false, scenario = 'flood') => {
    try {
      return await api.get('/risk/assess', { params: { lat, lon, demo, scenario } });
    } catch (e) {
      const cached = await offlineStorage.get('cachedData', 'latest_risk');
      if (cached) return { data: cached, isOfflineCached: true };
      throw e;
    }
  },
  methodology: () => api.get('/risk/methodology'),
};

export const chatAPI = {
  send: (data) => api.post('/chat/', data),
  history: (sessionId) => api.get('/chat/history', { params: { session_id: sessionId } }),
};

export const locationAPI = {
  search: (q) => api.get('/locations/search', { params: { q } }),
  reverse: (lat, lon) => api.get('/locations/reverse', { params: { lat, lon } }),
  getSaved: () => api.get('/locations/'),
  save: (data) => api.post('/locations/', data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export const alertAPI = {
  getAll: (includeDismissed = false) => api.get('/alerts/', { params: { include_dismissed: includeDismissed } }),
  getHistory: (hazardType, severity) => api.get('/alerts/history', { params: { hazard_type: hazardType, severity } }),
  check: (lat, lon, demo = false, scenario = 'flood') =>
    api.get('/alerts/check', { params: { lat, lon, demo, scenario } }),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  dismiss: (id) => api.put(`/alerts/${id}/dismiss`),
};

export const checklistAPI = {
  getAll: () => api.get('/checklists/'),
  toggle: (data) => api.put('/checklists/toggle', data),
};

export const contactsAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/trusted-contacts/');
      if (res.data && Array.isArray(res.data)) {
        await offlineStorage.set('cachedData', 'trusted_contacts', res.data);
      }
      return res;
    } catch (e) {
      const cached = await offlineStorage.get('cachedData', 'trusted_contacts');
      if (cached) return { data: cached, isOfflineCached: true };
      throw e;
    }
  },
  add: async (data) => {
    const payload = {
      ...data,
      name: data.name?.trim(),
      relationship: data.relationship?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim() ? data.email.trim() : null,
      priority: Number(data.priority) || 1,
      notify_on_alert: data.notify_on_alert !== undefined ? data.notify_on_alert : true,
    };
    try {
      const res = await api.post('/trusted-contacts/', payload);
      // Synchronize with offline storage
      const cached = (await offlineStorage.get('cachedData', 'trusted_contacts')) || [];
      const updated = [res.data, ...cached.filter((c) => c.id !== res.data.id)];
      await offlineStorage.set('cachedData', 'trusted_contacts', updated);
      return res;
    } catch (e) {
      // Offline fallback: if network is offline or unreachable, store locally
      if (!window.navigator.onLine || e.code === 'ERR_NETWORK') {
        const cached = (await offlineStorage.get('cachedData', 'trusted_contacts')) || [];
        const localContact = {
          id: Date.now(),
          ...payload,
          created_at: new Date().toISOString(),
          isOfflineDraft: true,
        };
        const updated = [localContact, ...cached];
        await offlineStorage.set('cachedData', 'trusted_contacts', updated);
        return { data: localContact, isOfflineDraft: true };
      }
      throw e;
    }
  },
  update: async (id, data) => {
    const payload = {
      ...data,
      name: data.name !== undefined ? data.name?.trim() : undefined,
      relationship: data.relationship !== undefined ? data.relationship?.trim() : undefined,
      phone: data.phone !== undefined ? data.phone?.trim() : undefined,
      email: data.email !== undefined ? (data.email?.trim() ? data.email.trim() : null) : undefined,
    };
    const res = await api.put(`/trusted-contacts/${id}`, payload);
    const cached = (await offlineStorage.get('cachedData', 'trusted_contacts')) || [];
    const updated = cached.map((c) => (c.id === id ? res.data : c));
    await offlineStorage.set('cachedData', 'trusted_contacts', updated);
    return res;
  },
  delete: async (id) => {
    try {
      const res = await api.delete(`/trusted-contacts/${id}`);
      const cached = (await offlineStorage.get('cachedData', 'trusted_contacts')) || [];
      await offlineStorage.set('cachedData', 'trusted_contacts', cached.filter((c) => c.id !== id));
      return res;
    } catch (e) {
      const cached = (await offlineStorage.get('cachedData', 'trusted_contacts')) || [];
      await offlineStorage.set('cachedData', 'trusted_contacts', cached.filter((c) => c.id !== id));
      return { data: { message: 'Contact removed locally' } };
    }
  },
  triggerSOS: (data) => api.post('/trusted-contacts/sos', data),
};

export const helplinesAPI = {
  getAll: async (serviceType, state, q) => {
    try {
      return await api.get('/helplines/', { params: { service_type: serviceType, state, q } });
    } catch (e) {
      const cached = await offlineStorage.get('cachedData', 'helplines');
      if (cached) return { data: cached, isOfflineCached: true };
      throw e;
    }
  },
  getQuick: () => api.get('/helplines/emergency-quick'),
};

export const safePlacesAPI = {
  getNearby: async (lat, lon, hazardType, placeType, radius = 15.0) => {
    try {
      return await api.get('/safe-places/nearby', {
        params: { lat, lon, hazard_type: hazardType, place_type: placeType, radius },
      });
    } catch (e) {
      const cached = await offlineStorage.get('cachedData', 'safe_places');
      if (cached) return { data: cached, isOfflineCached: true };
      throw e;
    }
  },
};

export const notificationAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
};

export const emergencyAPI = {
  find: (lat, lon, radius = 5000) =>
    api.get('/emergency-resources/', { params: { lat, lon, radius } }),
};

export const recommendationAPI = {
  get: (lat, lon, profile = 'general', language = 'en', demo = false) =>
    api.get('/recommendations/', { params: { lat, lon, profile_type: profile, language, demo } }),
};

export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  users: () => api.get('/admin/users'),
  health: () => api.get('/admin/health'),
};

export default api;

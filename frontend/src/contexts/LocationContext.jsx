import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { locationAPI } from '../services/api';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('cg_location');
    return saved ? JSON.parse(saved) : { latitude: 17.6868, longitude: 83.2185 };
  });
  const [locationName, setLocationName] = useState(() => localStorage.getItem('cg_location_name') || 'Visakhapatnam');
  const [permissionState, setPermissionState] = useState('prompt'); // 'granted', 'denied', 'prompt', 'unavailable'
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

  const resolveLocationName = async (lat, lon) => {
    try {
      const res = await locationAPI.reverse(lat, lon);
      const name = res.data.name || res.data.city || 'Current Location';
      setLocationName(name);
      localStorage.setItem('cg_location_name', name);
    } catch {
      setLocationName('Active Location');
    }
  };

  const updateLocationCoords = (lat, lon, customName = null) => {
    const loc = { latitude: lat, longitude: lon };
    setLocation(loc);
    localStorage.setItem('cg_location', JSON.stringify(loc));
    setLastUpdatedTime(new Date());
    if (customName) {
      setLocationName(customName);
      localStorage.setItem('cg_location_name', customName);
    } else {
      resolveLocationName(lat, lon);
    }
  };

  const detectLocation = useCallback(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setPermissionState('unavailable');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionState('granted');
        updateLocationCoords(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
        } else {
          setPermissionState('unavailable');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const toggleLiveTracking = useCallback(() => {
    if (isLiveTracking) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setIsLiveTracking(false);
    } else {
      if (navigator.geolocation) {
        setIsLiveTracking(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setPermissionState('granted');
            // Only update if moved > 500m
            const dLat = Math.abs(pos.coords.latitude - (location?.latitude || 0));
            const dLon = Math.abs(pos.coords.longitude - (location?.longitude || 0));
            if (dLat > 0.005 || dLon > 0.005) {
              updateLocationCoords(pos.coords.latitude, pos.coords.longitude);
            }
          },
          () => setIsLiveTracking(false),
          { enableHighAccuracy: true, maximumAge: 60000 }
        );
      }
    }
  }, [isLiveTracking, location]);

  const setManualLocation = (lat, lon, name) => {
    updateLocationCoords(lat, lon, name);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <LocationContext.Provider value={{
      location,
      locationName,
      permissionState,
      isLiveTracking,
      lastUpdatedTime,
      loading,
      detectLocation,
      toggleLiveTracking,
      setManualLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);

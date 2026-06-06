import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Define your live backend URL from Render
const BACKEND_URL = 'https://kumbhflow-backend.onrender.com';

// Configure Axios globally to point to your live backend domain
axios.defaults.baseURL = BACKEND_URL;

const AppContext = createContext();

export function AppProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({
    totalPilgrims: 0,
    criticalZones: 0,
    activeAlerts: 0,
    safetyIndex: 100,
  });

  useEffect(() => {
    // Updated: Point the WebSocket client to the live Render URL
    const newSocket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('crowd_update', (data) => {
      if (data.sectors) {
        setSectors((prev) => {
          const updated = [...prev];
          data.sectors.forEach((update) => {
            const idx = updated.findIndex((s) => s.sectorId === update.sectorId);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], ...update };
            }
          });
          return updated;
        });
      }
      if (data.summary) {
        setLiveMetrics(data.summary);
      }
      setLastUpdate(new Date());
    });

    newSocket.on('emergency_alert', (data) => {
      setAlerts((prev) => [
        { alertId: `EMG-${Date.now()}`, ...data, isActive: true, createdAt: new Date() },
        ...prev,
      ]);
    });

    newSocket.on('sector_status_change', (data) => {
      setSectors((prev) =>
        prev.map((s) => (s.sectorId === data.sectorId ? { ...s, status: data.status, isClosed: true } : s))
      );
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const fetchSectors = useCallback(async () => {
    try {
      const res = await axios.get('/api/sectors');
      setSectors(res.data.data);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get('/api/alerts?active=true');
      setAlerts(res.data.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get('/api/analytics/overview');
      setAnalytics(res.data.data);
      setLiveMetrics({
        totalPilgrims: res.data.data.totalPilgrims,
        criticalZones: res.data.data.statusBreakdown.CRITICAL + res.data.data.statusBreakdown.RED,
        activeAlerts: res.data.data.activeAlerts,
        safetyIndex: res.data.data.safetyIndex,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, []);

  useEffect(() => {
    fetchSectors();
    fetchAlerts();
    fetchAnalytics();

    const interval = setInterval(() => {
      fetchAlerts();
      fetchAnalytics();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchSectors, fetchAlerts, fetchAnalytics]);

  const closeSector = async (sectorId) => {
    try {
      await axios.put(`/api/sectors/${sectorId}/close`);
      socket?.emit('sector_closure', { sectorId });
      await fetchSectors();
      return true;
    } catch (err) {
      console.error('Error closing sector:', err);
      return false;
    }
  };

  const openSector = async (sectorId) => {
    try {
      await axios.put(`/api/sectors/${sectorId}/open`);
      await fetchSectors();
      return true;
    } catch (err) {
      console.error('Error opening sector:', err);
      return false;
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.put(`/api/alerts/${alertId}/resolve`, { resolvedBy: 'Control Room' });
      setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
      return true;
    } catch (err) {
      console.error('Error resolving alert:', err);
      return false;
    }
  };

  const broadcastEmergency = (message, sectors) => {
    socket?.emit('emergency_reroute', { message, sectors });
  };

  const deployResources = async (sectorId, resources) => {
    try {
      await axios.put(`/api/sectors/${sectorId}/resources`, resources);
      await fetchSectors();
      return true;
    } catch (err) {
      console.error('Error deploying resources:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        socket,
        sectors,
        alerts,
        analytics,
        isConnected,
        lastUpdate,
        liveMetrics,
        fetchSectors,
        fetchAlerts,
        fetchAnalytics,
        closeSector,
        openSector,
        resolveAlert,
        broadcastEmergency,
        deployResources,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
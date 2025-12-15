import axios from 'axios';
import { saveToOfflineStorage, getPendingAttendances, markAsSynced, removeSyncedItems } from './offlineStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get server time
export const getServerTime = async (): Promise<string> => {
  try {
    const response = await api.get('/api/time');
    return response.data.serverTime;
  } catch (error) {
    // Fallback to client time if server unavailable
    return new Date().toISOString();
  }
};

// Submit attendance action
export const submitAttendance = async (
  employeeId: string,
  employeeName: string,
  action: 'checkin' | 'breakin' | 'breakout' | 'checkout'
): Promise<any> => {
  const serverTime = await getServerTime();
  
  const payload = {
    employeeId,
    employeeName,
    action,
    timestamp: serverTime,
  };

  if (!isOnline()) {
    // Save to offline storage
    saveToOfflineStorage({
      employeeId,
      employeeName,
      action,
      timestamp: new Date().toISOString(),
      serverTime: serverTime,
    });
    throw new Error('OFFLINE');
  }

  try {
    const response = await api.post('/api/attendance/submit', payload);
    return response.data;
  } catch (error: any) {
    // If request fails, save to offline storage
    if (!error.response || error.response.status >= 500) {
      saveToOfflineStorage({
        employeeId,
        employeeName,
        action,
        timestamp: new Date().toISOString(),
        serverTime: serverTime,
      });
    }
    throw error;
  }
};

// Sync pending attendance records
export const syncPendingAttendances = async (): Promise<number> => {
  if (!isOnline()) {
    return 0;
  }

  const pending = getPendingAttendances().filter(item => !item.synced);
  let syncedCount = 0;

  for (const item of pending) {
    try {
      const payload = {
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        action: item.action,
        timestamp: item.serverTime || item.timestamp,
      };
      
      await api.post('/api/attendance/submit', payload);
      markAsSynced(item.id);
      syncedCount++;
    } catch (error) {
      console.error('Error syncing attendance:', error);
    }
  }

  removeSyncedItems();
  return syncedCount;
};

// Get employee list
export const getEmployees = async (): Promise<any[]> => {
  try {
      const response = await api.get('/api/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

// Get today's attendance status
export const getTodayStatus = async (employeeId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/attendance/today/${employeeId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};


import axios from 'axios';
import { saveToOfflineStorage, getPendingAttendances, markAsSynced, removeSyncedItems } from './offlineStorage';

// Use relative path for Vercel deployment (works for both dev and production)
// Only use absolute URL if explicitly set in environment (for external API)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Ensure we never use localhost in production
const baseURL = typeof window !== 'undefined' && window.location.hostname === 'localhost' && API_URL.startsWith('http')
  ? API_URL
  : API_URL.startsWith('http') ? API_URL : '/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get server time
export const getServerTime = async (): Promise<string> => {
  try {
    const response = await api.get('/time');
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
    const response = await api.post('/attendance/submit', payload);
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
  if (pending.length === 0) {
    return 0;
  }

  let syncedCount = 0;
  const failedIds: string[] = [];
  const errors: string[] = [];

  for (const item of pending) {
    try {
      const payload = {
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        action: item.action,
        timestamp: item.serverTime || item.timestamp,
      };
      
      const response = await api.post('/attendance/submit', payload);
      
      // Only mark as synced if server returns success
      if (response.status === 201 || response.status === 200) {
        markAsSynced(item.id);
        syncedCount++;
      } else {
        failedIds.push(item.id);
        errors.push(`Failed to sync ${item.action} for ${item.employeeName}`);
      }
    } catch (error: any) {
      console.error('Error syncing attendance:', error);
      failedIds.push(item.id);
      
      // Don't mark as failed if it's a validation error (like "already checked in")
      // These are permanent failures and should be removed
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      
      if (status === 400 && (errorMsg.includes('already') || errorMsg.includes('Please'))) {
        // Validation error - mark as synced (permanently failed, no point retrying)
        markAsSynced(item.id);
        syncedCount++; // Count as "processed"
      } else {
        errors.push(`Failed to sync ${item.action} for ${item.employeeName}: ${errorMsg}`);
      }
    }
  }

  // Remove successfully synced items
  removeSyncedItems();
  
  // Log errors if any
  if (errors.length > 0) {
    console.warn('Sync errors:', errors);
  }

  return syncedCount;
};

// Get employee list
export const getEmployees = async (): Promise<any[]> => {
  try {
      const response = await api.get('/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

// Get today's attendance status
export const getTodayStatus = async (employeeId: string): Promise<any> => {
  try {
    const response = await api.get(`/attendance/today/${employeeId}`);
    return response.data;
  } catch (error) {
    return {
      checkInTime: null,
      checkOutTime: null,
      breakInTime: null,
      breakOutTime: null,
      status: null,
      officeStartTime: '09:00',
      officeEndTime: '17:00',
      flexibleStart: false,
    };
  }
};


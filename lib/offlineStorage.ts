// Offline storage utility for attendance data
const STORAGE_KEY = 'attendance_pending';

export interface PendingAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  action: 'checkin' | 'breakin' | 'breakout' | 'checkout';
  timestamp: string;
  serverTime?: string;
  synced: boolean;
}

export const saveToOfflineStorage = (data: Omit<PendingAttendance, 'id' | 'synced'>): void => {
  try {
    const pending = getPendingAttendances();
    const newEntry: PendingAttendance = {
      ...data,
      id: Date.now().toString(),
      synced: false,
    };
    pending.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error saving to offline storage:', error);
  }
};

export const getPendingAttendances = (): PendingAttendance[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading offline storage:', error);
    return [];
  }
};

export const markAsSynced = (id: string): void => {
  try {
    const pending = getPendingAttendances();
    const updated = pending.map(item => 
      item.id === id ? { ...item, synced: true } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking as synced:', error);
  }
};

export const removeSyncedItems = (): void => {
  try {
    const pending = getPendingAttendances();
    const unsynced = pending.filter(item => !item.synced);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unsynced));
  } catch (error) {
    console.error('Error removing synced items:', error);
  }
};

export const clearOfflineStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline storage:', error);
  }
};


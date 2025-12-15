'use client';

import { useState, useEffect } from 'react';
import { submitAttendance, getServerTime, isOnline, syncPendingAttendances, getEmployees, getTodayStatus } from '@/lib/api';
import { getPendingAttendances } from '@/lib/offlineStorage';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [breakInTime, setBreakInTime] = useState<string | null>(null);
  const [canBreakOut, setCanBreakOut] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);

  useEffect(() => {
    // Load employees
    loadEmployees();
    
    // Update time every second
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Check online status
    const handleOnline = () => {
      setOnline(true);
      syncPendingAttendances().then(count => {
        if (count > 0) {
          setMessage({ type: 'success', text: `${count} record(s) synced successfully!` });
          setTimeout(() => setMessage(null), 3000);
        }
      });
    };
    
    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);

    // Sync on mount
    if (navigator.onLine) {
      syncPendingAttendances();
    }

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadTodayStatus();
    }
  }, [employeeId]);

  const loadEmployees = async () => {
    const empList = await getEmployees();
    setEmployees(empList);
    if (empList.length > 0 && !employeeId) {
      setEmployeeId(empList[0].id);
      setEmployeeName(empList[0].name);
    }
  };

  const loadTodayStatus = async () => {
    if (!employeeId) return;
    const status = await getTodayStatus(employeeId);
    setTodayStatus(status);
    
    if (status) {
      setCheckInTime(status.checkInTime || null);
      setBreakInTime(status.breakInTime || null);
      setCanBreakOut(status.breakInTime && !status.breakOutTime);
      setCanCheckOut(status.checkInTime && !status.checkOutTime && (!status.breakInTime || status.breakOutTime));
    } else {
      setCheckInTime(null);
      setBreakInTime(null);
      setCanBreakOut(false);
      setCanCheckOut(false);
    }
  };

  const updateTime = async () => {
    try {
      const serverTime = await getServerTime();
      const date = new Date(serverTime);
      setCurrentTime(format(date, 'HH:mm:ss'));
      setCurrentDate(format(date, 'dd MMM yyyy'));
    } catch (error) {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm:ss'));
      setCurrentDate(format(now, 'dd MMM yyyy'));
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = employees.find(emp => emp.id === selectedId);
    if (selected) {
      setEmployeeId(selected.id);
      setEmployeeName(selected.name);
    }
  };

  const handleAction = async (action: 'checkin' | 'breakin' | 'breakout' | 'checkout') => {
    if (!employeeId || !employeeName) {
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await submitAttendance(employeeId, employeeName, action);
      
      if (isOnline()) {
        setMessage({ type: 'success', text: `${action.toUpperCase()} recorded successfully!` });
        await loadTodayStatus();
      } else {
        const pending = getPendingAttendances();
        setMessage({ 
          type: 'success', 
          text: `Saved offline (${pending.length} pending). Will sync when online.` 
        });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      if (error.message === 'OFFLINE') {
        const pending = getPendingAttendances();
        setMessage({ 
          type: 'success', 
          text: `Saved offline (${pending.length} pending). Will sync when online.` 
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: 'Failed to record attendance. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!checkInTime) return null;
    
    // Status is calculated server-side based on employee-specific timings
    // Display will be updated when we fetch today's status from API
    return <span className="status-badge status-on-time">✓ Checked In</span>;
  };

  return (
    <div className="container">
      {!online && (
        <div className="offline-indicator">📴 Offline Mode</div>
      )}
      {online && getPendingAttendances().length > 0 && (
        <div className="sync-indicator">🔄 Syncing...</div>
      )}

      <h1>📋 Attendance System</h1>

      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
          {message.text}
        </div>
      )}

      <div className="info-section">
        <div className="info-row">
          <span className="info-label">Employee:</span>
          <select 
            value={employeeId} 
            onChange={handleEmployeeChange}
            disabled={loading}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        
        <div className="info-row">
          <span className="info-label">Date:</span>
          <span className="info-value">{currentDate}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Time:</span>
          <span className="info-value">{currentTime}</span>
        </div>

        {getEmployeeTiming() && (
          <div className="info-row">
            <span className="info-label">Office Hours:</span>
            <span className="info-value">{getEmployeeTiming()}</span>
          </div>
        )}

        {checkInTime && (
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value">{getStatusBadge()}</span>
          </div>
        )}

        {checkInTime && (
          <div className="info-row">
            <span className="info-label">Check-In:</span>
            <span className="info-value">{format(new Date(checkInTime), 'HH:mm:ss')}</span>
          </div>
        )}

        {breakInTime && (
          <div className="info-row">
            <span className="info-label">Break-In:</span>
            <span className="info-value">{format(new Date(breakInTime), 'HH:mm:ss')}</span>
          </div>
        )}
      </div>

      <div className="button-group">
        <button
          className="action-btn btn-checkin"
          onClick={() => handleAction('checkin')}
          disabled={loading || !!checkInTime}
        >
          🟢 Check-In
        </button>

        <button
          className="action-btn btn-breakin"
          onClick={() => handleAction('breakin')}
          disabled={loading || !checkInTime || !!breakInTime || !!canBreakOut}
        >
          🟡 Break-In
        </button>

        <button
          className="action-btn btn-breakout"
          onClick={() => handleAction('breakout')}
          disabled={loading || !canBreakOut}
        >
          🟠 Break-Out
        </button>

        <button
          className="action-btn btn-checkout"
          onClick={() => handleAction('checkout')}
          disabled={loading || !canCheckOut}
        >
          🔵 Check-Out
        </button>
      </div>
    </div>
  );
}


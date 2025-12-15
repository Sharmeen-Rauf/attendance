'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitAttendance, getServerTime, isOnline, syncPendingAttendances, getTodayStatus } from '@/lib/api';
import { getPendingAttendances } from '@/lib/offlineStorage';
import { format } from 'date-fns';
import axios from 'axios';

export default function AttendancePage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
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
  const [officeStartTime, setOfficeStartTime] = useState('09:00');
  const [officeEndTime, setOfficeEndTime] = useState('17:00');
  const [flexibleStart, setFlexibleStart] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
    
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

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      
      if (response.data.employee) {
        const emp = response.data.employee;
        setEmployeeId(emp.id);
        setEmployeeName(emp.name);
        setOfficeStartTime(emp.officeStartTime);
        setOfficeEndTime(emp.officeEndTime);
        setFlexibleStart(emp.flexibleStart);
      }
    } catch (error) {
      // Not logged in, redirect to login
      router.push('/login');
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

  const getEmployeeTiming = () => {
    if (!employeeId) return null;
    
    if (flexibleStart) {
      return `Flexible (Complete 8 hours)`;
    }
    return `${officeStartTime} - ${officeEndTime}`;
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      router.push('/login');
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <div className="container">
      {!online && (
        <div className="offline-indicator">📴 Offline Mode</div>
      )}
      {online && getPendingAttendances().length > 0 && (
        <div className="sync-indicator">🔄 Syncing...</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>📋 Attendance System</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: '#666'
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
          {message.text}
        </div>
      )}

      <div className="info-section">
        <div className="info-row">
          <span className="info-label">Employee:</span>
          <span className="info-value" style={{ fontWeight: '600', fontSize: '16px' }}>{employeeName}</span>
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


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitAttendance, getServerTime, isOnline, syncPendingAttendances, getTodayStatus } from '@/lib/api';
import { getPendingAttendances } from '@/lib/offlineStorage';
import { format } from 'date-fns';
import axios from 'axios';
import NotificationBell from '@/app/components/NotificationBell';

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
  const [breakOutTime, setBreakOutTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
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
          // Reload status after sync
          if (employeeId) {
            loadTodayStatus();
          }
        }
      }).catch(error => {
        console.error('Sync error:', error);
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
      syncPendingAttendances().then(count => {
        if (count > 0 && employeeId) {
          loadTodayStatus();
        }
      }).catch(error => {
        console.error('Initial sync error:', error);
      });
    }
    
    // Also refresh status periodically to catch any updates
    const statusInterval = setInterval(() => {
      if (employeeId) {
        loadTodayStatus();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(statusInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      loadTodayStatus();
      // Also check for pending syncs
      const pending = getPendingAttendances().filter(item => !item.synced && item.employeeId === employeeId);
      if (pending.length > 0 && online) {
        syncPendingAttendances().then(count => {
          if (count > 0) {
            loadTodayStatus();
          }
        });
      }
    }
  }, [employeeId, online]);

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
    try {
      const status = await getTodayStatus(employeeId);
      setTodayStatus(status);
      
      if (status && (status.checkInTime || status.breakInTime || status.checkOutTime)) {
        // Only update if we have actual data from server
        if (status.checkInTime) setCheckInTime(status.checkInTime);
        if (status.breakInTime !== undefined) setBreakInTime(status.breakInTime || null);
        if (status.breakOutTime !== undefined) setBreakOutTime(status.breakOutTime || null);
        if (status.checkOutTime !== undefined) setCheckOutTime(status.checkOutTime || null);
        
        // Break-Out is enabled when: break started but not ended
        setCanBreakOut(!!status.breakInTime && !status.breakOutTime);
        
        // Check-Out is enabled when: checked in AND not checked out AND (no break OR break completed)
        setCanCheckOut(
          !!status.checkInTime && 
          !status.checkOutTime && 
          (!status.breakInTime || !!status.breakOutTime)
        );
      }
      // Don't reset state if no status - prevents clearing state immediately after action submission
      // State will remain from the immediate update in handleAction
    } catch (error) {
      console.error('Error loading today status:', error);
      // On error, don't clear state - might be temporary network issue
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
      // Don't show error if still loading auth
      if (!loading) {
        setMessage({ type: 'error', text: 'Please wait, loading employee information...' });
        setTimeout(() => setMessage(null), 2000);
      }
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await submitAttendance(employeeId, employeeName, action);
      
      // Update state immediately for better UX
      const now = new Date().toISOString();
      if (action === 'checkin') {
        setCheckInTime(now);
        setCanBreakOut(false); // Break-out is not enabled yet
        setCanCheckOut(false); // Can't check out yet
      } else if (action === 'breakin') {
        setBreakInTime(now);
        setCanBreakOut(true); // Now can break out
        setCanCheckOut(false); // Can't check out while on break
      } else if (action === 'breakout') {
        setBreakOutTime(now);
        setCanBreakOut(false); // Break is completed
        setCanCheckOut(true); // Now can check out
      } else if (action === 'checkout') {
        setCheckOutTime(now);
        setCanBreakOut(false);
        setCanCheckOut(false);
      }
      
      if (isOnline()) {
        // Check if result has a message (e.g., "already checked in")
        if (result?.message) {
          // If already checked in, use the server data
          if (result.checkInTime) {
            setCheckInTime(result.checkInTime);
            setBreakInTime(result.breakInTime || null);
            setBreakOutTime(result.breakOutTime || null);
            setCheckOutTime(result.checkOutTime || null);
            setCanBreakOut(!!result.breakInTime && !result.breakOutTime);
            setCanCheckOut(!!result.checkInTime && !result.checkOutTime && (!result.breakInTime || !!result.breakOutTime));
          }
          // Silently update status instead of showing error
          await loadTodayStatus();
        } else {
          // Success - use server response data if available
          if (result.checkInTime !== undefined) setCheckInTime(result.checkInTime || null);
          if (result.breakInTime !== undefined) setBreakInTime(result.breakInTime || null);
          if (result.breakOutTime !== undefined) setBreakOutTime(result.breakOutTime || null);
          if (result.checkOutTime !== undefined) setCheckOutTime(result.checkOutTime || null);
          
          // Update button states based on server response
          setCanBreakOut(!!result.breakInTime && !result.breakOutTime);
          setCanCheckOut(!!result.checkInTime && !result.checkOutTime && (!result.breakInTime || !!result.breakOutTime));
          
          setMessage({ type: 'success', text: `${action.toUpperCase()} recorded successfully!` });
          // Reload status after successful submission to ensure sync
          setTimeout(async () => {
            await loadTodayStatus();
          }, 1000);
        }
      } else {
        const pending = getPendingAttendances();
        setMessage({ 
          type: 'success', 
          text: `Saved offline (${pending.length} pending). Will sync when online.` 
        });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Attendance submission error:', error);
      if (error.message === 'OFFLINE') {
        // Update state even when offline
        const now = new Date().toISOString();
        if (action === 'checkin') {
          setCheckInTime(now);
          setCanBreakOut(false);
          setCanCheckOut(false);
        } else if (action === 'breakin') {
          setBreakInTime(now);
          setCanBreakOut(true);
          setCanCheckOut(false);
        } else if (action === 'breakout') {
          setBreakOutTime(now);
          setCanBreakOut(false);
          setCanCheckOut(true);
        } else if (action === 'checkout') {
          setCheckOutTime(now);
          setCanBreakOut(false);
          setCanCheckOut(false);
        }
        
        const pending = getPendingAttendances();
        setMessage({ 
          type: 'success', 
          text: `Saved offline (${pending.length} pending). Will sync when online.` 
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
        setMessage({ 
          type: 'error', 
          text: `Failed to record attendance: ${errorMsg}. Please try again.` 
        });
        setTimeout(() => setMessage(null), 5000);
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
      {(() => {
        try {
          const pending = getPendingAttendances().filter(item => !item.synced);
          if (pending.length > 0) {
            return (
              <div 
                className="sync-indicator" 
                onClick={async () => {
                  if (loading) return;
                  setLoading(true);
                  try {
                    const count = await syncPendingAttendances();
                    if (count > 0) {
                      setMessage({ type: 'success', text: `${count} record(s) synced!` });
                      setTimeout(() => setMessage(null), 3000);
                    } else {
                      const stillPending = getPendingAttendances().filter(item => !item.synced);
                      if (stillPending.length > 0) {
                        setMessage({ type: 'error', text: `Failed to sync ${stillPending.length} record(s). Check console for details.` });
                        setTimeout(() => setMessage(null), 5000);
                      }
                    }
                    await loadTodayStatus();
                  } catch (error: any) {
                    console.error('Sync error:', error);
                    setMessage({ type: 'error', text: `Sync failed: ${error.message || 'Unknown error'}` });
                    setTimeout(() => setMessage(null), 5000);
                  } finally {
                    setLoading(false);
                  }
                }} 
                style={{ cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                🔄 {pending.length} pending - Click to sync
              </div>
            );
          }
        } catch (error) {
          console.error('Error rendering sync indicator:', error);
        }
        return null;
      })()}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Attendance System</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <NotificationBell employeeId={employeeId} />
          <Link href="/aira" className="btn" style={{ background: 'var(--secondary-color)', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
            Aira Assistant
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'var(--text-primary)',
              border: '1px solid var(--border-dark)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff'
            }}
          >
            Logout
          </button>
        </div>
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

        {breakOutTime && (
          <div className="info-row">
            <span className="info-label">Break-Out:</span>
            <span className="info-value">{format(new Date(breakOutTime), 'HH:mm:ss')}</span>
          </div>
        )}
      </div>

      <div className="button-group">
        <button
          className="action-btn btn-checkin"
          onClick={() => handleAction('checkin')}
          disabled={loading || !!checkInTime}
        >
          Check-In
        </button>

        <button
          className="action-btn btn-breakin"
          onClick={() => handleAction('breakin')}
          disabled={loading || !checkInTime || !!breakInTime || !!checkOutTime}
        >
          Break-In
        </button>

        <button
          className="action-btn btn-breakout"
          onClick={() => handleAction('breakout')}
          disabled={loading || !breakInTime || !!breakOutTime}
        >
          Break-Out
        </button>

        <button
          className="action-btn btn-checkout"
          onClick={() => handleAction('checkout')}
          disabled={loading || !canCheckOut}
        >
          Check-Out
        </button>
      </div>
    </div>
  );
}


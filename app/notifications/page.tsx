'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';

export default function NotificationsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchStatus();
    // Refresh every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/status/live');
      setStatus(response.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="container">
          <h1>📢 Live Notifications</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="container">
          <h1>📢 Live Notifications</h1>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>📢 Live Notifications</h1>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{status.checkedIn}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Checked In</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{status.onBreak}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>On Break</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{status.checkedOut}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Checked Out</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{status.notCheckedIn}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Not Checked In</div>
          </div>
        </div>

        {/* Checked In Employees */}
        {status.employees.checkedIn.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>✅ Checked In ({status.employees.checkedIn.length})</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {status.employees.checkedIn.map((emp: any) => (
                <div key={emp.employeeId} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid #28a745'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{emp.employeeName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Check-in: {emp.checkInTime ? format(new Date(emp.checkInTime), 'HH:mm:ss') : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* On Break Employees */}
        {status.employees.onBreak.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>☕ On Break ({status.employees.onBreak.length})</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {status.employees.onBreak.map((emp: any) => {
                const breakStart = emp.breakInTime ? new Date(emp.breakInTime) : null;
                const breakDuration = breakStart ? Math.floor((new Date().getTime() - breakStart.getTime()) / 60000) : 0;
                
                return (
                  <div key={emp.employeeId} style={{
                    background: '#fff3cd',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '2px solid #ffc107'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{emp.employeeName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Break started: {breakStart ? format(breakStart, 'HH:mm:ss') : '-'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#856404', fontWeight: '600', marginTop: '5px' }}>
                      Duration: {breakDuration} minutes
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Not Checked In */}
        {status.employees.notCheckedIn.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>⏰ Not Checked In ({status.employees.notCheckedIn.length})</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {status.employees.notCheckedIn.map((emp: any) => (
                <div key={emp.employeeId} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid #dee2e6'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{emp.employeeName}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Expected: {emp.officeStartTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checked Out */}
        {status.employees.checkedOut.length > 0 && (
          <div>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>🏁 Checked Out ({status.employees.checkedOut.length})</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {status.employees.checkedOut.map((emp: any) => (
                <div key={emp.employeeId} style={{
                  background: '#e7f3ff',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid #007bff'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>{emp.employeeName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Check-out: {emp.checkOutTime ? format(new Date(emp.checkOutTime), 'HH:mm:ss') : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


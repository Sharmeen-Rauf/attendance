'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import AiraChat from '@/app/components/AiraChat';

type TabType = 'attendance' | 'employees' | 'payroll' | 'leaves';

export default function HRAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAira, setShowAira] = useState(false);

  useEffect(() => {
    loadEmployees();
    if (activeTab === 'attendance') loadAttendance();
    if (activeTab === 'payroll') loadPayroll();
    if (activeTab === 'leaves') loadLeaves();
  }, [activeTab, filterDate]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/attendance?date=${filterDate}`);
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const res = await axios.get(`/api/payroll?month=${currentMonth}`);
      setPayroll(res.data.payroll || []);
    } catch (error) {
      console.error('Error loading payroll:', error);
      setPayroll([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/leaves?status=pending');
      setLeaves(res.data.leaves || []);
    } catch (error) {
      console.error('Error loading leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await axios.patch(`/api/leaves/${leaveId}`, { status });
      loadLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
      alert('Failed to update leave status');
    }
  };

  const exportAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting attendance:', error);
      alert('Failed to export attendance');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {showAira && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          height: '600px',
          zIndex: 1000,
          boxShadow: 'var(--shadow-xl)',
        }}>
          <AiraChat onClose={() => setShowAira(false)} />
        </div>
      )}
      <div className="container" style={{ paddingTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>HR Management System</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Complete Human Resources Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAira(!showAira)}
              className="btn"
              style={{
                background: showAira ? 'var(--secondary-color)' : 'var(--primary-color)',
                color: 'white',
              }}
            >
              {showAira ? 'Close Aira' : 'Open Aira Assistant'}
            </button>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('attendance')}
              className="btn"
              style={{
                background: activeTab === 'attendance' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'attendance' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: activeTab === 'attendance' ? '600' : '400',
              }}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className="btn"
              style={{
                background: activeTab === 'employees' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'employees' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: activeTab === 'employees' ? '600' : '400',
              }}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className="btn"
              style={{
                background: activeTab === 'payroll' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'payroll' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: activeTab === 'payroll' ? '600' : '400',
              }}
            >
              Payroll
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className="btn"
              style={{
                background: activeTab === 'leaves' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'leaves' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: activeTab === 'leaves' ? '600' : '400',
              }}
            >
              Leave Management
            </button>
          </div>

          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input"
                  style={{ width: '200px' }}
                />
                <button onClick={exportAttendance} className="btn btn-secondary">
                  Export Excel
                </button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : attendance.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No attendance records found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => {
                        const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
                        const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
                        const hours = checkIn && checkOut 
                          ? ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1)
                          : '-';
                        return (
                          <tr key={record.id}>
                            <td>{record.employeeName}</td>
                            <td>{format(new Date(record.date), 'dd MMM yyyy')}</td>
                            <td>{checkIn ? format(checkIn, 'HH:mm:ss') : '-'}</td>
                            <td>{checkOut ? format(checkOut, 'HH:mm:ss') : '-'}</td>
                            <td>
                              <span className={`status-badge status-${record.status}`}>
                                {record.status === 'on_time' ? 'On Time' : record.status === 'grace' ? 'Grace' : 'Late'}
                              </span>
                            </td>
                            <td>{hours}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Link href="/admin" className="btn btn-primary">
                  Add Employee
                </Link>
              </div>
              {employees.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No employees found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Office Hours</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.id}</td>
                          <td>{emp.name}</td>
                          <td>{emp.email || '-'}</td>
                          <td>{emp.officeStartTime} - {emp.officeEndTime}</td>
                          <td>{emp.flexibleStart ? 'Flexible' : 'Fixed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Payroll management coming soon. This will include salary processing, allowances, and deductions.
              </p>
              {payroll.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No payroll records found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Month</th>
                        <th>Base Salary</th>
                        <th>Allowances</th>
                        <th>Deductions</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.map((record: any) => (
                        <tr key={record._id}>
                          <td>{record.employee_name}</td>
                          <td>{record.month}</td>
                          <td>{record.base_salary?.toLocaleString()}</td>
                          <td>{record.allowances?.toLocaleString()}</td>
                          <td>{record.deductions?.toLocaleString()}</td>
                          <td>{record.total?.toLocaleString()}</td>
                          <td>{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaves' && (
            <div>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Pending leave requests requiring approval
              </p>
              {leaves.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No pending leave requests</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Source</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave: any) => {
                        const employeeName = leave.employeeName || leave.employee_name;
                        const leaveType = leave.type || leave.leave_type;
                        const startDate = leave.startDate || leave.start_date;
                        const endDate = leave.endDate || leave.end_date;
                        const reason = leave.reason || '';
                        const source = leave.source === 'email' ? '📧 Email' : 'System';
                        
                        return (
                          <tr key={leave._id || leave.id}>
                            <td>{employeeName}</td>
                            <td>{leaveType}</td>
                            <td>{format(new Date(startDate), 'dd MMM yyyy')}</td>
                            <td>{format(new Date(endDate || startDate), 'dd MMM yyyy')}</td>
                            <td>{leave.days || 1}</td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reason}>{reason}</td>
                            <td>{source}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleLeaveAction(leave.id || leave._id, 'approved')}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(leave.id || leave._id, 'rejected')}
                                  className="btn btn-ghost"
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


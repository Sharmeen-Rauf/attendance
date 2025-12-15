'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  breakInTime: string | null;
  breakOutTime: string | null;
  status: 'on_time' | 'grace' | 'late';
  breakDuration: number | null;
}

export default function AdminDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ id: '', name: '', email: '' });
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
  const [addEmployeeMessage, setAddEmployeeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, [filterDate, filterEmployee, filterStatus]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddEmployeeLoading(true);
    setAddEmployeeMessage(null);

    try {
      const response = await fetch('/api/employees/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newEmployee.id.trim().toUpperCase(),
          name: newEmployee.name.trim(),
          email: newEmployee.email.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAddEmployeeMessage({ type: 'success', text: 'Employee added successfully!' });
        setNewEmployee({ id: '', name: '', email: '' });
        setShowAddEmployee(false);
        await loadEmployees();
        setTimeout(() => setAddEmployeeMessage(null), 3000);
      } else {
        setAddEmployeeMessage({ type: 'error', text: data.error || 'Failed to add employee' });
      }
    } catch (error) {
      setAddEmployeeMessage({ type: 'error', text: 'Failed to add employee. Please try again.' });
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  const handleSeedEmployees = async () => {
    setAddEmployeeLoading(true);
    setAddEmployeeMessage(null);

    try {
      const response = await fetch('/api/employees/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setAddEmployeeMessage({ type: 'success', text: data.message || 'Employees seeded successfully!' });
        await loadEmployees();
        setTimeout(() => setAddEmployeeMessage(null), 3000);
      } else {
        setAddEmployeeMessage({ type: 'error', text: data.error || 'Failed to seed employees' });
      }
    } catch (error) {
      setAddEmployeeMessage({ type: 'error', text: 'Failed to seed employees. Please try again.' });
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterEmployee) params.append('employee_id', filterEmployee);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(
        `/api/attendance?${params}`
      );
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterEmployee) params.append('employee_id', filterEmployee);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(
        `/api/attendance/export?${params}`,
        { method: 'GET' }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${filterDate || 'all'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time':
        return '#28a745';
      case 'grace':
        return '#ffc107';
      case 'late':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_time':
        return '🟢 On Time';
      case 'grace':
        return '🟡 Grace';
      case 'late':
        return '🔴 Late';
      default:
        return '⚪ N/A';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>👨‍💼 Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowAddEmployee(!showAddEmployee)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showAddEmployee ? '✖️ Cancel' : '➕ Add Employee'}
            </button>
            <button
              onClick={handleSeedEmployees}
              disabled={addEmployeeLoading}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: addEmployeeLoading ? 'not-allowed' : 'pointer',
                opacity: addEmployeeLoading ? 0.6 : 1
              }}
            >
              {addEmployeeLoading ? 'Loading...' : '🌱 Seed Default Employees'}
            </button>
          </div>
        </div>

        {addEmployeeMessage && (
          <div style={{
            padding: '12px',
            background: addEmployeeMessage.type === 'error' ? '#fee' : '#efe',
            color: addEmployeeMessage.type === 'error' ? '#c33' : '#3c3',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {addEmployeeMessage.text}
          </div>
        )}

        {showAddEmployee && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '2px solid #e0e0e0'
          }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>➕ Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Employee ID *</label>
                  <input
                    type="text"
                    value={newEmployee.id}
                    onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value.toUpperCase() })}
                    placeholder="e.g., EMP001"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Employee Name *</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="e.g., John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="e.g., john@company.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={addEmployeeLoading}
                style={{
                  padding: '10px 30px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: addEmployeeLoading ? 'not-allowed' : 'pointer',
                  opacity: addEmployeeLoading ? 0.6 : 1
                }}
              >
                {addEmployeeLoading ? 'Adding...' : '➕ Add Employee'}
              </button>
            </form>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Employee:</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="on_time">On Time</option>
              <option value="grace">Grace</option>
              <option value="late">Late</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={exportExcel}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📥 Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Employee</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Check-In</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Check-Out</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Break</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{record.employeeName}</td>
                    <td style={{ padding: '12px' }}>{format(parseISO(record.date), 'dd MMM yyyy')}</td>
                    <td style={{ padding: '12px' }}>
                      {record.checkInTime ? format(parseISO(record.checkInTime), 'HH:mm:ss') : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.checkOutTime ? format(parseISO(record.checkOutTime), 'HH:mm:ss') : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.breakDuration !== null 
                        ? `${Math.floor(record.breakDuration / 60)}m ${record.breakDuration % 60}s`
                        : '-'
                      }
                      {record.breakDuration !== null && record.breakDuration > 30 * 60 && (
                        <span style={{ color: '#dc3545', marginLeft: '5px' }}>⚠️</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        color: getStatusColor(record.status),
                        fontWeight: '600'
                      }}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {records.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No attendance records found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


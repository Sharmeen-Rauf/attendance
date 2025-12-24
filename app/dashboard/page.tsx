'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onBreak: 0,
    onLeave: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [employeesRes, statusRes] = await Promise.all([
        axios.get('/api/employees', { withCredentials: true }),
        axios.get('/api/status/live', { withCredentials: true }),
      ]);

      const employees = employeesRes.data.employees || [];
      const statusData = statusRes.data || {};

      setStats({
        totalEmployees: employees.length,
        presentToday: statusData.checkedIn?.length || 0,
        onBreak: statusData.onBreak?.length || 0,
        onLeave: statusData.onLeave?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ paddingTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>HR Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Overview of your organization</p>
          </div>
          <Link href="/admin" className="btn btn-primary">
            Admin Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 grid-cols-2 grid-cols-4" style={{ marginBottom: '32px' }}>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Total Employees</p>
            <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{stats.totalEmployees}</h2>
          </div>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Present Today</p>
            <h2 style={{ margin: 0, color: 'var(--success-color)' }}>{stats.presentToday}</h2>
          </div>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>On Break</p>
            <h2 style={{ margin: 0, color: 'var(--warning-color)' }}>{stats.onBreak}</h2>
          </div>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>On Leave</p>
            <h2 style={{ margin: 0, color: 'var(--text-secondary)' }}>{stats.onLeave}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1" style={{ maxWidth: '800px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/attendance" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Mark Attendance
              </Link>
              <Link href="/admin" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                Manage Employees
              </Link>
              <Link href="/admin" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


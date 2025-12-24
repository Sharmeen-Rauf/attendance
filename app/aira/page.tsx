'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AiraChat from '@/app/components/AiraChat';
import Link from 'next/link';

export default function AiraPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      
      if (response.data.employee) {
        const emp = response.data.employee;
        setEmployeeId(emp.id);
        setEmployeeName(emp.name);
      }
    } catch (error) {
      // Not logged in, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>Aira AI Assistant</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Your intelligent HR assistant for all your questions</p>
          </div>
          <Link href="/" className="btn btn-ghost">
            Back to Home
          </Link>
        </div>

        <div className="card" style={{ height: '600px', padding: 0 }}>
          <AiraChat employeeId={employeeId} employeeName={employeeName} />
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>What can Aira help you with?</h3>
          <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <h4 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>Attendance</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Get help with check-in, check-out, break times, and attendance records
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '8px', color: 'var(--secondary-color)' }}>Leave Management</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Apply for leave, check leave balance, and understand leave policies
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>Payroll</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Get information about salary, payslips, deductions, and payroll policies
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '8px', color: 'var(--secondary-color)' }}>HR Policies</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Learn about company policies, employee benefits, and HR guidelines
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


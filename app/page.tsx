import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      padding: '40px 20px'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>HR Management System</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Complete Human Resources Management Platform</p>
        </div>

        <div className="grid grid-cols-1" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ marginBottom: '8px' }}>Employee Portal</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Access your attendance dashboard and manage your work records
            </p>
            <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Employee Login
            </Link>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '8px' }}>HR Management</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Complete HR system with attendance, payroll, leave management, and employee administration
            </p>
            <Link href="/admin/hr" className="btn btn-secondary" style={{ display: 'inline-block' }}>
              HR Dashboard
            </Link>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '8px' }}>Aira AI Assistant</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Get instant help with HR queries, attendance, leaves, and more using our AI assistant
            </p>
            <Link href="/aira" className="btn btn-secondary" style={{ display: 'inline-block' }}>
              Chat with Aira
            </Link>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '8px' }}>Live Status</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              View real-time employee status and notifications
            </p>
            <Link href="/notifications" className="btn btn-outline" style={{ display: 'inline-block' }}>
              View Live Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

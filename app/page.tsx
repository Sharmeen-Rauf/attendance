import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>🏢 Attendance System</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link 
            href="/attendance"
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            📱 Employee Attendance
          </Link>
          <Link 
            href="/admin"
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            👨‍💼 Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


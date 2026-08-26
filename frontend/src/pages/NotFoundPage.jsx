import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto 0', textAlign: 'center' }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-risk-critical-bg)',
              color: 'var(--color-risk-critical)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              404 - Surveillance Route Not Found
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              The requested surveillance page or route does not exist in DairyGuard. Please return to the District Dashboard.
            </p>
          </div>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={Home}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;

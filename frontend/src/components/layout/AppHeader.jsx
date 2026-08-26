import React from 'react';
import { Shield, Bell, Menu, X, MapPin } from 'lucide-react';
import Badge from '../common/Badge';

export const AppHeader = ({ onToggleSidebar, isSidebarOpen }) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface-card)',
        borderBottom: '1px solid var(--color-border)',
        height: 'var(--header-main-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      {/* Brand & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)'
          }}
          className="mobile-menu-btn"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand Shield Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--color-primary-blue)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-blue)', letterSpacing: '-0.02em' }}>
                DairyGuard
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-blue-light)',
                  color: 'var(--color-primary-blue)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  border: '1px solid var(--color-blue-border)'
                }}
              >
                SURVEILLANCE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '-2px' }}>
              Dairy Procurement Integrity & Risk-Based Food Safety Surveillance
            </p>
          </div>
        </div>
      </div>

      {/* Jurisdiction & Officer Profile Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Jurisdiction Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--color-text-primary)'
          }}
          className="jurisdiction-pill"
        >
          <MapPin size={14} style={{ color: 'var(--color-primary-blue)' }} />
          <span style={{ fontWeight: 500 }}>State Jurisdiction:</span>
          <span style={{ fontWeight: 600 }}>Maharashtra (34 Districts)</span>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          aria-label="Surveillance alerts"
          style={{
            position: 'relative',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Active Procurement Anomalies Flagged"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--color-risk-critical)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            8
          </span>
        </button>

        {/* Officer Profile Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FAFBFD'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-blue-light)',
              color: 'var(--color-primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: '1px solid var(--color-blue-border)'
            }}
          >
            SS
          </div>
          <div style={{ textAlign: 'left' }} className="officer-details">
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Dr. S. Sharma
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
              Senior Food Safety & Dairy Officer
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .jurisdiction-pill {
            display: none !important;
          }
          .officer-details {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default AppHeader;

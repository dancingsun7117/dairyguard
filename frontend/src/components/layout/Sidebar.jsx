import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  FileText,
  ClipboardCheck
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'OPERATIONAL SURVEILLANCE',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
      { name: 'Anomaly Detection', path: '/anomalies', icon: AlertTriangle, badge: '8 Flagged' },
      { name: 'Risk Map', path: '/risk-map', icon: MapPin, badge: null }
    ]
  },
  {
    title: 'NETWORK & ENTITIES',
    items: [
      { name: 'Collection Centres', path: '/collection-centres', icon: Building2, badge: null },
      { name: 'Farmers', path: '/farmers', icon: Users, badge: null },
      { name: 'Supply Forecast', path: '/supply-forecast', icon: TrendingUp, badge: null }
    ]
  },
  {
    title: 'GOVERNANCE & AUDIT',
    items: [
      { name: 'Reports', path: '/reports', icon: FileText, badge: null },
      { name: 'Audit Logs', path: '/audit-logs', icon: ClipboardCheck, badge: null }
    ]
  }
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 42, 68, 0.4)',
            zIndex: 90,
            display: 'none'
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-surface-card)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          minHeight: 'calc(100vh - var(--header-top-height) - var(--header-main-height))',
          zIndex: 95
        }}
      >
        <div style={{ padding: '16px 0' }}>
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  padding: '0 20px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                {section.title}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth <= 900) onClose();
                      }}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 20px',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--color-primary-blue)' : 'var(--color-text-primary)',
                        backgroundColor: isActive ? 'var(--color-blue-light)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--color-primary-blue)' : '3px solid transparent',
                        textDecoration: 'none',
                        transition: 'background-color var(--transition-fast)'
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-risk-critical-bg)',
                            color: 'var(--color-risk-critical)',
                            border: '1px solid var(--color-risk-critical-border)',
                            padding: '2px 6px',
                            borderRadius: '2px'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / System Telemetry Status */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border-light)',
            backgroundColor: '#FAFBFD'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-risk-low)'
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Surveillance Stream: Active
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
            Maharashtra State Grid (34 Districts)
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .app-sidebar {
            position: fixed !important;
            top: calc(var(--header-top-height) + var(--header-main-height));
            left: -260px;
            bottom: 0;
            transition: left 0.25s ease-in-out;
            box-shadow: var(--shadow-dropdown);
          }
          .app-sidebar.open {
            left: 0 !important;
          }
          .sidebar-backdrop {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;

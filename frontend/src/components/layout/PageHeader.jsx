import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions
}) => {
  return (
    <div
      style={{
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Breadcrumbs Navigation */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Link
            to="/dashboard"
            style={{
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <Home size={13} style={{ marginRight: '4px' }} />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none'
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title & Actions Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '850px'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

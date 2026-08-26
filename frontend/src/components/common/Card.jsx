import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  style = {},
  headerStyle = {},
  bodyStyle = {},
  noPadding = false
}) => {
  return (
    <div
      className={`gov-card ${className}`}
      style={{
        backgroundColor: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-subtle)',
        overflow: 'hidden',
        ...style
      }}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            ...headerStyle
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? '0' : '20px', ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
};

export default Card;

import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          backgroundColor: 'var(--color-risk-critical-bg)',
          color: 'var(--color-risk-critical)',
          borderColor: 'var(--color-risk-critical-border)',
          dotColor: 'var(--color-risk-critical)'
        };
      case 'high':
        return {
          backgroundColor: 'var(--color-risk-high-bg)',
          color: 'var(--color-risk-high)',
          borderColor: 'var(--color-risk-high-border)',
          dotColor: 'var(--color-risk-high)'
        };
      case 'moderate':
        return {
          backgroundColor: 'var(--color-risk-moderate-bg)',
          color: 'var(--color-risk-moderate)',
          borderColor: 'var(--color-risk-moderate-border)',
          dotColor: 'var(--color-risk-moderate)'
        };
      case 'low':
      case 'safe':
        return {
          backgroundColor: 'var(--color-risk-low-bg)',
          color: 'var(--color-risk-low)',
          borderColor: 'var(--color-risk-low-border)',
          dotColor: 'var(--color-risk-low)'
        };
      case 'primary':
      case 'gov':
        return {
          backgroundColor: 'var(--color-blue-light)',
          color: 'var(--color-primary-blue)',
          borderColor: 'var(--color-blue-border)',
          dotColor: 'var(--color-primary-blue)'
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--color-neutral-bg)',
          color: 'var(--color-neutral-status)',
          borderColor: 'var(--color-neutral-border)',
          dotColor: 'var(--color-neutral-status)'
        };
    }
  };

  const styles = getVariantStyles();
  const isSmall = size === 'sm';

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        lineHeight: 1,
        padding: isSmall ? '3px 8px' : '4px 10px',
        borderRadius: 'var(--radius-xs)',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: styles.dotColor,
            flexShrink: 0
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;

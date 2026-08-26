import React from 'react';

export const MetricCard = ({
  label,
  value,
  indicator,
  indicatorType = 'neutral', // 'positive' | 'warning' | 'critical' | 'neutral'
  subtext,
  icon: Icon,
  style = {}
}) => {
  const getIndicatorColor = () => {
    switch (indicatorType) {
      case 'critical':
        return { color: 'var(--color-risk-critical)', bg: 'var(--color-risk-critical-bg)', border: 'var(--color-risk-critical-border)' };
      case 'warning':
      case 'high':
        return { color: 'var(--color-risk-high)', bg: 'var(--color-risk-high-bg)', border: 'var(--color-risk-high-border)' };
      case 'positive':
      case 'safe':
        return { color: 'var(--color-risk-low)', bg: 'var(--color-risk-low-bg)', border: 'var(--color-risk-low-border)' };
      case 'primary':
        return { color: 'var(--color-primary-blue)', bg: 'var(--color-blue-light)', border: 'var(--color-blue-border)' };
      case 'neutral':
      default:
        return { color: 'var(--color-text-secondary)', bg: 'var(--color-surface-subtle)', border: 'var(--color-border-light)' };
    }
  };

  const indStyle = getIndicatorColor();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '124px',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.01em' }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
        <span
          style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          {value}
        </span>
        {indicator && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '2px',
              backgroundColor: indStyle.bg,
              color: indStyle.color,
              border: `1px solid ${indStyle.border}`
            }}
          >
            {indicator}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default MetricCard;

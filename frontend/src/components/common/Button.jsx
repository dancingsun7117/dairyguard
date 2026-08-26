import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...rest
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-surface-subtle)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          hoverBg: '#E4E7EC'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-primary-blue)',
          border: '1px solid var(--color-primary-blue)',
          hoverBg: 'var(--color-blue-light)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid transparent',
          hoverBg: 'var(--color-surface-subtle)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-risk-critical)',
          color: '#FFFFFF',
          border: '1px solid var(--color-risk-critical)',
          hoverBg: '#911c13'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary-blue)',
          color: '#FFFFFF',
          border: '1px solid var(--color-primary-blue)',
          hoverBg: 'var(--color-blue-hover)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8125rem', gap: '6px', height: '32px' };
      case 'lg':
        return { padding: '10px 20px', fontSize: '0.95rem', gap: '10px', height: '44px' };
      case 'md':
      default:
        return { padding: '8px 16px', fontSize: '0.875rem', gap: '8px', height: '38px' };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`gov-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
        backgroundColor: vStyles.backgroundColor,
        color: vStyles.color,
        border: vStyles.border,
        padding: sStyles.padding,
        fontSize: sStyles.fontSize,
        gap: sStyles.gap,
        height: sStyles.height,
        boxShadow: 'var(--shadow-subtle)',
        outline: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && vStyles.hoverBg) {
          e.currentTarget.style.backgroundColor = vStyles.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = vStyles.backgroundColor;
        }
      }}
      {...rest}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};

export default Button;

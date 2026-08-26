import React from 'react';
import './DairyGuardLogo.css';

/**
 * DairyGuard Logo Component
 * - 'navbar' variant uses /dairyguard-landing-logo.png (FINAL_LOGO (1).png)
 * - All other variants use /dairyguard-logo.png (Original transparent logo)
 */
export const DairyGuardLogo = ({
  variant = 'default',
  className = '',
  style = {},
  alt = 'DairyGuard - Verify. Protect. Trust.'
}) => {
  const logoSrc = variant === 'navbar'
    ? '/dairyguard-landing-logo.png'
    : '/dairyguard-logo.png';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`dg-brand-logo is-${variant} ${className}`}
      style={style}
    />
  );
};

export default DairyGuardLogo;

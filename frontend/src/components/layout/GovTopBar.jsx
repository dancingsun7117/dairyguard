import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Globe, Contrast } from 'lucide-react';

export const GovTopBar = () => {
  const {
    textSize,
    decreaseTextSize,
    resetTextSize,
    increaseTextSize,
    language,
    setLanguage,
    highContrast,
    toggleContrast
  } = useAccessibility();

  return (
    <div>
      {/* Tricolor National Indicator Stripe */}
      <div className="gov-flag-stripe" />

      {/* Identity & Accessibility Strip */}
      <div
        style={{
          backgroundColor: 'var(--color-dark-blue)',
          color: '#E0E7F1',
          fontSize: '0.78rem',
          padding: '6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid #1f395b'
        }}
      >
        {/* National Identity Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.02em' }}>
            भारत सरकार | Government of India
          </span>
          <span style={{ color: '#547297' }}>•</span>
          <span style={{ color: '#C2D1E5' }}>
            Ministry of Fisheries, Animal Husbandry & Dairying
          </span>
          <span style={{ color: '#547297' }}>•</span>
          <span style={{ color: '#A5BEDB', fontSize: '0.75rem' }}>
            Maharashtra State Surveillance
          </span>
        </div>

        {/* Accessibility & Language Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Font Size Accessibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Accessibility: Adjust Text Size">
            <span style={{ color: '#8FA7C4', fontSize: '0.72rem', marginRight: '4px' }}>Text Size:</span>
            <button
              type="button"
              onClick={decreaseTextSize}
              style={{
                background: textSize === 'small' ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: '#FFFFFF',
                border: '1px solid #375376',
                borderRadius: '2px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              A-
            </button>
            <button
              type="button"
              onClick={resetTextSize}
              style={{
                background: textSize === 'normal' ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: '#FFFFFF',
                border: '1px solid #375376',
                borderRadius: '2px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              A
            </button>
            <button
              type="button"
              onClick={increaseTextSize}
              style={{
                background: textSize === 'large' || textSize === 'x-large' ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: '#FFFFFF',
                border: '1px solid #375376',
                borderRadius: '2px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              A+
            </button>
          </div>

          <span style={{ color: '#375376' }}>|</span>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            style={{
              background: 'transparent',
              color: highContrast ? '#FFD700' : '#C2D1E5',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem'
            }}
            title="Toggle High Contrast"
          >
            <Contrast size={13} />
            <span>{highContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          <span style={{ color: '#375376' }}>|</span>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} style={{ color: '#8FA7C4' }} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.75rem',
                cursor: 'pointer',
                outline: 'none',
                padding: '2px 4px'
              }}
            >
              <option value="en" style={{ color: '#172033', background: '#FFFFFF' }}>English</option>
              <option value="hi" style={{ color: '#172033', background: '#FFFFFF' }}>हिंदी (Hindi)</option>
              <option value="mr" style={{ color: '#172033', background: '#FFFFFF' }}>मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovTopBar;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [textSize, setTextSize] = useState('normal'); // 'small' | 'normal' | 'large' | 'x-large'
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
  }, [highContrast]);

  const decreaseTextSize = () => {
    if (textSize === 'x-large') setTextSize('large');
    else if (textSize === 'large') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('small');
  };

  const resetTextSize = () => {
    setTextSize('normal');
  };

  const increaseTextSize = () => {
    if (textSize === 'small') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('x-large');
  };

  const toggleContrast = () => {
    setHighContrast(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        decreaseTextSize,
        resetTextSize,
        increaseTextSize,
        language,
        setLanguage,
        highContrast,
        toggleContrast
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

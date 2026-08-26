import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AppRoutes from './routes/AppRoutes';

export const App = () => {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AccessibilityProvider>
  );
};

export default App;

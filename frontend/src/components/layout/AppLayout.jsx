import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GovTopBar from './GovTopBar';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Top Government Identity Bar */}
      <GovTopBar />

      {/* Main Application Header */}
      <AppHeader onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Body with Sidebar and Content View */}
      <div className="main-layout">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="content-wrapper">
          <div className="page-content">
            <Outlet />
          </div>
          {/* Government Portal Structured Footer */}
          <footer
            style={{
              padding: '16px 32px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#FAFBFD',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <span>DairyGuard Surveillance & Risk Platform • </span>
              <span>Designed in accordance with UX4G Standards</span>
            </div>
            <div>
              <span>Official Dairy Procurement Integrity Surveillance System (Hackathon Demo)</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

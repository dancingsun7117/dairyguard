import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthPortalModal from '../components/auth/AuthPortalModal';
import RiskDisclaimer from '../components/common/RiskDisclaimer';
import DairyGuardLogo from '../components/common/DairyGuardLogo';
import './LandingPage.css';

export const LandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialModal = () => {
    if (location.pathname === '/gov-login' || location.pathname === '/government-access' || location.search.includes('government')) {
      return 'government';
    }
    if (location.pathname === '/login' || location.pathname === '/collection-centre-access' || location.search.includes('collection-centre')) {
      return 'collection-centre';
    }
    return null;
  };

  const [activeAuthModal, setActiveAuthModal] = useState(getInitialModal);

  useEffect(() => {
    const modal = getInitialModal();
    if (modal) {
      setActiveAuthModal(modal);
    }
  }, [location.pathname, location.search]);

  const handleCloseModal = () => {
    setActiveAuthModal(null);
    if (
      location.pathname === '/login' ||
      location.pathname === '/collection-centre-access' ||
      location.pathname === '/gov-login' ||
      location.pathname === '/government-access'
    ) {
      navigate('/', { replace: true });
    }
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dg-landing-page">
      {/* ====================================================================
          1. HERO SECTION (Full Photographic Background)
          ==================================================================== */}
      <section className="dg-hero">
        {/* Top Navigation */}
        <header className="dg-hero-nav">
          <Link to="/" className="dg-nav-brand" title="DairyGuard - Verify. Protect. Trust.">
            <img 
              src="/dairyguard-landing-logo.png" 
              alt="DairyGuard - Verify. Protect. Trust." 
              className="dg-navbar-logo-img" 
            />
          </Link>

          <nav>
            <ul className="dg-nav-links">
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-nav-link-item">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-nav-link-item">
                  How it works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-nav-link-item">
                  Resources
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('footer-contact')} className="dg-nav-link-item">
                  Contact
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Hero Headline & Description */}
        <div className="dg-hero-main">
          <h1 className="dg-hero-headline">
            Building a<br />
            healthier <span className="gold-text">dairy</span><br />
            <span className="gold-text">ecosystem.</span>
          </h1>

          <div className="dg-gold-divider"></div>

          <p className="dg-hero-subtext">
            From the first litre collected to the<br />
            decisions that protect the dairy network.
          </p>
        </div>

        {/* Hero Portal Cards (Side-by-Side) */}
        <div className="dg-hero-cards-row">
          {/* Card 1: COLLECTION CENTRE (Opens Login / Access Modal) */}
          <div 
            className="dg-portal-card-ref"
            onClick={() => setActiveAuthModal('collection-centre')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveAuthModal('collection-centre'); } }}
            style={{ cursor: 'pointer' }}
          >
            {/* Subtle Milk Cans Line Art Watermark */}
            <svg className="dg-portal-watermark" viewBox="0 0 100 110" fill="none" stroke="#2B351F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M45 40H75V95H45V40Z" />
              <path d="M52 30H68V40H52V30Z" />
              <path d="M40 50H45V70H40V50Z" />
              <path d="M75 50H80V70H75V50Z" />
              <path d="M15 60H35V95H15V60Z" />
              <path d="M20 52H30V60H20V52Z" />
            </svg>

            <div>
              <div className="dg-portal-header">
                <div className="dg-portal-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10L12 3L21 10V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10Z" fill="none"/>
                    <path d="M9 21V12H15V21" fill="currentColor"/>
                    <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <h2 className="dg-portal-card-title">COLLECTION CENTRE</h2>
              </div>
              <p className="dg-portal-card-desc">
                Manage collection,<br />
                quality &amp; cattle data.
              </p>
            </div>

            <div>
              <span className="dg-portal-btn dg-portal-btn-olive">
                Enter portal →
              </span>
            </div>
          </div>

          {/* Card 2: GOVERNMENT (Opens Login / Access Modal) */}
          <div 
            className="dg-portal-card-ref"
            onClick={() => setActiveAuthModal('government')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveAuthModal('government'); } }}
            style={{ cursor: 'pointer' }}
          >
            {/* Subtle Government Dome Line Art Watermark */}
            <svg className="dg-portal-watermark" viewBox="0 0 100 110" fill="none" stroke="#2B351F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 95H80" />
              <path d="M25 85H75" />
              <path d="M28 85V65" />
              <path d="M42 85V65" />
              <path d="M58 85V65" />
              <path d="M72 85V65" />
              <path d="M24 65H76L50 45L24 65Z" />
              <path d="M38 45C38 32 62 32 62 45" />
              <line x1="50" y1="32" x2="50" y2="24" />
            </svg>

            <div>
              <div className="dg-portal-header">
                <div className="dg-portal-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21H21" />
                    <path d="M5 21V11" />
                    <path d="M19 21V11" />
                    <path d="M9 21V11" />
                    <path d="M15 21V11" />
                    <path d="M2 11L12 4L22 11H2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h2 className="dg-portal-card-title">GOVERNMENT</h2>
              </div>
              <p className="dg-portal-card-desc">
                Monitor anomalies,<br />
                adulteration &amp;<br />
                regional risks.
              </p>
            </div>

            <div>
              <span className="dg-portal-btn dg-portal-btn-gold">
                Enter portal →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. WHAT IS DAIRYGUARD? SECTION (Muted Sand / Khaki Background)
          ==================================================================== */}
      <section id="what-is-dairyguard" className="dg-what-section">
        {/* Botanical watermark on the top-right */}
        <svg className="dg-botanical-watermark" viewBox="0 0 200 200" fill="none" stroke="#3A4728" strokeWidth="1.5">
          <path d="M180 20C140 50 110 90 90 140" strokeLinecap="round"/>
          <path d="M165 35C150 45 140 40 145 25C150 15 165 25 165 35Z" fill="#3A4728" fillOpacity="0.3"/>
          <path d="M145 60C130 70 120 65 125 50C130 40 145 50 145 60Z" fill="#3A4728" fillOpacity="0.3"/>
          <path d="M125 90C110 100 100 95 105 80C110 70 125 80 125 90Z" fill="#3A4728" fillOpacity="0.3"/>
          <path d="M105 120C90 130 80 125 85 110C90 100 105 110 105 120Z" fill="#3A4728" fillOpacity="0.3"/>
        </svg>

        <div className="dg-what-container">
          <h2 className="dg-what-title">What is DairyGuard?</h2>
          <div className="dg-what-gold-divider"></div>

          {/* Main Grid: Left Story Copy + Right 5-Stage Diagram */}
          <div className="dg-what-grid">
            {/* Left Story Copy */}
            <div className="dg-what-copy">
              <p className="dg-what-paragraph">
                DairyGuard connects collection centres and government intelligence on one platform.
              </p>
              <p className="dg-what-paragraph">
                We bring everyday data together, uncover risks early and turn insights into actions that keep the dairy ecosystem healthy and reliable.
              </p>
            </div>

            {/* Right: 5-Stage Diagram Box */}
            <div className="dg-diagram-box">
              <div className="dg-diagram-track">
                {/* Node 1: FARMER */}
                <div className="dg-stage-node">
                  <div className="dg-stage-icon-circle">
                    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="#2B361C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {/* Rural Indian Hat */}
                      <path d="M12 20C12 20 18 10 24 10C30 10 36 20 36 20H12Z" />
                      <path d="M8 20C14 20 34 20 40 20" strokeWidth="2.2"/>
                      {/* Face & Mustache */}
                      <circle cx="24" cy="26" r="6" />
                      <path d="M21 28C22 27 26 27 27 28" strokeWidth="2"/>
                      {/* Shoulders */}
                      <path d="M14 40C14 34 18 32 24 32C30 32 34 34 34 40" />
                    </svg>
                  </div>
                  <span className="dg-stage-title">FARMER</span>
                  <span className="dg-stage-line">Data begins here.</span>
                </div>

                {/* Connector 1 */}
                <div className="dg-connector-segment">
                  <div className="dg-connector-line"></div>
                  <div className="dg-connector-dot"></div>
                </div>

                {/* Node 2: COLLECTION CENTRE */}
                <div className="dg-stage-node">
                  <div className="dg-stage-icon-circle">
                    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="#2B361C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {/* Milk Bottle / Can */}
                      <path d="M19 12H29V16L33 22V38C33 39.1 32.1 40 31 40H17C15.9 40 15 39.1 15 38V22L19 16V12Z" />
                      <path d="M18 12H30" strokeWidth="2.5"/>
                      <path d="M15 28C20 30 28 26 33 28" />
                    </svg>
                  </div>
                  <span className="dg-stage-title">COLLECTION CENTRE</span>
                  <span className="dg-stage-line">Collect &amp; monitor.</span>
                </div>

                {/* Connector 2 */}
                <div className="dg-connector-segment">
                  <div className="dg-connector-line"></div>
                  <div className="dg-connector-dot"></div>
                </div>

                {/* Node 3: DAIRYGUARD (Central Emphasized Node) */}
                <div className="dg-stage-node is-hero-node">
                  <div className="dg-stage-icon-circle">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Shield Contour */}
                      <path d="M24 6L11 11V22C11 30.5 16.5 38.3 24 41C31.5 38.3 37 30.5 37 22V11L24 6Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                      {/* Snowflake / Neural Node Network */}
                      <circle cx="24" cy="23" r="3" fill="#FFFFFF"/>
                      <line x1="24" y1="13" x2="24" y2="33" stroke="#FFFFFF" strokeWidth="1.8"/>
                      <line x1="15" y1="18" x2="33" y2="28" stroke="#FFFFFF" strokeWidth="1.8"/>
                      <line x1="15" y1="28" x2="33" y2="18" stroke="#FFFFFF" strokeWidth="1.8"/>
                      <circle cx="24" cy="13" r="1.8" fill="#FFFFFF"/>
                      <circle cx="24" cy="33" r="1.8" fill="#FFFFFF"/>
                      <circle cx="15" cy="18" r="1.8" fill="#FFFFFF"/>
                      <circle cx="33" cy="28" r="1.8" fill="#FFFFFF"/>
                      <circle cx="15" cy="28" r="1.8" fill="#FFFFFF"/>
                      <circle cx="33" cy="18" r="1.8" fill="#FFFFFF"/>
                    </svg>
                  </div>
                  <span className="dg-stage-title">DAIRYGUARD</span>
                  <span className="dg-stage-line">Detect &amp; analyse.</span>
                </div>

                {/* Connector 3 */}
                <div className="dg-connector-segment">
                  <div className="dg-connector-line"></div>
                  <div className="dg-connector-dot"></div>
                </div>

                {/* Node 4: GOVERNMENT */}
                <div className="dg-stage-node">
                  <div className="dg-stage-icon-circle">
                    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="#2B361C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 40H38" strokeWidth="2"/>
                      <path d="M12 36H36" />
                      <path d="M15 36V22" />
                      <path d="M21 36V22" />
                      <path d="M27 36V22" />
                      <path d="M33 36V22" />
                      <path d="M10 22H38L24 11L10 22Z" />
                      <circle cx="24" cy="17" r="2" fill="#2B361C"/>
                    </svg>
                  </div>
                  <span className="dg-stage-title">GOVERNMENT</span>
                  <span className="dg-stage-line">Act &amp; intervene.</span>
                </div>

                {/* Connector 4 */}
                <div className="dg-connector-segment">
                  <div className="dg-connector-line"></div>
                  <div className="dg-connector-dot"></div>
                </div>

                {/* Node 5: STRONGER COMMUNITIES */}
                <div className="dg-stage-node">
                  <div className="dg-stage-icon-circle">
                    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="#2B361C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {/* Center Person */}
                      <circle cx="24" cy="18" r="5" />
                      <path d="M16 38C16 31 19.5 28 24 28C28.5 28 32 31 32 38" />
                      {/* Left Person */}
                      <circle cx="13" cy="22" r="3.5" />
                      <path d="M8 38C8 33 10.5 31 14 31" />
                      {/* Right Person */}
                      <circle cx="35" cy="22" r="3.5" />
                      <path d="M40 38C40 33 37.5 31 34 31" />
                    </svg>
                  </div>
                  <span className="dg-stage-title">STRONGER COMMUNITIES</span>
                  <span className="dg-stage-line">Healthier future.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4-Pill Horizontal Container (COLLECT / DETECT / UNDERSTAND / ACT) */}
          <div className="dg-pills-bar">
            {/* Pill 1: COLLECT */}
            <div className="dg-pill-item">
              <div className="dg-pill-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28321B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H16V6L19 10V20C19 20.6 18.6 21 18 21H6C5.4 21 5 20.6 5 20V10L8 6V3Z" />
                  <path d="M8 3H16" strokeWidth="2.5"/>
                  <path d="M5 14C8 15.5 16 13 19 14.5" />
                </svg>
              </div>
              <div className="dg-pill-content">
                <span className="dg-pill-title">COLLECT</span>
                <span className="dg-pill-desc">Accurate data from<br />collection centres.</span>
              </div>
            </div>

            {/* Pill 2: DETECT */}
            <div className="dg-pill-item">
              <div className="dg-pill-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28321B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <line x1="15.5" y1="15.5" x2="21" y2="21" strokeWidth="2.5"/>
                  <path d="M7.5 11.5L9.5 8.5L11.5 12.5L13.5 10.5" strokeWidth="1.6"/>
                </svg>
              </div>
              <div className="dg-pill-content">
                <span className="dg-pill-title">DETECT</span>
                <span className="dg-pill-desc">Spot unusual patterns<br />early.</span>
              </div>
            </div>

            {/* Pill 3: UNDERSTAND */}
            <div className="dg-pill-item">
              <div className="dg-pill-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28321B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20H20" strokeWidth="2"/>
                  <rect x="6" y="14" width="3" height="6" fill="#28321B"/>
                  <rect x="11" y="10" width="3" height="10" fill="#28321B"/>
                  <rect x="16" y="6" width="3" height="14" fill="#28321B"/>
                  <path d="M6 10L11 6L18 3" strokeWidth="1.8"/>
                  <path d="M15 3H18V6" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="dg-pill-content">
                <span className="dg-pill-title">UNDERSTAND</span>
                <span className="dg-pill-desc">Turn data into meaningful<br />dairy intelligence.</span>
              </div>
            </div>

            {/* Pill 4: ACT */}
            <div className="dg-pill-item">
              <div className="dg-pill-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28321B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12L11 15L16 9" strokeWidth="2.2"/>
                </svg>
              </div>
              <div className="dg-pill-content">
                <span className="dg-pill-title">ACT</span>
                <span className="dg-pill-desc">Enable faster, informed<br />decisions.</span>
              </div>
            </div>
          </div>

          {/* System Legal / Risk Clarification Disclaimer */}
          <div style={{ marginTop: 28 }}>
            <RiskDisclaimer />
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FOOTER SECTION (Deep Olive Green + Rural Village Silhouette)
          ==================================================================== */}
      <footer id="footer-contact" className="dg-footer-ref">
        {/* Rural village landscape silhouette background */}
        <div className="dg-footer-landscape"></div>

        <div className="dg-footer-content">
          {/* Col 1: Brand */}
          <div className="dg-footer-col">
            <div className="dg-footer-brand-header">
              <img 
                src="/dairyguard-logo.png" 
                alt="DairyGuard - Verify. Protect. Trust." 
                className="dg-footer-logo-img" 
              />
            </div>
            <p className="dg-footer-tagline">
              Building a healthier<br />dairy ecosystem.
            </p>
          </div>

          {/* Col 2: COMPANY */}
          <div className="dg-footer-col">
            <h3 className="dg-footer-heading">COMPANY</h3>
            <ul className="dg-footer-links-list">
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-footer-link-item">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-footer-link-item">
                  How it works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('what-is-dairyguard')} className="dg-footer-link-item">
                  Resources
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('footer-contact')} className="dg-footer-link-item">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: PORTALS */}
          <div className="dg-footer-col">
            <h3 className="dg-footer-heading">PORTALS</h3>
            <ul className="dg-footer-links-list">
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveAuthModal('collection-centre')} 
                  className="dg-footer-link-item"
                >
                  Collection Centre
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveAuthModal('government')} 
                  className="dg-footer-link-item"
                >
                  Government
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: FOLLOW US */}
          <div className="dg-footer-col">
            <h3 className="dg-footer-heading">FOLLOW US</h3>
            <div className="dg-footer-social-row">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="dg-social-circle" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="dg-social-circle" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="dg-social-circle" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 5: Copyright */}
          <div className="dg-footer-col dg-footer-copyright-col">
            <p className="dg-footer-copyright-text">
              &copy; 2026 DairyGuard.<br />
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Unified DairyGuard Portal Access / Verification Modal Overlay */}
      <AuthPortalModal
        isOpen={Boolean(activeAuthModal)}
        onClose={handleCloseModal}
        portalType={activeAuthModal || 'collection-centre'}
      />
    </div>
  );
};

export default LandingPage;

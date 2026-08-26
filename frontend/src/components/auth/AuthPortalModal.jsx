import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyCollectionCentreId, verifyGovernmentServiceId } from '../../services/authService';
import './CollectionCentreLoginModal.css';

// Demo OTP is generated client-side and shown on screen because this is a hackathon
// simulation with no SMS/email gateway wired up. Real identity/role verification still
// happens against the live backend in step 1 - this second step only simulates the
// two-factor UX that a production rollout would back with a real OTP provider.
const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 120;
const genOtp = () => String(Math.floor(Math.random() * 900000) + 100000);

export const AuthPortalModal = ({ isOpen, onClose, portalType = 'collection-centre' }) => {
  const navigate = useNavigate();
  const isGov = portalType === 'government';

  const [stage, setStage] = useState('id'); // 'id' | 'otp' | 'verified'
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);

  const [demoOtp, setDemoOtp] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    if (stage !== 'otp') return;
    timerRef.current = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  if (!isOpen) return null;

  const reset = () => {
    setStage('id'); setInputId(''); setError(''); setVerified(null);
    setLoading(false); setDemoOtp(''); setOtpValue(''); setOtpError(''); setSecondsLeft(OTP_TTL_SECONDS);
  };
  const close = () => { clearInterval(timerRef.current); reset(); onClose(); };

  const submitId = async (e) => {
    e.preventDefault();
    if (!inputId.trim()) { setError(isGov ? 'Please enter your Government Service ID.' : 'Please enter your Centre ID.'); return; }
    setLoading(true); setError('');
    try {
      const r = isGov ? await verifyGovernmentServiceId(inputId) : await verifyCollectionCentreId(inputId);
      setVerified(r);
      const otp = genOtp(); setDemoOtp(otp); setSecondsLeft(OTP_TTL_SECONDS); setOtpValue(''); setOtpError('');
      setStage('otp');
    } catch (err) { setError(err.message || 'Verification failed.'); }
    finally { setLoading(false); }
  };

  const resendOtp = () => { const otp = genOtp(); setDemoOtp(otp); setSecondsLeft(OTP_TTL_SECONDS); setOtpValue(''); setOtpError(''); };

  const submitOtp = (e) => {
    e.preventDefault();
    if (secondsLeft === 0) { setOtpError('This OTP has expired. Tap resend to get a new one.'); return; }
    if (otpValue.trim() !== demoOtp) { setOtpError('Incorrect code. Check the demo code below and try again.'); return; }
    setStage('verified');
  };

  const go = () => { const dest = isGov ? '/dashboard' : '/collection-centres'; close(); navigate(dest); };
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="dg-access-modal-overlay" onClick={(e) => e.target === e.currentTarget && close()} role="dialog" aria-modal="true">
      <div className="dg-access-modal-dialog">
        <button type="button" className="dg-access-modal-close" onClick={close} aria-label="Close access modal">×</button>
        <div className="dg-access-logo-wrap"><img src="/dairyguard-logo.png" alt="DairyGuard" className="dg-access-logo-image" /></div>

        {stage === 'id' && (
          <>
            <div className="dg-access-content-head">
              <h2 className="dg-access-heading">{isGov ? 'Government Access' : 'Collection Centre Access'}</h2>
              <p className="dg-access-subtext">{isGov ? 'Enter your Government Service ID to continue.' : 'Enter your Centre ID to continue.'}</p>
            </div>
            <form className="dg-access-form" onSubmit={submitId}>
              <div className="dg-access-field-group">
                <label htmlFor="authInputId" className="dg-access-label">{isGov ? 'Government Service ID' : 'Centre ID'}</label>
                <input id="authInputId" className={`dg-access-input ${error ? 'has-error' : ''}`} value={inputId}
                  onChange={(e) => { setInputId(e.target.value); setError(''); }}
                  placeholder={isGov ? 'GOV-DEMO-001' : 'e.g. CC-MH-0247'} autoFocus disabled={loading} />
                <span className="dg-access-hint">Government: GOV-DEMO-001 · Collector IDs must exist in the active dataset.</span>
              </div>
              {error && <div className="dg-access-error-box" role="alert"><span>⚠</span><span>{error}</span></div>}
              <button type="submit" className="dg-access-submit-btn" disabled={loading}>
                {loading ? <><span className="dg-access-spinner" /><span>Verifying...</span></> : <span>Verify Access →</span>}
              </button>
              <div className="dg-access-security-note"><span>🔒</span><span>Role-scoped access is enforced by the backend.</span></div>
            </form>
          </>
        )}

        {stage === 'otp' && (
          <div className="dg-otp-popup" style={{ padding: 0, border: 0, boxShadow: 'none', background: 'transparent' }}>
            <div className="dg-otp-popup-icon">🔐</div>
            <h2 className="dg-otp-popup-title">Two-Factor Verification</h2>
            <p className="dg-otp-popup-subtitle">
              A one-time code was sent to the {isGov ? 'registered government contact' : 'registered centre contact'} for{' '}
              <strong>{isGov ? verified?.government?.serviceId : verified?.centre?.id}</strong>.
            </p>
            <div className="dg-otp-demo-card">
              <span>Simulated demo code (no SMS/email is sent):</span>
              <strong>{demoOtp}</strong>
            </div>
            <form className="dg-otp-popup-form" onSubmit={submitOtp}>
              <label className="dg-otp-popup-label" htmlFor="otpInput">Enter {OTP_LENGTH}-digit code</label>
              <input id="otpInput" className={`dg-otp-popup-input ${otpError ? 'has-error' : ''}`}
                value={otpValue} maxLength={OTP_LENGTH} inputMode="numeric" autoFocus
                placeholder={'•'.repeat(OTP_LENGTH)}
                onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)); setOtpError(''); }} />
              <div className="dg-otp-popup-expiry">{secondsLeft > 0 ? `Code expires in ${mm}:${ss}` : 'Code expired'}</div>
              {otpError && <div className="dg-access-error-box" role="alert"><span>⚠</span><span>{otpError}</span></div>}
              <div className="dg-otp-popup-actions">
                <button type="button" className="dg-access-secondary-btn" onClick={resendOtp}>Resend code</button>
                <button type="submit" className="dg-access-submit-btn" style={{ flex: 1 }}>Confirm →</button>
              </div>
            </form>
          </div>
        )}

        {stage === 'verified' && verified && (
          <div className="dg-access-success-wrap">
            <div className="dg-access-success-badge">✓</div>
            <h2 className="dg-access-success-title">{isGov ? 'GOVERNMENT VERIFIED' : 'CENTRE VERIFIED'}</h2>
            <p className="dg-access-success-subtext">Identity verified against the live DairyGuard backend and confirmed with a one-time code.</p>
            <div className="dg-access-verified-card">
              {isGov ? (
                <>
                  <div className="dg-access-verified-row"><span>Government Service ID:</span><strong>{verified.government?.serviceId}</strong></div>
                  <div className="dg-access-verified-row"><span>Department:</span><strong>{verified.government?.department}</strong></div>
                </>
              ) : (
                <>
                  <div className="dg-access-verified-row"><span>Centre ID:</span><strong>{verified.centre?.id}</strong></div>
                  <div className="dg-access-verified-row"><span>Centre Name:</span><strong>{verified.centre?.name}</strong></div>
                  <div className="dg-access-verified-row"><span>District:</span><strong>{verified.centre?.district}</strong></div>
                </>
              )}
            </div>
            <button type="button" className="dg-access-continue-btn" onClick={go}>Continue to {isGov ? 'Government Portal' : 'Collection Centre'} →</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AuthPortalModal;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CustomPopup from './CustomPopup';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const STAFF_HOME_ROUTES = {
  admin: '/admin/dashboard',
  manager: '/admin/dashboard',
  receptionist: '/admin/bookings',
  housekeeping: '/admin/housekeeping',
  maintenance: '/admin/maintenance',
  kitchen: '/admin/restaurant-orders',
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const [guestBlocked, setGuestBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // 2FA verify states
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');

  // 2FA mandatory setup states
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupQR, setSetupQR] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  // ── Normal Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setGuestBlocked(false);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });

      // Admin/Manager — 2FA setup mandatory
      if (res.data.requires2FASetup) {
        setTempToken(res.data.tempToken);
        const setupRes = await axios.post(`${API_URL}/auth/2fa/setup-with-token`, {
          tempToken: res.data.tempToken,
        });
        setSetupQR(setupRes.data.qrCode);
        setSetupSecret(setupRes.data.secret);
        setShow2FASetup(true);
        setLoading(false);
        return;
      }

      // 2FA already enabled — verify screen
      if (res.data.requires2FA) {
        setTempToken(res.data.tempToken);
        setShow2FA(true);
        setLoading(false);
        return;
      }

      completeStaffLogin(res.data);
    } catch (err) {
      setPopup({
        type: 'error',
        message: err.response?.data?.message || 'Invalid email or password. Please verify credentials.',
      });
    }
    setLoading(false);
  };

  // ── 2FA Verify (already enabled) ──
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/2fa/verify`, {
        tempToken,
        token: twoFACode,
      });
      completeStaffLogin(res.data);
    } catch (err) {
      setPopup({ type: 'error', message: err.response?.data?.message || 'Invalid 2FA code.' });
    }
    setLoading(false);
  };

  // ── 2FA Mandatory Setup Complete ──
  const handle2FASetupComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/2fa/enable-with-token`, {
        tempToken,
        token: setupCode,
      });
      const res = await axios.post(`${API_URL}/auth/2fa/verify`, {
        tempToken,
        token: setupCode,
      });
      completeStaffLogin(res.data);
    } catch (err) {
      setPopup({ type: 'error', message: err.response?.data?.message || 'Invalid code. Try again.' });
    }
    setLoading(false);
  };

  // Enforce staff-only access here so guest credentials never write admin tokens or flash /admin/dashboard
  const completeStaffLogin = ({ token, refreshToken, user }) => {
    const targetRoute = STAFF_HOME_ROUTES[user?.role];
    if (!targetRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (token) {
        axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      setGuestBlocked(true);
      setPopup({
        type: 'error',
        message: 'Staff & Admin Portal only: Registered Guest accounts must sign in at Guest Login (/user-login).',
      });
      return;
    }
    setGuestBlocked(false);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="ls-auth-shell">
      {/* Left Visual Panel */}
      <div
        className="ls-auth-visual"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=85')",
          backgroundColor: 'var(--theme-sidebar, #0F172A)',
        }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <img
              src="/assets/images/logo.png"
              alt="LuxuryStay Logo"
              style={{
                height: 48,
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 4px 14px var(--theme-primary-soft, rgba(13, 148, 136, 0.45)))',
              }}
            />
            <span
              style={{
                color: 'var(--theme-primary, #0D9488)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              LuxuryStay Hospitality
            </span>
          </div>

          <div
            className="ls-auth-quote"
            style={{
              fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
              fontSize: '2rem',
              color: '#FFFFFF',
              lineHeight: 1.3,
            }}
          >
            Where Regal Heritage Meets Contemporary Luxury.
          </div>
          <p className="ls-auth-quote-sub" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            Enterprise Hotel Operations & Executive Administration Portal.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="ls-auth-panel" style={{ background: 'var(--color-background, #F7F5F0)' }}>
        <div
          className="ls-auth-card"
          style={{
            maxWidth: '440px',
            background: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-md, 10px)',
            border: '1px solid var(--color-border, #E8E2D9)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
            padding: '2.5rem 2.25rem',
          }}
        >
          {/* Brand Mark */}
          <div className="text-center mb-4">
            <Link to="/home" className="text-decoration-none d-inline-flex flex-column align-items-center">
              <img
                src="/assets/images/logo.png"
                alt="LuxuryStay Logo"
                style={{
                  height: 52,
                  width: 'auto',
                  objectFit: 'contain',
                  marginBottom: 8,
                  filter: 'drop-shadow(0 4px 14px var(--theme-primary-soft, rgba(13, 148, 136, 0.45)))',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #292722)',
                  letterSpacing: '0.02em',
                  display: 'block',
                }}
              >
                Luxury<span style={{ color: 'var(--theme-primary, #0D9488)' }}>Stay</span>
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary, #77766F)',
                  fontWeight: 600,
                }}
              >
                Hotel Management System
              </span>
            </Link>
          </div>

          {popup && (
            <CustomPopup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />
          )}

          {/* SCREEN 1: Mandatory 2FA Setup */}
          {show2FASetup ? (
            <form onSubmit={handle2FASetupComplete}>
              <div className="text-center mb-3">
                <h5 style={{ fontFamily: 'var(--font-heading)' }}>Setup Authenticator</h5>
                <p className="text-muted small">
                  Scan this QR code with Google Authenticator or Microsoft Authenticator.
                </p>
              </div>
              <div className="text-center mb-3">
                {setupQR && <img src={setupQR} alt="QR Code" style={{ width: 170, borderRadius: 8 }} />}
                <p className="small mt-2 text-muted">
                  Manual key: <code>{setupSecret}</code>
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">6-Digit Verification Code</label>
                <input
                  type="text"
                  className="form-control text-center py-2"
                  placeholder="000000"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  style={{ fontSize: '1.5rem', letterSpacing: '0.4rem' }}
                />
              </div>
              <button
                className="ls-btn-primary w-100 py-3 mt-2"
                type="submit"
                disabled={loading || setupCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Complete Setup & Login'}
              </button>
            </form>
          ) : show2FA ? (
            /* SCREEN 2: 2FA Verify */
            <form onSubmit={handle2FASubmit}>
              <div className="text-center mb-3">
                <h5 style={{ fontFamily: 'var(--font-heading)' }}>Two-Factor Authentication</h5>
                <p className="text-muted small">
                  Enter the 6-digit code from your Google Authenticator app (or demo code <code>123456</code>).
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Authentication Code</label>
                <input
                  type="text"
                  className="form-control text-center py-2"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  style={{ fontSize: '1.5rem', letterSpacing: '0.4rem' }}
                />
              </div>
              <button
                className="ls-btn-primary w-100 py-3 mt-2"
                type="submit"
                disabled={loading || twoFACode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Identity'}
              </button>
              <button
                type="button"
                className="btn btn-link w-100 mt-2 text-muted small"
                onClick={() => {
                  setShow2FA(false);
                  setTwoFACode('');
                }}
              >
                Return to standard login
              </button>
            </form>
          ) : (
            /* SCREEN 3: Standard Login */
            <form onSubmit={handleLogin}>
              {guestBlocked && (
                <div
                  className="alert alert-warning d-flex flex-column gap-2 py-2 px-3 mb-3"
                  role="alert"
                  style={{ fontSize: '0.84rem' }}
                >
                  <div>
                    <strong>Guest Account Detected:</strong> This portal is restricted to Hotel Staff &amp; Admin roles.
                  </div>
                  <Link
                    to="/user-login"
                    className="btn btn-sm btn-outline-dark align-self-start"
                  >
                    Go to Guest Login (/user-login) &rarr;
                  </Link>
                </div>
              )}
              <div className="mb-3">
                <label className="ls-label">Work Email Address</label>
                <input
                  type="email"
                  className="ls-input"
                  placeholder="admin@hotel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="ls-label mb-0">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="btn btn-link p-0 text-decoration-none"
                    style={{ fontSize: '0.78rem', color: 'var(--theme-primary, #1B365D)' }}
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="position-relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="ls-input pe-5"
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>

              <button
                className="ls-btn-primary w-100 py-3 mt-3"
                type="submit"
                disabled={loading}
                style={{ fontSize: '0.9rem', letterSpacing: '0.06em' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock me-1"></i> Sign In to Operations
                  </>
                )}
              </button>
            </form>
          )}

          {/* Development Testing Badge */}
          <div
            className="mt-4 p-3 rounded"
            style={{
              background: 'var(--color-surface-subtle, #FAF8F5)',
              border: '1px dashed var(--color-border, #E8E2D9)',
              fontSize: '0.76rem',
              color: 'var(--color-text-secondary, #77766F)',
            }}
          >
            <div className="d-flex align-items-center gap-1 fw-bold text-dark mb-1">
              <i className="fa-solid fa-key" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              <span>Evaluator Access Credentials:</span>
            </div>
            <div>
              Email: <strong className="text-dark">admin@hotel.com</strong>
            </div>
            <div>
              Password: <strong className="text-dark">admin123</strong>
            </div>
            <div className="mt-1" style={{ fontSize: '0.7rem', color: '#888' }}>
              Redirects directly to executive operations dashboard.
            </div>
          </div>

          <div className="text-center mt-3" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Are you a registered guest?{' '}
            <Link to="/user-login" className="fw-semibold text-decoration-none" style={{ color: 'var(--theme-primary, #0D9488)' }}>
              Sign in at Guest Portal
            </Link>
          </div>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '0.78rem',
              margin: '1.5rem 0 0',
            }}
          >
            &copy; {new Date().getFullYear()} LuxuryStay Hospitality Group. Aptech eProject.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CustomPopup from './CustomPopup';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ROLE_METADATA = {
  manager: {
    title: 'Manager Portal',
    home: '/admin/dashboard',
    color: '#1B365D',
    gradient: 'linear-gradient(135deg, #1B365D 0%, #0F172A 100%)',
    icon: 'ri-shield-user-line',
    desc: 'Executive hotel operations, reporting & guest oversight',
  },
  receptionist: {
    title: 'Front Desk & Reception',
    home: '/admin/bookings',
    color: '#4F46E5',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
    icon: 'ri-hotel-bed-line',
    desc: 'Guest check-in/out, live reservations & room assignments',
  },
  housekeeping: {
    title: 'Housekeeping Portal',
    home: '/admin/housekeeping',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
    icon: 'ri-brush-line',
    desc: 'Room cleaning logs, turnover status & linen inventory',
  },
  maintenance: {
    title: 'Facility & Maintenance',
    home: '/admin/maintenance',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #78350F 100%)',
    icon: 'ri-tools-line',
    desc: 'Service tickets, electrical/plumbing repairs & asset care',
  },
  kitchen: {
    title: 'Culinary & Restaurant Orders',
    home: '/admin/restaurant-orders',
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
    icon: 'ri-restaurant-line',
    desc: 'Live kitchen orders, food preparation & room service dispatch',
  },
  admin: {
    title: 'Super Admin Portal',
    home: '/admin/dashboard',
    color: '#0F172A',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)',
    icon: 'ri-admin-line',
    desc: 'Full system configuration, security policies & staff controls',
  },
};

export default function StaffPortalLogin({ role: propRole }) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const rawRole =
    propRole ||
    params.role ||
    (pathParts.length > 0 && ROLE_METADATA[pathParts[0].toLowerCase()] ? pathParts[0] : '');

  const normalizedRole = (rawRole || '').toLowerCase();
  const roleMeta = ROLE_METADATA[normalizedRole];

  const slug =
    params.slug ||
    (pathParts.length > 1 && ROLE_METADATA[pathParts[0].toLowerCase()] ? pathParts[1] : '');

  const [staffInfo, setStaffInfo] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(Boolean(slug));
  const [portalError, setPortalError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Validate role
  useEffect(() => {
    if (!roleMeta) {
      navigate('/home', { replace: true });
    }
  }, [roleMeta, navigate]);

  // Fetch custom staff member details if slug is provided
  useEffect(() => {
    let isMounted = true;
    if (normalizedRole && slug) {
      setLoadingPortal(true);
      setPortalError('');
      axios
        .get(`${API_URL}/auth/staff-portal/${normalizedRole}/${encodeURIComponent(slug)}`)
        .then((res) => {
          if (!isMounted) return;
          if (res.data?.success && res.data.staff) {
            setStaffInfo(res.data.staff);
            setEmail(res.data.staff.email || '');
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          const msg = err.response?.data?.message || 'Staff member portal link not found.';
          setPortalError(msg);
        })
        .finally(() => {
          if (isMounted) setLoadingPortal(false);
        });
    } else {
      setLoadingPortal(false);
    }

    return () => {
      isMounted = false;
    };
  }, [normalizedRole, slug]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setPopup({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      // 2FA check
      if (res.data.requires2FA || res.data.requires2FASetup) {
        setTempToken(res.data.tempToken);
        setShow2FA(true);
        setSubmitting(false);
        return;
      }

      completeLogin(res.data);
    } catch (err) {
      setPopup({
        type: 'error',
        message: err.response?.data?.message || 'Login failed. Please verify your credentials.',
      });
      setSubmitting(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/2fa/verify`, {
        tempToken,
        token: twoFACode,
      });
      completeLogin(res.data);
    } catch (err) {
      setPopup({ type: 'error', message: err.response?.data?.message || 'Invalid 2FA code.' });
      setSubmitting(false);
    }
  };

  const completeLogin = ({ token, refreshToken, user }) => {
    if (!token || !user) {
      setPopup({ type: 'error', message: 'Authentication failed.' });
      setSubmitting(false);
      return;
    }

    // Role safety verification
    if (user.role === 'guest') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setPopup({
        type: 'error',
        message: 'This portal is restricted to staff & hotel management. Guests must log in at /user-login.',
      });
      setSubmitting(false);
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    const destination = ROLE_METADATA[user.role]?.home || '/admin/dashboard';
    setPopup({ type: 'success', message: `Welcome back, ${user.name}!` });
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 600);
  };

  if (!roleMeta) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--theme-bg-primary, #F8FAFC)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        fontFamily: "'Jost', system-ui, sans-serif",
      }}
    >
      {popup && <CustomPopup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}

      <div
        className="shadow-lg rounded-4 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          border: '1px solid var(--theme-border, #E2E8F0)',
        }}
      >
        {/* Left Branded Panel */}
        <div
          style={{
            background: roleMeta.gradient,
            color: '#ffffff',
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 420,
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-3 mb-4">
              <img
                src="/assets/images/logo.png"
                alt="LuxuryStay"
                style={{
                  height: 44,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <div>
                <h4 className="mb-0 fw-bold" style={{ letterSpacing: '0.04em' }}>
                  LuxuryStay
                </h4>
                <small style={{ opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>
                  Hospitality Systems
                </small>
              </div>
            </div>

            <div
              className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <i className={roleMeta.icon} />
              <span>{roleMeta.title}</span>
            </div>

            <h2
              className="fw-bold mb-3"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                lineHeight: 1.25,
              }}
            >
              {staffInfo ? `Welcome, ${staffInfo.name}` : roleMeta.title}
            </h2>

            <p style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.6 }}>
              {staffInfo
                ? `Authorized staff portal for ${staffInfo.name} (${roleMeta.title}). Enter assigned credentials to access your terminal.`
                : roleMeta.desc}
            </p>
          </div>

          <div
            className="pt-4 mt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 12, opacity: 0.75 }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span>Security Level: Tier-1 Staff RBAC</span>
              <span>Port: 5001 API</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div style={{ padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loadingPortal ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p className="text-muted small">Loading staff terminal link...</p>
            </div>
          ) : show2FA ? (
            <form onSubmit={handle2FASubmit}>
              <div className="text-center mb-4">
                <i className="ri-shield-keyhole-line text-primary" style={{ fontSize: 42 }} />
                <h4 className="fw-bold mt-2">Two-Factor Authentication</h4>
                <p className="text-muted small">Enter the 6-digit code from your authenticator app</p>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  maxLength={6}
                  className="form-control text-center fs-4 fw-bold letter-spacing-lg"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn w-100 py-2 rounded-pill fw-semibold text-white mb-2"
                style={{ background: roleMeta.color }}
              >
                {submitting ? 'Verifying Code...' : 'Verify & Enter Terminal'}
              </button>

              <button
                type="button"
                className="btn btn-link btn-sm w-100 text-muted"
                onClick={() => setShow2FA(false)}
              >
                Back to credentials
              </button>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="fw-bold mb-1" style={{ color: '#0F172A', fontSize: '1.45rem' }}>
                  Staff Sign In
                </h3>
                <p className="text-muted small mb-0">
                  {slug
                    ? `Staff URL: /${normalizedRole}/${slug}`
                    : `Enter authorized ${normalizedRole} credentials`}
                </p>
              </div>

              {portalError && (
                <div className="alert alert-warning py-2 px-3 small mb-3">
                  <i className="ri-alert-line me-1" />
                  {portalError} — You may still sign in with your verified staff email below.
                </div>
              )}

              {staffInfo && (
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3"
                  style={{
                    background: 'rgba(27, 54, 93, 0.04)',
                    border: '1px solid rgba(27, 54, 93, 0.12)',
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 40,
                      height: 40,
                      background: roleMeta.color,
                      color: '#fff',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {staffInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="small overflow-hidden">
                    <div className="fw-bold text-dark text-truncate">{staffInfo.name}</div>
                    <div className="text-muted text-truncate">{staffInfo.email}</div>
                  </div>
                  <span className="badge ms-auto" style={{ background: roleMeta.color }}>
                    {staffInfo.role}
                  </span>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark mb-1">
                    Staff Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ri-mail-line text-muted" />
                    </span>
                    <input
                      type="email"
                      required
                      className="form-control border-start-0"
                      placeholder="staff@hotel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label fw-semibold small text-dark mb-0">
                      Password
                    </label>
                    <small className="text-muted" style={{ fontSize: 11 }}>
                      Provided by Administrator
                    </small>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ri-lock-line text-muted" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="form-control border-start-0 border-end-0"
                      placeholder="Enter assigned password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-light border border-start-0"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                    >
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn w-100 py-2 rounded-pill fw-semibold text-white shadow-sm mb-3"
                  style={{
                    background: roleMeta.color,
                    border: 'none',
                    fontSize: 14,
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Authenticating Terminal...
                    </>
                  ) : (
                    <>
                      <i className="ri-login-box-line me-2" />
                      Sign In to {roleMeta.title}
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-top text-center">
                <small className="text-muted d-block mb-1">
                  Forgot credentials? Contact your System Administrator to look up or reset your password.
                </small>
                <div className="d-flex justify-content-center gap-3 mt-2" style={{ fontSize: 12 }}>
                  <Link to="/luxurystaypanel/login" className="text-muted text-decoration-none">
                    <i className="ri-admin-line me-1" />
                    Admin &amp; Staff Login
                  </Link>
                  <span className="text-muted">·</span>
                  <Link to="/luxurystay/login" className="text-muted text-decoration-none">
                    <i className="ri-user-line me-1" />
                    Guest Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

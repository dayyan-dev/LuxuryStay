// src/Component/User/Home/Register.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyEmailOtp, resendEmailOtp } from '../../../api/authApi.js';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PopupAlert = ({ popup, onClose }) =>
  !popup.show ? null : (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 99999,
        minWidth: 300,
        maxWidth: 380,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderLeft: `4px solid ${popup.type === 'success' ? 'var(--theme-primary, #1B365D)' : '#CC5B55'}`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          flexShrink: 0,
          background:
            popup.type === 'success'
              ? 'var(--theme-primary-gradient, var(--theme-primary, #1B365D))'
              : '#CC5B55',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {popup.type === 'success' ? '✓' : '✕'}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 2 }}>
          {popup.type === 'success' ? 'Success' : 'Error'}
        </div>
        <div style={{ fontSize: 13, color: '#6c757d' }}>{popup.message}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#adb5bd',
          fontSize: 18,
        }}
      >
        ✕
      </button>
    </div>
  );

/** Collapse multi-spaces; allow letters, spaces, apostrophe, hyphen, period */
function sanitizeName(value) {
  return value
    .replace(/[^a-zA-Z\s'.-]/g, '')
    .replace(/ {2,}/g, ' ');
}

function validateName(name) {
  const trimmed = name.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 3) return 'Name must be at least 3 characters.';
  if (/\s{2,}/.test(name)) return 'Only one space is allowed between words.';
  if (!/^[A-Za-z]+(?:[ '.][A-Za-z]+|-?[A-Za-z]+)*$/.test(trimmed)) {
    return 'Use letters only — single spaces between words.';
  }
  if (trimmed.split(/\s+/).length < 2) {
    return 'Please enter your first and last name.';
  }
  return '';
}

function validateEmail(email) {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (/\s/.test(value)) return 'Email cannot contain spaces.';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address (e.g. you@example.com).';
  return '';
}

/** Format while typing: 03XX-XXXXXXX or +92 3XX-XXXXXXX */
function formatPakPhone(raw) {
  const hasPlus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');

  // International: 92XXXXXXXXXX
  if (hasPlus || digits.startsWith('92')) {
    if (!digits.startsWith('92')) digits = `92${digits}`;
    digits = digits.slice(0, 12); // 92 + 10 national digits
    const national = digits.slice(2); // 3XXXXXXXXX
    if (!national) return '+92';
    if (national.length <= 3) return `+92 ${national}`;
    return `+92 ${national.slice(0, 3)}-${national.slice(3, 10)}`;
  }

  // Local: prefer 03XXXXXXXXX
  if (digits.startsWith('3') && !digits.startsWith('03')) {
    digits = `0${digits}`;
  }
  digits = digits.slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** Normalize to 03XXXXXXXXX for API storage */
function normalizePakPhone(display) {
  let digits = display.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length >= 12) {
    digits = `0${digits.slice(2, 12)}`;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    digits = `0${digits}`;
  }
  return digits.slice(0, 11);
}

function validatePhone(display) {
  if (!display.trim()) return 'Phone number is required.';
  const normalized = normalizePakPhone(display);
  if (!/^03[0-9]{9}$/.test(normalized)) {
    return 'Use Pakistani format: 03XX-XXXXXXX or +92 3XX-XXXXXXX.';
  }
  return '';
}

function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function validatePassword(password) {
  if (!password) return 'Password is required.';
  const c = getPasswordChecks(password);
  if (!c.length) return 'Password must be at least 8 characters.';
  if (!c.upper) return 'Add at least one uppercase letter.';
  if (!c.lower) return 'Add at least one lowercase letter.';
  if (!c.number) return 'Add at least one number.';
  if (!c.special) return 'Add at least one special character (!@#$…).';
  return '';
}

function validateConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password.';
  if (confirm !== password) return 'Passwords do not match.';
  return '';
}

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  const passwordChecks = useMemo(
    () => getPasswordChecks(formData.password),
    [formData.password]
  );

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3500);
  };

  const fieldError = (field, value, all = formData) => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirm(all.password, value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'name') nextValue = sanitizeName(value);
    if (name === 'email') nextValue = value.replace(/\s/g, '');
    if (name === 'phone') nextValue = formatPakPhone(value);

    const nextForm = { ...formData, [name]: nextValue };
    setFormData(nextForm);

    if (touched[name] || errors[name]) {
      setErrors((prev) => {
        const next = {
          ...prev,
          [name]: fieldError(name, nextValue, nextForm),
        };
        if (name === 'password' && (touched.confirmPassword || prev.confirmPassword)) {
          next.confirmPassword = fieldError(
            'confirmPassword',
            nextForm.confirmPassword,
            nextForm
          );
        }
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError(name, value, formData),
    }));
  };

  const validateAll = () => {
    const nextErrors = {
      name: fieldError('name', formData.name),
      email: fieldError('email', formData.email),
      phone: fieldError('phone', formData.phone),
      password: fieldError('password', formData.password),
      confirmPassword: fieldError('confirmPassword', formData.confirmPassword),
    };
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showPopup('error', 'Please fix the highlighted fields.');
      return;
    }

    if (!consent) {
      showPopup('error', 'Please accept the Privacy Policy to continue.');
      return;
    }

    const phoneNormalized = normalizePakPhone(formData.phone);

    setLoading(true);
    try {
      const data = await registerUser({
        name: formData.name.trim().replace(/ {2,}/g, ' '),
        email: formData.email.trim().toLowerCase(),
        phone: phoneNormalized,
        password: formData.password,
        consentAccepted: true,
      });

      if (data.success && data.requiresEmailVerification) {
        setPendingEmail(data.email || formData.email.trim().toLowerCase());
        setDevOtp(data.devOtp || '');
        setOtp('');
        setOtpError('');
        setResendSeconds(30);
        setStep('otp');
        showPopup(
          'success',
          data.devOtp
            ? 'Account created. Enter the demo OTP shown below (email not configured).'
            : 'OTP sent to your email. Enter the 6-digit code to verify.'
        );
      } else if (data.success) {
        showPopup('success', data.message || 'Registration successful! Please login.');
        setTimeout(() => navigate('/user-login'), 1500);
      } else {
        showPopup('error', data.message || 'Registration failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error. Please try again.';
      showPopup('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setOtpError('Enter the 6-digit code from your email.');
      return;
    }
    setOtpError('');
    setLoading(true);
    try {
      const data = await verifyEmailOtp({ email: pendingEmail, otp: code });
      if (data.success) {
        showPopup('success', data.message || 'Email verified! You can sign in.');
        setTimeout(() => navigate('/user-login'), 1200);
      } else {
        setOtpError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || loading) return;
    setLoading(true);
    setOtpError('');
    try {
      const data = await resendEmailOtp({ email: pendingEmail });
      if (data.success) {
        setDevOtp(data.devOtp || '');
        setResendSeconds(30);
        showPopup('success', data.message || 'A new code was sent.');
      } else {
        showPopup('error', data.message || 'Could not resend code.');
      }
    } catch (err) {
      showPopup('error', err.response?.data?.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ ok, label }) => (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: ok ? '#2f6b3a' : '#777',
        fontSize: '0.78rem',
        lineHeight: 1.4,
      }}
    >
      <i
        className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle'}`}
        style={{ fontSize: '0.7rem', color: ok ? '#2f6b3a' : '#c5c0b6' }}
        aria-hidden
      />
      {label}
    </li>
  );

  return (
    <>
      <PopupAlert
        popup={popup}
        onClose={() => setPopup({ show: false, type: '', message: '' })}
      />
      <section className="ls-auth-shell" style={{ display: 'grid' }} aria-label="Create account">
        <div
          className="ls-auth-visual"
          style={{ backgroundImage: "url('/user-assets/images/slider/slide-3.jpg')" }}
        >
          <div>
            <p
              style={{
                color: 'var(--ls-gold)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              Join LuxuryStay
            </p>
            <div className="ls-auth-quote">
              Reserve in seconds. Arrive to a room prepared just for you.
            </div>
            <p className="ls-auth-quote-sub">
              Members enjoy priority booking, restaurant ordering and loyalty rewards.
            </p>
          </div>
        </div>

        <div className="ls-auth-panel">
          <div className="ls-auth-card" style={{ maxWidth: 460 }}>
            <div
              className="ls-auth-brand mb-3"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textAlign: 'center',
              }}
            >
                <img
                  src="/assets/images/logo.png"
                  alt="LuxuryStay Logo"
                  style={{
                    height: 56,
                    width: 'auto',
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: 'drop-shadow(0 4px 14px var(--theme-primary-soft, rgba(13, 148, 136, 0.45)))',
                  }}
                />
              <div
                className="ls-auth-brand-name"
                style={{
                  fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #292722)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Luxury<span style={{ color: 'var(--theme-primary, #0D9488)' }}>Stay</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--ls-font-serif)',
                  fontSize: '1.5rem',
                  color: 'var(--ls-dark)',
                  marginBottom: '0.25rem',
                }}
              >
                {step === 'otp' ? 'Verify Email' : 'Create Account'}
              </h2>
              <p style={{ color: 'var(--ls-gray)', fontSize: '0.92rem', margin: 0 }}>
                {step === 'otp'
                  ? `We sent a 6-digit code to ${pendingEmail}`
                  : 'Register to book rooms & order food'}
              </p>
            </div>

            {step === 'otp' ? (
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="ls-input-group">
                  <label className="ls-input-label ls-input-required" htmlFor="reg-otp">
                    Verification code
                  </label>
                  <input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`ls-input${otpError ? ' is-invalid' : ''}`}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    required
                    style={{
                      letterSpacing: '0.35em',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      textAlign: 'center',
                    }}
                  />
                  {otpError ? (
                    <span className="ls-field-error">{otpError}</span>
                  ) : (
                    <span className="ls-field-helper">
                      Check your inbox (and spam). Code expires in 10 minutes.
                    </span>
                  )}
                </div>

                {devOtp ? (
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 8,
                      background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.12))',
                      border: '1px dashed var(--ls-gold, )',
                      fontSize: '0.88rem',
                      color: 'var(--ls-dark)',
                    }}
                  >
                    <strong>Demo OTP</strong> (email not delivered):{' '}
                    <span style={{ letterSpacing: '0.2em', fontWeight: 700 }}>{devOtp}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="ls-btn ls-btn-primary ls-btn-block"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </button>

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.88rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || resendSeconds > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendSeconds > 0 ? '#999' : 'var(--ls-gold-dark, var(--theme-primary-hover, #122642))',
                      fontWeight: 600,
                      cursor: resendSeconds > 0 ? 'not-allowed' : 'pointer',
                      padding: 0,
                    }}
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setOtp('');
                      setDevOtp('');
                      setOtpError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ls-gray)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ← Back to form
                  </button>
                </div>
              </form>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="ls-input-group">
                <label className="ls-input-label ls-input-required" htmlFor="reg-name">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className={`ls-input${errors.name ? ' is-invalid' : ''}`}
                  placeholder="e.g. Ayesha Khan"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.name ? (
                  <span className="ls-field-error">{errors.name}</span>
                ) : (
                  <span className="ls-field-helper">First & last name — one space between words.</span>
                )}
              </div>

              <div className="ls-input-group">
                <label className="ls-input-label ls-input-required" htmlFor="reg-email">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`ls-input${errors.email ? ' is-invalid' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.email && <span className="ls-field-error">{errors.email}</span>}
              </div>

              <div className="ls-input-group">
                <label className="ls-input-label ls-input-required" htmlFor="reg-phone">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className={`ls-input${errors.phone ? ' is-invalid' : ''}`}
                  placeholder="03XX-XXXXXXX or +92 3XX-XXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.phone ? (
                  <span className="ls-field-error">{errors.phone}</span>
                ) : (
                  <span className="ls-field-helper">
                    Pakistani mobile — auto-formats as 03XX-XXXXXXX or +92 3XX-XXXXXXX.
                  </span>
                )}
              </div>

              <div className="ls-input-group">
                <label className="ls-input-label ls-input-required" htmlFor="reg-password">
                  Password
                </label>
                <div className="ls-password-wrap">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`ls-input${errors.password ? ' is-invalid' : ''}`}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="ls-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i
                      className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {errors.password && (
                  <span className="ls-field-error">{errors.password}</span>
                )}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0.45rem 0 0',
                    display: 'grid',
                    gap: 2,
                  }}
                >
                  <CheckItem ok={passwordChecks.length} label="At least 8 characters" />
                  <CheckItem ok={passwordChecks.upper} label="One uppercase letter" />
                  <CheckItem ok={passwordChecks.lower} label="One lowercase letter" />
                  <CheckItem ok={passwordChecks.number} label="One number" />
                  <CheckItem ok={passwordChecks.special} label="One special character (!@#$…)" />
                </ul>
              </div>

              <div className="ls-input-group">
                <label className="ls-input-label ls-input-required" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <div className="ls-password-wrap">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`ls-input${errors.confirmPassword ? ' is-invalid' : ''}`}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="ls-password-toggle"
                    aria-label={
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    }
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    <i
                      className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="ls-field-error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="mb-4 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="privacyConsent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <label
                  className="form-check-label text-muted"
                  htmlFor="privacyConsent"
                  style={{ fontSize: '0.9rem' }}
                >
                  I have read and accept the Privacy Policy. I consent to my personal data
                  (name, email, phone, booking history) being stored and processed to provide
                  hotel services. I can withdraw my consent at any time from my profile.
                </label>
              </div>

              <button
                type="submit"
                className="ls-btn ls-btn-primary ls-btn-block"
                disabled={loading}
              >
                {loading ? 'Creating your account…' : 'Create Account'}
              </button>
            </form>
            )}

            <p
              style={{
                textAlign: 'center',
                color: 'var(--ls-gray)',
                fontSize: '0.9rem',
                margin: '1.5rem 0 0',
              }}
            >
              Already have an account?{' '}
              <Link to="/user-login" style={{ color: 'var(--ls-gold-dark)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;

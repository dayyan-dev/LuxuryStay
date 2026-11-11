// src/Component/User/Home/UserLogin.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../../api/authApi.js';
import { useAuth } from '../../../Context/AuthContext';

const PopupAlert = ({ popup, onClose }) => !popup.show ? null : (
  <div style={{
    position:'fixed',top:24,right:24,zIndex:99999,minWidth:300,maxWidth:380,
    background:'#fff',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
    padding:'18px 22px',display:'flex',alignItems:'center',gap:14,
    borderLeft:`4px solid ${popup.type==='success'?'var(--theme-primary, #1B365D)':'#CC5B55'}`
  }}>
    <div style={{
      width:38,height:38,borderRadius:'50%',flexShrink:0,
      background:popup.type==='success'?'var(--theme-primary-gradient, var(--theme-primary, #1B365D))':'#CC5B55',
      display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,fontWeight:700
    }}>{popup.type==='success'?'✓':'✕'}</div>
    <div>
      <div style={{fontWeight:700,fontSize:14,color:'#1a1a2e',marginBottom:2}}>
        {popup.type==='success'?'Success':'Error'}
      </div>
      <div style={{fontSize:13,color:'#6c757d'}}>{popup.message}</div>
    </div>
    <button onClick={onClose}
      style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#adb5bd',fontSize:18}}>✕</button>
  </div>
);

const UserLogin = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3500);
  };

  const from = location.state?.from?.pathname || location.state?.from || '/home';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);

      if (data.token) {
        login(data.user, data.token, data.refreshToken);
        showPopup('success', `Welcome back, ${data.user.name}!`);
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        showPopup('error', data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const api = err.response?.data;
      if (api?.code === 'EMAIL_NOT_VERIFIED') {
        showPopup('error', api.message || 'Please verify your email OTP first.');
        setTimeout(() => navigate('/register'), 1600);
      } else if (api?.message) {
        showPopup('error', api.message);
      } else {
        showPopup('error', 'Server error. Please verify the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PopupAlert popup={popup} onClose={() => setPopup({ show: false, type: '', message: '' })} />
      <section
        className="ls-auth-shell"
        style={{ display: 'grid' }}
        aria-label="Guest login"
      >
        <div
          className="ls-auth-visual"
          style={{ backgroundImage: "url('/user-assets/images/slider/slide-2.jpg')" }}
        >
          <div>
            <p style={{ color: 'var(--ls-gold)', letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
              Members & Guests
            </p>
            <div className="ls-auth-quote">Your suite, your preferences, your moment of calm.</div>
            <p className="ls-auth-quote-sub">Sign in to manage bookings, request services and earn loyalty rewards.</p>
          </div>
        </div>

        <div className="ls-auth-panel">
          <div className="ls-auth-card">
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
                  height: 54,
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
              <h2 style={{ fontFamily: 'var(--ls-font-serif)', fontSize: '1.5rem', color: 'var(--ls-dark)', marginBottom: '0.25rem' }}>Welcome Back</h2>
              <p style={{ color: 'var(--ls-gray)', fontSize: '0.92rem', margin: 0 }}>Sign in to your guest account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate={false}>

              <div className="ls-input-group">
                <label className="ls-input-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email" name="email"
                  className="ls-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email} onChange={handleChange} required
                />
              </div>

              <div className="ls-input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="ls-input-label" htmlFor="login-password">Password</label>
                <div className="ls-password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="ls-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="ls-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button type="submit" className="ls-btn ls-btn-primary ls-btn-block" disabled={loading}>
                {loading ? 'Signing you in…' : 'Sign In'}
              </button>

            </form>

            <p style={{ textAlign: 'center', color: 'var(--ls-gray)', fontSize: '0.9rem', margin: '1.5rem 0 0' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--ls-gold-dark)', fontWeight: 600 }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserLogin;
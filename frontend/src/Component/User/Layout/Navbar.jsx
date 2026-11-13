import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

const DESTINATIONS = [
  { city: 'Karachi', tag: 'Flagship, by the sea' },
  { city: 'Lahore', tag: 'Grand Mall' },
  { city: 'Islamabad', tag: 'Margalla Hills' },
  { city: 'Bhurban', tag: 'Alpine Resort' },
  { city: 'Gwadar', tag: 'Coastal Sanctuary' },
  { city: 'Malam Jabba', tag: 'Ski Resort' },
];

const LINKS = [
  { to: '/home', label: 'Home', end: true },
  { to: '/hotels', label: 'Hotels', dropdown: true },
  { to: '/room', label: 'Rooms & Suites' },
  { to: '/services', label: 'Experiences' },
  { to: '/restaurant', label: 'Dining' },
  { to: '/offers', label: 'Offers' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const PHONE_HREF = 'tel:+9221111505505';
const PHONE_LABEL = '+92 21 111 505 505';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'dest' | 'user' | null
  const [mobileDestOpen, setMobileDestOpen] = useState(false);
  const headerRef = useRef(null);
  const scrolledRef = useRef(false);

  const isHome = location.pathname === '/' || location.pathname === '/home';

  /* Scroll compact state with hysteresis — avoids sticky height feedback loop/jiggle */
  useEffect(() => {
    const ENTER = 64; // must exceed collapsed height delta (~38px top strip)
    const EXIT = 8;

    const onScroll = () => {
      const y = window.scrollY;
      const next = scrolledRef.current ? y > EXIT : y > ENTER;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close everything when the route changes */
  useEffect(() => {
    setDrawerOpen(false);
    setOpenMenu(null);
    setMobileDestOpen(false);
  }, [location.pathname, location.search]);

  /* Lock page scroll while the mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  /* Outside click + Escape close dropdowns and drawer */
  useEffect(() => {
    const onDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = () => {
    setOpenMenu(null);
    setDrawerOpen(false);
    logout();
    navigate('/luxurystay/login');
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'G';

  return (
    <>
      <style>{css}</style>

      <header
        ref={headerRef}
        className={`lx-header ${scrolled ? 'is-scrolled' : ''} ${isHome ? 'is-home' : ''}`}
      >
        {/* ── Top strip: contact + utility links (desktop only) ── */}
        <div className="lx-top">
          <div className="lx-wrap lx-top-inner">
            <div className="lx-top-left">
              <a href={PHONE_HREF} className="lx-top-link">
                <i className="fa-solid fa-phone" />
                <span>24/7 Reservations: {PHONE_LABEL}</span>
              </a>
            </div>
            <div className="lx-top-right">
              <Link to="/offers" className="lx-top-link lx-gold">
                <i className="fa-solid fa-tag" />
                <span>Special offers</span>
              </Link>
              <Link to="/luxurystaypanel/login" className="lx-top-link" title="Staff and management portal">
                <i className="fa-solid fa-shield-halved" />
                <span>Staff portal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main bar ── */}
        <div className="lx-bar">
          <div className="lx-wrap lx-bar-inner">
            {/* Brand */}
            <Link to="/home" className="lx-brand" aria-label="LuxuryStay home">
              <img
                src="/assets/images/logo.png"
                alt="LuxuryStay Hospitality Logo"
                className="lx-brand-logo"
              />
              <span className="lx-brand-text">
                <span className="lx-brand-name">
                  Luxury<em style={{ color: 'var(--theme-secondary-light, #2DD4BF)' }}>Stay</em>
                </span>
                <span className="lx-brand-sub">Hotels &amp; Resorts</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="lx-nav" aria-label="Main">
              {LINKS.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.to}
                    className="lx-dd"
                    onMouseEnter={() => setOpenMenu('dest')}
                    onMouseLeave={() => setOpenMenu((m) => (m === 'dest' ? null : m))}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `lx-link ${isActive ? 'active' : ''}`
                      }
                    >
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      className="lx-caret"
                      aria-label="Show destinations"
                      aria-expanded={openMenu === 'dest'}
                      onClick={() => setOpenMenu(openMenu === 'dest' ? null : 'dest')}
                    >
                      <i className="fa-solid fa-chevron-down" />
                    </button>

                    <div className={`lx-panel lx-dest ${openMenu === 'dest' ? 'open' : ''}`}>
                      <div className="lx-dest-head">Choose a destination</div>
                      <div className="lx-dest-grid">
                        {DESTINATIONS.map((d) => (
                          <Link
                            key={d.city}
                            to={`/hotels?city=${encodeURIComponent(d.city)}`}
                            className="lx-dest-item"
                          >
                            <span className="lx-dest-city">{d.city}</span>
                            <span className="lx-dest-tag">{d.tag}</span>
                          </Link>
                        ))}
                      </div>
                      <Link to="/hotels" className="lx-dest-all">
                        View all hotels
                      </Link>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `lx-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Right actions */}
            <div className="lx-actions">
              {user ? (
                <div className="lx-user">
                  <button
                    type="button"
                    className="lx-user-btn"
                    aria-expanded={openMenu === 'user'}
                    onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
                  >
                    <span className="lx-avatar">{initials}</span>
                    <span className="lx-user-name">{firstName}</span>
                    <i className="fa-solid fa-chevron-down lx-user-chev" />
                  </button>
                  <div className={`lx-panel lx-user-panel ${openMenu === 'user' ? 'open' : ''}`}>
                    <div className="lx-user-head">
                      <strong>{user.name || 'Guest'}</strong>
                      {user.email && <span>{user.email}</span>}
                    </div>
                    <Link to="/profile" className="lx-user-item">
                      <i className="fa-regular fa-calendar-check" /> My bookings
                    </Link>
                    <Link to="/profile" className="lx-user-item">
                      <i className="fa-regular fa-user" /> My profile
                    </Link>
                    <button type="button" className="lx-user-item lx-danger" onClick={handleLogout}>
                      <i className="fa-solid fa-arrow-right-from-bracket" /> Log out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/luxurystay/login" className="lx-signin">
                  <i className="fa-regular fa-user" />
                  <span>Sign in</span>
                </Link>
              )}

              <Link to="/hotels" className="lx-book">
                <i className="fa-solid fa-calendar-check" />
                <span>Book your stay</span>
              </Link>

              <button
                type="button"
                className="lx-burger"
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen((o) => !o)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={`lx-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`lx-drawer ${drawerOpen ? 'open' : ''}`}
        aria-label="Mobile menu"
        aria-hidden={!drawerOpen}
      >
        <div className="lx-drawer-head">
          <div className="d-flex align-items-center gap-2">
            <img
              src="/assets/images/logo.png"
              alt="LuxuryStay Logo"
              style={{
                height: 38,
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px var(--theme-primary-soft, rgba(13, 148, 136, 0.4)))',
              }}
            />
            <span className="lx-brand-name">
              Luxury<em style={{ color: 'var(--theme-secondary-light, #2DD4BF)' }}>Stay</em>
            </span>
          </div>
          <button
            type="button"
            className="lx-drawer-close"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {user && (
          <Link to="/profile" className="lx-drawer-user">
            <span className="lx-avatar lg">{initials}</span>
            <span>
              <strong>{user.name || 'Guest'}</strong>
              <small>View my bookings</small>
            </span>
          </Link>
        )}

        <nav className="lx-drawer-nav">
          {LINKS.map((item) =>
            item.dropdown ? (
              <div key={item.to}>
                <div className="lx-drawer-row">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `lx-drawer-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    className="lx-drawer-toggle"
                    aria-label="Show destinations"
                    aria-expanded={mobileDestOpen}
                    onClick={() => setMobileDestOpen((o) => !o)}
                  >
                    <i className={`fa-solid fa-chevron-down ${mobileDestOpen ? 'flip' : ''}`} />
                  </button>
                </div>
                <div className={`lx-drawer-sub ${mobileDestOpen ? 'open' : ''}`}>
                  {DESTINATIONS.map((d) => (
                    <Link
                      key={d.city}
                      to={`/hotels?city=${encodeURIComponent(d.city)}`}
                      className="lx-drawer-subitem"
                    >
                      {d.city}
                      <small>{d.tag}</small>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `lx-drawer-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="lx-drawer-foot">
          <Link to="/hotels" className="lx-book block">
            <i className="fa-solid fa-calendar-check" />
            <span>Book your stay</span>
          </Link>

          {user ? (
            <button type="button" className="lx-drawer-secondary" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket" /> Log out
            </button>
          ) : (
            <Link to="/luxurystay/login" className="lx-drawer-secondary">
              <i className="fa-regular fa-user" /> Sign in / Register
            </Link>
          )}

          <a href={PHONE_HREF} className="lx-drawer-meta">
            <i className="fa-solid fa-phone" /> {PHONE_LABEL}
          </a>
          <Link to="/luxurystaypanel/login" className="lx-drawer-meta">
            <i className="fa-solid fa-shield-halved" /> Staff portal
          </Link>
        </div>
      </aside>
    </>
  );
}

/* ───────────────────────── Styles ───────────────────────── */
const css = `
.lx-header{
  --lx-ink:var(--theme-sidebar,#0F172A);
  --lx-deep:#0A1118;
  --lx-gold:var(--theme-primary,#1B365D);
  --lx-accent:var(--theme-secondary,#ffffff);
  --lx-ivory:#F8FAFC;
  --lx-muted:#94A3B8;
  --lx-line:rgba(255,255,255,.14);
  position:sticky;top:0;left:0;right:0;width:100%;z-index:1050;
  margin:0;padding:0;
  background:rgba(10,17,24,.95);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  font-family:var(--font-body,system-ui,-apple-system,"Segoe UI",sans-serif);
  transition:background .35s ease,box-shadow .35s ease,border-color .35s ease;
}
.lx-wrap{width:100%;max-width:1320px;margin:0 auto;padding:0 1.5rem}

/* ── Home Page Transparent Overlay Mode (Over Hero Section Slider) ── */
.lx-header.is-home:not(.is-scrolled){
  position:absolute;top:0;left:0;right:0;width:100%;z-index:1050;
  background:transparent;
  box-shadow:none;
  border-bottom:none;
}
.lx-header.is-home:not(.is-scrolled) .lx-top{
  background:rgba(14,16,14,.38);
  border-bottom:1px solid rgba(255,255,255,.12);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
}
.lx-header.is-home:not(.is-scrolled) .lx-bar{
  background:transparent;
  border-bottom:1px solid rgba(255,255,255,.10);
  box-shadow:none;
}

/* ── Scrolled State (Fixed Frosted Glass Luxury Bar) ── */
.lx-header.is-scrolled{
  position:fixed;top:0;left:0;right:0;width:100%;z-index:1050;
  background:rgba(14,16,14,.95);
  -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
  box-shadow:0 10px 30px rgba(0,0,0,.45);
  border-bottom:1px solid rgba(255,255,255,.08);
}
.lx-header.is-scrolled .lx-bar{
  background:transparent;
  border-bottom:none;
  box-shadow:none;
}

/* top strip */
.lx-top{
  background:var(--lx-deep);border-bottom:1px solid var(--lx-line);
  max-height:38px;overflow:hidden;
  transition:max-height .35s ease,opacity .25s ease,border-color .35s ease;
}
.is-scrolled .lx-top{
  max-height:0;opacity:0;border-bottom-width:0;border-bottom-color:transparent;
  pointer-events:none;
}
.lx-top-inner{display:flex;justify-content:space-between;align-items:center;height:38px}
.lx-top-left,.lx-top-right{display:flex;align-items:center;gap:1.5rem}
.lx-top-link{
  display:inline-flex;align-items:center;gap:.5rem;
  font-size:.78rem;color:rgba(255,255,255,0.85);text-decoration:none;transition:color .2s;
}
.lx-top-link i{color:#fff;font-size:.72rem}
.lx-top-link:hover{color:#fff}
.lx-top-link.lx-gold{color:#fff;font-weight:600}

/* main bar */
.lx-bar{
  background:rgba(23,26,23,.9);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--lx-line);
  box-shadow:0 4px 22px rgba(0,0,0,.18);
  transition:background .3s,box-shadow .3s;
}
.is-scrolled .lx-bar{background:rgba(23,26,23,.98);box-shadow:0 12px 36px rgba(0,0,0,.45)}
.lx-bar-inner{
  display:flex;align-items:center;justify-content:space-between;gap:1.5rem;
  height:78px;
}
/* Keep bar height fixed while scrolled — height changes on sticky headers cause scroll jiggle */

/* brand */
.lx-brand{display:flex;align-items:center;gap:.75rem;text-decoration:none;flex-shrink:0}
.lx-brand-logo{
  height:48px;width:auto;object-fit:contain;flex-shrink:0;
  transition:transform .25s ease, filter .25s ease;
  filter:drop-shadow(0 2px 10px var(--theme-primary-soft, rgba(13,148,136,.45)));
}
.lx-brand:hover .lx-brand-logo{
  transform:scale(1.05);
  filter:drop-shadow(0 4px 16px var(--theme-secondary-soft, rgba(20,184,166,.55)));
}
.lx-brand-text{display:flex;flex-direction:column;line-height:1}
.lx-brand-name{
  font-family:var(--font-heading,"Playfair Display",Georgia,serif);
  font-size:1.35rem;font-weight:700;color:#fff;letter-spacing:.02em;
}
.lx-brand-name em{font-style:normal;color:var(--theme-secondary-light, #2DD4BF);transition:color .2s}
.lx-brand-sub{
  margin-top:4px;font-size:.62rem;font-weight:600;letter-spacing:.2em;
  text-transform:uppercase;color:rgba(255,255,255,.7);
}

/* desktop nav */
.lx-nav{display:flex;align-items:center;gap:.15rem;flex:1;justify-content:center}
.lx-link{
  position:relative;padding:.55rem .7rem;text-decoration:none;white-space:nowrap;
  font-size:.82rem;font-weight:500;letter-spacing:.02em;
  color:rgba(255,255,255,.82);transition:color .2s;
}
.lx-link::after{
  content:"";position:absolute;left:.7rem;right:.7rem;bottom:2px;height:2px;
  background:#fff;transform:scaleX(0);transform-origin:left;
  transition:transform .28s ease;
}
.lx-link:hover{color:#fff}
.lx-link:hover::after,.lx-link.active::after{transform:scaleX(1)}
.lx-link.active{color:#fff;font-weight:600}

/* destinations dropdown */
.lx-dd{position:relative;display:flex;align-items:center}
.lx-dd .lx-link{padding-right:.25rem}
.lx-dd .lx-link::after{right:.25rem}
.lx-caret{
  background:none;border:0;color:rgba(255,255,255,.6);cursor:pointer;
  padding:.4rem .35rem;font-size:.6rem;line-height:1;
}
.lx-caret:hover{color:#fff}
.lx-panel{
  position:absolute;top:100%;background:var(--lx-ink);
  border:1px solid var(--lx-line);border-radius:10px;
  box-shadow:0 24px 50px rgba(0,0,0,.5);
  opacity:0;visibility:hidden;transform:translateY(8px);
  transition:opacity .2s ease,transform .2s ease,visibility .2s;
}
.lx-panel.open{opacity:1;visibility:visible;transform:translateY(0)}
.lx-dest{left:50%;margin-left:-190px;width:380px;padding:1rem;margin-top:6px}
.lx-dest::before{content:"";position:absolute;top:-10px;left:0;right:0;height:10px} /* hover bridge */
.lx-dest-head{
  font-size:.72rem;color:var(--lx-muted);padding:.1rem .5rem .6rem;
  border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:.5rem;
}
.lx-dest-grid{display:grid;grid-template-columns:1fr 1fr;gap:.15rem}
.lx-dest-item{
  display:flex;flex-direction:column;gap:2px;padding:.6rem .6rem;border-radius:6px;
  text-decoration:none;transition:background .2s;
}
.lx-dest-item:hover{background:var(--theme-primary-soft, rgba(27,54,93,.14))}
.lx-dest-city{color:#fff;font-size:.9rem;font-weight:600}
.lx-dest-tag{color:var(--lx-muted);font-size:.74rem}
.lx-dest-all{
  display:block;margin-top:.5rem;padding:.65rem .5rem 0;text-align:center;
  border-top:1px solid rgba(255,255,255,.07);
  color:#fff;font-size:.8rem;font-weight:600;text-decoration:none;
}
.lx-dest-all:hover{text-decoration:underline}

/* right actions */
.lx-actions{display:flex;align-items:center;gap:.7rem;flex-shrink:0}
.lx-signin{
  display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .9rem;
  font-size:.8rem;font-weight:600;color:var(--lx-ivory);text-decoration:none;
  border:1px solid rgba(255,255,255,.25);border-radius:var(--radius-sm,4px);
  transition:background .2s,border-color .2s;
}
.lx-signin i{color:#fff}
.lx-signin:hover{background:rgba(255,255,255,.1);border-color:#fff;color:#fff}
.lx-book{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  padding:.62rem 1.2rem;font-size:.8rem;font-weight:700;letter-spacing:.04em;
  color:#FFFFFF !important;text-decoration:none;white-space:nowrap;
  background:var(--lx-gold);border:1px solid rgba(255,255,255,0.25);border-radius:var(--radius-sm,4px);
  transition:filter .2s,transform .2s;
  box-shadow:0 4px 14px var(--theme-primary-soft, rgba(27,54,93,.35));
}
.lx-book:hover{filter:brightness(1.18);color:#FFFFFF !important;transform:translateY(-1px)}
.lx-book.block{width:100%;padding:.85rem 1rem;font-size:.9rem}

/* user menu */
.lx-user{position:relative}
.lx-user-btn{
  display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;
  padding:.28rem .7rem .28rem .3rem;color:#fff;font-size:.8rem;font-weight:600;
  background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.3);border-radius:999px;
}
.lx-avatar{
  width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
  background:var(--lx-gold);color:#FFFFFF;font-size:.68rem;font-weight:700;
}
.lx-avatar.lg{width:44px;height:44px;font-size:.9rem}
.lx-user-chev{font-size:.55rem;color:rgba(255,255,255,.6)}
.lx-user-panel{right:0;width:230px;padding:.4rem;margin-top:8px}
.lx-user-head{display:flex;flex-direction:column;gap:2px;padding:.65rem .7rem;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:.3rem}
.lx-user-head strong{color:#fff;font-size:.85rem}
.lx-user-head span{color:var(--lx-muted);font-size:.74rem;overflow:hidden;text-overflow:ellipsis}
.lx-user-item{
  display:flex;align-items:center;gap:.65rem;width:100%;padding:.6rem .7rem;
  background:none;border:0;border-radius:6px;cursor:pointer;text-align:left;
  color:rgba(255,255,255,0.85);font-size:.82rem;text-decoration:none;
}
.lx-user-item i{width:16px;color:#fff;text-align:center}
.lx-user-item:hover{background:var(--theme-primary-soft, rgba(27,54,93,.14));color:#fff}
.lx-user-item.lx-danger:hover{background:rgba(220,80,80,.14)}
.lx-user-item.lx-danger:hover i{color:#E26D6D}

/* hamburger */
.lx-burger{
  display:none;width:44px;height:44px;border-radius:8px;cursor:pointer;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.25);
  flex-direction:column;justify-content:center;align-items:center;gap:5px;padding:0;
}
.lx-burger span{display:block;width:20px;height:2px;background:#fff;border-radius:2px}

/* drawer */
.lx-overlay{
  position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.6);
  opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;
}
.lx-overlay.open{opacity:1;visibility:visible}
.lx-drawer{
  position:fixed;top:0;right:0;bottom:0;z-index:1060;
  width:min(380px,88vw);display:flex;flex-direction:column;
  background:var(--lx-ink);border-left:1px solid var(--lx-line);
  transform:translateX(100%);visibility:hidden;
  transition:transform .35s cubic-bezier(.16,1,.3,1),visibility .35s;
  overflow-y:auto;
}
.lx-drawer.open{transform:translateX(0);visibility:visible}
.lx-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
.lx-drawer-close{width:40px;height:40px;border-radius:8px;cursor:pointer;color:#fff;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.25)}
.lx-drawer-user{display:flex;align-items:center;gap:.9rem;margin:1rem 1.4rem 0;padding:.8rem;border-radius:10px;text-decoration:none;background:var(--theme-primary-soft, rgba(27,54,93,.14));border:1px solid var(--lx-line)}
.lx-drawer-user strong{display:block;color:#fff;font-size:.92rem}
.lx-drawer-user small{color:var(--lx-muted);font-size:.76rem}
.lx-drawer-nav{padding:.8rem 1rem;flex:1}
.lx-drawer-row{display:flex;align-items:center}
.lx-drawer-row .lx-drawer-link{flex:1}
.lx-drawer-link{
  display:block;padding:.85rem .5rem;color:rgba(255,255,255,.88);text-decoration:none;
  font-family:var(--font-heading,"Playfair Display",Georgia,serif);
  font-size:1.2rem;border-bottom:1px solid rgba(255,255,255,.06);
}
.lx-drawer-link.active{color:#fff}
.lx-drawer-toggle{width:44px;height:44px;background:none;border:0;color:#fff;cursor:pointer}
.lx-drawer-toggle i{transition:transform .25s}
.lx-drawer-toggle i.flip{transform:rotate(180deg)}
.lx-drawer-sub{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease}
.lx-drawer-sub.open{grid-template-rows:1fr}
.lx-drawer-sub > *{overflow:hidden;min-height:0}
.lx-drawer-sub.open{padding:.3rem 0 .5rem}
.lx-drawer-subitem{
  display:flex;justify-content:space-between;align-items:baseline;
  padding:.6rem .9rem;color:rgba(255,255,255,0.85);font-size:.92rem;text-decoration:none;
}
.lx-drawer-subitem small{color:var(--lx-muted);font-size:.72rem}
.lx-drawer-subitem:hover{color:#fff}
.lx-drawer-foot{display:flex;flex-direction:column;gap:.7rem;padding:1.2rem 1.4rem 1.6rem;border-top:1px solid rgba(255,255,255,.07)}
.lx-drawer-secondary{
  display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;
  padding:.8rem;cursor:pointer;color:#fff;font-size:.88rem;font-weight:600;text-decoration:none;
  background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:var(--radius-sm,4px);
}
.lx-drawer-secondary:hover{background:rgba(255,255,255,.1)}
.lx-drawer-meta{display:flex;align-items:center;gap:.6rem;color:var(--lx-muted);font-size:.82rem;text-decoration:none}
.lx-drawer-meta i{color:#fff;width:16px}

/* keyboard focus */
.lx-header a:focus-visible,.lx-header button:focus-visible,
.lx-drawer a:focus-visible,.lx-drawer button:focus-visible{
  outline:2px solid var(--lx-gold);outline-offset:2px;
}

/* responsive */
@media (max-width:1199.98px){
  .lx-nav,.lx-top,.lx-signin,.lx-user,.lx-book:not(.block){display:none}
  .lx-burger{display:flex}
  .lx-bar-inner{height:68px}
  .lx-wrap{padding:0 1rem}
}
@media (min-width:1200px){
  .lx-overlay,.lx-drawer{display:none}
}
@media (max-width:1349.98px) and (min-width:1200px){
  .lx-link{padding:.55rem .5rem;font-size:.78rem}
  .lx-book span{display:none}
  .lx-book{padding:.62rem .8rem}
}
@media (prefers-reduced-motion:reduce){
  .lx-header *,.lx-drawer,.lx-overlay{transition:none!important}
}
`;

import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Footer() {
  const [hotelInfo, setHotelInfo] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hotel_info')) || {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    const handleStorage = () => {
      try {
        setHotelInfo(JSON.parse(localStorage.getItem('hotel_info')) || {});
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('hotel_info_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hotel_info_updated', handleStorage);
    };
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="user-footer position-relative"
      style={{
        background: 'var(--theme-primary-hover, #122642)',
        color: 'rgba(255, 255, 255, 0.72)',
        padding: '5rem 0 2rem',
        marginTop: 'auto',
        borderTop: '2px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.35))',
        fontFamily: 'var(--font-body, "Inter", sans-serif)',
      }}
    >
      <div className="container">
        <div className="row gy-5 gy-lg-0">
          {/* ── Column 1: Brand, Heritage & Tagline ── */}
          <div className="col-12 col-lg-4 pe-lg-4">
            <Link
              to="/home"
              className="text-decoration-none d-inline-flex align-items-center gap-3 mb-3"
            >
              <img
                src="/assets/images/logo.png"
                alt="LuxuryStay Hospitality Logo"
                style={{
                  height: 62,
                  width: 'auto',
                  objectFit: 'contain',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 4px 14px var(--theme-primary-soft, rgba(13, 148, 136, 0.45)))',
                  transition: 'transform 0.25s ease',
                }}
              />
              <div className="d-flex flex-column lh-1">
                <span
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    fontFamily:
                      'var(--font-heading, "Playfair Display", Georgia, serif)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Luxury
                  <span style={{ color: 'var(--theme-secondary-light, #2DD4BF)' }}>
                    Stay
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255, 255, 255, 0.75)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  Hotels &amp; Resorts
                </span>
              </div>
            </Link>

            {/* Brand Description */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                marginBottom: '1.25rem',
              }}
            >
              {hotelInfo.description ||
                'Pakistan’s premier luxury hospitality network, delivering regal service, historic charm, and contemporary comfort across Karachi, Lahore, Islamabad, Bhurban, Gwadar, and Malam Jabba.'}
            </p>

            {/* Hospitality Motto / Tagline Badge */}
            <div className="mb-4">
              <span
                className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
                style={{
                  background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.12))',
                  border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.35))',
                  color: 'var(--theme-secondary-light, #60A5FA)',
                  fontSize: '0.82rem',
                  fontStyle: 'italic',
                  fontFamily:
                    'var(--font-heading, "Playfair Display", Georgia, serif)',
                  letterSpacing: '0.04em',
                }}
              >
                <i
                  className="fa-solid fa-gem"
                  style={{ fontSize: '0.75rem' }}
                ></i>
                “Comfort, thoughtfully delivered.”
              </span>
            </div>

            {/* Genuine Social Links */}
            <div className="d-flex gap-2">
              {[
                { icon: 'fa-facebook-f', href: '#facebook', label: 'Facebook' },
                { icon: 'fa-instagram', href: '#instagram', label: 'Instagram' },
                { icon: 'fa-whatsapp', href: '#whatsapp', label: 'WhatsApp' },
                { icon: 'fa-linkedin-in', href: '#linkedin', label: 'LinkedIn' },
                { icon: 'fa-youtube', href: '#youtube', label: 'YouTube' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="d-flex align-items-center justify-content-center text-decoration-none"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))',
                    color: 'var(--theme-secondary-light, #60A5FA)',
                    fontSize: '0.88rem',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'var(--theme-primary, #1B365D)';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color =
                      'var(--theme-primary, #1B365D)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className={`fa-brands ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Explore ── */}
          <div className="col-6 col-md-4 col-lg-2 ms-lg-auto">
            <h6
              style={{
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.4rem',
              }}
            >
              Explore
            </h6>
            <ul className="list-unstyled mb-0" style={{ padding: 0 }}>
              {[
                { to: '/home', label: 'Home' },
                { to: '/room', label: 'Rooms & Suites' },
                { to: '/hotels', label: 'Hotels & Resorts' },
                { to: '/services', label: 'Experiences' },
                { to: '/restaurant', label: 'Dining' },
                { to: '/offers', label: 'Special Offers' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.to} style={{ marginBottom: '0.7rem' }}>
                  <NavLink
                    to={item.to}
                    className="text-decoration-none d-inline-flex align-items-center"
                    style={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        'var(--theme-primary, #1B365D)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i
                      className="fa-solid fa-chevron-right me-2"
                      style={{
                        fontSize: '7px',
                        color: 'var(--theme-secondary-light, #60A5FA)',
                      }}
                    ></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Guest Services ── */}
          <div className="col-6 col-md-4 col-lg-2">
            <h6
              style={{
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.4rem',
              }}
            >
              Guest Services
            </h6>
            <ul className="list-unstyled mb-0" style={{ padding: 0 }}>
              {[
                { to: '/hotels', label: 'Book Your Stay' },
                { to: '/profile', label: 'My Bookings' },
                { to: '/contact', label: 'Guest Support' },
                { to: '/faq', label: 'FAQ & Policies' },
                { to: '/about', label: 'About LuxuryStay' },
                { to: '/login', label: 'Staff Portal' },
              ].map((item) => (
                <li key={item.label} style={{ marginBottom: '0.7rem' }}>
                  <NavLink
                    to={item.to}
                    className="text-decoration-none d-inline-flex align-items-center"
                    style={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        'var(--theme-primary, #1B365D)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i
                      className="fa-solid fa-chevron-right me-2"
                      style={{
                        fontSize: '7px',
                        color: 'var(--theme-secondary-light, #60A5FA)',
                      }}
                    ></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact Details & Concierge ── */}
          <div className="col-12 col-md-4 col-lg-3">
            <h6
              style={{
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.4rem',
              }}
            >
              Contact & Concierge
            </h6>

            {/* Address */}
            <div className="d-flex gap-3 mb-3">
              <span
                style={{
                  color: 'var(--theme-secondary-light, #60A5FA)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <i className="fa-solid fa-location-dot"></i>
              </span>
              <div
                style={{
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                {hotelInfo.address ||
                  'Club Road, Civil Lines, Karachi / Mall Road, Lahore / Margalla Road, Islamabad'}
              </div>
            </div>

            {/* Central Phone */}
            <a
              href="tel:+9221111505505"
              className="d-flex align-items-center gap-3 mb-3 text-decoration-none"
              style={{
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--theme-primary, #1B365D)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            >
              <span
                style={{
                  color: 'var(--theme-secondary-light, #60A5FA)',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-phone-volume"></i>
              </span>
              <div>UAN: +92 21 111 505 505</div>
            </a>

            {/* Central Email */}
            <a
              href="mailto:reservations@theluxurystay.com"
              className="d-flex align-items-center gap-3 mb-3 text-decoration-none"
              style={{
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--theme-primary, #1B365D)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            >
              <span
                style={{
                  color: 'var(--theme-secondary-light, #60A5FA)',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-envelope"></i>
              </span>
              <div>reservations@theluxurystay.com</div>
            </a>

            {/* 24/7 Concierge Operating Box */}
            <div
              className="p-3 mt-3 rounded"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.25))',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.5,
              }}
            >
              <i
                className="fa-solid fa-bell-concierge me-2"
                style={{ color: 'var(--theme-primary, #1B365D)' }}
              ></i>
              <strong>24/7 Dedicated Concierge & Guest Services Desk.</strong>
              <div className="mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Direct support for room bookings, event reservations & private transfers.
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Copyright, Legal Links & Back to Top ── */}
        <div
          className="row mt-5 pt-4 border-top align-items-center"
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
        >
          {/* Left: Copyright & Project context */}
          <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.52)',
                fontSize: '0.82rem',
                margin: 0,
              }}
            >
              Copyright &copy; {new Date().getFullYear()}{' '}
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                LuxuryStay Hospitality — Hotels & Resorts
              </span>
              . All Rights Reserved. Aptech eProject.
            </p>
          </div>

          {/* Right: Legal Links + Smooth Back to Top Button */}
          <div className="col-12 col-md-6 d-flex flex-wrap align-items-center justify-content-center justify-content-md-end gap-3">
            <div
              className="d-flex align-items-center gap-3"
              style={{ fontSize: '0.8rem' }}
            >
              <Link
                to="/faq"
                className="text-decoration-none"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--theme-primary, #1B365D)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)')
                }
              >
                Privacy & Guest Policies
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <Link
                to="/faq"
                className="text-decoration-none"
                style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--theme-primary, #1B365D)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)')
                }
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Smooth Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="btn btn-sm d-inline-flex align-items-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.40))',
                color: 'var(--theme-primary, #1B365D)',
                borderRadius: 'var(--radius-sm, 4px)',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.85rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--theme-primary, #1B365D)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'var(--theme-primary, #1B365D)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'var(--theme-primary, #1B365D)';
                e.currentTarget.style.borderColor = 'var(--theme-primary-soft, rgba(27, 54, 93, 0.40))';
              }}
              title="Return to top of page"
            >
              <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.75rem' }}></i>
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

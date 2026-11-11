import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../Context/AuthContext';

export default function MembershipPrivilege() {
  const { user } = useAuth();

  return (
    <section className="py-5 ls-print-surface">
      <div className="container py-4">
        <div className="ls-privilege-banner">
          <div className="ls-privilege-pattern" />

          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            <div className="col-lg-8">
              <span
                style={{
                  color: 'var(--ls-gold)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Exclusive Membership
              </span>

              <h2 className="ls-serif text-white mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 600 }}>
                {user ? `Welcome to the Privilege Club, ${user.name?.split(' ')[0] || 'Member'}` : 'Join the LuxuryStay Privilege Club'}
              </h2>

              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '650px', marginBottom: '1.75rem' }}>
                Earn loyalty points after each completed paid stay (typically 1 point per PKR 100 charged). Points unlock suite upgrades, priority check-in, and dining privileges once you build a stay history — new members start at 0 until their first checkout.
              </p>

              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.2))', border: '1px solid var(--ls-gold)', display: 'grid', placeItems: 'center', color: 'var(--ls-gold)' }}>
                    <i className="fa-solid fa-coins"></i>
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 500 }}>Points on Every Stay</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.2))', border: '1px solid var(--ls-gold)', display: 'grid', placeItems: 'center', color: 'var(--ls-gold)' }}>
                    <i className="fa-solid fa-crown"></i>
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 500 }}>Complimentary Suite Upgrades</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.2))', border: '1px solid var(--ls-gold)', display: 'grid', placeItems: 'center', color: 'var(--ls-gold)' }}>
                    <i className="fa-solid fa-bell-concierge"></i>
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 500 }}>24/7 Dedicated Concierge</span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3">
                {user ? (
                  <>
                    <Link to="/profile" className="text-decoration-none">
                      <button className="ls-btn-gold px-4 py-2" style={{ fontSize: '0.88rem' }}>
                        View My Membership
                      </button>
                    </Link>
                    <Link to="/offers" className="text-decoration-none">
                      <button className="ls-btn-outline-gold px-4 py-2" style={{ fontSize: '0.88rem' }}>
                        Member Offers
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="text-decoration-none">
                      <button className="ls-btn-gold px-4 py-2" style={{ fontSize: '0.88rem' }}>
                        Enroll As Member — It's Free
                      </button>
                    </Link>
                    <Link to="/user-login" className="text-decoration-none">
                      <button className="ls-btn-outline-gold px-4 py-2" style={{ fontSize: '0.88rem' }}>
                        Member Sign In
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-4 text-center mt-4 mt-lg-0 d-none d-lg-block">
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary-soft, rgba(27, 54, 93, 0.2)) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: 16,
                  border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.40))',
                  padding: '2.5rem 1.5rem',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 10 }}>⚜️</div>
                <h4 className="ls-serif text-white mb-1">Privilege Card</h4>
                <p style={{ color: 'var(--ls-gold)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                  LuxuryStay Elite
                </p>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 15 }}>
                  Valid across all Pakistani properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOffers } from '../../../../api/offerApi';

export default function SpecialOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    getOffers()
      .then(data => {
        setOffers(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="py-5 ls-print-surface">
      <div className="container py-4">
        {/* Section Title */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
          <div>
            <span className="ls-section-tag">Curated Privileges</span>
            <h2 className="ls-section-title mb-2">Special Offers & Seasonal Packages</h2>
            <p className="ls-section-subtitle ms-0 mb-0">
              Exclusive promotional rates, seasonal mountain retreats, and bespoke celebration packages.
            </p>
          </div>
          <Link to="/offers" className="text-decoration-none mt-3 mt-md-0">
            <span className="ls-btn-outline-gold" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
              View All Offers ({offers.length}) <i className="fa-solid fa-arrow-right ms-1"></i>
            </span>
          </Link>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map(n => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="ls-card p-0" style={{ height: 350 }}>
                  <div className="ls-skeleton ls-skeleton-card" style={{ height: 180 }} />
                  <div className="p-3">
                    <div className="ls-skeleton ls-skeleton-text mb-2" style={{ width: '50%' }} />
                    <div className="ls-skeleton ls-skeleton-text" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {offers.slice(0, 3).map((offer) => (
              <div className="col-12 col-md-6 col-lg-4" key={offer._id}>
                <div className="ls-offer-card">
                  <div className="position-relative">
                    <img
                      src={offer.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                      alt={offer.title}
                      className="ls-offer-img"
                      loading="lazy"
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'var(--ls-gold)',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        borderRadius: 3,
                        textTransform: 'uppercase',
                      }}
                    >
                      {offer.badge || 'Privilege'}
                    </span>
                  </div>

                  <div className="ls-offer-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="ls-offer-code-pill mb-0" onClick={() => handleCopyCode(offer.code)} style={{ cursor: 'pointer' }} title="Click to copy promo code">
                        <i className="fa-solid fa-ticket"></i>
                        <span>{offer.code}</span>
                        <i className={`fa-solid ${copiedCode === offer.code ? 'fa-check text-success' : 'fa-copy'} ms-1`} style={{ fontSize: '0.75rem' }}></i>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ls-gray)', fontWeight: 500 }}>
                        Min {offer.minNights || 1} Night(s)
                      </span>
                    </div>

                    <h4 className="ls-serif mb-2" style={{ fontSize: '1.25rem', color: 'var(--ls-charcoal)', fontWeight: 600 }}>
                      {offer.title}
                    </h4>

                    <p className="text-muted small mb-3" style={{ lineHeight: 1.55 }}>
                      {offer.description}
                    </p>

                    <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                      <div style={{ color: 'var(--ls-gold)', fontWeight: 700, fontSize: '0.92rem' }}>
                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `PKR ${offer.discountValue?.toLocaleString()} OFF`}
                      </div>
                      <Link
                        to={`/room?promo=${encodeURIComponent(offer.code || '')}`}
                        className="text-decoration-none"
                        onClick={() => {
                          if (offer.code) {
                            try {
                              sessionStorage.setItem('pendingPromoCode', offer.code);
                            } catch { /* ignore */ }
                          }
                        }}
                      >
                        <button className="ls-btn-gold" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}>
                          Claim Offer
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


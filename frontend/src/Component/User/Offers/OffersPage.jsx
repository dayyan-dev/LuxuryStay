import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOffers } from '../../../api/offerApi';

export default function OffersPage() {
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

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div style={{ background: 'var(--ls-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      <div
        className="py-5 text-white position-relative"
        style={{
          background: "linear-gradient(rgba(41, 39, 34, 0.78), rgba(41, 39, 34, 0.9)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80') center/cover",
          borderBottom: '1px solid var(--ls-border-warm)',
        }}
      >
        <div className="container py-4 text-center">
          <span className="ls-section-tag" style={{ color: 'var(--ls-gold)' }}>Privileges & Promotions</span>
          <h1 className="ls-serif display-5 fw-bold mb-2 text-white">Special Offers & Packages</h1>
          <p className="lead mx-auto mb-0" style={{ maxWidth: '650px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
            Elevate your stay with our curated promotional packages, seasonal mountain retreats, and exclusive member privileges.
          </p>
        </div>
      </div>

      <div className="container mt-5">
        {loading && (
          <div className="text-center py-5">
            <div className="ls-loader mx-auto mb-3" />
            <p className="text-muted">Loading current offers...</p>
          </div>
        )}

        {!loading && offers.length === 0 && (
          <div className="text-center py-5 bg-white rounded-3 p-5 border" style={{ borderColor: 'var(--ls-border-warm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
            <h3 className="ls-serif mb-2">No Active Offers Right Now</h3>
            <p className="text-muted mb-4">Please check back soon for seasonal promotional packages.</p>
            <Link to="/room" className="text-decoration-none">
              <button className="ls-btn-gold">View Standard Room Rates</button>
            </Link>
          </div>
        )}

        {!loading && offers.length > 0 && (
          <div className="row g-4">
            {offers.map((offer) => (
              <div className="col-12 col-md-6 col-lg-6" key={offer._id}>
                <div className="ls-offer-card h-100 bg-white">
                  <div className="row g-0 h-100">
                    <div className="col-md-5">
                      <img
                        src={offer.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                        alt={offer.title}
                        style={{ width: '100%', height: '100%', minHeight: '240px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-7 d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-dark text-gold" style={{ color: 'var(--ls-gold)', letterSpacing: '0.08em' }}>
                          {offer.badge || 'PROMOTION'}
                        </span>
                        <span className="small text-muted">
                          Min {offer.minNights || 1} Night(s)
                        </span>
                      </div>

                      <h3 className="ls-serif fs-4 mb-2">{offer.title}</h3>
                      <p className="small text-muted mb-3" style={{ lineHeight: 1.55 }}>
                        {offer.description}
                      </p>

                      <div className="mb-3">
                        <div
                          className="ls-offer-code-pill cursor-pointer"
                          onClick={() => handleCopy(offer.code)}
                          title="Click to copy promo code"
                          style={{ cursor: 'pointer' }}
                        >
                          <i className="fa-solid fa-ticket"></i>
                          <span>{offer.code}</span>
                          <i className={`fa-solid ${copiedCode === offer.code ? 'fa-check text-success' : 'fa-copy'} ms-1`}></i>
                        </div>
                        {copiedCode === offer.code && (
                          <span className="small text-success ms-2 fw-bold">Copied to clipboard!</span>
                        )}
                      </div>

                      {offer.terms && offer.terms.length > 0 && (
                        <div className="small text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                          <strong>Terms:</strong> {offer.terms[0]}
                        </div>
                      )}

                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div className="fw-bold" style={{ color: 'var(--ls-gold)' }}>
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
                          <button className="ls-btn-gold px-3 py-2" style={{ fontSize: '0.82rem' }}>
                            Book With Code <i className="fa-solid fa-arrow-right ms-1"></i>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


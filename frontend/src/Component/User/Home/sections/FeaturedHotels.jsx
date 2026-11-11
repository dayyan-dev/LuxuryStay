import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeatureHotels } from '../../../../api/hotelApi';
import Reveal from '../../effects/Reveal';
import TiltCard from '../../effects/TiltCard';

export default function FeatuHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureHotels()
      .then(data => {
        setHotels(data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-5 ls-print-surface">
      <div className="container py-4">
        {/* Header */}
        <Reveal className="text-center mb-5">
          <span className="ls-section-tag">Destinations & Stays</span>
          <h2 className="ls-section-title">Our Featured Hotels & Resorts</h2>
          <p className="ls-section-subtitle">
            From the Arabian Sea coastline in Gwadar to the misty pines of Bhurban, discover refined comfort in Pakistan's most enchanting destinations.
          </p>
        </Reveal>

        {/* Loading skeleton */}
        {loading && (
          <div className="row g-4">
            {[1, 2, 3].map(n => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="ls-card p-0" style={{ height: 420 }}>
                  <div className="ls-skeleton ls-skeleton-card" style={{ height: 220 }} />
                  <div className="p-3">
                    <div className="ls-skeleton ls-skeleton-text mb-2" style={{ width: '40%' }} />
                    <div className="ls-skeleton ls-skeleton-text mb-3" style={{ width: '80%' }} />
                    <div className="ls-skeleton ls-skeleton-text" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hotels Grid */}
        {!loading && hotels.length > 0 && (
          <div className="row g-4 ls-depth-scene">
            {hotels.map((hotel, index) => (
              <Reveal
                className="col-12 col-md-6 col-lg-4"
                key={hotel._id}
                delay={Math.min(index * 0.08, 0.32)}
              >
                <TiltCard maxTilt={5} glare={false}>
                  <div className="ls-hotel-card">
                    <div className="ls-hotel-img-wrap">
                      <img
                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'}
                        alt={hotel.name}
                        className="ls-hotel-img"
                        loading="lazy"
                      />
                      <span className="ls-hotel-badge">{hotel.city}</span>
                      <div className="ls-hotel-rating">
                        <i className="fa-solid fa-star text-warning"></i>
                        <span>{hotel.rating?.toFixed(1) || '4.9'}</span>
                      </div>
                    </div>

                    <div className="ls-hotel-body">
                      <div className="ls-hotel-city">
                        <i className="fa-solid fa-location-dot me-1"></i> {hotel.city}, Pakistan
                      </div>
                      <h3 className="ls-hotel-title">{hotel.name}</h3>
                      <p className="ls-hotel-desc">
                        {hotel.description?.length > 125 ? `${hotel.description.slice(0, 125)}...` : hotel.description}
                      </p>

                      <div className="ls-hotel-facilities">
                        {(hotel.facilities || []).slice(0, 3).map((f, i) => (
                          <span key={i} className="ls-facility-pill">
                            <i className="fa-solid fa-check me-1 text-gold" style={{ color: 'var(--ls-gold)', fontSize: '0.65rem' }}></i>
                            {f}
                          </span>
                        ))}
                      </div>

                      <div className="ls-hotel-footer mt-auto">
                        <div>
                          <div className="ls-hotel-price-label">Starting From</div>
                          <div className="ls-hotel-price">
                            PKR {(hotel.startingPrice || 22000).toLocaleString()}
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ls-gray)' }}> / night</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Link to={`/hotels/${hotel._id}`} className="text-decoration-none">
                            <button className="ls-btn-outline-gold" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                              Details
                            </button>
                          </Link>
                          <Link to={`/hotels/${hotel._id}`} className="text-decoration-none">
                            <button className="ls-btn-gold" style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem' }}>
                              Book
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}

        {/* View All Destinations Button */}
        <div className="text-center mt-5">
          <Link to="/hotels" className="text-decoration-none">
            <button className="ls-btn-outline-gold px-4 py-2" style={{ fontSize: '0.92rem' }}>
              <i className="fa-solid fa-compass me-2"></i> Explore All LuxuryStay Destinations
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}


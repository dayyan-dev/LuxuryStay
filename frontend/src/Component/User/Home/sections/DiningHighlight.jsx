import React from 'react';
import { Link } from 'react-router-dom';

const diningSanctuaries = [
  {
    name: 'Dumpukht — Royal Mughlai',
    cuisine: 'Authentic Nawabi & Mughal Delicacies',
    description: 'Slow-cooked in sealed clay handis over fragrant charcoal embers, reviving the culinary traditions of Awadh and Lahore.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    timing: 'Dinner: 7:00 PM – 11:30 PM',
  },
  {
    name: 'Sakura — Pan-Asian & Teppanyaki',
    cuisine: 'Japanese Teppan & Fresh Sashimi',
    description: 'Master chefs craft live teppanyaki theatre and exquisite sushi rolls utilizing the freshest marine catches from Gwadar and Tokyo.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    timing: 'Lunch & Dinner: 12:30 PM – 11:00 PM',
  },
  {
    name: 'The Terrace Lounge & Grill',
    cuisine: 'Prime Steaks & Wood-fi Artisan Grills',
    description: 'Al fresco dining under the stars with panoramic views of the Margalla Hills or Karachi skyline, accompanied by live classical music.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    timing: 'Evening: 6:00 PM – Midnight',
  },
];

export default function DiningHighlight() {
  return (
    <section className="py-5" style={{ background: 'var(--ls-charcoal)', color: '#FFFFFF' }}>
      <div className="container py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="ls-section-tag" style={{ color: 'var(--ls-gold)' }}>Gastronomic Excellence</span>
          <h2 className="ls-section-title text-white">Award-Winning Culinary Sanctuaries</h2>
          <p className="ls-section-subtitle" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Each LuxuryStay destination hosts signature culinary experiences, presenting heirloom Pakistani flavors and sophisticated world gastronomy.
          </p>
        </div>

        {/* 3 Dining Cards */}
        <div className="row g-4 mb-4">
          {diningSanctuaries.map((d, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i}>
              <div
                style={{
                  background: '#202020',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.25))',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                }}
              >
                <div style={{ height: 220, overflow: 'hidden' }}>
                  <img
                    src={d.image}
                    alt={d.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <span style={{ color: 'var(--ls-gold)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {d.cuisine}
                  </span>
                  <h3 className="ls-serif my-2" style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>
                    {d.name}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                    {d.description}
                  </p>
                  <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                      <i className="fa-regular fa-clock me-1 text-gold" style={{ color: 'var(--ls-gold)' }}></i> {d.timing}
                    </span>
                    <Link to="/restaurant" className="text-decoration-none">
                      <span style={{ color: 'var(--ls-gold)', fontSize: '0.82rem', fontWeight: 600 }}>
                        View Menu <i className="fa-solid fa-arrow-right ms-1"></i>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="text-center pt-3">
          <Link to="/restaurant" className="text-decoration-none">
            <button className="ls-btn-gold px-4 py-2" style={{ fontSize: '0.9rem' }}>
              <i className="fa-solid fa-utensils me-2"></i> Explore All Dining & Room Service
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}


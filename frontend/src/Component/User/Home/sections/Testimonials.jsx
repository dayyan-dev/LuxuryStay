import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../Context/AuthContext';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <i
      key={i}
      className={`fa-star ${i < rating ? 'fa-solid text-warning' : 'fa-regular text-muted'}`}
      style={{ fontSize: '12px' }}
    />
  ));
};

const getInitials = (name = '') => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const AVATAR_COLORS = ['var(--theme-primary, #1B365D)', '#e67e22', '#9b59b6', '#3498db', '#27ae60', '#CC5B55'];

const getAvatarColor = (name = '') => {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const FALLBACK = [
  {
    _id: '1', name: 'Dennis Jacques', rating: 5,
    review: 'Booking was seamless and the suite exceeded our expectations — warm service from arrival to checkout.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2', name: 'Patrick Cary', rating: 5,
    review: 'We hosted our anniversary celebration here, and it was simply perfect. The event team handled every detail flawlessly.',
    createdAt: new Date().toISOString(),
  },
];

export default function Testimonials() {
  const { user, token } = useAuth();
  const isLoggedIn = Boolean(user && token);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/feedbacks/public`)
      .then(res => res.json())
      .then(data => {
        // Hide inquiry submissions from public guest quotes
        const valid = Array.isArray(data)
          ? data.filter((f) => f.review && !String(f.review).startsWith('[Guest Inquiry]'))
          : [];
        setFeedbacks(valid.length ? valid : FALLBACK);
        setLoading(false);
      })
      .catch(() => {
        setFeedbacks(FALLBACK);
        setLoading(false);
      });
  }, []);

  const [current, setCurrent] = useState(0);
  const display = feedbacks.length ? feedbacks : FALLBACK;
  const total = display.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <section className="section">
      <div className="container">

        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Our Feedbacks
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            What Our <span className="text-primary">Guests Say <br className="d-none d-md-block" />About</span> Hotel The Luxury Stay
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : display.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa-regular fa-comment-dots" style={{ fontSize: '3rem', color: 'var(--theme-primary, #1B365D)', opacity: 0.5 }}></i>
            <p className="mt-3 text-muted fs-5">No feedback yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="position-relative wow fadeInUp">
            {/* Cards */}
            <div className="row g-4">
              {(total === 1 ? [display[0]] : [display[current], display[(current + 1) % total]].slice(0, total)).map((item, idx) => (
                <div key={item._id} className={`col-12 ${total > 1 ? 'col-md-6' : ''}`}>
                  <div className="bg-white rounded-5 p-5 h-100 d-flex flex-column justify-content-between">

                    <div className="d-flex gap-1 mb-3">
                      {renderStars(item.rating)}
                    </div>

                    <p className="lh-lg text-body-secondary flex-grow-1">
                      "{item.review}"
                    </p>

                    {item.adminReply && (
                      <div
                        className="mt-3 p-3 rounded-4"
                        style={{ background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.08))', borderLeft: '3px solid var(--theme-primary, #1B365D)' }}
                      >
                        <div className="text-2 fw-600 text-primary mb-1">
                          <i className="fa-solid fa-reply me-1" /> Hotel Response
                        </div>
                        <p className="text-2 text-body-secondary mb-0">{item.adminReply}</p>
                      </div>
                    )}

                    <hr className="my-3 opacity-1" />

                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 46, height: 46,
                          background: getAvatarColor(item.name),
                          color: '#fff', fontWeight: 700, fontSize: 14,
                        }}
                      >
                        {getInitials(item.name)}
                      </div>
                      <div>
                        <h3 className="text-4 fw-600 mb-0">{item.name}</h3>
                        <div className="text-2 text-body-tertiary">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="ms-auto">
                        <span
                          className="rounded-pill px-3 py-1 text-2 fw-700"
                          style={{
                            background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.1))',
                            color: 'var(--theme-primary, #1B365D)',
                            border: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))',
                          }}
                        >
                          {item.rating}.0 ★
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
            ))}
            </div>

            {/* Navigation Arrows */}
            {total > 2 && (
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button
                  onClick={prev}
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '2px solid var(--theme-primary, #1B365D)',
                    background: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--theme-primary, #1B365D)', fontSize: '18px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--theme-primary, #1B365D)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--theme-primary, #1B365D)'; }}
                >
                  <i className="fa-solid fa-angle-left" />
                </button>
                <button
                  onClick={next}
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '2px solid var(--theme-primary, #1B365D)',
                    background: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: 'var(--theme-primary, #1B365D)', fontSize: '18px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--theme-primary, #1B365D)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--theme-primary, #1B365D)'; }}
                >
                  <i className="fa-solid fa-angle-right" />
                </button>
              </div>
            )}

            {/* Dots */}
            {total > 2 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                {display.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} style={{
                    width: i === current ? 24 : 8, height: 8,
                    borderRadius: 4, border: 'none', padding: 0,
                    background: i === current ? 'var(--theme-primary, #1B365D)' : '#ddd',
                    transition: 'all 0.3s', cursor: 'pointer',
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="fw-500 text-center mt-4 wow fadeInUp">
          {isLoggedIn ? (
            <>
              Share Your Experience{' '}
              <Link
                to="/rooms#guest-feedback"
                className="fw-600 link-primary link-offset-2 link-underline-opacity-100 link-underline-opacity-0-hover"
              >
                Write Feedback Below Rooms
              </Link>
            </>
          ) : (
            <>
              Want to share your stay experience?{' '}
              <Link
                to="/luxurystay/register"
                state={{ from: '/rooms#guest-feedback' }}
                className="fw-600 link-primary link-offset-2 link-underline-opacity-100 link-underline-opacity-0-hover"
              >
                Register
              </Link>
              {' '}or{' '}
              <Link
                to="/luxurystay/login"
                state={{ from: '/rooms#guest-feedback' }}
                className="fw-600 link-primary link-offset-2 link-underline-opacity-100 link-underline-opacity-0-hover"
              >
                Sign In to Leave Feedback
              </Link>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
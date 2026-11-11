import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { getHotelCities } from '../../../../api/hotelApi';
import { loadStaySearch, saveStaySearch } from '../../../../utils/staySearch';

const SLIDES = [
  {
    id: 'karachi',
    tag: 'Flagship Grandeur • Karachi',
    title: 'Where Arabian Sea Breeze Meets Pure Opulence',
    subtitle:
      'Experience 5-star ocean-view suites, temperature-controlled infinity pools, and signature fine dining in Pakistan’s bustling financial capital.',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=85',
    city: 'Karachi',
    ctaLink: '/hotels?city=Karachi',
  },
  {
    id: 'lahore',
    tag: 'Heritage & Grandeur • Lahore',
    title: 'Timeless Mughal Splendor in Modern Comfort',
    subtitle:
      'Nestled along historic Mall Road, featuring regal courtyard pavilions, tranquil water fountains, handcrafted suites, and world-class banquet halls.',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=85',
    city: 'Lahore',
    ctaLink: '/hotels?city=Lahore',
  },
  {
    id: 'islamabad',
    tag: 'Executive Sanctuary • Islamabad',
    title: 'Serenity Beneath the Pine-Clad Margalla Hills',
    subtitle:
      'Panoramic floor-to-ceiling mountain vistas, diplomatic enclave suites, private club lounges, and bespoke concierge hospitality.',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=85',
    city: 'Islamabad',
    ctaLink: '/hotels?city=Islamabad',
  },
  {
    id: 'bhurban',
    tag: 'Alpine Chalet Retreat • Bhurban',
    title: 'Misty Pine Peaks, Crisp Air & Fireside Luxury',
    subtitle:
      'Wake up above the clouds with breathtaking Himalayan valley views, cedarwood balconies, heated spa pools, and private roaring fireplaces.',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=85',
    city: 'Bhurban',
    ctaLink: '/hotels?city=Bhurban',
  },
  {
    id: 'gwadar',
    tag: 'Coastal Sanctuary • Gwadar',
    title: 'Sunset Waters & Pristine Golden Shorelines',
    subtitle:
      'Secluded seaside cabanas, fresh Arabian catch seafood pavilions, and untouched coastal tranquility on Pakistan’s southern jewel.',
    image:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=85',
    city: 'Gwadar',
    ctaLink: '/hotels?city=Gwadar',
  },
];

export default function Intro() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Quick Booking Engine State
  const [cities, setCities] = useState([]);
  const [destination, setDestination] = useState(() => loadStaySearch().city || '');
  const [checkIn, setCheckIn] = useState(() => loadStaySearch().checkIn || '');
  const [checkOut, setCheckOut] = useState(() => loadStaySearch().checkOut || '');
  const [guests, setGuests] = useState(() => loadStaySearch().guests || '2');
  const [rooms, setRooms] = useState(() => loadStaySearch().rooms || '1');

  const today = new Date().toISOString().split('T')[0];

  // Parallax Scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  // Autoplay Slider Timer
  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  useEffect(() => {
    getHotelCities()
      .then((data) => setCities(data || []))
      .catch(() =>
        setCities([
          'Karachi',
          'Lahore',
          'Islamabad',
          'Bhurban',
          'Gwadar',
          'Malam Jabba',
        ])
      );
  }, []);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    if (!checkOut || checkOut <= val) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Please select both check-in and check-out dates.');
      return;
    }
    if (checkOut <= checkIn) {
      alert('Check-out must be after check-in.');
      return;
    }
    const stay = {
      city: destination || '',
      checkIn,
      checkOut,
      guests: guests || '2',
      rooms: rooms || '1',
    };
    saveStaySearch(stay);

    const query = new URLSearchParams();
    if (destination) query.set('city', destination);
    query.set('checkIn', checkIn);
    query.set('checkOut', checkOut);
    if (guests) query.set('guests', guests);
    if (rooms) query.set('rooms', rooms);

    navigate(`/hotels?${query.toString()}`);
  };

  const current = SLIDES[activeSlide];

  return (
    <section
      ref={sectionRef}
      className="position-relative d-flex flex-column justify-content-between text-white"
      style={{
        minHeight: '100vh',
        padding: '8.5rem 0 3.5rem',
        overflow: 'hidden',
        background: '#141614',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── 1. CINEMATIC SLIDER BACKGROUNDS (Crossfade) ── */}
      <div className="position-absolute inset-0 w-100 h-100" style={{ zIndex: 1, top: 0, left: 0 }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${current.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>

        {/* Charcoal & Vignette Luxury Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(14, 16, 14, 0.60) 0%, rgba(14, 16, 14, 0.48) 40%, rgba(14, 16, 14, 0.88) 100%)',
            zIndex: 2,
          }}
        />

        {/* Warm Taupe radial atmosphere */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 70% 50% at 50% 30%, var(--theme-primary-soft, rgba(27, 54, 93, 0.18)), transparent 70%)',
          }}
        />
      </div>

      {/* ── 2. CAROUSEL PREV / NEXT NAVIGATION CONTROLS ── */}
      <button
        type="button"
        className="ls-slider-nav-btn ls-slider-prev"
        onClick={prevSlide}
        aria-label="Previous Slide"
        style={{
          position: 'absolute',
          top: '46%',
          left: '24px',
          zIndex: 15,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          background: 'rgba(23, 26, 23, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--theme-primary, #0D9488)';
          e.currentTarget.style.borderColor = 'var(--theme-primary, #0D9488)';
          e.currentTarget.style.transform = 'scale(1.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(23, 26, 23, 0.55)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '18px' }}></i>
      </button>

      <button
        type="button"
        className="ls-slider-nav-btn ls-slider-next"
        onClick={nextSlide}
        aria-label="Next Slide"
        style={{
          position: 'absolute',
          top: '46%',
          right: '24px',
          zIndex: 15,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          background: 'rgba(23, 26, 23, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--theme-primary, #0D9488)';
          e.currentTarget.style.borderColor = 'var(--theme-primary, #0D9488)';
          e.currentTarget.style.transform = 'scale(1.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(23, 26, 23, 0.55)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <i className="fa-solid fa-chevron-right" style={{ fontSize: '18px' }}></i>
      </button>

      {/* ── 3. HERO SLIDER CONTENT ── */}
      <motion.div
        className="container position-relative py-3 my-auto text-center"
        style={{
          zIndex: 5,
          y: reduceMotion ? 0 : contentY,
          opacity: reduceMotion ? 1 : contentOpacity,
        }}
      >
        <div className="mx-auto" style={{ maxWidth: '920px' }}>
          {/* Animated Slide Badges */}
          <div className="mb-3 d-flex flex-wrap justify-content-center gap-2">
            <span
              className="d-inline-flex align-items-center gap-2 px-3 py-1"
              style={{
                background: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.22))',
                border: '1px solid var(--theme-secondary-soft, rgba(37, 99, 235, 0.20))',
                color: 'var(--theme-bg-primary, #F8FAFC)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '4px',
              }}
            >
              <i className="fa-solid fa-crown" style={{ fontSize: '0.72rem', color: 'var(--theme-primary, #1B365D)' }}></i>
              {current.tag}
            </span>

            <span
              className="d-inline-flex align-items-center gap-2 px-3 py-1"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '0.76rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                borderRadius: '4px',
              }}
            >
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              Destination 0{activeSlide + 1} / 0{SLIDES.length}
            </span>
          </div>

          {/* Animated Slide Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.id + '-title'}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
                fontSize: 'clamp(2.3rem, 5vw, 4.15rem)',
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
                marginBottom: '1rem',
              }}
            >
              {current.title}
            </motion.h1>
          </AnimatePresence>

          {/* Animated Slide Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={current.id + '-sub'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lead mx-auto mb-4"
              style={{
                color: 'rgba(247, 245, 240, 0.92)',
                fontSize: 'clamp(0.98rem, 1.7vw, 1.16rem)',
                fontWeight: 300,
                maxWidth: '740px',
                lineHeight: 1.65,
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              }}
            >
              {current.subtitle}
            </motion.p>
          </AnimatePresence>

          {/* Call to Actions */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
            <Link to={current.ctaLink} className="text-decoration-none">
              <button
                type="button"
                className="ls-btn ls-btn-primary"
                style={{
                  padding: '0.85rem 2.2rem',
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  borderRadius: 'var(--radius-sm, 6px)',
                  boxShadow: '0 8px 24px var(--theme-primary-soft, rgba(27, 54, 93, 0.35))',
                }}
              >
                <i className="fa-solid fa-hotel me-2"></i>
                Explore {current.city} Property
              </button>
            </Link>

            <Link to="/room" className="text-decoration-none">
              <button
                type="button"
                className="ls-btn ls-btn-outline"
                style={{
                  padding: '0.85rem 2.2rem',
                  fontSize: '0.9rem',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.55)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <i className="fa-solid fa-door-open me-2"></i>
                View All Rooms
              </button>
            </Link>
          </div>

          {/* ── Slide Pagination Bars / Indicators (Enlarged for Easy Scroll/Navigation) ── */}
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${s.city}`}
                style={{
                  width: activeSlide === idx ? '50px' : '16px',
                  height: '10px',
                  borderRadius: '999px',
                  border: 'none',
                  background:
                    activeSlide === idx
                      ? 'var(--theme-primary, #0D9488)'
                      : 'rgba(255, 255, 255, 0.50)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── 4. QUICK BOOKING ENGINE PANEL ── */}
        <motion.div
          id="hero-booking-panel"
          className="ls-search-engine mt-4"
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.98)',
            color: 'var(--theme-text-dark, #292722)',
            borderRadius: 'var(--radius-md, 12px)',
            padding: '1.4rem 1.6rem',
            border: '1px solid var(--theme-border, #E8E2D9)',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)',
            position: 'relative',
            zIndex: 10,
            textAlign: 'left',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-6 col-lg-3">
                <label className="ls-label d-flex align-items-center gap-1 mb-2 fw-semibold" style={{ fontSize: 13, color: 'var(--theme-text-dark, #0F172A)' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                  Destination / Hotel
                </label>
                <select
                  className="form-select"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: '46px',
                    fontWeight: 500,
                    border: '1px solid var(--theme-border, #E8E2D9)',
                  }}
                >
                  <option value="">All Destinations (Pakistan)</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c} — LuxuryStay Resort
                    </option>
                  ))}
                  {cities.length === 0 && (
                    <>
                      <option value="Karachi">Karachi — Flagship</option>
                      <option value="Lahore">Lahore — Grand Mall</option>
                      <option value="Islamabad">Islamabad — Margalla</option>
                      <option value="Bhurban">Bhurban — Alpine Resort</option>
                      <option value="Gwadar">Gwadar — Coastal Sanctuary</option>
                      <option value="Malam Jabba">Malam Jabba — Ski Resort</option>
                    </>
                  )}
                </select>
              </div>

              <div className="col-6 col-md-3 col-lg-2">
                <label className="ls-label d-flex align-items-center gap-1 mb-2 fw-semibold" style={{ fontSize: 13, color: 'var(--theme-text-dark, #0F172A)' }}>
                  <i className="fa-regular fa-calendar-check" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                  Check-In
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={today}
                  value={checkIn}
                  onChange={handleCheckInChange}
                  required
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: '46px',
                    border: '1px solid var(--theme-border, #E8E2D9)',
                  }}
                />
              </div>

              <div className="col-6 col-md-3 col-lg-2">
                <label className="ls-label d-flex align-items-center gap-1 mb-2 fw-semibold" style={{ fontSize: 13, color: 'var(--theme-text-dark, #0F172A)' }}>
                  <i className="fa-regular fa-calendar-xmark" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                  Check-Out
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: '46px',
                    border: '1px solid var(--theme-border, #E8E2D9)',
                  }}
                />
              </div>

              <div className="col-6 col-md-3 col-lg-1">
                <label className="ls-label d-flex align-items-center gap-1 mb-2 fw-semibold" style={{ fontSize: 13, color: 'var(--theme-text-dark, #0F172A)' }}>
                  <i className="fa-solid fa-user-group" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                  Guests
                </label>
                <select
                  className="form-select px-2"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: '46px',
                    fontWeight: 500,
                    border: '1px solid var(--theme-border, #E8E2D9)',
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="col-6 col-md-3 col-lg-1">
                <label className="ls-label d-flex align-items-center gap-1 mb-2 fw-semibold" style={{ fontSize: 13, color: 'var(--theme-text-dark, #0F172A)' }}>
                  <i className="fa-solid fa-bed" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
                  Rooms
                </label>
                <select
                  className="form-select px-2"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: '46px',
                    fontWeight: 500,
                    border: '1px solid var(--theme-border, #E8E2D9)',
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="col-12 col-lg-3">
                <button
                  type="submit"
                  className="ls-btn ls-btn-primary w-100"
                  style={{
                    height: '46px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.88rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    boxShadow: '0 6px 18px var(--theme-primary-soft, rgba(27, 54, 93, 0.35))',
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass me-2"></i>
                  Check Availability
                </button>
              </div>
            </div>
          </form>

          {/* Luxury Value Pillars */}
          <div className="d-flex flex-wrap justify-content-center justify-content-md-between align-items-center gap-3 pt-3 mt-3 border-top border-light-subtle">
            <span
              className="d-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.76rem', color: 'var(--theme-text-secondary, #475569)', fontWeight: 500 }}
            >
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              Best Direct Rate Guarantee
            </span>
            <span
              className="d-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.76rem', color: 'var(--theme-text-secondary, #475569)', fontWeight: 500 }}
            >
              <i className="fa-solid fa-wifi" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              Complimentary High-Speed Wi-Fi
            </span>
            <span
              className="d-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.76rem', color: 'var(--theme-text-secondary, #475569)', fontWeight: 500 }}
            >
              <i className="fa-solid fa-arrow-rotate-left" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              Flexible Cancellation Options
            </span>
            <span
              className="d-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.76rem', color: 'var(--theme-text-secondary, #475569)', fontWeight: 500 }}
            >
              <i className="fa-solid fa-bell-concierge" style={{ color: 'var(--theme-primary, #1B365D)' }}></i>
              24/7 Dedicated Concierge
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

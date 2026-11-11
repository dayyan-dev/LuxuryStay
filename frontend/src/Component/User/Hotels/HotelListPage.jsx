import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getHotels, getHotelCities } from '../../../api/hotelApi';
import { saveStaySearch } from '../../../utils/staySearch';

export default function HotelListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'All';
  const skipOnceRef = useRef(false);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';
  const roomsNeeded = searchParams.get('rooms') || '';

  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stayQuery = useMemo(() => {
    const q = new URLSearchParams();
    if (checkIn) q.set('checkIn', checkIn);
    if (checkOut) q.set('checkOut', checkOut);
    if (guests) q.set('guests', guests);
    if (roomsNeeded) q.set('rooms', roomsNeeded);
    const s = q.toString();
    return s ? `?${s}` : '';
  }, [checkIn, checkOut, guests, roomsNeeded]);

  useEffect(() => {
    if (checkIn || checkOut || guests || roomsNeeded || (initialCity && initialCity !== 'All')) {
      saveStaySearch({
        checkIn,
        checkOut,
        guests,
        rooms: roomsNeeded,
        city: initialCity !== 'All' ? initialCity : '',
      });
    }
  }, [checkIn, checkOut, guests, roomsNeeded, initialCity]);

  useEffect(() => {
    getHotelCities()
      .then(data => setCities(['All', ...(data || [])]))
      .catch(() => setCities(['All', 'Karachi', 'Lahore', 'Islamabad', 'Bhurban', 'Gwadar', 'Malam Jabba']));
  }, []);

  const fetchHotels = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (selectedCity && selectedCity !== 'All') params.city = selectedCity;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (maxPrice) params.maxPrice = maxPrice;

    getHotels(params)
      .then(res => {
        const list = res.data || [];
        setHotels(list);
        setLoading(false);
        // From stay search with a city: if only one property, go straight to rooms
        const cityScoped = selectedCity && selectedCity !== 'All';
        const hasStay = Boolean(checkIn && checkOut);
        if (
          !skipOnceRef.current &&
          cityScoped &&
          hasStay &&
          list.length === 1 &&
          list[0]?._id
        ) {
          skipOnceRef.current = true;
          navigate(`/hotels/${list[0]._id}${stayQuery}`, { replace: true });
        }
      })
      .catch(() => {
        setError('Unable to load hotels at this time. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    const newParams = new URLSearchParams(searchParams);
    if (city === 'All') newParams.delete('city');
    else newParams.set('city', city);
    setSearchParams(newParams);
  };

  const hotelStartPrice = (hotel) => {
    if (hotel.startingPrice != null && hotel.startingPrice > 0) return hotel.startingPrice;
    if (hotel.minPrice != null && hotel.minPrice > 0) return hotel.minPrice;
    return null;
  };

  return (
    <div className="ls-print-surface" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Page Hero Banner */}
      <div
        className="py-5 text-white position-relative"
        style={{
          background: "linear-gradient(rgba(41, 39, 34, 0.78), rgba(41, 39, 34, 0.9)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80') center/cover",
          borderBottom: '1px solid var(--ls-border-warm)',
        }}
      >
        <div className="container py-4 text-center">
          <span className="ls-section-tag" style={{ color: 'var(--ls-gold)' }}>Destinations Across Pakistan</span>
          <h1 className="ls-serif display-5 fw-bold mb-2 text-white">Hotels & Resorts</h1>
          <p className="lead mx-auto mb-0" style={{ maxWidth: '650px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
            Explore LuxuryStay's collection of five-star urban sanctuaries, historic grand hotels, and serene alpine resorts.
          </p>
        </div>
      </div>

      <div className="container mt-4">
        {(checkIn || checkOut || guests) && (
          <div
            className="alert border mb-4 d-flex flex-wrap align-items-center justify-content-between gap-2"
            style={{ background: 'var(--ls-ivory)', borderColor: 'var(--ls-border-warm)' }}
          >
            <div className="small mb-0">
              <strong>Your stay search:</strong>{' '}
              {checkIn && checkOut ? (
                <span>
                  {checkIn} → {checkOut}
                </span>
              ) : (
                <span className="text-muted">Dates not set</span>
              )}
              {guests ? ` · ${guests} guest(s)` : ''}
              {roomsNeeded ? ` · ${roomsNeeded} room(s)` : ''}
              <span className="text-muted d-block mt-1">
                Select a property, then choose a room — your dates carry into booking.
              </span>
            </div>
            <Link to="/home" className="ls-btn-outline-gold" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              Edit Search
            </Link>
          </div>
        )}

        {/* City Filter Pills */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 py-2">
          {cities.map((city) => (
            <button
              key={city}
              className={`ls-filter-pill ${selectedCity === city ? 'active' : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              {city === 'All' ? 'All Destinations' : city}
            </button>
          ))}
        </div>

        {/* Search & Price Filter Bar */}
        <div className="bg-white p-3 rounded-3 shadow-sm border mb-4" style={{ borderColor: 'var(--ls-border-warm)' }}>
          <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search hotel name, location, or facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-3">
              <select
                className="form-select"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="">Any Starting Price</option>
                <option value="22000">Up to PKR 22,000</option>
                <option value="25000">Up to PKR 25,000</option>
                <option value="30000">Up to PKR 30,000</option>
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button type="submit" className="ls-btn-gold w-100 py-2" style={{ fontSize: '0.85rem' }}>
                Filter
              </button>
            </div>

            <div className="col-12 col-lg-2 text-lg-end text-muted small">
              Found <strong>{hotels.length}</strong> {hotels.length === 1 ? 'property' : 'properties'}
            </div>
          </form>
        </div>

        {loading && (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="bg-white rounded-3 p-3 shadow-sm" style={{ height: 400 }}>
                  <div className="ls-skeleton ls-skeleton-card mb-3" style={{ height: 200 }} />
                  <div className="ls-skeleton ls-skeleton-text mb-2" style={{ width: '40%' }} />
                  <div className="ls-skeleton ls-skeleton-text mb-2" style={{ width: '80%' }} />
                  <div className="ls-skeleton ls-skeleton-text" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger text-center my-5 p-4 rounded-3">
            <i className="fa-solid fa-triangle-exclamation fs-3 mb-2 d-block"></i>
            {error}
            <div className="mt-3">
              <button className="ls-btn-outline-gold" onClick={fetchHotels}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-5 my-4 bg-white rounded-3 p-5 border" style={{ borderColor: 'var(--ls-border-warm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
            <h3 className="ls-serif mb-2">No Properties Found</h3>
            <p className="text-muted mb-4">No LuxuryStay destinations match your current search filters.</p>
            <button
              className="ls-btn-gold"
              onClick={() => {
                setSelectedCity('All');
                setSearchTerm('');
                setMaxPrice('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {!loading && !error && hotels.length > 0 && (
          <div className="row g-4">
            {hotels.map((hotel) => {
              const start = hotelStartPrice(hotel);
              return (
                <div className="col-12 col-md-6 col-lg-4" key={hotel._id}>
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
                        <span>{hotel.rating?.toFixed(1) || '4.8'}</span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({hotel.reviewCount || 100})</span>
                      </div>
                    </div>

                    <div className="ls-hotel-body">
                      <div className="ls-hotel-city">
                        <i className="fa-solid fa-location-dot me-1"></i> {hotel.city}, Pakistan
                      </div>
                      <h3 className="ls-hotel-title">{hotel.name}</h3>
                      <p className="ls-hotel-desc">
                        {hotel.description?.length > 130 ? `${hotel.description.slice(0, 130)}...` : hotel.description}
                      </p>

                      <div className="ls-hotel-facilities">
                        {(hotel.facilities || []).slice(0, 3).map((f, i) => (
                          <span key={i} className="ls-facility-pill">
                            <i className="fa-solid fa-check me-1" style={{ color: 'var(--ls-gold)', fontSize: '0.65rem' }}></i>
                            {f}
                          </span>
                        ))}
                      </div>

                      <div className="ls-hotel-footer mt-auto">
                        <div>
                          <div className="ls-hotel-price-label">Starting From</div>
                          <div className="ls-hotel-price">
                            {start != null ? (
                              <>
                                PKR {Number(start).toLocaleString()}
                                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ls-gray)' }}> / night</span>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.95rem' }}>See room rates</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Link to={`/hotels/${hotel._id}${stayQuery}`} className="text-decoration-none">
                            <button className="ls-btn-outline-gold" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                              Details
                            </button>
                          </Link>
                          <Link to={`/hotels/${hotel._id}${stayQuery}`} className="text-decoration-none">
                            <button className="ls-btn-gold" style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem' }}>
                              Book
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

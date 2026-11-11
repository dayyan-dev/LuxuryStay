import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getHotelById } from '../../../api/hotelApi';
import {
  formatRoomTitle,
  formatRoomTypeLabel,
  getUploadUrl,
  isRoomBookingBlocked,
  isRoomUnavailableForStay,
  getRoomStatusMeta,
} from '../../../utils/userMedia';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsNeeded = Number(searchParams.get('guests')) || 0;

  const stayQuery = useMemo(() => {
    const q = new URLSearchParams();
    ['checkIn', 'checkOut', 'guests', 'rooms', 'promo'].forEach((key) => {
      const v = searchParams.get(key);
      if (v) q.set(key, v);
    });
    const s = q.toString();
    return s ? `?${s}` : '';
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getHotelById(id, {
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guestsNeeded || undefined,
    })
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError('Hotel property details could not be loaded.');
        setLoading(false);
      });
  }, [id, checkIn, checkOut, guestsNeeded]);

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="ls-loader mx-auto my-5" />
        <p className="text-muted">Loading LuxuryStay property details...</p>
      </div>
    );
  }

  if (error || !data?.hotel) {
    return (
      <div className="container py-5 text-center my-5">
        <h2 className="ls-serif mb-3">Property Not Found</h2>
        <p className="text-muted mb-4">{error || 'The requested hotel property is unavailable.'}</p>
        <Link to="/hotels" className="text-decoration-none">
          <button className="ls-btn-gold">Back to All Hotels</button>
        </Link>
      </div>
    );
  }

  const { hotel, rooms: allRooms = [] } = data;
  // API already filters by guests when requested; keep client safety net
  const rooms =
    guestsNeeded > 0
      ? allRooms.filter((r) => Number(r.capacity || 0) >= guestsNeeded)
      : allRooms;
  const images = hotel.images?.length > 0
    ? hotel.images
    : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80'];
  // Cap side thumbs so the gallery stays one even rectangle (no empty gap under hero)
  const galleryThumbs = images.slice(0, 4);
  const GALLERY_H = 420;

  const roomPrices = rooms.map((r) => Number(r.price)).filter((p) => p > 0);
  const startingFrom = roomPrices.length
    ? Math.min(...roomPrices)
    : (hotel.startingPrice || null);

  return (
    <div style={{ background: 'var(--ls-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--ls-charcoal)', color: '#FFFFFF', padding: '2.5rem 0 1.5rem', borderBottom: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.30))' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <span className="ls-section-tag" style={{ color: 'var(--ls-gold)' }}>
                {hotel.city}, Pakistan — LuxuryStay 5-Star Hotel
              </span>
              <h1 className="ls-serif text-white display-5 fw-bold mb-1">{hotel.name}</h1>
              <p className="text-muted mb-0 small">
                <i className="fa-solid fa-location-dot me-1 text-gold" style={{ color: 'var(--ls-gold)' }}></i> {hotel.address}
              </p>
            </div>
            <div className="mt-3 mt-md-0 text-md-end">
              <div className="d-flex align-items-center gap-2 mb-2 justify-content-md-end">
                <span className="badge bg-warning text-dark px-2 py-1 fw-bold">
                  ★ {hotel.rating?.toFixed(1) || '4.9'}
                </span>
                <span className="text-white-50 small">({hotel.reviewCount || 200} Verified Reviews)</span>
              </div>
              <div className="text-white">
                <span className="small text-white-50">Starting From </span>
                <span className="fs-4 fw-bold ls-serif text-gold" style={{ color: 'var(--ls-gold)' }}>
                  {startingFrom != null ? `PKR ${Number(startingFrom).toLocaleString()}` : 'See rooms'}
                </span>
                {startingFrom != null && <span className="small text-white-50"> / night</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="bg-white p-3 rounded-3 shadow-sm border mb-4" style={{ borderColor: 'var(--ls-border-warm)' }}>
          <div
            className="ls-hotel-gallery"
            style={{
              display: 'grid',
              gridTemplateColumns: galleryThumbs.length > 1 ? 'minmax(0, 2.2fr) minmax(0, 1fr)' : '1fr',
              gridTemplateRows:
                galleryThumbs.length > 1
                  ? `repeat(${galleryThumbs.length}, minmax(0, 1fr))`
                  : `${GALLERY_H}px`,
              gap: 8,
              height: GALLERY_H,
            }}
          >
            <div
              style={{
                gridColumn: 1,
                gridRow: galleryThumbs.length > 1 ? `1 / span ${galleryThumbs.length}` : 1,
                borderRadius: 6,
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              <img
                src={images[selectedImg] || images[0]}
                alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {galleryThumbs.length > 1 &&
              galleryThumbs.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className="border-0 p-0"
                  onClick={() => setSelectedImg(i)}
                  aria-label={`View photo ${i + 1}`}
                  style={{
                    gridColumn: 2,
                    gridRow: i + 1,
                    borderRadius: 6,
                    overflow: 'hidden',
                    minHeight: 0,
                    opacity: selectedImg === i ? 1 : 0.75,
                    cursor: 'pointer',
                    boxShadow: selectedImg === i ? 'inset 0 0 0 2px var(--ls-gold)' : 'none',
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-3 shadow-sm border mb-4" style={{ borderColor: 'var(--ls-border-warm)' }}>
              <h3 className="ls-serif mb-3">About This Sanctuary</h3>
              <p className="text-muted mb-0" style={{ lineHeight: 1.7 }}>{hotel.description}</p>
            </div>

            {hotel.facilities?.length > 0 && (
              <div className="bg-white p-4 rounded-3 shadow-sm border mb-4" style={{ borderColor: 'var(--ls-border-warm)' }}>
                <h3 className="ls-serif mb-3">Property Highlights & Amenities</h3>
                <div className="row g-3">
                  {hotel.facilities.map((f, i) => (
                    <div className="col-6 col-md-4" key={i}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-check" style={{ color: 'var(--ls-gold)' }}></i>
                        <span style={{ fontSize: '0.92rem', color: 'var(--ls-charcoal)', fontWeight: 500 }}>{f}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-3 shadow-sm border mb-4" style={{ borderColor: 'var(--ls-border-warm)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="ls-serif mb-0">Available Rooms & Suites</h3>
                <span className="badge bg-light text-dark border">{rooms.length} rooms</span>
              </div>
              <p className="text-muted small mb-4">
                Rooms listed here belong only to <strong>{hotel.name}</strong>.
                {checkIn && checkOut && (
                  <span className="d-block mt-1">
                    Stay dates <strong>{checkIn}</strong> → <strong>{checkOut}</strong> — rooms already reserved for these dates show as unavailable.
                  </span>
                )}
                {guestsNeeded > 0 && (
                  <span className="d-block mt-1">
                    Showing rooms that sleep at least <strong>{guestsNeeded}</strong> guest{guestsNeeded !== 1 ? 's' : ''}
                    {allRooms.length !== rooms.length
                      ? ` (${allRooms.length - rooms.length} hidden as under capacity).`
                      : '.'}
                  </span>
                )}
              </p>

              <div className="row g-3">
                {rooms.map((room) => {
                  const hardBlocked = isRoomBookingBlocked(room.status);
                  const dateBlocked = room.dateConflict === true || room.availableForDates === false;
                  const blocked = isRoomUnavailableForStay(room);
                  const statusMeta = dateBlocked && !hardBlocked
                    ? getRoomStatusMeta('booked')
                    : getRoomStatusMeta(room.status);
                  return (
                    <div className="col-12" key={room._id}>
                      <div className="border rounded-3 p-3 p-md-4 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between" style={{ borderColor: 'var(--ls-border-warm)', opacity: blocked ? 0.85 : 1 }}>
                        <div className="d-flex gap-3 align-items-center">
                          <div style={{ width: 100, height: 80, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                            <img
                              src={getUploadUrl(room.images?.[0])}
                              alt={room.roomNumber}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: blocked ? 'grayscale(35%)' : undefined }}
                            />
                          </div>
                          <div>
                            <span className="badge bg-dark text-capitalize mb-1">{formatRoomTypeLabel(room.type)}</span>
                            {statusMeta && (room.status !== 'available' || dateBlocked) && (
                              <span className="badge ms-1 mb-1" style={{ background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}>
                                {dateBlocked && !hardBlocked ? 'Booked for your dates' : statusMeta.text}
                              </span>
                            )}
                            <h5 className="mb-1 ls-serif">Room {room.roomNumber} — {formatRoomTitle(room)}</h5>
                            <div className="text-muted small">
                              <i className="fa-solid fa-user me-1"></i> Max {room.capacity} Guests &nbsp;|&nbsp;
                              <i className="fa-solid fa-layer-group ms-1 me-1"></i> Floor: {room.floor}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3 mt-2 mt-md-0">
                          <div className="text-md-end">
                            <div className="fs-5 fw-bold ls-serif">PKR {room.price?.toLocaleString()}</div>
                            <div className="text-muted small">per night</div>
                          </div>
                          {blocked ? (
                            <button className="ls-btn-outline-gold px-3 py-2" style={{ fontSize: '0.82rem' }} disabled>
                              {dateBlocked && !hardBlocked
                                ? 'Unavailable for dates'
                                : (statusMeta?.text || 'Unavailable')}
                            </button>
                          ) : (
                            <Link to={`/booking/${room._id}${stayQuery}`} className="text-decoration-none">
                              <button className="ls-btn-gold px-3 py-2" style={{ fontSize: '0.82rem' }}>
                                Book Room <i className="fa-solid fa-arrow-right ms-1"></i>
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {rooms.length === 0 && (
                  <p className="text-muted mb-0">
                    {guestsNeeded > 0 && allRooms.length > 0
                      ? `No rooms at this property can accommodate ${guestsNeeded} guests. Try fewer guests or another property.`
                      : 'No rooms are currently listed for this property.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-3 shadow-sm border sticky-top" style={{ top: '90px', borderColor: 'var(--ls-border-warm)' }}>
              <h4 className="ls-serif mb-3">Reserve Your Stay</h4>
              <p className="small text-muted mb-4">Best rate guarantee when booking directly on the official LuxuryStay platform.</p>

              <div className="p-3 rounded mb-3" style={{ background: 'var(--ls-ivory)', border: '1px solid var(--ls-border-warm)' }}>
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Contact Reservations</span>
                  <span className="fw-bold text-dark">{hotel.contactPhone || '+92 21 111 505 505'}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>Email</span>
                  <span className="fw-bold text-dark">{hotel.contactEmail || 'reservations@theluxurystay.com'}</span>
                </div>
              </div>

              <div className="mb-3">
                <Link
                  to={`/room${stayQuery}${stayQuery ? '&' : '?'}hotelId=${hotel._id}`}
                  className="text-decoration-none w-100 d-block"
                >
                  <button className="ls-btn-gold w-100 py-3 mb-2">
                    <i className="fa-solid fa-calendar-check me-2"></i> View This Property&apos;s Rooms
                  </button>
                </Link>
                <Link to="/offers" className="text-decoration-none w-100 d-block">
                  <button className="ls-btn-outline-gold w-100 py-2">
                    <i className="fa-solid fa-tag me-2"></i> View Special Packages
                  </button>
                </Link>
              </div>

              <div className="text-muted small text-center">
                <i className="fa-solid fa-shield-halved me-1 text-success"></i> Free cancellation up to 48 hours before check-in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

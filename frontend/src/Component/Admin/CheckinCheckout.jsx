import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

const CheckinCheckout = () => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [bookings, setBookings] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [activeTab, setActiveTab] = useState("checkin");
  const [qrModal, setQrModal] = useState({ show: false, qrCode: '', booking: null });
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get(`${API_URL}/bookings/all`, { headers });
      setBookings(res.data || []);
    } catch (err) { console.error(err); }
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // CHECK-IN: confirmed ya pending (cash) + checkInDate = today
  const checkInList = bookings.filter(
    (b) =>
      ["confirmed", "pending"].includes(b.bookingStatus) &&
      isSameDay(new Date(b.checkInDate), today)
  );

  // CHECK-OUT: checked_in + checkOutDate = today ONLY
  const checkOutList = bookings.filter((b) => {
    const coDate = new Date(b.checkOutDate);
    coDate.setHours(0, 0, 0, 0);
    return b.bookingStatus === "checked_in" && isSameDay(coDate, today);
  });

  // OCCUPIED: checked_in status — currently in hotel
  const occupiedList = bookings.filter(
    (b) => b.bookingStatus === "checked_in"
  );

  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(b => {
      const name = (b.guestName || b.userId?.name || '').toLowerCase();
      const phone = (b.guestPhone || b.userId?.phone || '').toLowerCase();
      const room = (b.roomId?.roomNumber || '').toString().toLowerCase();
      return name.includes(q) || phone.includes(q) || room.includes(q);
    });
  };

  const paymentBadge = (status) => (
    <span className={`badge ${status === "paid" ? "badge-available" : "badge-occupied"}`} style={{ textTransform: 'capitalize' }}>
      <span className="badge-dot"></span>
      {status === 'paid' ? 'Paid' : 'Unpaid'}
    </span>
  );

  // CHECK-IN — confirmed/pending → checked_in + room occupied (dedicated API)
  const handleCheckIn = async (booking) => {
    const bookingId = typeof booking === 'string' ? booking : booking._id;
    const payment = typeof booking === 'string'
      ? bookings.find(b => b._id === bookingId)?.paymentStatus
      : booking?.paymentStatus;

    try {
      if (payment && payment !== 'paid') {
        const ok = window.confirm(
          'Payment is still pending for this guest.\n\nMark as paid and check in now?'
        );
        if (!ok) return;
        await api.put(`${API_URL}/bookings/${bookingId}/payment`, {}, { headers });
      }
      await api.put(`${API_URL}/bookings/${bookingId}/check-in`, {}, { headers });
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Check-in failed.');
    }
  };

  // CHECK-OUT — checked_in → checked_out → complete (room → cleaning → available)
  const handleCheckout = async () => {
    try {
      const bookingId = selectedBooking._id;
      if (paymentStatus === 'paid' && selectedBooking.paymentStatus !== 'paid') {
        await api.put(`${API_URL}/bookings/${bookingId}/payment`, {}, { headers });
      }
      await api.put(`${API_URL}/bookings/${bookingId}/check-out`, {}, { headers });
      await api.put(`${API_URL}/bookings/${bookingId}/complete`, {}, { headers });
      setShowCheckoutModal(false);
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Check-out failed.');
    }
  };

  const handleGenerateQR = async (booking) => {
    try {
      const res = await api.get(`${API_URL}/bookings/${booking._id}/qr`, { headers });
      setQrModal({ show: true, qrCode: res.data.qrCode, booking });
    } catch (err) {
      console.error(err);
    }
  };

  const BookingRow = ({ b, showCheckout = false }) => {
    const checkIn = new Date(b.checkInDate).toLocaleDateString("en-PK");
    const checkOut = new Date(b.checkOutDate).toLocaleDateString("en-PK");
    const nights = Math.ceil(
      (new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)
    );

    return (
      <tr style={{ transition: 'background-color 0.15s ease' }}>
        <td>
          <div className="fw-semibold" style={{ color: 'var(--theme-text-dark)' }}>{b.guestName || b.userId?.name || "Guest"}</div>
          <small style={{ color: 'var(--theme-text-secondary)' }}>ID: {b._id ? b._id.slice(-6).toUpperCase() : '—'}</small>
        </td>
        <td>
          <span style={{ color: 'var(--theme-text-secondary)', fontSize: 13 }}>
            {b.guestPhone || b.userId?.phone || "—"}
          </span>
        </td>
        <td>
          <span className="badge" style={{ background: 'var(--theme-bg-secondary)', color: 'var(--theme-text-dark)', border: '1px solid var(--theme-border)', fontWeight: 600 }}>
            {b.roomId ? `Room ${b.roomId.roomNumber} (${b.roomId.type})` : "—"}
          </span>
        </td>
        <td><span style={{ color: showCheckout ? 'var(--theme-text-secondary)' : 'var(--theme-success)', fontWeight: 500 }}>{checkIn}</span></td>
        <td><span style={{ color: showCheckout ? 'var(--theme-warning)' : 'var(--theme-text-secondary)', fontWeight: 500 }}>{checkOut}</span></td>
        {!showCheckout && <td style={{ color: 'var(--theme-text-secondary)' }}>{nights} night(s)</td>}
        <td>
          <span className="num-stat" style={{ fontWeight: 600, color: 'var(--theme-text-dark)' }}>
            PKR {Number(b.totalAmount).toLocaleString()}
          </span>
        </td>
        <td>{paymentBadge(b.paymentStatus)}</td>
        {!showCheckout && (
          <td><small style={{ color: 'var(--theme-text-muted)', maxWidth: 140, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.specialRequests || "—"}</small></td>
        )}
        <td>
          {!showCheckout ? (
            <div className="d-flex gap-2">
              <button
                className="ls-btn ls-btn-sm"
                style={{
                  background: 'var(--theme-success)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
                onClick={() => handleCheckIn(b)}
              >
                <i className="ri-login-box-line"></i>
                {b.paymentStatus === 'paid' ? 'Check-in' : 'Pay & Check-in'}
              </button>
              <button
                className="ls-btn ls-btn-ghost ls-btn-sm"
                onClick={() => handleGenerateQR(b)}
                title="Generate Digital Key QR"
                style={{ border: '1px solid var(--theme-border)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              >
                <i className="ri-qr-code-line" style={{ color: 'var(--theme-primary)' }}></i>
              </button>
            </div>
          ) : (
            <button
              className="ls-btn ls-btn-sm"
              style={{
                background: 'var(--theme-warning)',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedBooking(b);
                setPaymentStatus(b.paymentStatus);
                if (b.paymentStatus !== 'paid') {
                  setShowPaymentWarning(true);
                } else {
                  setShowCheckoutModal(true);
                }
              }}
            >
              <i className="ri-logout-box-line"></i>Check-out
            </button>
          )}
        </td>
      </tr>
    );
  };

  const OccupiedRow = ({ b }) => {
    const checkIn = new Date(b.checkInDate).toLocaleDateString("en-PK");
    const checkOut = new Date(b.checkOutDate).toLocaleDateString("en-PK");
    const coDate = new Date(b.checkOutDate);
    coDate.setHours(0, 0, 0, 0);
    const nightsLeft = Math.ceil((coDate - today) / (1000 * 60 * 60 * 24));

    return (
      <tr style={{ transition: 'background-color 0.15s ease' }}>
        <td>
          <div className="fw-semibold" style={{ color: 'var(--theme-text-dark)' }}>{b.guestName || b.userId?.name || "Guest"}</div>
          <small style={{ color: 'var(--theme-text-secondary)' }}>ID: {b._id ? b._id.slice(-6).toUpperCase() : '—'}</small>
        </td>
        <td>
          <span style={{ color: 'var(--theme-text-secondary)', fontSize: 13 }}>
            {b.guestPhone || b.userId?.phone || "—"}
          </span>
        </td>
        <td>
          <span className="badge" style={{ background: 'var(--theme-bg-secondary)', color: 'var(--theme-text-dark)', border: '1px solid var(--theme-border)', fontWeight: 600 }}>
            {b.roomId ? `Room ${b.roomId.roomNumber} (${b.roomId.type})` : "—"}
          </span>
        </td>
        <td style={{ color: 'var(--theme-text-secondary)' }}>{checkIn}</td>
        <td style={{ color: 'var(--theme-text-secondary)' }}>{checkOut}</td>
        <td>
          <span className={`badge ${nightsLeft <= 1 ? "badge-occupied" : "badge-reserved"}`}>
            <span className="badge-dot"></span>
            {nightsLeft <= 0 ? "Due today" : `${nightsLeft} night(s) left`}
          </span>
        </td>
        <td>
          <span className="num-stat" style={{ fontWeight: 600, color: 'var(--theme-text-dark)' }}>
            PKR {Number(b.totalAmount).toLocaleString()}
          </span>
        </td>
        <td>{paymentBadge(b.paymentStatus)}</td>
      </tr>
    );
  };

  const currentList = activeTab === "checkin"
    ? filterBySearch(checkInList)
    : activeTab === "checkout"
    ? filterBySearch(checkOutList)
    : filterBySearch(occupiedList);

  return (
    <div className="container-fluid" style={{ padding: '0 0.5rem' }}>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="heading-luxury mb-0" style={{ fontSize: '1.75rem', color: 'var(--theme-text-dark)' }}>
              Check-in / Check-out Desk
            </h2>
            <span className="badge badge-primary">Front Desk</span>
          </div>
          <p className="mb-0" style={{ color: 'var(--theme-text-secondary)', fontSize: 14 }}>
            Monitor real-time guest arrivals, departures, and in-house stays for today ({todayStr}).
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/admin/bookings" className="ls-btn ls-btn-outline ls-btn-sm">
            <i className="ri-calendar-line me-1"></i> All Bookings
          </Link>
          <Link to="/admin/booking-new" className="ls-btn ls-btn-primary ls-btn-sm">
            <i className="ri-add-line me-1"></i> New Booking
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Today's Check-ins",
            value: checkInList.length,
            icon: "ri-login-box-line",
            color: "var(--theme-success)",
            bg: "var(--theme-success-bg)",
            desc: "Expected arrivals"
          },
          {
            label: "Today's Check-outs",
            value: checkOutList.length,
            icon: "ri-logout-box-line",
            color: "var(--theme-warning)",
            bg: "var(--theme-warning-bg)",
            desc: "Departures scheduled"
          },
          {
            label: "Currently Occupied",
            value: occupiedList.length,
            icon: "ri-hotel-bed-line",
            color: "var(--theme-info)",
            bg: "var(--theme-info-bg)",
            desc: "Guests currently in hotel"
          },
        ].map((s, i) => (
          <div className="col-12 col-md-4" key={i}>
            <div className="card-luxury p-3 h-100 d-flex align-items-center gap-3">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0
                }}
              >
                <i className={s.icon}></i>
              </div>
              <div className="flex-grow-1">
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--theme-text-secondary)', fontWeight: 600 }}>
                  {s.label}
                </span>
                <div className="d-flex align-items-baseline gap-2">
                  <h3 className="num-stat mb-0" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--theme-text-dark)' }}>
                    {s.value}
                  </h3>
                  <small style={{ color: 'var(--theme-text-muted)', fontSize: 12 }}>{s.desc}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="card-luxury">
        <div
          className="p-3 border-bottom d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          {/* Custom Tabs */}
          <div className="d-flex align-items-center gap-2 overflow-auto pb-1 pb-md-0">
            {[
              { key: "checkin", label: "Check-in Today", count: checkInList.length, color: "var(--theme-success)" },
              { key: "checkout", label: "Check-out Today", count: checkOutList.length, color: "var(--theme-warning)" },
              { key: "occupied", label: "Currently Occupied", count: occupiedList.length, color: "var(--theme-info)" },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: active ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                    backgroundColor: active ? 'var(--theme-primary)' : 'var(--theme-surface)',
                    color: active ? '#FFFFFF' : 'var(--theme-text-secondary)',
                    fontWeight: active ? 600 : 500,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'var(--theme-bg-secondary)',
                      color: active ? '#FFFFFF' : 'var(--theme-text-dark)',
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <i
              className="ri-search-line"
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--theme-text-muted)'
              }}
            ></i>
            <input
              type="text"
              placeholder="Search guest, room or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                paddingLeft: 36,
                paddingRight: 14,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--theme-border)',
                backgroundColor: 'var(--theme-bg-primary)',
                fontSize: 13,
                height: 38
              }}
            />
          </div>
        </div>

        <div className="p-3">
          {/* Informational Banner */}
          <div
            className="p-2 px-3 rounded mb-3 d-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)', fontSize: 13, color: 'var(--theme-text-secondary)' }}
          >
            <i className="ri-information-line" style={{ color: 'var(--theme-primary)', fontSize: 16 }}></i>
            {activeTab === "checkin" && (
              <span>Guests whose reservation check-in date is <strong>today</strong>. Click <strong>Check-in</strong> to register arrival and occupy the assigned room.</span>
            )}
            {activeTab === "checkout" && (
              <span>Guests whose departure date is <strong>today</strong>. Ensure payments are cleared before finalizing check-out.</span>
            )}
            {activeTab === "occupied" && (
              <span>Currently in-house guests. Real-time stay duration and room assignments are tracked below.</span>
            )}
          </div>

          {/* Table Container */}
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ borderColor: 'var(--theme-border)' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--theme-text-secondary)' }}>
                  <th style={{ padding: '12px 14px' }}>Guest Details</th>
                  <th style={{ padding: '12px 14px' }}>Phone</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Room</th>
                  <th style={{ padding: '12px 14px' }}>Check In</th>
                  <th style={{ padding: '12px 14px' }}>Check Out</th>
                  {activeTab === "checkin" && <th style={{ padding: '12px 14px' }}>Stay</th>}
                  {activeTab === "occupied" && <th style={{ padding: '12px 14px' }}>Status</th>}
                  <th style={{ padding: '12px 14px' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Payment</th>
                  {activeTab === "checkin" && <th style={{ padding: '12px 14px' }}>Special Request</th>}
                  {activeTab !== "occupied" && <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-5" style={{ color: 'var(--theme-text-muted)' }}>
                      <i className="ri-inbox-line fs-1 d-block mb-2" style={{ opacity: 0.4 }}></i>
                      <p className="mb-0 fw-medium">No records found matching current criteria.</p>
                    </td>
                  </tr>
                ) : (
                  currentList.map((b) => (
                    activeTab === "occupied" ? (
                      <OccupiedRow key={b._id} b={b} />
                    ) : (
                      <BookingRow key={b._id} b={b} showCheckout={activeTab === "checkout"} />
                    )
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && selectedBooking && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(41, 39, 34, 0.6)", backdropFilter: "blur(4px)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-modal)', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-modal)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }}>
                <h5 className="modal-title heading-luxury mb-0" style={{ fontSize: '1.25rem', color: 'var(--theme-text-dark)' }}>
                  <i className="ri-logout-box-line me-2" style={{ color: 'var(--theme-warning)' }}></i>
                  Confirm Guest Check-out
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCheckoutModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <div
                  className="p-3 rounded mb-3"
                  style={{ backgroundColor: 'var(--theme-bg-primary)', border: '1px solid var(--theme-border)' }}
                >
                  <div className="row g-3">
                    <div className="col-6">
                      <p className="text-muted mb-1 fs-12 text-uppercase">Guest Name</p>
                      <h6 className="mb-0" style={{ color: 'var(--theme-text-dark)', fontWeight: 600 }}>
                        {selectedBooking.guestName || selectedBooking.userId?.name || 'Guest'}
                      </h6>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-1 fs-12 text-uppercase">Contact</p>
                      <h6 className="mb-0" style={{ color: 'var(--theme-text-dark)' }}>
                        {selectedBooking.userId?.phone || selectedBooking.guestPhone || "—"}
                      </h6>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-1 fs-12 text-uppercase">Room Number</p>
                      <h6 className="mb-0" style={{ color: 'var(--theme-primary)', fontWeight: 700 }}>
                        {selectedBooking.roomId ? `Room ${selectedBooking.roomId.roomNumber}` : "—"}
                      </h6>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-1 fs-12 text-uppercase">Total Bill</p>
                      <h5 className="num-stat mb-0" style={{ color: 'var(--theme-success)', fontWeight: 700 }}>
                        PKR {Number(selectedBooking.totalAmount).toLocaleString()}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--theme-text-dark)' }}>
                    Payment Verification
                  </label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-border)' }}
                  >
                    <option value="paid">Payment Cleared / Paid ✅</option>
                    <option value="unpaid">Payment Pending / Unpaid ❌</option>
                  </select>
                </div>

                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: 'var(--theme-warning-bg)', border: '1px solid rgba(212, 154, 70, 0.3)', color: 'var(--theme-text-dark)', fontSize: 13 }}
                >
                  <i className="ri-refresh-line me-2" style={{ color: 'var(--theme-warning)' }}></i>
                  Upon completion, the room will automatically be scheduled for <strong>Housekeeping Cleaning</strong>.
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--theme-border)' }}>
                <button
                  type="button"
                  className="ls-btn ls-btn-outline"
                  onClick={() => setShowCheckoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ls-btn"
                  style={{ backgroundColor: 'var(--theme-warning)', color: '#fff', border: 'none' }}
                  onClick={handleCheckout}
                >
                  <i className="ri-logout-box-line me-1"></i> Confirm & Finalize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT WARNING MODAL */}
      {showPaymentWarning && selectedBooking && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(41, 39, 34, 0.6)", backdropFilter: "blur(4px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-modal)', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-modal)' }}>
              <div className="modal-header" style={{ backgroundColor: 'var(--theme-danger-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                <h5 className="modal-title heading-luxury mb-0" style={{ color: 'var(--theme-danger)', fontSize: '1.2rem' }}>
                  <i className="ri-error-warning-line me-2"></i>
                  Payment Required Before Check-out
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentWarning(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--theme-danger-bg)', color: 'var(--theme-danger)', fontSize: 32 }}
                >
                  <i className="ri-secure-payment-line"></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: 'var(--theme-text-dark)' }}>
                  Unsettled Balance
                </h5>
                <p className="mb-3" style={{ color: 'var(--theme-text-secondary)', fontSize: 14 }}>
                  Guest <strong>{selectedBooking.userId?.name || selectedBooking.guestName || "Guest"}</strong> currently has an outstanding balance of:
                </p>
                <div className="num-stat mb-3" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--theme-danger)' }}>
                  PKR {Number(selectedBooking.totalAmount).toLocaleString()}
                </div>
                <div
                  className="text-start p-3 rounded"
                  style={{ backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)', fontSize: 13, color: 'var(--theme-text-secondary)' }}
                >
                  <i className="ri-information-line me-2" style={{ color: 'var(--theme-primary)' }}></i>
                  Please collect the pending bill and record payment via the Payments desk prior to releasing the guest.
                </div>
              </div>
              <div className="modal-footer justify-content-center gap-2" style={{ borderTop: '1px solid var(--theme-border)' }}>
                <button
                  type="button"
                  className="ls-btn ls-btn-outline"
                  onClick={() => setShowPaymentWarning(false)}
                >
                  Close
                </button>
                <Link
                  className="ls-btn ls-btn-primary"
                  to="/admin/payments"
                  onClick={() => setShowPaymentWarning(false)}
                >
                  <i className="ri-bill-line me-1"></i> Open Billing Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModal.show && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(41, 39, 34, 0.6)", backdropFilter: "blur(4px)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-modal)', border: '1px solid var(--theme-border)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }}>
                <h5 className="modal-title heading-luxury mb-0" style={{ fontSize: '1.25rem', color: 'var(--theme-text-dark)' }}>
                  <i className="ri-qr-code-line me-2" style={{ color: 'var(--theme-primary)' }}></i>
                  Digital Check-in Key QR
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setQrModal({ show: false, qrCode: '', booking: null })}
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <p className="mb-3" style={{ color: 'var(--theme-text-secondary)', fontSize: 14 }}>
                  Present this QR code to the guest for contactless digital verification.
                </p>
                {qrModal.qrCode && (
                  <div className="p-3 bg-white d-inline-block rounded shadow-sm" style={{ border: '1px solid var(--theme-border)' }}>
                    <img src={qrModal.qrCode} alt="QR Code" style={{ width: 220, height: 220, display: 'block' }} />
                  </div>
                )}
                <div className="mt-3">
                  <div className="fw-semibold" style={{ color: 'var(--theme-text-dark)', fontSize: 16 }}>
                    {qrModal.booking?.guestName || qrModal.booking?.userId?.name}
                  </div>
                  <small style={{ color: 'var(--theme-text-secondary)' }}>
                    Room {qrModal.booking?.roomId?.roomNumber} — {new Date(qrModal.booking?.checkInDate).toLocaleDateString('en-PK')}
                  </small>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--theme-border)' }}>
                <button
                  type="button"
                  className="ls-btn ls-btn-outline"
                  onClick={() => setQrModal({ show: false, qrCode: '', booking: null })}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="ls-btn ls-btn-primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `checkin-qr-${qrModal.booking?._id}.png`;
                    link.href = qrModal.qrCode;
                    link.click();
                  }}
                >
                  <i className="ri-download-line me-1"></i> Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinCheckout;

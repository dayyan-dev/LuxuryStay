import { useState, useEffect } from "react";
import api from '../../api/authApi';
import { ConfirmDialog } from '../Common/PremiumUI';

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

const Bookings = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState([]);
  const [filterBookingStatus, setFilterBookingStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  // const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // const [updateStatus, setUpdateStatus] = useState({ bookingStatus: '', paymentStatus: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    let result = bookings;
    if (filterBookingStatus)
      result = result.filter((b) => b.bookingStatus === filterBookingStatus);
    if (filterPaymentStatus)
      result = result.filter((b) => b.paymentStatus === filterPaymentStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        String(b.guestName || b.userId?.name || '').toLowerCase().includes(q) ||
        String(b.guestEmail || b.userId?.email || '').toLowerCase().includes(q) ||
        String(b.guestPhone || b.userId?.phone || '').toLowerCase().includes(q) ||
        (b.roomId && String(b.roomId.roomNumber || '').toLowerCase().includes(q))
      );
    }
    setFilter(result);
  }, [filterBookingStatus, filterPaymentStatus, searchQuery, bookings]);

  const loadBookings = async () => {
    try {
      const res = await api.get(`${API_URL}/bookings/all`, { headers });
      setBookings(res.data);
      setFilter(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    cancelled: bookings.filter((b) => b.bookingStatus === "cancelled").length,
  };

  const statusBadge = (status) => {
    const map = {
      pending:    { bg: 'rgba(212, 154, 70, 0.14)', color: '#D49A46', label: 'Pending' },
      confirmed:  { bg: 'rgba(54, 133, 104, 0.12)', color: '#368568', label: 'Confirmed' },
      checked_in: { bg: 'rgba(102, 138, 168, 0.12)', color: '#668AA8', label: 'Checked In' },
      completed:  { bg: 'var(--theme-primary-soft, rgba(27, 54, 93, 0.14))', color: 'var(--theme-primary-hover, #122642)', label: 'Completed' },
      cancelled:  { bg: 'rgba(204, 91, 85, 0.12)',  color: '#CC5B55', label: 'Cancelled' },
    };
    const s = map[status] || { bg: 'var(--theme-surface-subtle, #F1F5F9)', color: 'var(--theme-text-secondary, #475569)', label: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}33`,
        padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.02em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
        {s.label}
      </span>
    );
  };

  const paymentBadge = (status) => {
    const map = {
      paid:     { bg: 'rgba(54, 133, 104, 0.12)', color: '#368568', label: 'Paid' },
      pending:  { bg: 'rgba(212, 154, 70, 0.14)', color: '#D49A46', label: 'Pending' },
      unpaid:   { bg: 'rgba(204, 91, 85, 0.12)',  color: '#CC5B55', label: 'Unpaid' },
      refunded: { bg: 'rgba(102, 138, 168, 0.12)', color: '#668AA8', label: 'Refunded' },
    };
    const s = map[status] || { bg: 'var(--theme-surface-subtle, #F1F5F9)', color: 'var(--theme-text-secondary, #475569)', label: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}33`,
        padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.02em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
        {s.label}
      </span>
    );
  };

  const openView = (b) => {
    setSelectedBooking(b);
    setShowViewModal(true);
  };
  const confirmBooking = async (id) => {
    try {
      // Confirm only — room becomes occupied at check-in
      await api.put(
        `${API_URL}/bookings/${id}`,
        { bookingStatus: "confirmed" },
        { headers }
      );
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to confirm booking.');
    }
  };
  const cancelBooking = async (id) => {
    try {
      await api.put(
        `${API_URL}/bookings/${id}`,
        { bookingStatus: "cancelled" },
        { headers },
      );

      setCancelTarget(null);
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };
  const markAsPaid = async (id) => {
    if (!window.confirm('Mark this booking as paid?')) return;
    try {
      await api.put(`${API_URL}/bookings/${id}/payment`, {}, { headers });
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark payment.');
    }
  };
  // const openUpdate = (b) => {
  //   setSelectedBooking(b);
  //   setUpdateStatus({ bookingStatus: b.bookingStatus, paymentStatus: b.paymentStatus });
  //   setShowUpdateModal(true);
  // };

  // const handleUpdate = async () => {
  //   try {
  //     await api.put(`${API_URL}/bookings/${selectedBooking._id}`, updateStatus, { headers });
  //     setShowUpdateModal(false);
  //     loadBookings();
  //   } catch (err) { console.error(err); }
  // };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Booking Management</h4>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: "bx bx-calendar-check",
            color: "info",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: "bx bx-time",
            color: "warning",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            icon: "bx bx-check-circle",
            color: "success",
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            icon: "bx bx-x-circle",
            color: "danger",
          },
        ].map((s, i) => (
          <div className="col-xl-3 col-md-6" key={i}>
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="avatar-sm flex-shrink-0">
                    <span
                      className={`avatar-title bg-${s.color}-subtle rounded fs-3`}
                    >
                      <i className={`${s.icon} text-${s.color}`}></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="text-uppercase fw-medium text-muted mb-1 fs-12">
                      {s.label}
                    </p>
                    <h4 className="mb-0 fw-semibold">{s.value}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2 py-3">
          <div>
            <h5 className="card-title mb-0">
              Reservation Directory
              <span className="text-muted fw-normal fs-13 ms-2">({filter.length} bookings)</span>
            </h5>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: 220 }}>
              <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="text"
                className="form-control form-control-sm ps-4"
                placeholder="Search guest, email, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="form-select form-select-sm w-auto"
              value={filterBookingStatus}
              onChange={(e) => setFilterBookingStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="form-select form-select-sm w-auto"
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-nowrap align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-muted">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filter.map((b, i) => (
                    <tr key={b._id}>
                      <td>{i + 1}</td>

                      <td>
                        <div className="fw-medium">
                          {b.guestName || b.userId?.name || "Guest"}
                        </div>

                        <small className="text-muted">
                          {b.guestEmail || b.userId?.email || ""}
                        </small>
                      </td>

                      <td>{b.roomId ? `Room ${b.roomId.roomNumber}` : "—"}</td>

                      <td>
                        {new Date(b.checkInDate).toLocaleDateString("en-PK")}
                      </td>

                      <td>
                        {new Date(b.checkOutDate).toLocaleDateString("en-PK")}
                      </td>

                      <td className="fw-medium">
                        PKR {Number(b.totalAmount).toLocaleString()}
                      </td>

                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">
                          {b.paymentMethod}
                        </span>
                      </td>

                      <td>{paymentBadge(b.paymentStatus)}</td>

                      <td>{statusBadge(b.bookingStatus)}</td>

                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* View */}
                          <button
                            className="btn btn-soft-info btn-sm"
                            onClick={() => openView(b)}
                          >
                            <i className="ri-eye-line"></i>
                          </button>

                          {/* Confirm / Cancel */}
                          {b.bookingStatus === "pending" &&
                            b.paymentStatus === "paid" && (
                              <>
                                <button
                                  className="btn btn-soft-success btn-sm"
                                  onClick={() => confirmBooking(b._id)}
                                >
                                  Confirm
                                </button>

                                <button
                                  className="btn btn-soft-danger btn-sm"
                                  onClick={() => setCancelTarget(b)}
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                          {/* Mark Paid */}
                          {b.paymentStatus !== "paid" && (
                            <button
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => markAsPaid(b._id)}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelBooking(cancelTarget._id)}
        title="Cancel this booking?"
        message={
          cancelTarget
            ? `Booking for ${cancelTarget.guestName || cancelTarget.userId?.name || 'Guest'}${cancelTarget.roomId ? ` — Room ${cancelTarget.roomId.roomNumber}` : ''} will be cancelled. This action cannot be undone.`
            : ''
        }
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        danger
      />

      {/* View Modal */}
      {showViewModal && selectedBooking && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    {
                      label: "Guest Name",
                      // FIX 2: pehle guestName dekho, phir userId.name
                      value: selectedBooking.guestName || selectedBooking.userId?.name || "Guest",
                    },
                    {
                      label: "Email",
                      value: selectedBooking.guestEmail || selectedBooking.userId?.email || "—",
                    },
                    {
                      label: "Phone",
                      value: selectedBooking.guestPhone || selectedBooking.userId?.phone || "—",
                    },
                    {
                      label: "Room",
                      value: selectedBooking.roomId
                        ? `Room ${selectedBooking.roomId.roomNumber} (${selectedBooking.roomId.type})`
                        : "—",
                    },
                    {
                      label: "Check In",
                      value: new Date(
                        selectedBooking.checkInDate,
                      ).toLocaleDateString("en-PK"),
                    },
                    {
                      label: "Check Out",
                      value: new Date(
                        selectedBooking.checkOutDate,
                      ).toLocaleDateString("en-PK"),
                    },
                    {
                      label: "Guests",
                      value: `${selectedBooking.guests} Person(s)`,
                    },
                    {
                      label: "Total Amount",
                      value: `PKR ${Number(selectedBooking.totalAmount).toLocaleString()}`,
                    },
                    {
                      label: "Payment Method",
                      value: selectedBooking.paymentMethod || "cash",
                    },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        <h6 className="mb-0">{item.value}</h6>
                      </div>
                    </div>
                  ))}
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Booking Status</p>
                      <h6 className="mb-0">
                        {statusBadge(selectedBooking.bookingStatus)}
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Payment Status</p>

                      <h6 className="mb-0">
                        {paymentBadge(selectedBooking.paymentStatus)}
                      </h6>
                    </div>
                  </div>

                  {selectedBooking.paymentMethod === "cash" &&
                    selectedBooking.paymentStatus !== "paid" && (
                      <div className="col-12">
                        <div className="alert alert-warning mt-2 mb-0">
                          Guest selected cash payment. Please update payment
                          status after receiving payment.
                        </div>
                      </div>
                    )}
                  {selectedBooking.specialRequests && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">
                          Special Requests
                        </p>
                        <h6 className="mb-0">
                          {selectedBooking.specialRequests}
                        </h6>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {/* {showUpdateModal && selectedBooking && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Booking</h5>
                <button className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Booking Status</label>
                  <select className="form-select" value={updateStatus.bookingStatus}
                    onChange={e => setUpdateStatus({ ...updateStatus, bookingStatus: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Payment Status</label>
                  <select className="form-select" value={updateStatus.paymentStatus}
                    onChange={e => setUpdateStatus({ ...updateStatus, paymentStatus: e.target.value })}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Bookings;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

const BookingNew = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [rooms, setRooms] = useState([]);
  const [allBookingsCache, setAllBookingsCache] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [guestError, setGuestError] = useState("");
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });

  const datesOverlap = (aStart, aEnd, bStart, bEnd) => {
    const s1 = new Date(aStart); const e1 = new Date(aEnd);
    const s2 = new Date(bStart); const e2 = new Date(bEnd);
    return s1 < e2 && s2 < e1;
  };

  const activeStatuses = ['pending', 'confirmed', 'checked_in'];

  const availableRoomsForDates = () => {
    // Without dates, only truly free rooms — avoids offering currently occupied ones
    if (!form.checkIn || !form.checkOut) {
      return rooms.filter((r) => r.status === 'available');
    }
    const blocked = new Set(
      allBookingsCache
        .filter((b) => activeStatuses.includes(b.bookingStatus)
          && datesOverlap(form.checkIn, form.checkOut, b.checkInDate, b.checkOutDate))
        .map((b) => String(b.roomId?._id || b.roomId))
    );
    return rooms.filter((room) =>
      room.status !== 'maintenance'
      && room.status !== 'cleaning'
      && !blocked.has(String(room._id))
    );
  };

  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: 1,

   paymentMethod: "cash",
    paymentStatus: "pending",

    specialRequests: "",
    redeemPoints: 0,
    availablePoints: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadRooms();
  }, []);
  const loadRooms = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get(`${API_URL}/rooms`, { headers }),
        api.get(`${API_URL}/bookings/all`, { headers }),
      ]);

      const allRooms = roomsRes.data;
      const allBookings = bookingsRes.data;
      // Keep all non-maintenance rooms; date overlap filtering happens when dates are chosen
      setRooms(
        (allRooms || []).filter((room) =>
          !['maintenance', 'cleaning'].includes(room.status)
        )
      );
      setAllBookingsCache(allBookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calcSummary = (roomId, checkIn, checkOut) => {
    const room = rooms.find((r) => r._id === roomId);

    if (!room || !checkIn || !checkOut) {
      setSummary(null);
      return;
    }

    const days = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
    );

    if (days <= 0) {
      setSummary(null);
      return;
    }

    setSummary({
      room,
      days,
      total: days * room.price,
    });
  };

  const validateGuests = (roomId, guests) => {
    const room = rooms.find((r) => r._id === roomId);

    if (!room) {
      setGuestError("");
      return;
    }

    const maxGuests = room.capacity || room.maxGuests || 1;

    if (Number(guests) > maxGuests) {
      setGuestError(`Maximum ${maxGuests} guests allowed`);

      setErrorPopup({ show: true, message: `Maximum ${maxGuests} guests allowed for this room.` });
      return;
    } else {
      setGuestError("");
    }
  };

  const handleChange = (field, value) => {
    const newForm = {
      ...form,
      [field]: value,
    };

    setForm(newForm);

    calcSummary(
      field === "roomId" ? value : newForm.roomId,
      field === "checkIn" ? value : newForm.checkIn,
      field === "checkOut" ? value : newForm.checkOut,
    );

    validateGuests(
      field === "roomId" ? value : newForm.roomId,
      field === "guests" ? value : newForm.guests,
    );
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.guestName.trim()) {
      setError("Guest name is required.");
      return;
    }

    if (!form.guestPhone.trim()) {
      setError("Guest phone is required.");
      return;
    }

    if (!form.roomId) {
      setError("Please select a room.");
      return;
    }

    // Phone validation
    const phoneRegex = /^03\d{9}$/;

    if (!phoneRegex.test(form.guestPhone)) {
      setError("Enter valid Pakistani phone number (03XXXXXXXXX)");
      return;
    }

    // Email validation
    if (form.guestEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!emailRegex.test(form.guestEmail)) {
        setError("Enter valid email address.");
        return;
      }
    }

    if (!form.checkIn || !form.checkOut) {
      setError("Check-in and check-out dates are required.");
      return;
    }

    if (!summary) {
      setError("Invalid dates selected.");
      return;
    }

    if (guestError) {
      setError(guestError);
      return;
    }

    const selectedRoom = rooms.find((r) => r._id === form.roomId);

    if (selectedRoom && Number(form.guests) > Number(selectedRoom.capacity)) {
      setError(`Room capacity is only ${selectedRoom.capacity} guest(s).`);
      return;
    }

    setLoading(true);

    try {
      const paymentStatus =
        form.paymentMethod === "online" ? "paid" : form.paymentStatus;

      const bookingStatus =
        form.paymentMethod === "online" ? "confirmed" : "pending";

      // FIX 3: Pehle walk-in guest create karo taake users page mein show ho
      let guestUserId = null;
      try {
        const walkinRes = await api.post(
          `${API_URL}/auth/walkin-guest`,
          {
            name: form.guestName,
            phone: form.guestPhone,
            email: form.guestEmail || undefined,
          },
          { headers }
        );
        guestUserId = walkinRes.data.user?._id;
      } catch (walkinErr) {
        console.warn("Walk-in guest create warning:", walkinErr.response?.data);
        // Booking phir bhi continue karein agar user create fail ho
      }

      // Create booking
      await api.post(
        `${API_URL}/bookings`,
        {
          roomId: form.roomId,

          // FIX 2: guestName, guestPhone, guestEmail booking mein save karo
          guestName: form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail,

          // FIX 3: walk-in user ka id booking se link karo
          userId: guestUserId,

          checkInDate: form.checkIn,
          checkOutDate: form.checkOut,
          guests: form.guests,

          totalAmount: Math.max(0, summary.total - (Number(form.redeemPoints) || 0) * 10),
          redeemPoints: form.redeemPoints || 0,
          paymentMethod: form.paymentMethod,
          paymentStatus: paymentStatus,

          specialRequests: form.specialRequests,
          bookingStatus: bookingStatus,
        },
        { headers },
      );

      setSuccess(
        `Booking created successfully! Room ${summary.room.roomNumber} booked for ${form.guestName}`,
      );

      setTimeout(() => {
        navigate("/admin/bookings");
      }, 2000);
    } catch (err) {
      console.log(err.response?.data);

      setError(err.response?.data?.message || "Error creating booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">New Booking</h4>

            <button
              className="btn btn-light"
              onClick={() => navigate("/admin/bookings")}
            >
              <i className="ri-arrow-left-line me-1"></i>
              Back to Bookings
            </button>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-9">
          {error && <div className="alert alert-danger">{error}</div>}
          {errorPopup.show && (
            <div style={{
              position: 'fixed', top: 24, right: 24, zIndex: 99999,
              minWidth: 300, maxWidth: 380, background: '#fff', borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 14,
              borderLeft: '4px solid #CC5B55'
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: '#CC5B55', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700
              }}>!</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 2 }}>Notice</div>
                <div style={{ fontSize: 13, color: '#6c757d' }}>{errorPopup.message}</div>
              </div>
              <button onClick={() => setErrorPopup({ show: false, message: '' })}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: 18 }}>✕</button>
            </div>
          )}

          {success && <div className="alert alert-success">{success}</div>}

          <div className="row g-3">
            {/* Guest Information */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="ri-user-line me-2 text-primary"></i>
                    Guest Information
                  </h5>
                </div>

                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Guest Name
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        className="form-control"
                        placeholder="Full name"
                        value={form.guestName}
                        onChange={(e) =>
                          handleChange("guestName", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Phone
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        className="form-control"
                        value={form.guestPhone}
                        maxLength="11"
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 11);
                          const val = onlyNums.length > 0 && !onlyNums.startsWith('03')
                            ? '03' + onlyNums.replace(/^0*3*/, '').slice(0, 9)
                            : onlyNums;
                          handleChange("guestPhone", val);
                        }}
                        placeholder="03XXXXXXXXX"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Email</label>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Optional"
                        value={form.guestEmail}
                        onChange={(e) =>
                          handleChange("guestEmail", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Special Requests</label>

                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Any special requests..."
                        value={form.specialRequests}
                        onChange={(e) =>
                          handleChange("specialRequests", e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="ri-calendar-check-line me-2 text-success"></i>
                    Booking Details
                  </h5>
                </div>

                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Select Room
                        <span className="text-danger"> *</span>
                      </label>

                      <select
                        className="form-select"
                        value={form.roomId}
                        onChange={(e) => handleChange("roomId", e.target.value)}
                      >
                        <option value="">Select Available Room</option>

                        {availableRoomsForDates().map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.roomNumber} — {r.type} — {r.capacity}{" "}
                            Persons — PKR {Number(r.price).toLocaleString()}
                            /night
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label">
                        Check In
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={form.checkIn}
                        onChange={(e) =>
                          handleChange("checkIn", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">
                        Check Out
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        min={form.checkIn || today}
                        value={form.checkOut}
                        onChange={(e) =>
                          handleChange("checkOut", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Number of Guests</label>

                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={summary?.room?.capacity || 1}
                        value={form.guests}
                        onChange={(e) => handleChange("guests", e.target.value)}
                      />
                      {summary?.room?.capacity && (
                        <small className="text-muted">
                          Max capacity: {summary.room.capacity} guest(s)
                        </small>
                      )}

                      {guestError && (
                        <small className="text-danger">{guestError}</small>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Payment Method</label>

                      <select
                        className="form-select"
                        value={form.paymentMethod}
                        onChange={(e) =>
                          handleChange("paymentMethod", e.target.value)
                        }
                      >
                        <option value="cash">Cash</option>

                        <option value="online">Online</option>
                      </select>
                    </div>
                    {form.paymentMethod === "cash" && (
                      <div className="col-12">
                        <label className="form-label">
                          Cash Payment Status
                        </label>

                        <select
                          className="form-select"
                          value={form.paymentStatus}
                          onChange={(e) =>
                            handleChange("paymentStatus", e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>

                          <option value="paid">Paid</option>
                        </select>

                        <small className="text-muted">
                          Select paid if guest already paid cash.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            {summary && (
              <div className="col-12">
                <div className="card border border-success">
                  <div className="card-header bg-success-subtle">
                    <h5 className="card-title mb-0 text-success">
                      <i className="ri-file-list-3-line me-2"></i>
                      Booking Summary
                    </h5>
                  </div>

                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3 col-6">
                        <p className="text-muted mb-1 fs-12">Room</p>

                        <h6 className="fw-semibold">
                          Room {summary.room.roomNumber}
                        </h6>
                      </div>

                      <div className="col-md-3 col-6">
                        <p className="text-muted mb-1 fs-12">Type</p>

                        <h6 className="fw-semibold">{summary.room.type}</h6>
                      </div>

                      <div className="col-md-3 col-6">
                        <p className="text-muted mb-1 fs-12">Guests Allowed</p>

                        <h6 className="fw-semibold">
                          {summary.room.capacity || summary.room.maxGuests || 1}
                        </h6>
                      </div>

                      <div className="col-md-3 col-6">
                        <p className="text-muted mb-1 fs-12">Nights</p>

                        <h6 className="fw-semibold">{summary.days}</h6>
                      </div>

                     <div className="col-12 border-top pt-3">

                        {/* Loyalty Points Section */}
                        {form.guestEmail && (
                          <div className="mb-3 p-3 rounded" style={{ background: '#f0f9f6', border: '1px solid #0ab39c' }}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="fw-medium fs-13">🎁 Loyalty Points</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={async () => {
                                  try {
                                    const userRes = await api.get(`${API_URL}/auth/users`, { headers });
                                    const users = userRes.data.users || [];
                                    const guest = users.find(u => u.email === form.guestEmail);
                                    if (guest) {
                                      const loyaltyRes = await api.get(`${API_URL}/guest-crm/${guest._id}/loyalty`, { headers });
                                      handleChange('availablePoints', loyaltyRes.data.points || 0);
                                    } else {
                                      handleChange('availablePoints', 0);
                                    }
                                  } catch { handleChange('availablePoints', 0); }
                                }}
                              >
                                Check Points
                              </button>
                            </div>

                            {form.availablePoints > 0 && (
                              <div>
                                <div className="text-muted fs-12 mb-2">
                                  Available: <strong>{form.availablePoints} points</strong> = PKR {(form.availablePoints * 10).toLocaleString()} discount
                                </div>
                                <div className="d-flex gap-2 align-items-center">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Points to redeem"
                                    min={0}
                                    max={form.availablePoints}
                                    value={form.redeemPoints || ''}
                                    onChange={e => handleChange('redeemPoints', Number(e.target.value))}
                                    style={{ width: 150 }}
                                  />
                                  <span className="text-success fs-13 fw-medium">
                                    = PKR {((form.redeemPoints || 0) * 10).toLocaleString()} off
                                  </span>
                                </div>
                              </div>
                            )}

                            {form.availablePoints === 0 && (
                              <div className="text-muted fs-12">Enter email and click "Check Points"</div>
                            )}
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fs-15 text-muted">Total Amount:</span>
                          <div className="text-end">
                            {form.redeemPoints > 0 && (
                              <div className="text-danger fs-13 text-decoration-line-through">
                                PKR {summary.total.toLocaleString()}
                              </div>
                            )}
                            <span className="fs-20 fw-bold text-success">
                              PKR {Math.max(0, summary.total - (form.redeemPoints * 10)).toLocaleString()}
                            </span>
                            {form.redeemPoints > 0 && (
                              <div className="text-success fs-12">
                                🎁 {form.redeemPoints} points redeemed — PKR {(form.redeemPoints * 10).toLocaleString()} discount
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="col-12 text-end">
              <button
                className="btn btn-light me-2"
                onClick={() => navigate("/admin/bookings")}
              >
                Cancel
              </button>

              <button
                className="btn btn-success btn-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                <i className="ri-calendar-check-line me-1"></i>

                {loading ? "Creating..." : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingNew;
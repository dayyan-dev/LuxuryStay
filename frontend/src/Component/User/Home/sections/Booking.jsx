import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getSingleRoom } from "../../../../api/roomApi";
import { validatePromoCode } from "../../../../api/offerApi";
import { useAuth } from "../../../../Context/AuthContext";
import AvailabilityCalendar from "./AvailabilityCalendar";
import {
  formatRoomTitle,
  getUploadUrl,
  isRoomBookingBlocked,
} from "../../../../utils/userMedia";

const BookingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, refreshAccessToken } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [guestError, setGuestError] = useState("");
  const [dateError, setDateError] = useState("");
  const [calendarConflict, setCalendarConflict] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState(searchParams.get("promo") || "");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);
  const [promoValidating, setPromoValidating] = useState(false);

  // Helper date strings
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Compute smart initial dates from search params or intelligent 1-2 night defaults
  const initialDates = useMemo(() => {
    const qIn = searchParams.get("checkIn");
    const qOut = searchParams.get("checkOut");
    const qGuests = parseInt(searchParams.get("guests"), 10) || 1;

    if (qIn && qOut && qOut > qIn && qIn >= todayStr) {
      return { checkInDate: qIn, checkOutDate: qOut, guests: qGuests };
    }

    // Default: Check-in Today (or Tomorrow), Check-out +2 days
    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);

    return {
      checkInDate: today.toISOString().split("T")[0],
      checkOutDate: nextDay.toISOString().split("T")[0],
      guests: qGuests,
    };
  }, [searchParams, todayStr]);

  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    checkInDate: initialDates.checkInDate,
    checkOutDate: initialDates.checkOutDate,
    guests: initialDates.guests,
    paymentMethod: "cash",
    specialRequests: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/user-login", { state: { from: `/booking/${roomId}` } });
    }
  }, [user, navigate, roomId]);

  // Prefill promo from Offers deep-link / session
  useEffect(() => {
    let code = searchParams.get("promo") || "";
    if (!code) {
      try {
        code = sessionStorage.getItem("pendingPromoCode") || "";
      } catch { /* ignore */ }
    }
    if (code) {
      setPromoInput(code.toUpperCase());
      try {
        sessionStorage.removeItem("pendingPromoCode");
      } catch { /* ignore */ }
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        guestName: prev.guestName || user.name || "",
        guestEmail: prev.guestEmail || user.email || "",
        guestPhone: prev.guestPhone || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setFetching(true);
        const data = await getSingleRoom(roomId);
        setRoom(data.room || data);
      } catch (err) {
        console.warn("Room fetch notice:", err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Clamp guests to room capacity once room is known (URL may request more than capacity)
  useEffect(() => {
    if (!room) return;
    const max = Number(room.capacity) || 4;
    setForm((prev) => {
      const current = Number(prev.guests) || 1;
      if (current > max) {
        setPromoMessage({
          success: false,
          text: `Guest count reduced to ${max} (this room's maximum capacity).`,
        });
        setGuestError("");
        return { ...prev, guests: max };
      }
      setGuestError("");
      return prev;
    });
  }, [room]);

  // Recalculate duration in nights
  const nights = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) return 0;
    const inD = new Date(form.checkInDate);
    const outD = new Date(form.checkOutDate);
    const diff = Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [form.checkInDate, form.checkOutDate]);

  // Pricing breakdown — room rates are GST-inclusive; show portion, do not add again
  const roomPrice = Number(room?.price) || 0;
  const subtotal = nights * roomPrice;
  const taxRate = 0.13; // 13% GST (included in published rate)
  const totalAmount = Math.max(0, subtotal - promoDiscount);
  const estimatedTax = Math.round((totalAmount * taxRate) / (1 + taxRate));
  const roomBlocked = isRoomBookingBlocked(room?.status);

  // Minimum allowed checkout date is day after selected check-in date
  const minCheckOutDate = useMemo(() => {
    if (!form.checkInDate) return todayStr;
    const d = new Date(form.checkInDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, [form.checkInDate, todayStr]);

  const getMaxGuests = () => room?.capacity || 4;

  const handlePhoneInput = (val) => {
    const onlyNums = val.replace(/\D/g, "").slice(0, 11);
    if (onlyNums.length > 0 && !onlyNums.startsWith("03")) {
      return "03" + onlyNums.replace(/^0*3*/, "").slice(0, 9);
    }
    return onlyNums;
  };

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    if (val < todayStr) {
      setDateError("Check-in date cannot be in the past.");
      return;
    }
    setDateError("");

    // Auto-advance checkout if checkout is missing or before/equal to new checkin
    if (!form.checkOutDate || form.checkOutDate <= val) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setForm((prev) => ({
        ...prev,
        checkInDate: val,
        checkOutDate: nextDay.toISOString().split("T")[0],
      }));
    } else {
      setForm((prev) => ({ ...prev, checkInDate: val }));
    }
  };

  const handleCheckOutChange = (e) => {
    const val = e.target.value;
    if (form.checkInDate && val <= form.checkInDate) {
      setDateError("Check-out date must be at least 1 night after check-in.");
      return;
    }
    setDateError("");
    setForm((prev) => ({ ...prev, checkOutDate: val }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "guestPhone") {
      setForm({ ...form, guestPhone: handlePhoneInput(value) });
      return;
    }

    if (name === "guests") {
      const max = getMaxGuests();
      if (Number(value) > max) {
        setGuestError(`${room?.type || "This"} suite allows maximum ${max} guest(s).`);
        return;
      } else {
        setGuestError("");
      }
    }

    setForm({ ...form, [name]: value });
  };

  // Synchronized callback from AvailabilityCalendar
  const handleCalendarDatesChange = (checkInDate, checkOutDate) => {
    setDateError("");
    setForm((prev) => ({
      ...prev,
      checkInDate: checkInDate || prev.checkInDate,
      checkOutDate: checkOutDate || prev.checkOutDate,
    }));
  };

  // Apply promotional voucher
  const handleApplyPromo = async () => {
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (nights === 0) {
      setPromoMessage({
        success: false,
        text: "Please select valid check-in and check-out dates first.",
      });
      return;
    }

    setPromoValidating(true);
    setPromoMessage(null);

    try {
      const res = await validatePromoCode({
        code: cleanCode,
        totalAmount: subtotal,
        nights,
        hotelId: room?.hotelId?._id || room?.hotelId,
      });

      if (res.success && res.data) {
        setPromoDiscount(res.data.discountAmount);
        setAppliedPromo(res.data);
        setPromoMessage({
          success: true,
          text: `Voucher '${res.data.code}' applied! Saved PKR ${res.data.discountAmount.toLocaleString()}`,
        });
      }
    } catch (err) {
      setPromoDiscount(0);
      setAppliedPromo(null);
      setPromoMessage({
        success: false,
        text:
          err.response?.data?.message ||
          "Invalid or expired promotional code. Please check requirements.",
      });
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setPromoDiscount(0);
    setAppliedPromo(null);
    setPromoMessage(null);
  };

  const createBooking = async (bookingData) => {
    let currentToken = token;
    const apiUrl =
      (process.env.REACT_APP_API_URL || "http://localhost:5001/api") + "/bookings";
    try {
      const response = await axios.post(apiUrl, bookingData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        currentToken = await refreshAccessToken();
        if (!currentToken) throw err;
        const response = await axios.post(apiUrl, bookingData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });
        return response.data;
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (roomBlocked) {
      setErrorModal({
        show: true,
        message:
          "This room is currently under maintenance or otherwise unavailable and cannot be booked.",
      });
      return;
    }

    if (!form.checkInDate || !form.checkOutDate) {
      setErrorModal({
        show: true,
        message: "Please specify both check-in and check-out dates.",
      });
      return;
    }

    if (nights <= 0) {
      setErrorModal({
        show: true,
        message: "Stay duration must be at least 1 night.",
      });
      return;
    }

    if (calendarConflict) {
      setErrorModal({
        show: true,
        message:
          "This suite is already reserved on some of your selected dates. Please adjust your stay.",
      });
      return;
    }

    if (Number(form.guests) > getMaxGuests()) {
      setErrorModal({
        show: true,
        message: `Maximum guest capacity for this room is ${getMaxGuests()}.`,
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomId,
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim(),
        guestEmail: form.guestEmail.trim(),
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guests: Number(form.guests) || 1,
        // Online gateway not live — always settle at hotel
        paymentMethod: "cash",
        specialRequests: form.specialRequests,
        promoCode: appliedPromo?.code || null,
        userId: user?._id || user?.id,
      };

      const res = await createBooking(payload);
      // Prefer server booking so success UI shows trusted totalAmount / reference
      const saved = res?.booking || res?.data || payload;
      setConfirmedBooking(saved);
      setShowSuccessModal(true);
      try {
        sessionStorage.setItem(
          "luxurystay_last_booking",
          JSON.stringify({ id: saved._id, ref: saved.bookingReference })
        );
      } catch { /* ignore */ }
    } catch (err) {
      console.error("Booking error:", err);
      setErrorModal({
        show: true,
        message:
          err.response?.data?.message ||
          "Unable to confirm booking. The dates may conflict with an existing reservation.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (fetching) {
    return (
      <div className="text-center py-5" style={{ minHeight: "60vh" }}>
        <div className="ls-loader mx-auto my-5" />
        <p className="text-muted">Loading suite details & availability...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container text-center py-5 my-5">
        <h2 className="ls-serif mb-3">Room Not Found</h2>
        <p className="text-muted mb-4">
          The selected accommodation is no longer available or was removed.
        </p>
        <button className="ls-btn-gold" onClick={() => navigate("/room")}>
          Browse All Rooms
        </button>
      </div>
    );
  }

  if (roomBlocked) {
    return (
      <div className="container text-center py-5 my-5">
        <h2 className="ls-serif mb-3">Room Unavailable</h2>
        <p className="text-muted mb-4">
          {formatRoomTitle(room)} (Room {room.roomNumber}) is currently under
          maintenance or otherwise unavailable for new reservations.
        </p>
        <button className="ls-btn-gold" onClick={() => navigate("/room")}>
          Browse Available Rooms
        </button>
      </div>
    );
  }

  return (
    <section
      className="py-5 ls-print-surface"
      style={{ minHeight: "100vh" }}
    >
      <div className="container">
        {/* Header Title */}
        <div className="text-center mb-4">
          <span className="ls-section-tag">Direct Reservation</span>
          <h1 className="ls-serif display-6 fw-bold mb-1">
            Complete Your Stay Reservation
          </h1>
          <p className="text-muted small">
            Guaranteed best rates with instant confirmation and flexible cancellation policy.
          </p>
        </div>

        <div className="row g-4 align-items-start">
          {/* Left Column: Guest Details & Stay Selection */}
          <div className="col-lg-7">
            <div
              className="bg-white shadow-sm rounded-3 p-4 p-lg-5 border"
              style={{ borderColor: "var(--ls-border-warm, #E6DFD3)" }}
            >
              <h3 className="ls-serif mb-4" style={{ fontSize: "1.35rem" }}>
                <i
                  className="fa-solid fa-user me-2"
                  style={{ color: "var(--theme-primary, #1B365D)" }}
                ></i>
                Guest Information
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-md-6">
                    <label className="ls-search-label">Full Name *</label>
                    <input
                      type="text"
                      name="guestName"
                      className="form-control"
                      placeholder="e.g. Tariq Mehmood"
                      value={form.guestName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label className="ls-search-label">
                      Contact Phone (03xx-xxxxxxx) *
                    </label>
                    <input
                      type="text"
                      name="guestPhone"
                      className="form-control"
                      placeholder="03001234567"
                      value={form.guestPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="ls-search-label">
                      Email Address (for Confirmation & PDF Invoice) *
                    </label>
                    <input
                      type="email"
                      name="guestEmail"
                      className="form-control"
                      placeholder="name@domain.com"
                      value={form.guestEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* ── EXPLICIT STAY DATES INPUTS (Fixes PKR 0 Issue) ── */}
                  <div className="col-12 mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="ls-search-label mb-0">
                        <i
                          className="fa-regular fa-calendar-check me-1.5"
                          style={{ color: "var(--theme-primary, #1B365D)" }}
                        ></i>
                        Select Stay Dates *
                      </label>
                      {nights > 0 && (
                        <span
                          className="badge px-3 py-1.5 rounded-pill"
                          style={{
                            background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.15))",
                            border: "1px solid var(--theme-primary, #1B365D)",
                            color: "var(--color-accent-dark, var(--theme-primary-hover, #122642))",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                          }}
                        >
                          <i className="fa-solid fa-moon me-1"></i>
                          {nights} Night{nights !== 1 ? "s" : ""} Stay
                        </span>
                      )}
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label
                          className="small text-muted mb-1 d-block"
                          style={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          CHECK-IN DATE
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          min={todayStr}
                          value={form.checkInDate}
                          onChange={handleCheckInChange}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label
                          className="small text-muted mb-1 d-block"
                          style={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          CHECK-OUT DATE
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          min={minCheckOutDate}
                          value={form.checkOutDate}
                          onChange={handleCheckOutChange}
                          required
                        />
                      </div>
                    </div>

                    {dateError && (
                      <div className="alert alert-warning py-2 px-3 small mb-2">
                        <i className="fa-solid fa-circle-exclamation me-1.5"></i>
                        {dateError}
                      </div>
                    )}

                    {/* Interactive Synchronized Suite Calendar */}
                    <AvailabilityCalendar
                      roomId={roomId}
                      checkInDate={form.checkInDate}
                      checkOutDate={form.checkOutDate}
                      onChange={handleCalendarDatesChange}
                      onConflictChange={setCalendarConflict}
                    />
                  </div>

                  {/* Guest Count */}
                  <div className="col-md-6 mt-3">
                    <label className="ls-search-label">Number of Guests *</label>
                    <input
                      type="number"
                      name="guests"
                      className={`form-control ${guestError ? "is-invalid" : ""}`}
                      min="1"
                      max={getMaxGuests()}
                      value={form.guests}
                      onChange={handleChange}
                      required
                    />
                    {guestError ? (
                      <small className="text-danger mt-1 d-block">
                        {guestError}
                      </small>
                    ) : (
                      <small className="text-muted mt-1 d-block">
                        Max {getMaxGuests()} guest(s) allowed for this room
                      </small>
                    )}
                  </div>

                  {/* Payment Method — online gateway not live yet */}
                  <div className="col-md-6 mt-3">
                    <label className="ls-search-label">Payment Method *</label>
                    <select
                      name="paymentMethod"
                      className="form-select"
                      value="cash"
                      disabled
                    >
                      <option value="cash">
                        Pay at Hotel (Cash or Cit Card on arrival)
                      </option>
                    </select>
                    <small className="text-muted mt-1 d-block">
                      Online card / JazzCash / Easypaisa checkout is coming soon.
                      Advance bank wire: +92 21 111 505 505.
                    </small>
                  </div>

                  {/* Payment Info Note */}
                  <div className="col-12">
                    <div
                      className="p-3 rounded small d-flex align-items-start gap-2.5"
                      style={{
                        background: "rgba(50, 122, 88, 0.08)",
                        border: "1px solid rgba(50, 122, 88, 0.25)",
                      }}
                    >
                      <i
                        className="fa-solid fa-shield-check mt-0.5"
                        style={{ color: "#327A58", fontSize: "1rem" }}
                      ></i>
                      <div style={{ color: "#24583F", lineHeight: 1.5 }}>
                        <strong>Guaranteed Direct Reservation:</strong> Zero upfront
                        charge required today. Full payment of{" "}
                        <strong>PKR {totalAmount.toLocaleString()}</strong> will be
                        collected at the front desk during check-in via Cash, Visa,
                        or Mastercard.
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="col-12">
                    <label className="ls-search-label">
                      Special Requests & Preferences
                    </label>
                    <textarea
                      rows="2"
                      name="specialRequests"
                      className="form-control"
                      placeholder="High floor, quiet suite, airport pickup, late arrival..."
                      value={form.specialRequests}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="d-flex gap-3 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="ls-btn-outline px-4"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="ls-btn-primary px-5 flex-grow-1"
                    disabled={
                      loading ||
                      nights === 0 ||
                      calendarConflict ||
                      !!guestError ||
                      roomBlocked
                    }
                  >
                    {loading
                      ? "Securing Reservation..."
                      : `Confirm Booking • PKR ${totalAmount.toLocaleString()}`}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Pricing Breakdown & Room Summary */}
          <div className="col-lg-5">
            <div
              className="bg-white shadow-sm rounded-3 overflow-hidden border position-sticky"
              style={{
                top: "90px",
                borderColor: "var(--ls-border-warm, #E6DFD3)",
              }}
            >
              {/* Room Image with Badge */}
              <div
                style={{
                  height: "200px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={getUploadUrl(room?.images?.[0])}
                  alt={formatRoomTitle(room)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "var(--color-primary, #292722)",
                    color: "var(--theme-primary, #1B365D)",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  Room {room.roomNumber}
                </span>
              </div>

              <div className="p-4">
                <span
                  className="ls-section-tag mb-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {(room.type || "Room").toString().toUpperCase()}
                </span>
                <h4 className="ls-serif mb-2">
                  {formatRoomTitle(room)}
                </h4>
                <p className="text-muted small mb-3">
                  {room.description?.slice(0, 110)}...
                </p>

                {/* Promotional Code Input Box */}
                <div
                  className="p-3 rounded mb-3"
                  style={{
                    background: "var(--color-surface-subtle, #FAF8F5)",
                    border: "1px solid var(--color-border, #E8E2D9)",
                  }}
                >
                  <label className="ls-search-label mb-2">
                    Have a Promotional Code?
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase fw-bold"
                      placeholder="e.g. NORTH25 or WEEKEND20"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      disabled={appliedPromo !== null}
                    />
                    {appliedPromo ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleRemovePromo}
                        type="button"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleApplyPromo}
                        disabled={promoValidating || !promoInput.trim()}
                        type="button"
                      >
                        {promoValidating ? "Checking..." : "Apply"}
                      </button>
                    )}
                  </div>

                  {promoMessage && (
                    <div
                      className={`small mt-2 ${
                        promoMessage.success
                          ? "text-success fw-bold"
                          : "text-danger"
                      }`}
                    >
                      {promoMessage.text}
                    </div>
                  )}

                  <div
                    className="small text-muted mt-2"
                    style={{ fontSize: "0.74rem" }}
                  >
                    💡 Active Codes: <strong>WEEKEND20</strong> (20% Off, min 2n),{" "}
                    <strong>NORTH25</strong> (25% Off, min 2n), or{" "}
                    <strong>BIZFLAT5K</strong> (PKR 5,000 Off)
                  </div>
                </div>

                {/* ── ITEMIZED PRICE BREAKDOWN (Accurate & Reactive) ── */}
                <div className="border rounded p-3 mb-3 bg-light">
                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Base Rate</span>
                    <span className="fw-semibold text-dark">
                      PKR {roomPrice.toLocaleString()} / night
                    </span>
                  </div>

                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Stay Duration</span>
                    <span className="fw-semibold text-dark">
                      {nights} Night{nights !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Subtotal</span>
                    <span className="fw-semibold text-dark">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="d-flex justify-content-between small text-success fw-bold mb-2">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span>- PKR {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>Est. GST portion (included in rate)</span>
                    <span className="text-secondary">
                      PKR {estimatedTax.toLocaleString()} (13%)
                    </span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold d-block text-dark">
                        Total Amount Payable
                      </span>
                      <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                        Payable at check-in (Cash / Card)
                      </small>
                    </div>
                    <span
                      className="fs-5 fw-bold ls-serif"
                      style={{ color: "var(--color-primary, #292722)" }}
                    >
                      PKR {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="small text-muted text-center">
                  <i
                    className="fa-solid fa-lock me-1"
                    style={{ color: "var(--theme-primary, #1B365D)" }}
                  ></i>
                  Encrypted & Secure 256-Bit Reservation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUCCESS CONFIRMATION MODAL ── */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="bg-white rounded-3 shadow p-4 p-md-5 text-center position-relative"
            style={{
              maxWidth: "520px",
              width: "100%",
              border: "1px solid var(--color-border, #E8E2D9)",
            }}
          >
            {/* Gold Checkmark */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background:
                  "var(--theme-primary-gradient, var(--theme-primary, #1B365D))",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 1.25rem",
                fontSize: 30,
                boxShadow: "0 8px 24px var(--theme-primary-soft, rgba(27, 54, 93, 0.40))",
              }}
            >
              ✓
            </div>

            <h3 className="ls-serif mb-1">Reservation Confirmed!</h3>
            <p className="text-muted small mb-3">
              Thank you for choosing LuxuryStay Hospitality. Your direct reservation has been secu.
            </p>

            {/* Unique Booking Reference Badge */}
            {confirmedBooking?.bookingReference && (
              <div className="mb-3">
                <span
                  className="px-3 py-1.5 rounded-pill font-monospace"
                  style={{
                    background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.15))",
                    border: "1px solid var(--theme-primary, #1B365D)",
                    color: "var(--color-primary, #292722)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  REF: {confirmedBooking.bookingReference}
                </span>
              </div>
            )}

            {/* Itemized Summary */}
            <div
              className="p-3 rounded text-start mb-4"
              style={{
                background: "var(--color-surface-subtle, #FAF8F5)",
                border: "1px solid var(--color-border, #E8E2D9)",
              }}
            >
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Reserved Suite:</span>
                <span className="fw-bold">
                  {formatRoomTitle(room)} — Room {room?.roomNumber}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Guest Name:</span>
                <span className="fw-bold">
                  {confirmedBooking?.guestName || form.guestName}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Stay Dates:</span>
                <span className="fw-bold">
                  {(confirmedBooking?.checkInDate || form.checkInDate)?.toString?.().slice?.(0, 10) || form.checkInDate}
                  {" → "}
                  {(confirmedBooking?.checkOutDate || form.checkOutDate)?.toString?.().slice?.(0, 10) || form.checkOutDate}
                  {" "}({nights} Night{nights !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Payment Method:</span>
                <span className="fw-bold">Pay at Hotel (Cash / Card)</span>
              </div>
              <div className="d-flex justify-content-between py-1 small">
                <span className="text-muted">Total Payable:</span>
                <span className="fw-bold text-dark fs-6">
                  PKR{" "}
                  {Number(
                    confirmedBooking?.totalAmount ?? totalAmount
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                className="ls-btn-primary py-2.5"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/profile");
                }}
              >
                View in My Bookings & Download Invoice
              </button>
              <button
                className="ls-btn-outline py-2.5"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/home");
                }}
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR NOTICE MODAL ── */}
      {errorModal.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setErrorModal({ show: false, message: "" })}
        >
          <div
            className="bg-white rounded-3 shadow p-4 text-center"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#EF4444",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 1rem",
                fontSize: 26,
              }}
            >
              ✕
            </div>
            <h4 className="ls-serif mb-2">Reservation Notice</h4>
            <p className="text-muted small mb-4">{errorModal.message}</p>
            <button
              className="ls-btn-primary w-100 py-2"
              onClick={() => setErrorModal({ show: false, message: "" })}
            >
              Adjust Stay Details
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingPage;

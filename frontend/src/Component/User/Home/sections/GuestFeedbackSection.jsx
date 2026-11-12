import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../Context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "G";

const getRoomOptionLabel = (room) => {
  const num = room?.roomNumber ? `Room ${room.roomNumber}` : "";
  const type = room?.type
    ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
    : "";
  const title = room?.title || room?.name || "";
  if (title) return num ? `${title} (${num})` : title;
  if (num && type) return `${num} — ${type}`;
  return num || type || "Luxury Suite";
};

export default function GuestFeedbackSection({ rooms = [] }) {
  const { user, token } = useAuth();
  const location = useLocation();
  const isLoggedIn = Boolean(user && token);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [review, setReview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API_URL}/feedbacks/public`)
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data)
          ? res.data.filter(
              (f) => f.review && !String(f.review).startsWith("[Guest Inquiry]")
            )
          : [];
        setFeedbacks(list);
      })
      .catch(() => {
        if (mounted) setFeedbacks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#guest-feedback") {
      const el = document.getElementById("guest-feedback");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    }
  }, [location.hash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isLoggedIn) {
      setErrorMsg("Please sign in first to submit your feedback.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg("Please select a star rating from 1 to 5.");
      return;
    }
    if (review.trim().length < 5) {
      setErrorMsg("Please write at least a short review (minimum 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: user.name || "Guest",
        email: user.email || "",
        phone: user.phone || "",
        rating,
        review: review.trim(),
        roomName: roomName.trim(),
      };
      const userId = user._id || user.id;
      if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) {
        payload.userId = userId;
      }

      const res = await axios.post(`${API_URL}/feedbacks`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const created = res.data?.feedback || {
        _id: `temp-${Date.now()}`,
        name: payload.name,
        roomName: payload.roomName,
        rating: payload.rating,
        review: payload.review,
        createdAt: new Date().toISOString(),
      };

      setFeedbacks((prev) => [created, ...prev]);
      setRating(0);
      setHoverRating(0);
      setRoomName("");
      setReview("");
      setSuccessMsg("Thank you! Your feedback has been published.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = feedbacks.length
    ? (
        feedbacks.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        feedbacks.length
      ).toFixed(1)
    : "5.0";

  const visibleFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 4);
  const activeStars = hoverRating || rating;

  return (
    <section
      id="guest-feedback"
      className="py-5"
      style={{
        background: "var(--theme-bg-primary, #F8FAFC)",
        borderTop: "1px solid var(--theme-border, #E2E8F0)",
      }}
    >
      <div className="container py-3 py-md-4">
        {/* Section Heading */}
        <div className="text-center mx-auto mb-5" style={{ maxWidth: 680 }}>
          <span
            className="d-inline-block text-uppercase fw-600 rounded-pill px-3 py-1 mb-3"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.1))",
              color: "var(--theme-primary, #1B365D)",
            }}
          >
            Guest Feedback & Reviews
          </span>
          <h2
            className="heading-font-family fw-600 mb-2"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Share Your <span className="text-primary">Room Experience</span>
          </h2>
          <p className="text-muted mb-0">
            Read verified reviews from our guests or sign in to rate your stay and rooms.
          </p>
        </div>

        <div className="row g-4 align-items-start">
          {/* Left Column: Submit Feedback / Register & Login Gate */}
          <div className="col-12 col-lg-5">
            <div
              className="bg-white rounded-4 p-4 p-md-5 shadow-sm"
              style={{ border: "1px solid var(--theme-border, #E2E8F0)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3
                  className="heading-font-family fw-600 mb-0"
                  style={{ fontSize: "1.4rem" }}
                >
                  Leave Feedback
                </h3>
                <span
                  className="rounded-pill px-3 py-1 fw-600"
                  style={{
                    fontSize: "0.78rem",
                    background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.08))",
                    color: "var(--theme-primary, #1B365D)",
                  }}
                >
                  ★ {avgRating} ({feedbacks.length})
                </span>
              </div>

              {isLoggedIn ? (
                <form onSubmit={handleSubmit}>
                  {/* Signed-in identity badge */}
                  <div
                    className="d-flex align-items-center gap-2 rounded-3 p-2 px-3 mb-3"
                    style={{
                      background: "rgba(39, 174, 96, 0.08)",
                      border: "1px solid rgba(39, 174, 96, 0.25)",
                    }}
                  >
                    <i className="fa-solid fa-circle-check text-success" />
                    <div className="small">
                      <span className="text-muted">Posting as </span>
                      <strong className="text-dark">{user.name}</strong>
                    </div>
                  </div>

                  {/* Optional Room Picker */}
                  <div className="mb-3">
                    <label
                      htmlFor="feedback-room-select"
                      className="form-label fw-600 small"
                    >
                      Room / Experience (Optional)
                    </label>
                    <select
                      id="feedback-room-select"
                      className="form-select rounded-3"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    >
                      <option value="">General Hotel & Stay Experience</option>
                      {Array.isArray(rooms) &&
                        rooms.map((r) => {
                          const label = getRoomOptionLabel(r);
                          return (
                            <option key={r._id || label} value={label}>
                              {label}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  {/* Interactive 5-Star Rating */}
                  <div className="mb-3">
                    <label className="form-label fw-600 small d-block">
                      Your Rating <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setRating(star);
                            setErrorMsg("");
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} stars`}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "2px 4px",
                            cursor: "pointer",
                            fontSize: "1.65rem",
                            lineHeight: 1,
                            color: activeStars >= star ? "#f59e0b" : "#cbd5e1",
                            transition: "transform 0.15s ease, color 0.15s ease",
                            transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                          }}
                        >
                          <i className="fa-solid fa-star" />
                        </button>
                      ))}
                      {activeStars > 0 && (
                        <span className="small fw-600 text-muted ms-1">
                          {RATING_LABELS[activeStars]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Textarea */}
                  <div className="mb-3">
                    <label
                      htmlFor="feedback-review-input"
                      className="form-label fw-600 small"
                    >
                      Your Feedback <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="feedback-review-input"
                      className="form-control rounded-3"
                      rows={4}
                      placeholder="Write about room comfort, cleanliness, staff hospitality..."
                      value={review}
                      onChange={(e) => {
                        setReview(e.target.value);
                        setErrorMsg("");
                      }}
                    />
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger py-2 px-3 small mb-3">
                      <i className="fa-solid fa-circle-exclamation me-1" />
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="alert alert-success py-2 px-3 small mb-3">
                      <i className="fa-solid fa-circle-check me-1" />
                      {successMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn w-100 rounded-pill fw-600 py-2"
                    style={{
                      background:
                        "var(--theme-primary-gradient, var(--theme-primary, #1B365D))",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {submitting ? "Submitting Feedback..." : "Submit Feedback"}
                  </button>
                </form>
              ) : (
                <div>
                  <p className="text-muted small mb-3">
                    To keep guest feedback authentic, please create an account and sign in
                    before posting your review.
                  </p>

                  <div
                    className="rounded-3 p-3 mb-4"
                    style={{
                      background: "var(--theme-bg-primary, #F8FAFC)",
                      border: "1px dashed var(--theme-border, #CBD5E1)",
                    }}
                  >
                    <div className="d-flex flex-column gap-2 small text-dark">
                      <div>
                        <span className="badge bg-primary me-2">1</span>
                        Register your guest account
                      </div>
                      <div>
                        <span className="badge bg-primary me-2">2</span>
                        Verify email OTP &amp; sign in
                      </div>
                      <div>
                        <span className="badge bg-primary me-2">3</span>
                        Rate &amp; post your room feedback here
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <Link
                      to="/user-login"
                      state={{ from: "/rooms#guest-feedback" }}
                      className="btn rounded-pill fw-600 py-2"
                      style={{
                        background:
                          "var(--theme-primary-gradient, var(--theme-primary, #1B365D))",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      <i className="fa-solid fa-right-to-bracket me-2" />
                      Sign In to Leave Feedback
                    </Link>

                    <Link
                      to="/register"
                      state={{ from: "/rooms#guest-feedback" }}
                      className="btn btn-outline-secondary rounded-pill fw-600 py-2"
                    >
                      <i className="fa-solid fa-user-plus me-2" />
                      Register New Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Public Reviews */}
          <div className="col-12 col-lg-7">
            {loading ? (
              <div className="bg-white rounded-4 p-5 text-center shadow-sm">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : visibleFeedbacks.length === 0 ? (
              <div
                className="bg-white rounded-4 p-5 text-center shadow-sm"
                style={{ border: "1px solid var(--theme-border, #E2E8F0)" }}
              >
                <i
                  className="fa-regular fa-comment-dots mb-3"
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--theme-primary, #1B365D)",
                    opacity: 0.6,
                  }}
                />
                <h4 className="heading-font-family fw-600">No Guest Feedback Yet</h4>
                <p className="text-muted mb-0">
                  Be the first registered guest to share your thoughts on our rooms and service!
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {visibleFeedbacks.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-4 p-4 shadow-sm"
                    style={{ border: "1px solid var(--theme-border, #E2E8F0)" }}
                  >
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-700"
                          style={{
                            width: 42,
                            height: 42,
                            background: "var(--theme-primary, #1B365D)",
                            color: "#fff",
                            fontSize: "0.85rem",
                          }}
                        >
                          {getInitials(item.name)}
                        </div>
                        <div>
                          <div className="fw-600 text-dark">{item.name || "Guest"}</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Just now"}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {item.roomName && (
                          <span
                            className="badge rounded-pill fw-500"
                            style={{
                              background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.1))",
                              color: "var(--theme-primary, #1B365D)",
                              fontSize: "0.75rem",
                              padding: "0.35rem 0.7rem",
                            }}
                          >
                            {item.roomName}
                          </span>
                        )}
                        <div className="d-flex align-items-center gap-1">
                          {Array.from({ length: 5 }, (_, idx) => (
                            <i
                              key={idx}
                              className={`fa-star ${
                                idx < item.rating
                                  ? "fa-solid text-warning"
                                  : "fa-regular text-muted"
                              }`}
                              style={{ fontSize: "0.8rem" }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-body-secondary mb-0 lh-base">"{item.review}"</p>

                    {item.adminReply && (
                      <div
                        className="mt-3 p-3 rounded-3"
                        style={{
                          background: "var(--theme-primary-soft, rgba(27, 54, 93, 0.06))",
                          borderLeft: "3px solid var(--theme-primary, #1B365D)",
                        }}
                      >
                        <div className="small fw-600 text-primary mb-1">
                          <i className="fa-solid fa-reply me-1" /> Hotel Response
                        </div>
                        <p className="small text-body-secondary mb-0">{item.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}

                {feedbacks.length > 4 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll
                        ? "Show Fewer Reviews"
                        : `View All ${feedbacks.length} Reviews`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

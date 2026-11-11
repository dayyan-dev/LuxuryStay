import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

export default function FeedbackModal({ booking, onClose, onSubmitted, showPopup }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRatingError("");
    setReviewError("");

    let hasError = false;
    if (!rating || rating < 1) {
      setRatingError("Please select a rating");
      hasError = true;
    }
    if (!review.trim()) {
      setReviewError("Please write your review");
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const payload = {
        name: booking.guestName || user?.name || "Guest",
        email: booking.guestEmail || user?.email || "",
        phone: booking.guestPhone || user?.phone || "",
        rating,
        review: review.trim(),
        bookingId: booking._id,
      };
      const userId = user?._id || user?.id;
      if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) payload.userId = userId;

      await axios.post(`${BASE_URL}/feedbacks`, payload);
      showPopup?.("success", "Thank you! Your feedback has been submitted.");
      onSubmitted?.(booking._id);
      onClose();
    } catch (error) {
      setReviewError(error.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: 32,
          maxWidth: 460, width: "100%", position: "relative",
          fontFamily: "'Jost', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", fontSize: 20, cursor: "pointer", color: "#999",
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 }}>
          Rate Your Stay
        </h4>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          Room {booking.roomNo || booking?.roomId?.roomNumber || ""} — {booking.checkInDate && new Date(booking.checkInDate).toLocaleDateString()} to {booking.checkOutDate && new Date(booking.checkOutDate).toLocaleDateString()}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-600" style={{ fontSize: 14 }}>
              Rating <span style={{ color: "" }}>*</span>
            </label>
            <div style={{ fontSize: 28, cursor: "pointer", lineHeight: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-solid fa-star ${rating >= star ? "text-warning" : "text-muted"}`}
                  onClick={() => { setRating(star); setRatingError(""); }}
                  style={{ marginRight: 8 }}
                />
              ))}
            </div>
            {ratingError && (
              <small className="text-danger d-block mt-1">
                <i className="fa-solid fa-circle-exclamation me-1"></i>{ratingError}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-600" style={{ fontSize: 14 }}>
              Your Review <span style={{ color: "" }}>*</span>
            </label>
            <textarea
              className="form-control rounded-4"
              rows={4}
              placeholder="Tell us about your stay..."
              value={review}
              onChange={(e) => { setReview(e.target.value); setReviewError(""); }}
            />
            {reviewError && (
              <small className="text-danger d-block mt-1">
                <i className="fa-solid fa-circle-exclamation me-1"></i>{reviewError}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn w-100 rounded-pill"
            style={{
              background: "var(--theme-primary-gradient, var(--theme-primary, #1B365D))",
              color: "#fff", border: "none", padding: "10px 0", fontWeight: 600,
            }}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

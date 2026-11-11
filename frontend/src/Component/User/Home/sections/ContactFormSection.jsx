import React, { useState, useEffect } from "react";
import { userAsset } from "../../../../utils/userAssets";
import axios from "axios";
import { useAuth } from "../../../../Context/AuthContext";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");

export default function ContactFormSection() {
  const { user } = useAuth();
  const [mode, setMode] = useState("inquiry"); // inquiry | feedback
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    rating: 0,
    review: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (user?.name || user?.email || user?.phone) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name || "",
        email: user.email || prev.email || "",
        phone: user.phone || prev.phone || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRatingError("");
    setReviewError("");

    let hasError = false;
    if (!/^03\d{9}$/.test(form.phone)) {
      setReviewError("Phone number must be Pakistani (03XXXXXXXXX — 11 digits)");
      hasError = true;
    }

    if (mode === "feedback") {
      if (!form.rating || form.rating < 1) {
        setRatingError("Please select a rating");
        hasError = true;
      }
      if (!form.review.trim()) {
        setReviewError("Please write your review");
        hasError = true;
      }
    } else {
      if (!form.subject.trim()) {
        setReviewError("Please add a subject for your inquiry");
        hasError = true;
      }
      if (!form.review.trim()) {
        setReviewError("Please describe your inquiry");
        hasError = true;
      }
    }
    if (hasError) return;

    try {
      const reviewBody =
        mode === "inquiry"
          ? `[Guest Inquiry] ${form.subject.trim()}\n\n${form.review.trim()}`
          : form.review.trim();

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        rating: mode === "feedback" ? Number(form.rating) : 5,
        review: reviewBody,
      };
      const userId = user?._id || user?.id;
      if (userId && /^[a-fA-F0-9]{24}$/.test(userId)) payload.userId = userId;

      await axios.post(`${BASE_URL}/feedbacks`, payload);
      setSubmitted(true);
      setForm((prev) => ({
        ...prev,
        subject: "",
        rating: 0,
        review: "",
      }));
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      setReviewError(error.response?.data?.error || "Failed to submit. Please try again.");
    }
  };

  return (
    <div className="section pt-0">
      <div className="container">
        <div className="row g-5 mt-4">
          <div className="col-lg-6 text-center wow fadeInLeft">
            <div className="position-relative d-inline-flex">
              <img className="img-fluid rounded-5" src={userAsset("images/contact-us.jpg")} alt="Contact Us" />
            </div>
          </div>

          <div className="col-lg-6 wow fadeInRight">
            <p>
              <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                Contact & Reviews
              </span>
            </p>
            <h2 className="heading-font-family text-10 fw-600 mb-3">
              How Can We <span className="text-primary">Help</span>
            </h2>
            <p className="text-muted mb-3">
              Send a reservation or property inquiry, or share stay feedback with guest relations.
            </p>

            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                className={`btn rounded-pill px-3 ${mode === "inquiry" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setMode("inquiry")}
              >
                Inquiry
              </button>
              <button
                type="button"
                className={`btn rounded-pill px-3 ${mode === "feedback" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setMode("feedback")}
              >
                Stay Feedback
              </button>
            </div>

            {submitted && (
              <div className="alert alert-success rounded-4 d-flex align-items-center gap-3 mb-4">
                <i className="fa-solid fa-circle-check fs-4"></i>
                <div>
                  <strong>Thank you!</strong>
                  <p className="text-muted mb-0">
                    {mode === "inquiry"
                      ? "Your inquiry was received. Our team will respond shortly."
                      : "Your review has been submitted successfully."}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="tel"
                  className="form-control rounded-pill"
                  placeholder="03XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })
                  }
                  required
                />
              </div>
              <div className="col-12">
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {mode === "inquiry" && (
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Subject (e.g. Group booking, wedding inquiry)"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
              )}

              {mode === "feedback" && (
                <div className="col-12">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="small fw-600">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0 border-0"
                        onClick={() => setForm({ ...form, rating: star })}
                        aria-label={`${star} stars`}
                      >
                        <i
                          className={`${star <= form.rating ? "fa-solid" : "fa-regular"} fa-star`}
                          style={{ color: "var(--theme-primary, #1B365D)", fontSize: "1.25rem" }}
                        />
                      </button>
                    ))}
                  </div>
                  {ratingError && <div className="text-danger small">{ratingError}</div>}
                </div>
              )}

              <div className="col-12">
                <textarea
                  className="form-control rounded-4"
                  rows="4"
                  placeholder={
                    mode === "inquiry"
                      ? "Tell us about your dates, group size, or question..."
                      : "Share your experience..."
                  }
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  required
                />
                {reviewError && <div className="text-danger small mt-1">{reviewError}</div>}
              </div>
              <div className="col-12">
                <button className="btn btn-new btn-primary text-nowrap rounded-pill" type="submit">
                  {mode === "inquiry" ? "Send Inquiry" : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

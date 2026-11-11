import { useState, useEffect } from "react";
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const Feedback = () => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState([]);
  const [filterRating, setFilterRating] = useState("");
  const [search, setSearch] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    let result = feedbacks;
    if (filterRating)
      result = result.filter((f) => f.rating === Number(filterRating));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          (f.userId?.name || "").toLowerCase().includes(q) ||
          (f.review || "").toLowerCase().includes(q),
      );
    }
    setFilter(result);
  }, [filterRating, search, feedbacks]);

  const loadFeedbacks = async () => {
    try {
      const res = await api.get(`${API_URL}/feedbacks`, { headers });
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const avg =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : 0;

  const ratingBadge = (rating) => {
    const color = rating >= 4 ? "success" : rating === 3 ? "warning" : "danger";
    return (
      <span className={`badge bg-${color}-subtle text-${color}`}>
        {rating}/5
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <i
            key={s}
            className={`ri-star-${s <= rating ? "fill" : "line"}`}
            style={{ color: s <= rating ? "#f5a623" : "#dee2e6", fontSize: 13 }}
          ></i>
        ))}
      </div>
    );
  };

  const colors = [
    "bg-primary",
    "bg-success",
    "bg-warning",
    "bg-info",
    "bg-danger",
  ];

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="mb-sm-0">Feedback Management</h4>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          {
            label: "Total Reviews",
            value: feedbacks.length,
            icon: "bx bx-message-dots",
            color: "info",
          },
          {
            label: "Average Rating",
            value: `${avg} / 5`,
            icon: "bx bx-star",
            color: "warning",
          },
          {
            label: "Positive (4-5⭐)",
            value: feedbacks.filter((f) => f.rating >= 4).length,
            icon: "bx bx-happy",
            color: "success",
          },
          {
            label: "Negative (1-2⭐)",
            value: feedbacks.filter((f) => f.rating <= 2).length,
            icon: "bx bx-sad",
            color: "danger",
          },
        ].map((s, i) => (
          <div className="col-md-3 col-6" key={i}>
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
        <div className="card-header d-flex align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0 flex-grow-1">All Feedback</h5>

          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search guest or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Rating Filter */}
          <select
            className="form-select form-select-sm w-auto"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No feedback found.
                    </td>
                  </tr>
                ) : (
                  filter.map((f, i) => {
                    const name = f.userId?.name || "Guest";
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <tr key={f._id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-xs">
                              <span
                                className={`avatar-title rounded-circle ${colors[i % colors.length]} text-white`}
                                style={{ fontSize: "11px" }}
                              >
                                {initials}
                              </span>
                            </div>
                            <div>
                              <div className="fw-medium">{name}</div>
                              <small className="text-muted">
                                {f.userId?.email || ""}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{ratingBadge(f.rating)}</div>
                          {renderStars(f.rating)}
                        </td>
                        <td>
                          <small
                            className="text-muted"
                            style={{
                              maxWidth: 220,
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.review || "—"}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(f.createdAt).toLocaleDateString("en-PK")}
                          </small>
                        </td>
                        <td>
                          <button
                            className="btn btn-soft-info btn-sm"
                            onClick={() => {
                              setSelected(f);
                              setShowDetailModal(true);
                            }}
                            title="View Detail"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {showDetailModal && selected && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Feedback Detail</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Guest info */}
                  <div className="col-12">
                    <div className="p-3 bg-light rounded d-flex align-items-center gap-3">
                      <div className="avatar-sm">
                        <span className="avatar-title rounded-circle bg-primary text-white fw-bold">
                          {(selected.userId?.name || "G")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-semibold">
                          {selected.userId?.name || "Guest"}
                        </h6>
                        <small className="text-muted">
                          {selected.userId?.email || "—"}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Rating</p>
                      <div className="d-flex align-items-center gap-2">
                        {ratingBadge(selected.rating)}
                        {renderStars(selected.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Submitted On</p>
                      <h6 className="mb-0">
                        {new Date(selected.createdAt).toLocaleString("en-PK")}
                      </h6>
                    </div>
                  </div>

                  {/* Review */}
                  <div className="col-12">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Review</p>
                      <p className="mb-0">{selected.review || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;

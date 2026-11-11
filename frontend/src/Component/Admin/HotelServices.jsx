import { useState, useEffect } from "react";
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const BASE_URL = (process.env.REACT_APP_SERVER_URL || "http://localhost:5001");

const CATEGORIES = [
  {
    value: "recreation",
    label: "Recreation",
    icon: "ri-swimming-line",
    color: "#0dcaf0",
  },
  {
    value: "dining",
    label: "Dining",
    icon: "ri-restaurant-line",
    color: "#fd7e14",
  },
  {
    value: "wellness",
    label: "Wellness",
    icon: "ri-heart-pulse-line",
    color: "#d63384",
  },
  {
    value: "business",
    label: "Business",
    icon: "ri-briefcase-line",
    color: "#405189",
  },
  {
    value: "transport",
    label: "Transport",
    icon: "ri-car-line",
    color: "#198754",
  },
  { value: "other", label: "Other", icon: "ri-hotel-line", color: "#6c757d" },
];

const SUGGESTED_ICONS = [
  "🏊",
  "🍽️",
  "💆",
  "🏋️",
  "🚗",
  "📶",
  "☕",
  "🎮",
  "🅿️",
  "🛁",
  "🧖",
  "🎯",
];

const HotelServices = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const emptyForm = {
    name: "",
    description: "",
    category: "recreation",
    icon: "🏊",
    timing: "",
    price: "Free",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    let result = services;
    if (filterCategory)
      result = result.filter((s) => s.category === filterCategory);
    if (filterStatus === "active") result = result.filter((s) => s.isActive);
    if (filterStatus === "inactive") result = result.filter((s) => !s.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q),
      );
    }
    setFilter(result);
  }, [filterCategory, filterStatus, search, services]);

  const loadServices = async () => {
    try {
      const res = await api.get(`${API_URL}/hotel-services`, { headers });
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    inactive: services.filter((s) => !s.isActive).length,
    cats: [...new Set(services.map((s) => s.category))].length,
  };

  const categoryInfo = (cat) =>
    CATEGORIES.find((c) => c.value === cat) || CATEGORIES[5];

  const getImageSrc = (service) => {
    if (!service.image) return null;
    if (service.image.startsWith("http")) return service.image;
    return `${BASE_URL}${service.image}`;
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("icon", form.icon);
    fd.append("timing", form.timing);
    fd.append("price", form.price);
    fd.append("isActive", form.isActive);
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const handleAdd = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Service name is required.");
      return;
    }
    try {
      await api.post(`${API_URL}/hotel-services`, buildFormData(), {
        headers,
      });
      setShowAddModal(false);
      resetForm();
      loadServices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add service.");
    }
  };

  const handleEdit = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Service name is required.");
      return;
    }
    try {
      await api.put(
        `${API_URL}/hotel-services/${selected._id}`,
        buildFormData(),
        { headers },
      );
      setShowEditModal(false);
      resetForm();
      loadServices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_URL}/hotel-services/${selected._id}`, {
        headers: { ...headers, "Content-Type": "application/json" },
      });
      setShowDeleteModal(false);
      loadServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const fd = new FormData();
      fd.append("name", service.name);
      fd.append("category", service.category);
      fd.append("isActive", !service.isActive);
      await api.put(`${API_URL}/hotel-services/${service._id}`, fd, {
        headers,
      });
      loadServices();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (service) => {
    setSelected(service);
    setForm({
      name: service.name,
      description: service.description || "",
      category: service.category,
      icon: service.icon || "🏨",
      timing: service.timing || "",
      price: service.price || "Free",
      isActive: service.isActive,
    });
    setImageFile(null);
    setImagePreview(getImageSrc(service) || "");
    setError("");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Hotel Services</h4>
            <button
              className="btn btn-success"
              onClick={() => {
                resetForm();
                setError("");
                setShowAddModal(true);
              }}
            >
              <i className="ri-add-line me-1"></i> Add Service
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          {
            label: "Total Services",
            value: stats.total,
            icon: "ri-hotel-line",
            color: "primary",
          },
          {
            label: "Active",
            value: stats.active,
            icon: "ri-checkbox-circle-line",
            color: "success",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: "ri-close-circle-line",
            color: "warning",
          },
          {
            label: "Categories",
            value: stats.cats,
            icon: "ri-price-tag-3-line",
            color: "info",
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
          <h5 className="card-title mb-0 flex-grow-1">All Services</h5>

          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select form-select-sm w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Timing</th>
                  <th>Price</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  filter.map((s, i) => {
                    const cat = categoryInfo(s.category);
                    return (
                      <tr
                        key={s._id}
                        className={!s.isActive ? "opacity-75" : ""}
                      >
                        <td>{i + 1}</td>
                        <td>
                          {getImageSrc(s) ? (
                            <img
                              src={getImageSrc(s)}
                              alt={s.name}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                background: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                              }}
                            >
                              {s.icon || "🏨"}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-medium">{s.name}</div>
                          {s.description && (
                            <small
                              className="text-muted"
                              style={{
                                maxWidth: 200,
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {s.description}
                            </small>
                          )}
                        </td>
                        <td>
                          <span
                            className="badge text-white"
                            style={{ backgroundColor: cat.color }}
                          >
                            <i className={`${cat.icon} me-1`}></i>
                            {cat.label}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {s.timing || "—"}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`badge ${s.price === "Free" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}
                          >
                            {s.price || "Free"}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={s.isActive}
                              onChange={() => handleToggleActive(s)}
                              style={{
                                cursor: "pointer",
                                width: 36,
                                height: 20,
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => openEdit(s)}
                              title="Edit"
                            >
                              <i className="ri-pencil-line"></i>
                            </button>
                            <button
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => {
                                setSelected(s);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
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

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Hotel Service</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <ServiceForm
                  form={form}
                  setForm={setForm}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleAdd}>
                  <i className="ri-check-line me-1"></i>Add Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Service</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <ServiceForm
                  form={form}
                  setForm={setForm}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-light"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleEdit}>
                  <i className="ri-check-line me-1"></i>Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div className="avatar-md mx-auto mb-3">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                    <i className="ri-delete-bin-line text-danger"></i>
                  </span>
                </div>
                <h5>Delete Service?</h5>
                <p className="text-muted">{selected?.name}</p>
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <button
                    className="btn btn-light"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── FORM COMPONENT ──
const ServiceForm = ({ form, setForm, imagePreview, onImageChange }) => (
  <div className="row g-3">
    <div className="col-md-6">
      <label className="form-label">
        Service Name <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. Swimming Pool"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
    </div>

    <div className="col-md-6">
      <label className="form-label">Category</label>
      <select
        className="form-select"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {[
          { value: "recreation", label: "Recreation" },
          { value: "dining", label: "Dining" },
          { value: "wellness", label: "Wellness" },
          { value: "business", label: "Business" },
          { value: "transport", label: "Transport" },
          { value: "other", label: "Other" },
        ].map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>

    <div className="col-md-6">
      <label className="form-label">Timing</label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. 6:00 AM - 10:00 PM"
        value={form.timing}
        onChange={(e) => setForm({ ...form, timing: e.target.value })}
      />
    </div>

    <div className="col-md-6">
      <label className="form-label">Price</label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. Free or PKR 500"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
    </div>

    <div className="col-12">
      <label className="form-label">Icon (Emoji)</label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. 🏊"
        value={form.icon}
        onChange={(e) => setForm({ ...form, icon: e.target.value })}
        style={{ fontSize: 20, width: 80 }}
      />
      <div className="d-flex flex-wrap gap-2 mt-2">
        {[
          "🏊",
          "🍽️",
          "💆",
          "🏋️",
          "🚗",
          "📶",
          "☕",
          "🎮",
          "🅿️",
          "🛁",
          "🧖",
          "🎯",
          "🛎️",
          "🏨",
        ].map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`btn btn-sm ${form.icon === emoji ? "btn-primary" : "btn-outline-secondary"}`}
            style={{ fontSize: 18, padding: "2px 8px" }}
            onClick={() => setForm({ ...form, icon: emoji })}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>

    <div className="col-12">
      <label className="form-label">Description</label>
      <textarea
        className="form-control"
        rows={3}
        placeholder="Brief description of this service..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </div>

    <div className="col-12">
      <label className="form-label">Image</label>
      <input
        type="file"
        className="form-control"
        accept="image/*"
        onChange={onImageChange}
      />
      {imagePreview && (
        <div className="mt-2">
          <img
            src={imagePreview}
            alt="preview"
            style={{
              height: 100,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #dee2e6",
            }}
          />
        </div>
      )}
    </div>

    <div className="col-12">
      <div className="form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          id="svcActive"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="svcActive">
          {form.isActive
            ? "Active — visible on website"
            : "Inactive — hidden from website"}
        </label>
      </div>
    </div>
  </div>
);

export default HotelServices;

import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from 'react-router-dom';
import api from '../../api/authApi';
import CustomPopup from './CustomPopup';

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api");
const VALID_STATUSES = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'];

// Settings se pricing load karo
const getPricingFromSettings = () => {
  try {
    const saved = localStorage.getItem('hotel_pricing');
    return saved ? JSON.parse(saved) : { single: 5000, double: 8000, suite: 15000, deluxe: 12000 };
  } catch { return { single: 5000, double: 8000, suite: 15000, deluxe: 12000 }; }
};

const Rooms = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') || '';
  const initialStatus = VALID_STATUSES.includes(statusFromUrl) ? statusFromUrl : '';

  const [rooms, setRooms]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterType, setFilterType]     = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState("roomNumber");
  const [viewMode, setViewMode]         = useState("grid");
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal]   = useState(false);
  const [selectedRoom, setSelectedRoom]   = useState(null);
  const [viewRoom, setViewRoom]           = useState(null);
  const [popup, setPopup] = useState(null);
  const error = popup?.message;

  const emptyForm = {
    floor: "", roomNumber: "", type: "", price: "",
    capacity: "", amenities: "", description: "", status: "available", images: [],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadRooms(); }, []);

  // Keep filter in sync when arriving from Live Room dashboard links
  useEffect(() => {
    const next = searchParams.get('status') || '';
    setFilterStatus(VALID_STATUSES.includes(next) ? next : '');
  }, [searchParams]);

  // Derive filter list in one pass with search & sorting
  const filter = useMemo(() => {
    let result = rooms;
    if (filterStatus) result = result.filter(r => r.status === filterStatus);
    if (filterType)   result = result.filter(r => r.type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        String(r.roomNumber || '').toLowerCase().includes(q) ||
        String(r.type || '').toLowerCase().includes(q) ||
        String(r.floor || '').toLowerCase().includes(q) ||
        (Array.isArray(r.amenities) && r.amenities.some(a => String(a).toLowerCase().includes(q)))
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'priceAsc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'priceDesc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'capacity') return Number(b.capacity || 0) - Number(a.capacity || 0);
      return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true });
    });
    return result;
  }, [rooms, filterStatus, filterType, searchQuery, sortBy]);

  const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
    if (value && VALID_STATUSES.includes(value)) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  };

 const loadRooms = async () => {
    setLoading(true);
    try {
      const [roomsRes, maintRes, hkRes] = await Promise.all([
        api.get(`${API_URL}/rooms`, { headers }),
        api.get(`${API_URL}/maintenance`, { headers }),
        api.get(`${API_URL}/housekeeping`, { headers }),
      ]);
      const activeMaint = (maintRes.data || []).filter(r => r.status !== 'resolved');
      const activeHk = (hkRes.data || []).filter(r => r.cleaningStatus !== 'completed');
      const enriched = (roomsRes.data || []).map(room => ({
        ...room,
        _activeMaint: activeMaint.filter(r => String(r.roomId?._id || r.roomId) === String(room._id)).length,
        _activeHk: activeHk.filter(r => String(r.roomId?._id || r.roomId) === String(room._id)).length,
      }));
      setRooms(enriched);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = {
    total:       rooms.length,
    available:   rooms.filter(r => r.status === "available").length,
    occupied:    rooms.filter(r => r.status === "occupied").length,
    maintenance: rooms.filter(r => r.status === "maintenance").length,
  };

  const statusBadge = (status) => {
    const map = {
      available:   { bg: 'rgba(54, 133, 104, 0.12)', color: '#368568', border: '1px solid rgba(54, 133, 104, 0.25)', label: 'Available' },
      occupied:    { bg: 'rgba(204, 91, 85, 0.12)', color: '#CC5B55', border: '1px solid rgba(204, 91, 85, 0.25)', label: 'Occupied' },
      cleaning:    { bg: 'rgba(212, 154, 70, 0.14)', color: '#D49A46', border: '1px solid rgba(212, 154, 70, 0.25)', label: 'Cleaning' },
      maintenance: { bg: 'rgba(100, 116, 139, 0.14)', color: 'var(--theme-text-secondary, #475569)', border: '1px solid rgba(100, 116, 139, 0.25)', label: 'Maintenance' },
      reserved:    { bg: 'rgba(102, 138, 168, 0.12)', color: '#668AA8', border: '1px solid rgba(102, 138, 168, 0.25)', label: 'Reserved' },
    };
    const s = map[status] || { bg: 'var(--theme-surface-subtle, #F1F5F9)', color: 'var(--theme-text-secondary, #475569)', border: '1px solid var(--theme-border, #E2E8F0)', label: status };
    return (
      <span style={{
        background: s.bg, color: s.color, border: s.border,
        padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.02em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
        {s.label}
      </span>
    );
  };

  const typeBadge = (type) => {
    const map = {
      single: "bg-info-subtle text-info",
      double: "bg-primary-subtle text-primary",
      suite:  "bg-warning-subtle text-warning",
      deluxe: "bg-secondary-subtle text-secondary",
    };
    return <span className={`badge ${map[type] || "bg-secondary"}`}>{type}</span>;
  };

  // FIX: Type select hone par Settings ki price + capacity auto-fill
  const handleTypeChange = (type, isEdit = false) => {
    const pricing  = getPricingFromSettings();
    const capacityMap = { single: 1, double: 2, suite: 4, deluxe: 3 };
    setForm(prev => ({
      ...prev,
      type,
      price:    pricing[type] || prev.price,
      capacity: capacityMap[type] || prev.capacity,
    }));
  };

  const handleAdd = async () => {
    setPopup(null);
    if (!form.roomNumber || !form.type || !form.price || !form.capacity) {
      setPopup({ type: 'error', message: "Please fill all required fields." });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("roomNumber",  form.roomNumber);
      formData.append("floor",       form.floor);
      formData.append("type",        form.type);
      formData.append("price",       form.price);
      formData.append("capacity",    form.capacity);
      formData.append("description", form.description);
      formData.append("status",      "available");
      form.amenities.split(",").forEach(a => formData.append("amenities", a.trim()));
      form.images.forEach(img => formData.append("images", img));

      await api.post(`${API_URL}/rooms`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      setForm(emptyForm);
      loadRooms();
    } catch (err) { setPopup({ type: 'error', message: err.response?.data?.message || "Error adding room" }); }
  };

  const handleEdit = async () => {
    setPopup(null);
    try {
      const formData = new FormData();
      formData.append("roomNumber",  form.roomNumber);
      formData.append("floor",       form.floor || "");
      formData.append("type",        form.type);
      formData.append("price",       form.price);
      formData.append("capacity",    form.capacity);
      formData.append("description", form.description);
      formData.append("status",      form.status);
      form.amenities.split(",").forEach(a => formData.append("amenities", a.trim()));
      if (form.images?.length > 0) {
        form.images.forEach(img => formData.append("images", img));
      }
      await api.put(`${API_URL}/rooms/${selectedRoom._id}`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setShowEditModal(false);
      loadRooms();
    } catch (err) { setPopup({ type: 'error', message: err.response?.data?.message || "Error updating room" }); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_URL}/rooms/${selectedRoom._id}`, { headers });
      setShowDeleteModal(false);
      loadRooms();
    } catch (err) { setPopup({ type: 'error', message: err.response?.data?.message || "Cannot delete room" }); }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.put(`${API_URL}/rooms/${id}`, { status }, { headers });
      loadRooms();
    } catch (err) { console.error(err); }
  };

  // Creates a Maintenance ticket AND marks the room (backend sets room status)
  const sendToMaintenance = async (room) => {
    try {
      await api.post(`${API_URL}/maintenance`, {
        roomId: room._id,
        roomNumber: room.roomNumber,
        issue: `Room ${room.roomNumber} sent to maintenance from Manage Rooms`,
        issueType: 'other',
        priority: 'medium',
      }, { headers });
      loadRooms();
    } catch (err) {
      console.error(err);
      setPopup({ type: 'error', message: err.response?.data?.message || 'Could not create maintenance request.' });
    }
  };

  const openEdit = (room) => {
    setSelectedRoom(room);
    setForm({
      roomNumber:  room.roomNumber,
      floor:       room.floor || "",
      type:        room.type,
      price:       room.price,
      capacity:    room.capacity,
      amenities:   room.amenities?.join(", ") || "",
      description: room.description || "",
      status:      room.status,
      images:      [],
    });
    setPopup(null);
    setShowEditModal(true);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Rooms</h4>
            <button className="btn btn-success" onClick={() => {
              setForm(emptyForm);
              setPopup(null);
              setShowAddModal(true);
            }}>
              <i className="ri-add-line me-1"></i> Add Room
            </button>
          </div>
        </div>
      </div>

      {/* Stats — clickable filters (equal size) */}
      <div className="row mb-3 g-3">
        {[
          { label: "Total Rooms",  value: stats.total,       icon: "ri-building-line",        color: "info",    status: "" },
          { label: "Available",    value: stats.available,   icon: "ri-checkbox-circle-line", color: "success", status: "available" },
          { label: "Occupied",     value: stats.occupied,    icon: "ri-hotel-bed-line",       color: "danger",  status: "occupied" },
          { label: "Maintenance",  value: stats.maintenance, icon: "ri-tools-line",           color: "warning", status: "maintenance" },
        ].map((s, i) => {
          const active = filterStatus === s.status;
          return (
            <div className="col-6 col-xl-3" key={i}>
              <button
                type="button"
                className={`ls-room-stat card card-animate h-100 w-100 text-start ${active ? 'is-active' : ''}`}
                onClick={() => handleStatusFilterChange(s.status)}
                title={s.status ? `Show ${s.label.toLowerCase()} rooms` : 'Show all rooms'}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm flex-shrink-0">
                      <span className={`avatar-title bg-${s.color}-subtle rounded fs-3`}>
                        <i className={`${s.icon} text-${s.color}`} aria-hidden="true"></i>
                      </span>
                    </div>
                    <div className="flex-grow-1 ms-3 min-w-0">
                      <p className="text-uppercase fw-medium text-muted mb-1 fs-12 text-truncate">{s.label}</p>
                      <h4 className="mb-0 fw-semibold">{s.value}</h4>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Rooms Explorer (Grid & Table View) */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3 py-3">
          <div>
            <h5 className="card-title mb-1">
              {filterStatus
                ? `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Rooms`
                : 'All Rooms'}
              <span className="text-muted fw-normal fs-13 ms-2">({filter.length} available)</span>
            </h5>
            <small className="text-muted">Manage inventory, monitor housekeeping, and update status</small>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Search Box */}
            <div className="position-relative" style={{ minWidth: 200 }}>
              <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
              <input
                type="text"
                className="form-control form-control-sm ps-4"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={filterStatus}
              onChange={e => handleStatusFilterChange(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>

            {/* Type Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>

            {/* Sorting */}
            <select
              className="form-select form-select-sm w-auto"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort rooms"
            >
              <option value="roomNumber">Sort: Room #</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="capacity">Capacity (Guests)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <i className="ri-grid-fill" />
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <i className="ri-table-line" />
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-3 p-md-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-secondary" role="status" />
              <span className="ms-2 text-muted">Loading room directory...</span>
            </div>
          ) : filter.length === 0 ? (
            <div className="text-center py-5">
              <i className="ri-hotel-bed-line fs-48 text-muted opacity-50 d-block mb-2" />
              <h6 className="fw-semibold">No rooms match your filter</h6>
              <p className="text-muted fs-13">Try clearing search terms or status filters.</p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={() => { setFilterStatus(''); setFilterType(''); setSearchQuery(''); }}
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── GRID / CARD VIEW ── */
            <div className="row g-4">
              {filter.map((room) => {
                const imgUrl = room.images?.length > 0
                  ? `${process.env.REACT_APP_SERVER_URL || "http://localhost:5001"}/uploads/${room.images[0]}`
                  : null;
                return (
                  <div className="col-xl-3 col-lg-4 col-md-6" key={room._id}>
                    <div className="card luxury-card h-100 d-flex flex-column" style={{ overflow: 'hidden' }}>
                      {/* Room Image Container */}
                      <div style={{ position: 'relative', height: 170, backgroundColor: '#FAF8F5', overflow: 'hidden' }}>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Room ${room.roomNumber}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                            <i className="ri-image-2-line fs-36 opacity-40 mb-1" />
                            <small className="fs-11">LuxuryStay Suites</small>
                          </div>
                        )}
                        {/* Status Badge Tag */}
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          {statusBadge(room.status)}
                        </div>
                        {/* Floor Badge */}
                        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                          <span className="badge bg-dark text-white opacity-85 px-2 py-1 fs-11">
                            {room.floor ? `${room.floor.charAt(0).toUpperCase() + room.floor.slice(1)} Floor` : 'Floor —'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="card-body p-3 d-flex flex-column flex-grow-1">
                        <div className="d-flex align-items-baseline justify-content-between mb-1">
                          <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                            Room {room.roomNumber}
                          </h5>
                          {typeBadge(room.type)}
                        </div>

                        {/* Price & Capacity */}
                        <div className="d-flex align-items-center justify-content-between my-2 pb-2 border-bottom">
                          <div>
                            <span className="text-muted fs-11 d-block text-uppercase">Price / Night</span>
                            <span className="fw-bold num-stat" style={{ color: 'var(--theme-primary)', fontSize: '1.1rem' }}>
                              PKR {Number(room.price).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-end">
                            <span className="text-muted fs-11 d-block text-uppercase">Capacity</span>
                            <span className="fw-semibold fs-13">
                              <i className="ri-user-line me-1 text-muted" />{room.capacity} Guests
                            </span>
                          </div>
                        </div>

                        {/* Amenities preview */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {room.amenities.slice(0, 3).map((a, idx) => (
                              <span key={idx} className="badge bg-light text-muted border fs-11 fw-normal">
                                {a}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="badge bg-light text-muted border fs-11 fw-normal">
                                +{room.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Alerts */}
                        {room._activeMaint > 0 && room.status !== 'maintenance' && (
                          <div className="alert alert-warning py-1 px-2 mb-2 fs-11 d-flex align-items-center gap-1">
                            <i className="ri-tools-line" /> Maintenance ticket active
                          </div>
                        )}
                        {room._activeHk > 0 && room.status !== 'cleaning' && (
                          <div className="alert alert-info py-1 px-2 mb-2 fs-11 d-flex align-items-center gap-1">
                            <i className="ri-brush-line" /> Housekeeping task scheduled
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto pt-2 d-flex gap-1 justify-content-between align-items-center">
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-soft-info"
                              onClick={() => { setViewRoom(room); setShowViewModal(true); }}
                              title="View Details"
                            >
                              <i className="ri-eye-line" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-soft-primary"
                              onClick={() => openEdit(room)}
                              title="Edit Room"
                            >
                              <i className="ri-edit-line" />
                            </button>
                            {room.status === "cleaning" && (
                              <button
                                type="button"
                                className="btn btn-soft-success"
                                onClick={() => changeStatus(room._id, "available")}
                                title="Mark Cleaned & Available"
                              >
                                <i className="ri-check-line" />
                              </button>
                            )}
                            {room.status !== "maintenance" && (
                              <button
                                type="button"
                                className="btn btn-soft-warning"
                                onClick={() => sendToMaintenance(room)}
                                title="Send To Maintenance"
                              >
                                <i className="ri-tools-line" />
                              </button>
                            )}
                          </div>

                          {!["occupied", "reserved"].includes(room.status) && (
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => { setSelectedRoom(room); setShowDeleteModal(true); }}
                              title="Delete Room"
                            >
                              <i className="ri-delete-bin-line" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── TABLE VIEW ── */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 ls-rooms-table">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Price/Night</th>
                    <th className="d-none d-md-table-cell">Capacity</th>
                    <th className="d-none d-lg-table-cell">Amenities</th>
                    <th className="d-none d-xl-table-cell">Image</th>
                    <th>Status</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filter.map((room, i) => (
                    <tr key={room._id}>
                      <td>{i + 1}</td>
                      <td><span className="fw-semibold">Room {room.roomNumber}</span></td>
                      <td>{typeBadge(room.type)}</td>
                      <td><span className="fw-medium num-stat">PKR {Number(room.price).toLocaleString()}</span></td>
                      <td className="d-none d-md-table-cell">{room.capacity} Person(s)</td>
                      <td className="d-none d-lg-table-cell"><small className="text-muted">{room.amenities?.slice(0, 3).join(", ") || "—"}</small></td>
                      <td className="d-none d-xl-table-cell">
                        {room.images?.length > 0 ? (
                          <img src={`${process.env.REACT_APP_SERVER_URL || "http://localhost:5001"}/uploads/${room.images[0]}`} alt="room"
                            width="56" height="56" style={{ objectFit: "cover", borderRadius: "8px" }} />
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {statusBadge(room.status)}
                        {room._activeMaint > 0 && room.status !== 'maintenance' && (
                          <span className="badge bg-warning-subtle text-warning ms-1" title="Open maintenance ticket — open Maintenance tab">
                            <i className="ri-tools-line me-1" />Ticket open
                          </span>
                        )}
                        {room._activeHk > 0 && room.status !== 'cleaning' && (
                          <span className="badge bg-info-subtle text-info ms-1" title="Active housekeeping task">
                            <i className="ri-brush-line me-1" />HK pending
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-soft-info btn-sm" onClick={() => { setViewRoom(room); setShowViewModal(true); }} title="View">
                            <i className="ri-eye-line"></i>
                          </button>
                          <button className="btn btn-soft-primary btn-sm" onClick={() => openEdit(room)} title="Edit">
                            <i className="ri-edit-line"></i>
                          </button>
                          {room.status === "cleaning" && (
                            <button className="btn btn-soft-success btn-sm" onClick={() => changeStatus(room._id, "available")} title="Mark Cleaned">
                              <i className="ri-check-line"></i>
                            </button>
                          )}
                          {room.status !== "maintenance" && (
                            <button className="btn btn-soft-warning btn-sm" onClick={() => sendToMaintenance(room)} title="Send To Maintenance">
                              <i className="ri-tools-line"></i>
                            </button>
                          )}
                          {!["occupied", "reserved"].includes(room.status) && (
                            <button className="btn btn-soft-danger btn-sm" onClick={() => { setSelectedRoom(room); setShowDeleteModal(true); }} title="Delete">
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Room</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Floor</label>
                    <select className="form-select" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>
                      <option value="">Select Floor</option>
                      <option value="ground">Ground Floor</option>
                      <option value="first">First Floor</option>
                      <option value="second">Second Floor</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Room Number</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        {form.floor === "ground" ? "GF" : form.floor === "first" ? "FF" : form.floor === "second" ? "SF" : "—"}
                      </span>
                      <input className="form-control" value={form.roomNumber}
                        onChange={e => setForm({ ...form, roomNumber: e.target.value })} placeholder="101" />
                    </div>
                  </div>

                  {/* Type — auto-fill triggers karta hai */}
                  <div className="col-md-6">
                    <label className="form-label">Type <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                      <option value="">Select Type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="suite">Suite</option>
                      <option value="deluxe">Deluxe</option>
                    </select>
                  </div>

                  {/* Price — auto-filled from Settings, editable */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Price/Night (PKR) <span className="text-danger">*</span>
                      {form.type && <small className="text-success ms-2"><i className="ri-magic-line"></i> auto-filled</small>}
                    </label>
                    <input className="form-control" type="number" value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 5000" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Capacity <span className="text-danger">*</span></label>
                    <input className="form-control" type="number" value={form.capacity} readOnly
                      style={{ background: '#f8f9fa' }} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Amenities <span className="text-muted fs-12">(comma separated)</span></label>
                    <input className="form-control" value={form.amenities}
                      onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, TV" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Room Images</label>
                    <input type="file" className="form-control" multiple
                      onChange={e => setForm({ ...form, images: [...e.target.files] })} />
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {form.images?.map((img, idx) => (
                        <img key={idx} src={URL.createObjectURL(img)} alt="preview"
                          width="80" height="80" style={{ objectFit: "cover", borderRadius: "8px" }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>Add Room</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Room</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Room Number</label>
                    <input className="form-control" value={form.roomNumber}
                      onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="suite">Suite</option>
                      <option value="deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Price/Night (PKR)</label>
                    <input className="form-control" type="number" value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Capacity</label>
                    <input className="form-control" type="number" value={form.capacity}
                      onChange={e => setForm({ ...form, capacity: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="cleaning">Cleaning</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amenities</label>
                    <input className="form-control" value={form.amenities}
                      onChange={e => setForm({ ...form, amenities: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Room Images</label>
                    {selectedRoom?.images?.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap mb-3">
                        {selectedRoom.images.map((img, idx) => (
                          <img key={idx} src={`${process.env.REACT_APP_SERVER_URL || "http://localhost:5001"}/uploads/${img}`} alt="room"
                            width="80" height="80" style={{ objectFit: "cover", borderRadius: "8px" }} />
                        ))}
                      </div>
                    )}
                    <input type="file" className="form-control" multiple
                      onChange={e => setForm({ ...form, images: [...e.target.files] })} />
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {form.images?.map((img, idx) => (
                        <img key={idx} src={URL.createObjectURL(img)} alt="preview"
                          width="80" height="80" style={{ objectFit: "cover", borderRadius: "8px" }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {showViewModal && viewRoom && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Room Details — Room {viewRoom.roomNumber}</h5>
                <button className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex gap-2 flex-wrap mb-4">
                  {viewRoom.images?.length > 0 ? (
                    viewRoom.images.map((img, idx) => (
                      <img key={idx} src={`${process.env.REACT_APP_SERVER_URL || "http://localhost:5001"}/uploads/${img}`} alt="room"
                        width="150" height="120" style={{ objectFit: "cover", borderRadius: "10px" }} />
                    ))
                  ) : <p className="text-muted">No Images</p>}
                </div>
                <div className="row g-3">
                  {[
                    { label: 'Room Number', value: viewRoom.roomNumber },
                    { label: 'Floor',       value: viewRoom.floor || '—' },
                    { label: 'Type',        value: viewRoom.type },
                    { label: 'Price/Night', value: `PKR ${Number(viewRoom.price).toLocaleString()}` },
                    { label: 'Capacity',    value: `${viewRoom.capacity} Guests` },
                    { label: 'Status',      value: statusBadge(viewRoom.status), isNode: true },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        {item.isNode ? <div>{item.value}</div> : <h6 className="mb-0 fw-semibold">{item.value}</h6>}
                      </div>
                    </div>
                  ))}
                  {viewRoom.amenities?.length > 0 && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">Amenities</p>
                        <div className="d-flex flex-wrap gap-1">
                          {viewRoom.amenities.map((a, i) => (
                            <span key={i} className="badge bg-info-subtle text-info">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {viewRoom.description && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">Description</p>
                        <p className="mb-0">{viewRoom.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div className="avatar-md mx-auto mb-3">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                    <i className="ri-delete-bin-line text-danger"></i>
                  </span>
                </div>
                <h5>Delete Room?</h5>
                <p className="text-muted">This action cannot be undone.</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
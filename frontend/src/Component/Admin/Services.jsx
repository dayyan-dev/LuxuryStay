import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SERVICE_TYPES = ['room_service', 'laundry', 'wake_up_call', 'transportation'];

const NEXT_STATUS = {
  pending:     'in_progress',
  in_progress: 'completed',
};

const typeLabel = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—';

const typeIcon = (t) => {
  const map = {
    room_service:    'ri-hotel-bed-line',
    laundry:         'ri-t-shirt-line',
    wake_up_call:    'ri-alarm-line',
    transportation:  'ri-car-line',
  };
  return map[t] || 'ri-customer-service-2-line';
};

const Services = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [services, setServices]         = useState([]);
  const [filter, setFilter]         = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');
  const [search, setSearch]             = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [error, setError]               = useState('');
  const [addForm, setAddForm]           = useState({
    guestName: '', roomNumber: '', serviceType: 'room_service', description: ''
  });

  useEffect(() => { loadServices(); }, []);

  useEffect(() => {
    let result = services;
    if (filterStatus) result = result.filter(s => s.status === filterStatus);
    if (filterType)   result = result.filter(s => s.serviceType === filterType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        (s.userId?.name || s.guestName || '').toLowerCase().includes(q) ||
        (s.roomNumber || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterStatus, filterType, search, services]);

  const loadServices = async () => {
    try {
      const res = await api.get(`${API_URL}/services`, { headers });
      setServices(res.data);
    } catch (err) { console.error(err); }
  };

  const stats = {
    total:      services.length,
    pending:    services.filter(s => s.status === 'pending').length,
    inProgress: services.filter(s => s.status === 'in_progress').length,
    completed:  services.filter(s => s.status === 'completed').length,
  };

  const statusBadge = (status) => {
    const map = {
      pending:     'bg-warning-subtle text-warning',
      in_progress: 'bg-primary-subtle text-primary',
      completed:   'bg-success-subtle text-success',
      cancelled:   'bg-danger-subtle text-danger',
    };
    return (
      <span className={`badge ${map[status] || 'bg-secondary'}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  // Next step
  const handleNextStatus = async (service) => {
    const next = NEXT_STATUS[service.status];
    if (!next) return;
    try {
      await api.put(`${API_URL}/services/${service._id}`, { status: next }, { headers });
      loadServices();
      if (selected?._id === service._id) setSelected({ ...service, status: next });
    } catch (err) { console.error(err); }
  };

  // Admin se request create
  const handleAddService = async () => {
    setError('');
    if (!addForm.guestName || !addForm.roomNumber || !addForm.serviceType) {
      setError('Guest name, room number, and service type are required.');
      return;
    }
    try {
      await api.post(`${API_URL}/services`, {
        guestName:   addForm.guestName,
        roomNumber:  addForm.roomNumber,
        serviceType: addForm.serviceType,
        description: addForm.description,
        status:      'pending',
      }, { headers });
      setShowAddModal(false);
      setAddForm({ guestName: '', roomNumber: '', serviceType: 'room_service', description: '' });
      loadServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Guest Service Requests</h4>
            <button className="btn btn-success" onClick={() => { setError(''); setShowAddModal(true); }}>
              <i className="ri-add-line me-1"></i> New Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Requests', value: stats.total,      icon: 'bx bx-support',       color: 'primary' },
          { label: 'Pending',        value: stats.pending,    icon: 'bx bx-time',           color: 'warning' },
          { label: 'In Progress',    value: stats.inProgress, icon: 'bx bx-loader-circle',  color: 'info'    },
          { label: 'Completed',      value: stats.completed,  icon: 'bx bx-check-circle',   color: 'success' },
        ].map((s, i) => (
          <div className="col-md-3 col-6" key={i}>
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="avatar-sm flex-shrink-0">
                    <span className={`avatar-title bg-${s.color}-subtle rounded fs-3`}>
                      <i className={`${s.icon} text-${s.color}`}></i>
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="text-uppercase fw-medium text-muted mb-1 fs-12">{s.label}</p>
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
          <h5 className="card-title mb-0 flex-grow-1">All Service Requests</h5>

          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search guest or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Service Type Filter */}
          <select className="form-select form-select-sm w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {SERVICE_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
          </select>

          {/* Status Filter */}
          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No service requests found.</td></tr>
                ) : filter.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td className="fw-medium">{s.guestName || s.userId?.name || 'Guest'}</td>
                    <td>{s.roomNumber || '—'}</td>
                    <td>
                      <span className="badge bg-info-subtle text-info">
                        <i className={`${typeIcon(s.serviceType)} me-1`}></i>
                        {typeLabel(s.serviceType)}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted" style={{ maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.description || '—'}
                      </small>
                    </td>
                    <td>{statusBadge(s.status)}</td>
                    <td><small className="text-muted">{new Date(s.createdAt).toLocaleString('en-PK')}</small></td>
                    <td>
                      <div className="d-flex gap-1">
                        {/* View detail */}
                        <button className="btn btn-soft-info btn-sm" onClick={() => { setSelected(s); setShowDetailModal(true); }} title="View Detail">
                          <i className="ri-eye-line"></i>
                        </button>

                        {/* Next step */}
                        {NEXT_STATUS[s.status] && (
                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => handleNextStatus(s)}
                            title={`Move to ${typeLabel(NEXT_STATUS[s.status])}`}
                          >
                            <i className="ri-arrow-right-line me-1"></i>
                            {NEXT_STATUS[s.status].replace('_', ' ')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {showDetailModal && selected && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Request Detail</h5>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    { label: 'Guest Name',    value: selected.userId?.name || selected.guestName || 'Guest' },
                    { label: 'Room Number',   value: selected.roomNumber || '—' },
                    { label: 'Service Type',  value: typeLabel(selected.serviceType) },
                    { label: 'Status',        value: statusBadge(selected.status), isNode: true },
                    { label: 'Requested At',  value: new Date(selected.createdAt).toLocaleString('en-PK') },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        {item.isNode ? <div className="mt-1">{item.value}</div> : <h6 className="mb-0">{item.value}</h6>}
                      </div>
                    </div>
                  ))}

                  {selected.description && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">Description</p>
                        <p className="mb-0">{selected.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next step button in modal */}
                {NEXT_STATUS[selected.status] && (
                  <div className="mt-3">
                    <button className="btn btn-success" onClick={() => handleNextStatus(selected)}>
                      <i className="ri-arrow-right-line me-1"></i>
                      Move to {NEXT_STATUS[selected.status].replace('_', ' ')}
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD REQUEST MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Service Request</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Guest Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      placeholder="Enter guest name"
                      value={addForm.guestName}
                      onChange={e => setAddForm({ ...addForm, guestName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Room Number <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      placeholder="e.g. 101"
                      value={addForm.roomNumber}
                      onChange={e => setAddForm({ ...addForm, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Service Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={addForm.serviceType}
                      onChange={e => setAddForm({ ...addForm, serviceType: e.target.value })}
                    >
                      {SERVICE_TYPES.map(t => (
                        <option key={t} value={t}>{typeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Any special instructions..."
                      value={addForm.description}
                      onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAddService}>
                  <i className="ri-check-line me-1"></i>Create Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
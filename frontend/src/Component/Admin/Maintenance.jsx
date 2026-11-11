import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

const ISSUE_TYPES = [
  { value: 'ac',          label: 'AC / Cooling',   icon: 'ri-temp-cold-line' },
  { value: 'plumbing',    label: 'Plumbing',        icon: 'ri-drop-line' },
  { value: 'electrical',  label: 'Electrical',      icon: 'ri-flashlight-line' },
  { value: 'furniture',   label: 'Furniture',       icon: 'ri-sofa-line' },
  { value: 'appliance',   label: 'Appliance',       icon: 'ri-tv-line' },
  { value: 'internet',    label: 'Internet / WiFi', icon: 'ri-wifi-off-line' },
  { value: 'other',       label: 'Other',           icon: 'ri-tools-line' },
];

const PRIORITIES = [
  { value: 'low',       label: 'Low',       color: '#6c757d', bg: '#f8f9fa' },
  { value: 'medium',    label: 'Medium',    color: '#0d6efd', bg: '#e7f1ff' },
  { value: 'high',      label: 'High',      color: '#fd7e14', bg: '#fff3e0' },
  { value: 'emergency', label: 'Emergency', color: '#dc3545', bg: '#ffeaea' },
];

const NEXT_STATUS = { pending: 'in_progress', in_progress: 'resolved' };

const Maintenance = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [requests, setRequests]   = useState([]);
  const [filter, setFilter]   = useState([]);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]       = useState('');
  const [rooms, setRooms]         = useState([]);
  const [maintStaff, setMaintStaff] = useState([]);

  const [showAddModal, setShowAddModal]       = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError]         = useState('');

  const emptyForm = {
    roomId: '', issue: '', issueType: 'other',
    priority: 'medium', assignedTo: '', dueDate: '', notes: ''
  };
  const [addForm, setAddForm] = useState(emptyForm);

  useEffect(() => { loadRequests(); }, []);

  useEffect(() => {
    let result = requests;
    if (filterStatus)   result = result.filter(r => r.status === filterStatus);
    if (filterPriority) result = result.filter(r => r.priority === filterPriority);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.roomId?.roomNumber || '').toLowerCase().includes(q) ||
        (r.issue || '').toLowerCase().includes(q) ||
        (r.assignedTo?.name || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterStatus, filterPriority, search, requests]);

  const loadRequests = async () => {
    try {
      const res = await api.get(`${API_URL}/maintenance`, { headers });
      setRequests(res.data);
      setFilter(res.data);
    } catch (err) { console.error(err); }
  };

  const loadModalData = async () => {
    try {
      const [roomsRes, usersRes] = await Promise.all([
        api.get(`${API_URL}/rooms`, { headers }),
        api.get(`${API_URL}/auth/users`, { headers })
      ]);
      setRooms(roomsRes.data);
      const users = usersRes.data?.users || usersRes.data || [];
      setMaintStaff((Array.isArray(users) ? users : []).filter(u => u.role === 'maintenance'));
    } catch (err) { console.error(err); }
  };

  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved:   requests.filter(r => r.status === 'resolved').length,
  };

  // ✅ Staff performance
  const staffPerformance = {};
  requests.forEach(r => {
    if (!r.assignedTo) return;
    const id   = r.assignedTo._id;
    const name = r.assignedTo.name;
    if (!staffPerformance[id]) {
      staffPerformance[id] = { name, total: 0, resolved: 0, pending: 0, inProgress: 0, avgTime: [] };
    }
    staffPerformance[id].total++;
    if (r.status === 'resolved') {
      staffPerformance[id].resolved++;
      if (r.resolvedAt && r.createdAt) {
        const mins = Math.round((new Date(r.resolvedAt) - new Date(r.createdAt)) / 60000);
        if (mins > 0) staffPerformance[id].avgTime.push(mins);
      }
    }
    if (r.status === 'pending')     staffPerformance[id].pending++;
    if (r.status === 'in_progress') staffPerformance[id].inProgress++;
  });

  const staffList = Object.values(staffPerformance).map(s => ({
    ...s,
    resolutionRate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0,
    avgMinutes: s.avgTime.length > 0 ? Math.round(s.avgTime.reduce((a, b) => a + b, 0) / s.avgTime.length) : 0,
  })).sort((a, b) => b.resolutionRate - a.resolutionRate);

  const priorityBadge = (p) => {
    const info = PRIORITIES.find(x => x.value === p) || PRIORITIES[1];
    return (
      <span className="badge" style={{ background: info.bg, color: info.color, border: `1px solid ${info.color}` }}>
        {info.label}
      </span>
    );
  };

  const statusBadge = (status) => {
    const map = {
      pending:     'bg-warning-subtle text-warning',
      in_progress: 'bg-primary-subtle text-primary',
      resolved:    'bg-success-subtle text-success',
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  const issueTypeInfo = (t) => ISSUE_TYPES.find(x => x.value === t) || ISSUE_TYPES[6];

  const isOverdue = (r) => {
    if (!r.dueDate || r.status === 'resolved') return false;
    return new Date(r.dueDate) < new Date();
  };

  const handleAdd = async () => {
    setError('');
    if (!addForm.roomId || !addForm.issue) {
      setError('Please select room and describe the issue.');
      return;
    }
    try {
      await api.post(`${API_URL}/maintenance`, {
        roomId:     addForm.roomId,
        issue:      addForm.issue,
        issueType:  addForm.issueType,
        priority:   addForm.priority,
        assignedTo: addForm.assignedTo || undefined,
        dueDate:    addForm.dueDate    || undefined,
        notes:      addForm.notes,
      }, { headers });
      setShowAddModal(false);
      setAddForm(emptyForm);
      loadRequests();
    } catch (err) { setError(err.response?.data?.message || 'Error adding request.'); }
  };

  const handleNextStatus = async (r) => {
    const next = NEXT_STATUS[r.status];
    if (!next) return;
    try {
      await api.put(`${API_URL}/maintenance/${r._id}`, { status: next }, { headers });
      loadRequests();
      if (selectedRequest?._id === r._id) setSelectedRequest({ ...r, status: next });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_URL}/maintenance/${selectedRequest._id}`, { headers });
      setShowDeleteModal(false);
      setShowDetailModal(false);
      loadRequests();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Maintenance Requests</h4>
            <button className="btn btn-success" onClick={() => {
              loadModalData();
              setAddForm(emptyForm);
              setError('');
              setShowAddModal(true);
            }}>
              <i className="ri-add-line me-1"></i> Add Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Requests', value: stats.total,      icon: 'bx bx-list-ul',      color: 'info'    },
          { label: 'Pending',        value: stats.pending,    icon: 'bx bx-time',          color: 'warning' },
          { label: 'In Progress',    value: stats.inProgress, icon: 'bx bx-loader-circle', color: 'primary' },
          { label: 'Resolved',       value: stats.resolved,   icon: 'bx bx-check-circle',  color: 'success' },
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
          <h5 className="card-title mb-0 flex-grow-1">All Maintenance Requests</h5>

          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search room, issue, staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select className="form-select form-select-sm w-auto" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
              <tr>
                  <th>#</th>
                  <th>Room</th>
                  <th>Issue Type</th>
                  <th>Issue</th>
                  <th>Reported By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No maintenance requests found.</td></tr>
                ) : filter.map((r, i) => {
                  const overdue = isOverdue(r);
                  const typeInfo = issueTypeInfo(r.issueType);
                  return (
                    <tr key={r._id} style={overdue ? { background: '#fff8f8' } : {}}>
                      <td>{i + 1}</td>
                      <td><span className="fw-medium">{r.roomId ? `Room ${r.roomId.roomNumber}` : '—'}</span></td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">
                          <i className={`${typeInfo.icon} me-1`}></i>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted" style={{ maxWidth: 180, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.issue}
                        </small>
                      </td>
                      <td>
                        <span className="fw-medium text-primary">{r.reportedBy?.name || '—'}</span>
                      </td>
                      <td>{priorityBadge(r.priority || 'medium')}</td>
                      <td>{statusBadge(r.status)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-soft-info btn-sm" onClick={() => { setSelectedRequest(r); setShowDetailModal(true); }} title="View">
                            <i className="ri-eye-line"></i>
                          </button>
                          {NEXT_STATUS[r.status] && (
                            <button className="btn btn-soft-success btn-sm" onClick={() => handleNextStatus(r)} title={`Move to ${NEXT_STATUS[r.status]}`}>
                              <i className="ri-arrow-right-line"></i>
                            </button>
                          )}
                          {/* <button className="btn btn-soft-danger btn-sm" onClick={() => { setSelectedRequest(r); setShowDeleteModal(true); }} title="Delete">
                            <i className="ri-delete-bin-line"></i>
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
{/* ── STAFF PERFORMANCE ── */}
      {staffList.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="card-title mb-0">🔧 Maintenance Staff Performance</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Staff Name</th>
                    <th>Total Tasks</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Avg Resolution Time</th>
                    <th>Resolution Rate</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0,
                              background: ['#405189','#0ab39c','#f7b84b','#f06548'][i % 4] }}
                          >
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="fw-medium">{s.name}</span>
                        </div>
                      </td>
                      <td>{s.total}</td>
                      <td><span className="badge bg-success-subtle text-success">{s.resolved}</span></td>
                      <td><span className="badge bg-warning-subtle text-warning">{s.pending}</span></td>
                      <td>
                        {s.avgMinutes > 0
                          ? <span className="text-muted fs-13">
                              {s.avgMinutes >= 60
                                ? `${Math.floor(s.avgMinutes / 60)}h ${s.avgMinutes % 60}m`
                                : `${s.avgMinutes} mins`}
                            </span>
                          : <span className="text-muted fs-13">—</span>
                        }
                      </td>
                      <td><span className="fw-bold">{s.resolutionRate}%</span></td>
                      <td style={{ minWidth: 150 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 8 }}>
                            <div
                              className={`progress-bar ${s.resolutionRate >= 80 ? 'bg-success' : s.resolutionRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${s.resolutionRate}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: 16 }}>
                            {s.resolutionRate >= 80 ? '⭐' : s.resolutionRate >= 50 ? '👍' : '⚠️'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ── DETAIL MODAL ── */}
      {showDetailModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Maintenance Request Detail</h5>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    { label: 'Room',        value: selectedRequest.roomId ? `Room ${selectedRequest.roomId.roomNumber} (${selectedRequest.roomId.type})` : '—' },
                    { label: 'Issue Type',  value: issueTypeInfo(selectedRequest.issueType).label },
                    { label: 'Reported By', value: selectedRequest.reportedBy?.name || '—' },
                    { label: 'Priority',    value: priorityBadge(selectedRequest.priority), isNode: true },
                    { label: 'Status',      value: statusBadge(selectedRequest.status), isNode: true },
                    { label: 'Resolved At', value: selectedRequest.resolvedAt ? new Date(selectedRequest.resolvedAt).toLocaleString('en-PK') : '—' },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        {item.isNode ? <div className="mt-1">{item.value}</div> : <h6 className="mb-0">{item.value}</h6>}
                      </div>
                    </div>
                  ))}
                  <div className="col-12">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">Issue Description</p>
                      <p className="mb-0">{selectedRequest.issue}</p>
                    </div>
                  </div>
                  {selectedRequest.notes && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">Notes</p>
                        <p className="mb-0">{selectedRequest.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {NEXT_STATUS[selectedRequest.status] && (
                  <div className="mt-3">
                    <button className="btn btn-success" onClick={() => handleNextStatus(selectedRequest)}>
                      <i className="ri-arrow-right-line me-1"></i>
                      Move to {NEXT_STATUS[selectedRequest.status].replace('_', ' ')}
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

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Maintenance Request</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Room <span className="text-danger">*</span></label>
                    <select className="form-select" value={addForm.roomId} onChange={e => setAddForm({ ...addForm, roomId: e.target.value })}>
                      <option value="">Select Room</option>
                      {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.type})</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Issue Type</label>
                    <select className="form-select" value={addForm.issueType} onChange={e => setAddForm({ ...addForm, issueType: e.target.value })}>
                      {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={addForm.priority} onChange={e => setAddForm({ ...addForm, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  {/* <div className="col-md-6">
                    <label className="form-label">Assign Staff</label>
                    <select className="form-select" value={addForm.assignedTo} onChange={e => setAddForm({ ...addForm, assignedTo: e.target.value })}>
                      <option value="">Not Assigned</option>
                      {maintStaff.length === 0
                        ? <option disabled>No maintenance staff found</option>
                        : maintStaff.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Due Date & Time</label>
                    <input type="datetime-local" className="form-control" value={addForm.dueDate}
                      onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })} />
                  </div> */}

                  <div className="col-12">
                    <label className="form-label">Issue Description <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={3} placeholder="Describe the issue in detail..."
                      value={addForm.issue} onChange={e => setAddForm({ ...addForm, issue: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes / Instructions</label>
                    <textarea className="form-control" rows={2} placeholder="Any additional instructions..."
                      value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>
                  <i className="ri-check-line me-1"></i>Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div className="avatar-md mx-auto mb-3">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                    <i className="ri-delete-bin-line text-danger"></i>
                  </span>
                </div>
                <h5>Delete Request?</h5>
                <p className="text-muted">This cannot be undone.</p>
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

export default Maintenance;
import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

const TASK_TYPES = [
  { value: 'room_cleaning',    label: 'Room Cleaning' },
  { value: 'deep_cleaning',    label: 'Deep Cleaning' },
  { value: 'linen_change',     label: 'Linen Change' },
  { value: 'bathroom_cleaning',label: 'Bathroom Cleaning' },
  { value: 'minibar_refill',   label: 'Mini Bar Refill' },
  { value: 'guest_request',    label: 'Guest Request' },
];

const PRIORITIES = [
  { value: 'low',       label: 'Low',       color: '#6c757d', bg: '#f8f9fa' },
  { value: 'medium',    label: 'Medium',    color: '#0d6efd', bg: '#e7f1ff' },
  { value: 'high',      label: 'High',      color: '#fd7e14', bg: '#fff3e0' },
  { value: 'emergency', label: 'Emergency', color: '#dc3545', bg: '#ffeaea' },
];

const NEXT_STATUS = { pending: 'in_progress', in_progress: 'completed' };

const Housekeeping = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [tasks, setTasks]           = useState([]);
  const [filter, setFilter]     = useState([]);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]         = useState('');
  const [rooms, setRooms]           = useState([]);
  const [hkStaff, setHkStaff]       = useState([]);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask]     = useState(null);
  const [error, setError]           = useState('');
  const [addForm, setAddForm]       = useState({
    roomId: '', staffId: '', taskType: 'room_cleaning',
    priority: 'medium', notes: '', dueDate: ''
  });

  useEffect(() => { loadTasks(); }, []);

  useEffect(() => {
    let result = tasks;
    if (filterStatus)   result = result.filter(t => t.cleaningStatus === filterStatus);
    if (filterPriority) result = result.filter(t => t.priority === filterPriority);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.roomId?.roomNumber || '').toLowerCase().includes(q) ||
        (t.requestedBy?.name || '').toLowerCase().includes(q) ||
        (t.assignedStaff?.name || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterStatus, filterPriority, search, tasks]);

  const loadTasks = async () => {
    try {
      const res = await api.get(`${API_URL}/housekeeping`, { headers });
      setTasks(res.data);
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
      setHkStaff((Array.isArray(users) ? users : []).filter(u => u.role === 'housekeeping'));
    } catch (err) { console.error(err); }
  };

 const stats = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.cleaningStatus === 'pending').length,
    inProgress: tasks.filter(t => t.cleaningStatus === 'in_progress').length,
    completed:  tasks.filter(t => t.cleaningStatus === 'completed').length,
  };

  // ✅ Staff performance calculations
  const staffPerformance = {};
  tasks.forEach(t => {
    if (!t.assignedStaff) return;
    const id   = t.assignedStaff._id;
    const name = t.assignedStaff.name;
    if (!staffPerformance[id]) {
      staffPerformance[id] = { name, total: 0, completed: 0, pending: 0, inProgress: 0, avgTime: [] };
    }
    staffPerformance[id].total++;
    if (t.cleaningStatus === 'completed') {
      staffPerformance[id].completed++;
      if (t.completedAt && t.createdAt) {
        const mins = Math.round((new Date(t.completedAt) - new Date(t.createdAt)) / 60000);
        if (mins > 0) staffPerformance[id].avgTime.push(mins);
      }
    }
    if (t.cleaningStatus === 'pending')     staffPerformance[id].pending++;
    if (t.cleaningStatus === 'in_progress') staffPerformance[id].inProgress++;
  });

  const staffList = Object.values(staffPerformance).map(s => ({
    ...s,
    completionRate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
    avgMinutes: s.avgTime.length > 0 ? Math.round(s.avgTime.reduce((a, b) => a + b, 0) / s.avgTime.length) : 0,
  })).sort((a, b) => b.completionRate - a.completionRate);

  const priorityInfo = (p) => PRIORITIES.find(x => x.value === p) || PRIORITIES[1];

  const priorityBadge = (p) => {
    const info = priorityInfo(p);
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
      completed:   'bg-success-subtle text-success',
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  const taskTypeLabel = (t) => TASK_TYPES.find(x => x.value === t)?.label || t;

  const handleAdd = async () => {
    setError('');
    if (!addForm.roomId) {
      setError('Please select a room.');
      return;
    }
    try {
      await api.post(`${API_URL}/housekeeping`, {
        roomId:        addForm.roomId,
        assignedStaff: addForm.staffId || undefined,
        taskType:      addForm.taskType,
        priority:      addForm.priority,
        notes:         addForm.notes,
        dueDate:       addForm.dueDate || undefined,
      }, { headers });
      setShowAddModal(false);
      setAddForm({ roomId: '', staffId: '', taskType: 'room_cleaning', priority: 'medium', notes: '', dueDate: '' });
      loadTasks();
    } catch (err) { setError(err.response?.data?.message || 'Error assigning task.'); }
  };

  const handleNextStatus = async (task) => {
    const next = NEXT_STATUS[task.cleaningStatus];
    if (!next) return;
    try {
      await api.put(`${API_URL}/housekeeping/${task._id}`, { cleaningStatus: next }, { headers });
      loadTasks();
      if (selectedTask?._id === task._id) setSelectedTask({ ...task, cleaningStatus: next });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_URL}/housekeeping/${selectedTask._id}`, { headers });
      setShowDeleteModal(false);
      setShowDetailModal(false);
      loadTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="page-title-box">
        <h4>Housekeeping Management</h4>
        <button className="btn btn-success" onClick={() => {
          loadModalData();
          setAddForm({ roomId: '', staffId: '', taskType: 'room_cleaning', priority: 'medium', notes: '', dueDate: '' });
          setError('');
          setShowAddModal(true);
        }}>
          <i className="ri-add-line me-1"></i> Assign Task
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-1">
        {[
          { label: 'Total Tasks',  value: stats.total,      icon: 'ri-list-check',    color: 'info'    },
          { label: 'Pending',      value: stats.pending,    icon: 'ri-time-line',     color: 'warning' },
          { label: 'In Progress',  value: stats.inProgress, icon: 'ri-loader-4-line', color: 'gold'    },
          { label: 'Completed',    value: stats.completed,  icon: 'ri-checkbox-circle-line', color: 'success' },
        ].map((s, i) => (
          <div className="col-xl-3 col-md-6" key={i}>
            <div className="card card-animate h-100">
              <div className="ls-kpi-body">
                <div>
                  <p className="ls-kpi-label">{s.label}</p>
                  <h4 className="ls-kpi-value">{s.value}</h4>
                </div>
                <div className={`ls-kpi-icon ls-kpi-icon-${s.color === 'warning' ? 'gold' : s.color}`}>
                  <i className={s.icon}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card mt-3">
        <div className="card-header d-flex align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0 flex-grow-1">Cleaning Tasks</h5>

          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search room or guest..."
            aria-label="Search tasks"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select className="form-select form-select-sm w-auto" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} aria-label="Filter by priority">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Room</th>
                  <th>Requested By</th>
                  <th>Task Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No tasks found.</td></tr>
                ) : filter.map((t, i) => (
                  <tr key={t._id}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="fw-medium">
                        {t.roomId ? `Room ${t.roomId.roomNumber}` : (t.roomNumber ? `Room ${t.roomNumber}` : '—')}
                      </span>
                      {t.roomId?.type && <small className="text-muted d-block">{t.roomId.type}</small>}
                    </td>
                    <td>
                      {t.guestRequest
                        ? <span className="fw-medium text-primary">{t.requestedBy?.name || 'Guest'}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info">{taskTypeLabel(t.taskType)}</span>
                    </td>
                    <td>{priorityBadge(t.priority || 'medium')}</td>
                    <td>{statusBadge(t.cleaningStatus)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-soft-info btn-sm" onClick={() => { setSelectedTask(t); setShowDetailModal(true); }} title="View details" aria-label={`View details for task ${i + 1}`}>
                          <i className="ri-eye-line"></i>
                        </button>
                        {NEXT_STATUS[t.cleaningStatus] && (
                          <button className="btn btn-soft-success btn-sm" onClick={() => handleNextStatus(t)} title={`Move to ${NEXT_STATUS[t.cleaningStatus].replace('_', ' ')}`} aria-label={`Move task ${i + 1} to ${NEXT_STATUS[t.cleaningStatus]}`}>
                            <i className="ri-arrow-right-line"></i>
                          </button>
                        )}
                        {/* <button className="btn btn-soft-danger btn-sm" onClick={() => { setSelectedTask(t); setShowDeleteModal(true); }} title="Delete">
                          <i className="ri-delete-bin-line"></i>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
{/* ── STAFF PERFORMANCE ── */}
      {staffList.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="card-title mb-0">👥 Staff Performance</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Staff Name</th>
                    <th>Total Tasks</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Avg Time</th>
                    <th>Completion Rate</th>
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
                      <td><span className="badge bg-success-subtle text-success">{s.completed}</span></td>
                      <td><span className="badge bg-warning-subtle text-warning">{s.pending}</span></td>
                      <td>
                        {s.avgMinutes > 0
                          ? <span className="text-muted fs-13">{s.avgMinutes} mins</span>
                          : <span className="text-muted fs-13">—</span>
                        }
                      </td>
                      <td><span className="fw-bold">{s.completionRate}%</span></td>
                      <td style={{ minWidth: 150 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 8 }}>
                            <div
                              className={`progress-bar ${s.completionRate >= 80 ? 'bg-success' : s.completionRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${s.completionRate}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: 16 }}>
                            {s.completionRate >= 80 ? '⭐' : s.completionRate >= 50 ? '👍' : '⚠️'}
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
      {showDetailModal && selectedTask && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Task Detail</h5>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    { label: 'Room',         value: selectedTask.roomId ? `Room ${selectedTask.roomId.roomNumber} (${selectedTask.roomId.type})` : (selectedTask.roomNumber ? `Room ${selectedTask.roomNumber}` : '—') },
                    { label: 'Requested By', value: selectedTask.guestRequest ? (selectedTask.requestedBy?.name || 'Guest') : '—' },
                    { label: 'Task Type',    value: taskTypeLabel(selectedTask.taskType) },
                    { label: 'Priority',     value: priorityBadge(selectedTask.priority), isNode: true },
                    { label: 'Status',       value: statusBadge(selectedTask.cleaningStatus), isNode: true },
                    { label: 'Requested On', value: new Date(selectedTask.createdAt).toLocaleString('en-PK') },
                    { label: 'Completed At', value: selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleString('en-PK') : '—' },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        {item.isNode ? <div className="mt-1">{item.value}</div> : <h6 className="mb-0">{item.value}</h6>}
                      </div>
                    </div>
                  ))}
                  {selectedTask.notes && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">Notes / Instructions</p>
                        <p className="mb-0">{selectedTask.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {NEXT_STATUS[selectedTask.cleaningStatus] && (
                  <div className="mt-3">
                    <button className="btn btn-success" onClick={() => handleNextStatus(selectedTask)}>
                      <i className="ri-arrow-right-line me-1"></i>
                      Move to {NEXT_STATUS[selectedTask.cleaningStatus].replace('_', ' ')}
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

      {/* ── ADD TASK MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Cleaning Task</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Select Room <span className="text-danger">*</span></label>
                    <select className="form-select" value={addForm.roomId} onChange={e => setAddForm({ ...addForm, roomId: e.target.value })}>
                      <option value="">Select Room</option>
                      {rooms.map(r => (
                        <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.type}) — {r.status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Assign Staff <span className="text-muted">(optional)</span></label>
                    <select className="form-select" value={addForm.staffId} onChange={e => setAddForm({ ...addForm, staffId: e.target.value })}>
                      <option value="">Select Housekeeping Staff</option>
                      {hkStaff.length === 0
                        ? <option disabled>No housekeeping staff found</option>
                        : hkStaff.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
                      }
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Task Type</label>
                    <select className="form-select" value={addForm.taskType} onChange={e => setAddForm({ ...addForm, taskType: e.target.value })}>
                      {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={addForm.priority} onChange={e => setAddForm({ ...addForm, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes / Instructions</label>
                    <textarea
                      className="form-control" rows={3}
                      placeholder="Any special instructions for the staff..."
                      value={addForm.notes}
                      onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>
                  <i className="ri-check-line me-1"></i>Assign Task
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
                <h5>Delete Task?</h5>
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

export default Housekeeping;
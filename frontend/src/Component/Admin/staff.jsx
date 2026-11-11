import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

const Staff = () => {
  const getHeaders = () => {
    const t = localStorage.getItem('token');
    const base = { 'Content-Type': 'application/json' };
    return t && t !== 'null' && t !== 'undefined'
      ? { ...base, Authorization: `Bearer ${t}` }
      : base;
  };

  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [error, setError] = useState('');
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', role: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '', status: '' });

  useEffect(() => { loadStaff(); }, []);

  useEffect(() => {
    let result = staff;
    if (filterRole) result = result.filter(u => u.role === filterRole);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterRole, search, staff]);

  const loadStaff = async () => {
    try {
      const res = await api.get(`${API_URL}/auth/users`, { headers: getHeaders() });
      const staffOnly = (res.data.users || []).filter(u =>
        ['manager', 'receptionist', 'housekeeping', 'maintenance', 'kitchen'].includes(u.role)
      );
      setStaff(staffOnly);
      setFilter(staffOnly);
    } catch (err) { console.error(err); }
  };

  const stats = {
    total: staff.length,
    active: staff.filter(u => u.status === 'active' || !u.status).length,
    receptionist: staff.filter(u => u.role === 'receptionist').length,
    housekeeping: staff.filter(u => u.role === 'housekeeping').length,
    maintenance: staff.filter(u => u.role === 'maintenance').length,
  };

  const roleBadge = (role) => {
    const map = {
      manager:      { backgroundColor: 'var(--theme-primary, #1B365D)', color: '#fff' },
      receptionist: { backgroundColor: '#668AA8', color: '#fff' },
      housekeeping: { backgroundColor: '#368568', color: '#fff' },
      maintenance:  { backgroundColor: '#D49A46', color: '#fff' },
      kitchen:      { backgroundColor: 'var(--theme-secondary, #2563EB)', color: '#fff' },
    };
    const style = map[role] || { backgroundColor: '#6c757d', color: '#fff' };
    return <span className="badge" style={style}>{role}</span>;
  };

  const statusBadge = (status) => {
    const map = {
      active:     { cls: 'bg-success-subtle text-success', label: 'Active' },
      inactive:   { cls: 'bg-secondary-subtle text-secondary', label: 'Inactive' },
      on_leave:   { cls: 'bg-info-subtle text-info', label: 'On Leave' },
      suspended:  { cls: 'bg-danger-subtle text-danger', label: 'Suspended' },
    };
    const s = map[status] || map['active'];
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const phoneRegex = /^03\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handlePhoneInput = (val) => {
    const onlyNums = val.replace(/\D/g, '').slice(0, 11);
    if (onlyNums.length > 0 && !onlyNums.startsWith('03')) {
      return '03' + onlyNums.replace(/^0*3*/, '').slice(0, 9);
    }
    return onlyNums;
  };

  const handleAdd = async () => {
    setError('');
    const { name, email, phone, role, password } = addForm;

    if (!name.trim())               { setError('Full name is required.');         return; }
    if (!email.trim())              { setError('Email is required.');              return; }
    if (!emailRegex.test(email))    { setError('Enter a valid email address.');    return; }
    if (!phone.trim())              { setError('Phone number is required.');       return; }
    if (!phoneRegex.test(phone))    { setError('Enter valid Pakistani phone number (03XXXXXXXXX — 11 digits).'); return; }
    if (!password.trim())           { setError('Password is required.');           return; }
    if (!passwordRegex.test(password)) { setError('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.'); return; }
    if (!role)                      { setError('Please select a role.');           return; }

    try {
      await api.post(
        `${API_URL}/auth/staff`,
        { name, email, phone, password, role },
        { headers: getHeaders() }
      );
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', role: '', password: '' });
      loadStaff();
    } catch (err) { setError(err.response?.data?.message || 'Error adding staff.'); }
  };

  const handleEdit = async () => {
    setError('');
    try {
      await api.put(`${API_URL}/auth/users/${selectedStaff._id}`, editForm, { headers: getHeaders() });
      setShowEditModal(false);
      loadStaff();
    } catch (err) { setError(err.response?.data?.message || 'Error updating staff.'); }
  };

  // Deactivate instead of delete
  const handleDeactivate = async () => {
    try {
      await api.put(
        `${API_URL}/auth/users/${selectedStaff._id}`,
        { status: 'inactive' },
        { headers: getHeaders() }
      );
      setShowDeactivateModal(false);
      loadStaff();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to deactivate staff.');
    }
  };

  const openEdit = (u) => {
    setSelectedStaff(u);
    setEditForm({ name: u.name, phone: u.phone || '', role: u.role, status: u.status || 'active' });
    setError('');
    setShowEditModal(true);
  };

  const openView = (u) => {
    setSelectedStaff(u);
    setShowViewModal(true);
  };

  const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-danger'];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Staff</h4>
            <button className="btn btn-success" onClick={() => {
              setAddForm({ name: '', email: '', phone: '', role: '', password: '' });
              setError('');
              setShowAddModal(true);
            }}>
              <i className="ri-user-add-line me-1"></i> Add Staff Member
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Staff',    value: stats.total,        icon: 'bx bx-group',    color: 'primary' },
          { label: 'Active',         value: stats.active,       icon: 'bx bx-user-check', color: 'success' },
          { label: 'Housekeeping',   value: stats.housekeeping, icon: 'bx bx-brush',    color: 'info' },
          { label: 'Maintenance',    value: stats.maintenance,  icon: 'bx bx-wrench',   color: 'warning' },
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
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="card-title mb-0">Staff Members</h5>

          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Search */}
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ minWidth: 0, width: 'min(220px, 100%)' }}
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {/* Role Filter */}
            <select
              className="form-select form-select-sm w-auto"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="maintenance">Maintenance</option>
              <option value="kitchen">Kitchen Staff</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No staff members found.</td></tr>
                ) : filter.map((u, i) => {
                  const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const isInactive = u.status === 'inactive';
                  return (
                    <tr key={u._id} className={isInactive ? 'opacity-75' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-xs">
                            <span className={`avatar-title rounded-circle ${colors[i % colors.length]} text-white`} style={{ fontSize: '11px' }}>
                              {initials}
                            </span>
                          </div>
                          <div className="fw-medium">{u.name}</div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{statusBadge(u.status || 'active')}</td>
                      <td><small className="text-muted">{new Date(u.createdAt).toLocaleDateString('en-PK')}</small></td>
                      <td>
                        <div className="d-flex gap-1">
                          {/* View */}
                          <button className="btn btn-soft-info btn-sm" onClick={() => openView(u)} title="View Profile">
                            <i className="ri-eye-line"></i>
                          </button>
                          {/* Edit */}
                          <button className="btn btn-soft-primary btn-sm" onClick={() => openEdit(u)} title="Edit">
                            <i className="ri-edit-line"></i>
                          </button>
                          {/* Deactivate — sirf active staff ke liye */}
                          {(u.status === 'active' || !u.status) && (
                            <button
                              className="btn btn-soft-danger btn-sm"
                              title="Deactivate"
                              onClick={() => { setSelectedStaff(u); setShowDeactivateModal(true); }}
                            >
                              <i className="ri-user-unfollow-line"></i>
                            </button>
                          )}
                          {/* Reactivate — sirf inactive staff ke liye */}
                          {u.status === 'inactive' && (
                            <button
                              className="btn btn-soft-success btn-sm"
                              title="Reactivate"
                              onClick={async () => {
                                if (!window.confirm(`Reactivate ${u.name}?`)) return;
                                try {
                                  await api.put(`${API_URL}/auth/users/${u._id}`, { status: 'active' }, { headers: getHeaders() });
                                  loadStaff();
                                } catch (err) {
                                  console.error(err);
                                  alert(err.response?.data?.message || 'Failed to reactivate staff.');
                                }
                              }}
                            >
                              <i className="ri-user-follow-line"></i>
                            </button>
                          )}
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

      {/* View Profile Modal */}
      {showViewModal && selectedStaff && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Staff Profile</h5>
                <button className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Avatar + Name Header */}
                <div className="text-center mb-4">
                  <div className="avatar-lg mx-auto mb-3">
                    <span className="avatar-title rounded-circle bg-primary text-white fs-3">
                      {selectedStaff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <h5 className="mb-1">{selectedStaff.name}</h5>
                  <div className="d-flex justify-content-center gap-2">
                    {roleBadge(selectedStaff.role)}
                    {statusBadge(selectedStaff.status || 'active')}
                  </div>
                </div>

                <div className="row g-3">
                  {[
                    { label: 'Email',       value: selectedStaff.email },
                    { label: 'Phone',       value: selectedStaff.phone || '—' },
                    { label: 'Role',        value: selectedStaff.role },
                    { label: 'Status',      value: selectedStaff.status || 'active' },
                    { label: 'Joined Date', value: new Date(selectedStaff.createdAt).toLocaleDateString('en-PK') },
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">{item.label}</p>
                        <h6 className="mb-0">{item.value}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowViewModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={() => { setShowViewModal(false); openEdit(selectedStaff); }}>
                  <i className="ri-edit-line me-1"></i> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Staff Member</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12">
                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name"
                      value={addForm.name}
                      onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email"
                      value={addForm.email}
                      onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    />
                  </div>

                  {/* Phone — sirf numbers, max 11, Pakistani format */}
                  <div className="col-12">
                    <label className="form-label">Phone <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      value={addForm.phone}
                      onChange={e => setAddForm({ ...addForm, phone: handlePhoneInput(e.target.value) })}
                      onKeyDown={e => {
                        // 11 digits ho jayen to aur type na ho — backspace/delete/arrows allow karo
                        const allowedKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                        if (addForm.phone.length >= 11 && !allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key) === false) {
                          // already handled by maxLength + handlePhoneInput
                        }
                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <small className="text-muted">Pakistani number — 03XXXXXXXXX (11 digits)</small>
                  </div>

                  {/* Password */}
                  <div className="col-12">
                    <label className="form-label">Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={addForm.password}
                      onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                    />
                    <small className="text-muted">Min 8 characters · 1 uppercase · 1 lowercase · 1 number</small>
                  </div>

                  {/* Role */}
                  <div className="col-12">
                    <label className="form-label">Role <span className="text-danger">*</span></label>
                    <select className="form-select" value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                      <option value="">Select Role</option>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="kitchen">Kitchen Staff</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>Add Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Staff Member</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: handlePhoneInput(e.target.value) })}
                      onKeyDown={e => {
                        const allowedKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <small className="text-muted">Pakistani number — 03XXXXXXXXX (11 digits)</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={editForm.role}
                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="kitchen">Kitchen Staff</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="suspended">Suspended</option>
                    </select>
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

      {/* Deactivate Modal */}
      {showDeactivateModal && selectedStaff && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div className="avatar-md mx-auto mb-3">
                  <span className="avatar-title bg-warning-subtle rounded-circle fs-1">
                    <i className="ri-user-unfollow-line text-warning"></i>
                  </span>
                </div>
                <h5>Deactivate Staff Member?</h5>
                <p className="text-muted mb-1">{selectedStaff.name}</p>
                <p className="text-muted fs-13">Staff record rehega — sirf inactive ho jaayega. Baad mein reactivate kar sakte ho.</p>
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <button className="btn btn-light" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
                  <button className="btn btn-warning" onClick={handleDeactivate}>Deactivate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
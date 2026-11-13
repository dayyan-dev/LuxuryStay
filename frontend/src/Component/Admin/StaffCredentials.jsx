import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ROLE_COLORS = {
  manager: { bg: 'var(--theme-primary, #1B365D)', text: '#fff' },
  receptionist: { bg: '#4F46E5', text: '#fff' },
  housekeeping: { bg: '#059669', text: '#fff' },
  maintenance: { bg: '#D97706', text: '#fff' },
  kitchen: { bg: '#DC2626', text: '#fff' },
};

export default function StaffCredentials() {
  const getHeaders = () => {
    const t = localStorage.getItem('token');
    const base = { 'Content-Type': 'application/json' };
    return t && t !== 'null' && t !== 'undefined'
      ? { ...base, Authorization: `Bearer ${t}` }
      : base;
  };

  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Revealed passwords map: { [userId]: boolean }
  const [revealed, setRevealed] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Edit / Reset modal
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteStaff = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`${API_URL}/auth/users/${deleteTarget._id}`, { headers: getHeaders() });
      setDeleteTarget(null);
      loadCredentials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff member.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}/auth/staff-credentials`, {
        headers: getHeaders(),
      });
      const list = res.data?.staff || [];
      setStaff(list);
      setFilter(list);
    } catch (err) {
      console.error('Failed to load staff credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = staff;
    if (filterRole) result = result.filter((u) => u.role === filterRole);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.portalSlug || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterRole, search, staff]);

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, idKey) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const generateRandomPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%&*';
    const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
    const generated =
      pick(upper) +
      pick(lower) +
      pick(digits) +
      pick(special) +
      Array.from({ length: 6 }, () => pick(lower + digits)).join('');
    setNewPassword(generated);
  };

  const openResetModal = (u) => {
    setSelectedStaff(u);
    setNewPassword(u.password !== '(Not saved - click reset)' ? u.password : '');
    setCustomSlug(u.portalSlug || '');
    setResetError('');
    setResetSuccess('');
    setShowResetModal(true);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }

    setUpdating(true);
    setResetError('');
    try {
      const payload = {
        password: newPassword.trim(),
        portalSlug: customSlug.trim() || undefined,
      };
      await api.put(`${API_URL}/auth/staff/${selectedStaff._id}/credentials`, payload, {
        headers: getHeaders(),
      });
      setResetSuccess('Credentials updated successfully!');
      setTimeout(() => {
        setShowResetModal(false);
        loadCredentials();
      }, 900);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setUpdating(false);
    }
  };

  const originUrl = window.location.origin;

  return (
    <div className="container-fluid">
      {/* Title & Header */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-1">Staff Credentials & Portal Directory</h4>
              <p className="text-muted small mb-0">
                Centralized directory of staff login credentials, saved passwords, and custom URL links.
              </p>
            </div>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <button className="btn btn-outline-secondary btn-sm" onClick={loadCredentials}>
                <i className="ri-refresh-line me-1" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card Banner */}
      <div className="card mb-4 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #0F172A 100%)', color: '#fff' }}>
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', fontSize: 20 }}
                >
                  <i className="ri-key-2-line" />
                </div>
                <div>
                  <h5 className="mb-0 text-white fw-bold">Individual Staff Portal URLs & Password Backup</h5>
                  <small style={{ opacity: 0.85 }}>
                    Each staff member has their dedicated URL (e.g. <code>/{'{role}'}/{'{name}'}</code>). Passwords are saved here so administrators can look them up or copy them whenever a team member forgets.
                  </small>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <span className="badge bg-white text-dark px-3 py-2 fs-6">
                Total Staff Accounts: <strong>{staff.length}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="card-title mb-0 fs-15">All Staff Credentials ({filter.length})</h5>

          <div className="d-flex align-items-center flex-wrap gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ minWidth: 200 }}
              placeholder="Search by name, email, or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-select form-select-sm w-auto"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
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

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Email Address</th>
                  <th>Custom Portal Login URL</th>
                  <th>Saved Password</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <div className="text-muted small mt-2">Loading credentials directory...</div>
                    </td>
                  </tr>
                ) : filter.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filter.map((u, i) => {
                    const initials = (u.name || 'S')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    const roleStyle = ROLE_COLORS[u.role] || { bg: '#6c757d', text: '#fff' };
                    const isPassRevealed = Boolean(revealed[u._id]);
                    const fullPortalUrl = `${originUrl}${u.portalUrl}`;

                    return (
                      <tr key={u._id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="avatar-xs rounded-circle d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width: 34,
                                height: 34,
                                background: roleStyle.bg,
                                color: roleStyle.text,
                                fontSize: 11,
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{u.name}</div>
                              <small className="text-muted">{u.phone || '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge text-uppercase"
                            style={{ background: roleStyle.bg, color: roleStyle.text, fontSize: 11 }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <code>{u.email}</code>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-1 py-0"
                              title="Copy Email"
                              onClick={() => copyToClipboard(u.email, `email-${u._id}`)}
                            >
                              <i
                                className={
                                  copiedId === `email-${u._id}`
                                    ? 'ri-check-line text-success'
                                    : 'ri-file-copy-line'
                                }
                              />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <a
                              href={u.portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="fw-semibold text-decoration-none"
                              style={{ color: 'var(--theme-primary, #1B365D)' }}
                            >
                              {u.portalUrl}
                            </a>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-1 py-0"
                              title="Copy Full URL"
                              onClick={() => copyToClipboard(fullPortalUrl, `url-${u._id}`)}
                            >
                              <i
                                className={
                                  copiedId === `url-${u._id}`
                                    ? 'ri-check-line text-success'
                                    : 'ri-file-copy-line'
                                }
                              />
                            </button>
                            <a
                              href={u.portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-soft-primary p-1 py-0"
                              title="Open Portal Link"
                            >
                              <i className="ri-external-link-line" />
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="px-2 py-1 rounded bg-light border small font-monospace"
                              style={{ minWidth: 110, display: 'inline-block' }}
                            >
                              {isPassRevealed ? u.password : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-1 py-0"
                              title={isPassRevealed ? 'Hide Password' : 'Show Password'}
                              onClick={() => toggleReveal(u._id)}
                            >
                              <i className={isPassRevealed ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-1 py-0"
                              title="Copy Password"
                              onClick={() => copyToClipboard(u.password, `pass-${u._id}`)}
                            >
                              <i
                                className={
                                  copiedId === `pass-${u._id}`
                                    ? 'ri-check-line text-success'
                                    : 'ri-file-copy-line'
                                }
                              />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-primary"
                              title="Reset / Edit Credentials"
                              onClick={() => openResetModal(u)}
                            >
                              <i className="ri-edit-line me-1" />
                              Reset
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-danger"
                              title="Delete permanently"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <i className="ri-delete-bin-line" />
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

      {/* Reset / Change Password Modal */}
      {showResetModal && selectedStaff && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Reset Password &amp; Portal for {selectedStaff.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowResetModal(false)}
                />
              </div>

              <form onSubmit={handleSaveCredentials}>
                <div className="modal-body p-4">
                  {resetError && <div className="alert alert-danger py-2 small">{resetError}</div>}
                  {resetSuccess && <div className="alert alert-success py-2 small">{resetSuccess}</div>}

                  <div className="mb-3">
                    <label className="form-label small text-muted mb-1">Staff Member</label>
                    <div className="fw-bold">{selectedStaff.name} ({selectedStaff.role})</div>
                    <small className="text-muted">{selectedStaff.email}</small>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label className="form-label fw-semibold small mb-0">
                        Password <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={generateRandomPassword}
                      >
                        🎲 Generate Random
                      </button>
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        required
                        className="form-control font-monospace"
                        placeholder="Enter or generate password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={() => copyToClipboard(newPassword, 'modal-pass')}
                        title="Copy Password"
                      >
                        <i className="ri-file-copy-line" />
                      </button>
                    </div>
                    <small className="text-muted" style={{ fontSize: 11 }}>
                      Must be at least 8 characters. Admin can view and copy this password anytime.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small mb-1">
                      Portal URL Slug
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light small text-muted">
                        /{selectedStaff.role}/
                      </span>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="slug (e.g. ali-khan)"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: 11 }}>
                      Resulting URL: <code>{originUrl}/{selectedStaff.role}/{customSlug || 'slug'}</code>
                    </small>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary px-4"
                  >
                    {updating ? 'Saving...' : 'Save & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {deleteTarget && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg border-0 rounded-4 text-center p-4">
              <div
                className="avatar-md mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 56, background: '#fee2e2', color: '#dc2626', fontSize: 24 }}
              >
                <i className="ri-delete-bin-line" />
              </div>
              <h5 className="fw-bold mb-1">Delete Staff Member?</h5>
              <p className="text-muted mb-1 fw-semibold">{deleteTarget.name}</p>
              <p className="text-muted fs-12 mb-0">Role: <span className="text-capitalize">{deleteTarget.role}</span> &bull; {deleteTarget.email}</p>
              <div className="alert alert-warning py-2 mt-3 fs-12 text-start">
                Yeh staff account permanently delete ho jayega. Credentials aur portal access bhi remove ho jayenge.
              </div>
              <div className="d-flex gap-2 justify-content-center mt-3">
                <button
                  type="button"
                  className="btn btn-light"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleDeleteStaff}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

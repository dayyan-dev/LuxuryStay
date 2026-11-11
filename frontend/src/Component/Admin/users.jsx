import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Users = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3200);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFilter(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q))
      )
    );
  }, [search, users]);

  const loadUsers = async () => {
    try {
      const res = await api.get(`${API_URL}/auth/users`, { headers });
      const guests = (res.data.users || [])
        .filter((u) => u.role === 'guest')
        .map((user) => {
          const bookings = user.bookings || [];
          const totalBookings = bookings.length;
          const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          const completedBookings = bookings.filter(
            (b) => b.bookingStatus === 'completed'
          ).length;
          return {
            ...user,
            totalBookings,
            totalSpent,
            completedBookings,
            isVIP: totalSpent > 100000,
          };
        });
      setUsers(guests);
      setFilter(guests);
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not load guests.');
    }
  };

  const openView = (u) => {
    setSelectedUser(u);
    setShowViewModal(true);
  };

  const confirmDelete = (u) => setDeleteTarget(u);

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`${API_URL}/auth/users/${deleteTarget._id}`, { headers });
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast('success', `${deleteTarget.name} removed from the system.`);
      setDeleteTarget(null);
      if (selectedUser?._id === deleteTarget._id) {
        setShowViewModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not delete guest.');
    } finally {
      setDeleting(false);
    }
  };

  const walkinCount = users.filter((u) => u.guestType === 'walk-in').length;
  const verifiedCount = users.filter((u) => u.isEmailVerified !== false).length;

  return (
    <div className="container-fluid ls-admin-page">
      {toast.show && (
        <div
          className={`ls-admin-toast ls-admin-toast--${toast.type}`}
          role="status"
        >
          <i
            className={`ri-${toast.type === 'success' ? 'checkbox-circle' : 'error-warning'}-line`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-title-box">
        <div>
          <p className="ls-admin-kicker mb-1">Guest directory</p>
          <h4 className="mb-0">Registe Guests</h4>
        </div>
        <div className="ls-admin-search">
          <i className="ri-search-line" />
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            label: 'Total Guests',
            value: users.length,
            icon: 'ri-group-line',
            tone: 'gold',
          },
          {
            label: 'Online Accounts',
            value: users.length - walkinCount,
            icon: 'ri-user-follow-line',
            tone: 'charcoal',
          },
          {
            label: 'Walk-ins',
            value: walkinCount,
            icon: 'ri-walk-line',
            tone: 'ivory',
          },
          {
            label: 'Email Verified',
            value: verifiedCount,
            icon: 'ri-mail-check-line',
            tone: 'gold',
          },
        ].map((s) => (
          <div className="col-6 col-xl-3" key={s.label}>
            <div className={`ls-admin-stat ls-admin-stat--${s.tone}`}>
              <div className="ls-admin-stat__icon">
                <i className={s.icon} />
              </div>
              <div>
                <p className="ls-admin-stat__label">{s.label}</p>
                <h3 className="ls-admin-stat__value">{s.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card ls-admin-table-card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h5 className="card-title mb-0">All registe guests</h5>
            <small className="text-muted">
              {filter.length} shown · delete permanently removes the account from the database
            </small>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 ls-admin-guests-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Bookings</th>
                  <th>Registe</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="ri-user-search-line fs-3 d-block mb-2" />
                      No guests found.
                    </td>
                  </tr>
                ) : (
                  filter.map((u, i) => {
                    const isWalkin = u.guestType === 'walk-in';
                    const initials = (u.name || '?')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <tr key={u._id}>
                        <td className="text-muted">{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="ls-admin-avatar">{initials}</span>
                            <div>
                              <div className="fw-semibold d-flex align-items-center gap-2 flex-wrap">
                                {u.name}
                                {u.isVIP && (
                                  <span className="badge bg-warning-subtle text-warning">VIP</span>
                                )}
                                {u.isEmailVerified === false && (
                                  <span className="badge bg-danger-subtle text-danger">
                                    Unverified
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">{u.email || '—'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-nowrap">{u.phone || '—'}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isWalkin
                                ? 'bg-secondary-subtle text-secondary'
                                : 'bg-success-subtle text-success'
                            }`}
                          >
                            {isWalkin ? 'Walk-in' : 'Online'}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium">{u.totalBookings}</span>
                          <small className="text-muted d-block">
                            PKR {Number(u.totalSpent || 0).toLocaleString()}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-PK')
                              : '—'}
                          </small>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-info"
                              title="View profile"
                              onClick={() => openView(u)}
                            >
                              <i className="ri-eye-line" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-danger"
                              title="Delete guest"
                              onClick={() => confirmDelete(u)}
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

      {/* View modal */}
      {showViewModal && selectedUser && (
        <div className="ls-admin-modal-backdrop" onClick={() => setShowViewModal(false)}>
          <div
            className="ls-admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ls-admin-modal__head">
              <div>
                <p className="ls-admin-kicker mb-1">Guest profile</p>
                <h5 className="mb-0">{selectedUser.name}</h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowViewModal(false)}
              />
            </div>
            <div className="ls-admin-modal__body">
              <div className="row g-3">
                {[
                  ['Email', selectedUser.email || '—'],
                  ['Phone', selectedUser.phone || '—'],
                  [
                    'Type',
                    selectedUser.guestType === 'walk-in' ? 'Walk-in Guest' : 'Online Guest',
                  ],
                  [
                    'Email status',
                    selectedUser.isEmailVerified === false ? 'Unverified' : 'Verified',
                  ],
                  ['Total bookings', selectedUser.totalBookings],
                  [
                    'Total revenue',
                    `PKR ${Number(selectedUser.totalSpent || 0).toLocaleString()}`,
                  ],
                  ['VIP', selectedUser.isVIP ? 'Yes' : 'No'],
                  [
                    'Registe',
                    selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString('en-PK')
                      : '—',
                  ],
                ].map(([label, value]) => (
                  <div className="col-md-6" key={label}>
                    <div className="ls-admin-detail-tile">
                      <p>{label}</p>
                      <strong>{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ls-admin-modal__foot">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowViewModal(false);
                  confirmDelete(selectedUser);
                }}
              >
                <i className="ri-delete-bin-line me-1" />
                Delete guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="ls-admin-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            className="ls-admin-modal ls-admin-modal--sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ls-admin-modal__head">
              <h5 className="mb-0 text-danger">
                <i className="ri-error-warning-line me-1" />
                Delete guest?
              </h5>
            </div>
            <div className="ls-admin-modal__body">
              <p className="mb-2">
                Permanently remove <strong>{deleteTarget.name}</strong>
                {deleteTarget.email ? (
                  <>
                    {' '}
                    (<span className="text-muted">{deleteTarget.email}</span>)
                  </>
                ) : null}{' '}
                from the database?
              </p>
              <p className="text-muted small mb-0">
                They will be able to register again with the same email. This cannot be undone.
              </p>
            </div>
            <div className="ls-admin-modal__foot">
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
                onClick={handleDelete}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

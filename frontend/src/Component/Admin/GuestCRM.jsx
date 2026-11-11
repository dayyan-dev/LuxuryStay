import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const GuestCRM = () => {
  const [guests, setGuests] = useState([]);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [guestsRes, statsRes] = await Promise.all([
        api.get(`${API_URL}/guest-crm`, { headers: headers() }),
        api.get(`${API_URL}/guest-crm/stats`, { headers: headers() }),
      ]);
      setGuests(guestsRes.data.guests || []);
      setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error(err);
      setGuests([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(g => {
    const matchSearch =
      g.user.name.toLowerCase().includes(search.toLowerCase()) ||
      g.user.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'vip' ? g.profile.isVIP :
      filter === 'frequent' ? g.completedStays >= 3 : true;
    return matchSearch && matchFilter;
  });

  const openGuest = (g) => {
    setSelected(g);
    setEditForm({
      preferences: { ...g.profile.preferences },
      birthday: g.profile.birthday?.slice(0, 10) || '',
      anniversary: g.profile.anniversary?.slice(0, 10) || '',
      isVIP: g.profile.isVIP,
      vipReason: g.profile.vipReason || '',
      tags: g.profile.tags?.join(', ') || '',
    });
    setEditMode(false);
  };

  const saveProfile = async () => {
    try {
      await api.put(`${API_URL}/guest-crm/${selected.user._id}`, {
        ...editForm,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      }, { headers: headers() });
      setEditMode(false);
      setSuccessPopup({ show: true, message: 'Guest profile saved.' });
      setTimeout(() => setSuccessPopup({ show: false, message: '' }), 2500);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save guest profile.');
    }
  };

  const formatPKR = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-success"></div>
    </div>
  );

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Guest CRM</h4>
          <p className="text-muted mb-0">Guest profiles, preferences, and stay history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Guests',   value: stats.totalGuests,         color: 'primary', icon: 'ri-user-line' },
          { label: 'VIP Guests',     value: stats.vipGuests,           color: 'warning', icon: 'ri-vip-crown-line' },
          { label: 'Total Revenue',  value: formatPKR(stats.totalRevenue || 0), color: 'success', icon: 'ri-money-dollar-circle-line' },
          { label: 'Avg Spend/Guest',value: formatPKR(stats.avgSpend || 0),     color: 'info',    icon: 'ri-bar-chart-line' },
        ].map((s, i) => (
          <div className="col-md-3" key={i}>
            <div className="card">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`avatar-sm bg-${s.color}-subtle rounded d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <i className={`${s.icon} text-${s.color} fs-22`}></i>
                </div>
                <div>
                  <div className="fw-bold fs-18">{s.value}</div>
                  <div className="text-muted fs-12">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Guest List */}
        <div className={selected ? 'col-md-5' : 'col-12'}>
          <div className="card">
            <div className="card-header">
              {/* Search + Filter */}
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm"
                  placeholder="Search guest..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="form-select form-select-sm" style={{ width: 130 }}
                  value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="vip">VIP Only</option>
                  <option value="frequent">Frequent (3+)</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              {filteredGuests.length === 0 ? (
                <div className="text-center text-muted py-4">No guests found</div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {filteredGuests.map((g, i) => (
                    <div
                      key={g.user._id}
                      className="d-flex align-items-center gap-3 px-3 py-2 border-bottom"
                      style={{
                        cursor: 'pointer',
                        background: selected?.user._id === g.user._id ? 'var(--vz-light)' : '',
                      }}
                      onClick={() => openGuest(g)}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 40, height: 40, flexShrink: 0, fontSize: 14,
                          background: ['#405189','#0ab39c','#f7b84b','#f06548'][i % 4] }}
                      >
                        {g.user.name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium fs-14">{g.user.name}</span>
                          {g.profile.isVIP && <span className="badge bg-warning-subtle text-warning fs-10">👑 VIP</span>}
                        </div>
                        <div className="text-muted fs-12">{g.user.email}</div>
                      </div>
                      <div className="text-end">
                        <div className="fs-12 fw-medium">{g.completedStays} stays</div>
                        <div className="fs-11 text-muted">{formatPKR(g.totalSpent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Detail Panel */}
        {selected && (
          <div className="col-md-7">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">{selected.user.name}</span>
                  {selected.profile.isVIP && <span className="badge bg-warning-subtle text-warning">👑 VIP</span>}
                </div>
                <div className="d-flex gap-2">
                  {!editMode && (
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setEditMode(true)}>
                      Edit Profile
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>✕</button>
                </div>
              </div>
              <div className="card-body" style={{ maxHeight: 520, overflowY: 'auto' }}>

                {/* Basic Info */}
                <div className="row g-2 mb-3">
                  {[
                    { label: 'Email',    value: selected.user.email },
                    { label: 'Phone',    value: selected.user.phone || '—' },
                    { label: 'Stays',    value: selected.completedStays },
                    { label: 'Spent',    value: formatPKR(selected.totalSpent) },
                  ].map((item, i) => (
                    <div className="col-6" key={i}>
                      <div className="bg-light rounded p-2">
                        <div className="fs-11 text-muted">{item.label}</div>
                        <div className="fw-medium fs-13">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {editMode ? (
                  /* Edit Form */
                  <div>
                    <h6 className="mb-3">Preferences</h6>
                    <div className="row g-2 mb-3">
                      {[
                        { label: 'Room Type', key: 'roomType', options: ['', 'single', 'double', 'suite', 'deluxe'] },
                        { label: 'Floor',     key: 'floorLevel', options: ['', 'low', 'high', 'any'] },
                        { label: 'Pillow',    key: 'pillowType', options: ['', 'soft', 'firm', 'any'] },
                        { label: 'Diet',      key: 'dietaryNeeds', options: ['', 'none', 'vegetarian', 'halal', 'vegan'] },
                      ].map(f => (
                        <div className="col-6" key={f.key}>
                          <label className="form-label fs-12">{f.label}</label>
                          <select className="form-select form-select-sm"
                            value={editForm.preferences?.[f.key] || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, preferences: { ...prev.preferences, [f.key]: e.target.value } }))}>
                            {f.options.map(o => <option key={o} value={o}>{o || 'Select'}</option>)}
                          </select>
                        </div>
                      ))}
                      <div className="col-6">
                        <label className="form-label fs-12">Birthday</label>
                        <input type="date" className="form-control form-control-sm"
                          value={editForm.birthday}
                          onChange={e => setEditForm(f => ({ ...f, birthday: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fs-12">Anniversary</label>
                        <input type="date" className="form-control form-control-sm"
                          value={editForm.anniversary}
                          onChange={e => setEditForm(f => ({ ...f, anniversary: e.target.value }))} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fs-12">Tags (comma separated)</label>
                        <input className="form-control form-control-sm" placeholder="corporate, honeymoon, frequent"
                          value={editForm.tags}
                          onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} />
                      </div>
                      <div className="col-12 d-flex align-items-center gap-2">
                        <input type="checkbox" className="form-check-input" id="vipCheck"
                          checked={editForm.isVIP}
                          onChange={e => setEditForm(f => ({ ...f, isVIP: e.target.checked }))} />
                        <label className="form-check-label fs-13" htmlFor="vipCheck">Mark as VIP</label>
                        {editForm.isVIP && (
                          <input className="form-control form-control-sm ms-2" placeholder="VIP reason"
                            value={editForm.vipReason}
                            onChange={e => setEditForm(f => ({ ...f, vipReason: e.target.value }))} />
                        )}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm" onClick={saveProfile}>Save</button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    {/* Preferences */}
                    <h6 className="mb-2">Preferences</h6>
                    <div className="row g-2 mb-3">
                      {[
                        { label: 'Room Type', value: selected.profile.preferences?.roomType || '—' },
                        { label: 'Floor',     value: selected.profile.preferences?.floorLevel || '—' },
                        { label: 'Pillow',    value: selected.profile.preferences?.pillowType || '—' },
                        { label: 'Diet',      value: selected.profile.preferences?.dietaryNeeds || '—' },
                        { label: 'Birthday',  value: selected.profile.birthday ? new Date(selected.profile.birthday).toLocaleDateString('en-PK') : '—' },
                        { label: 'Anniversary', value: selected.profile.anniversary ? new Date(selected.profile.anniversary).toLocaleDateString('en-PK') : '—' },
                      ].map((item, i) => (
                        <div className="col-4" key={i}>
                          <div className="bg-light rounded p-2 text-center">
                            <div className="fs-11 text-muted">{item.label}</div>
                            <div className="fw-medium fs-12 text-capitalize">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    {selected.profile.tags?.length > 0 && (
                      <div className="mb-3">
                        {selected.profile.tags.map((tag, i) => (
                          <span key={i} className="badge bg-primary-subtle text-primary me-1">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Stay History */}
                    <h6 className="mb-2">Stay History</h6>
                    {selected.bookings.length === 0 ? (
                      <p className="text-muted fs-13">No bookings yet</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-borderless mb-0">
                          <thead className="table-light">
                            <tr><th>Room</th><th>Check In</th><th>Amount</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {selected.bookings.slice(0, 5).map(b => (
                              <tr key={b._id}>
                                <td>{b.roomId?.roomNumber || '—'}</td>
                                <td>{new Date(b.checkInDate).toLocaleDateString('en-PK')}</td>
                                <td>{formatPKR(b.totalAmount)}</td>
                                <td><span className="badge bg-success-subtle text-success fs-10">{b.bookingStatus}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Loyalty Points */}
<h6 className="mb-2 mt-3">🎁 Loyalty Points</h6>
<div className="d-flex align-items-center gap-3 p-3 rounded mb-3"
  style={{ background: 'linear-gradient(135deg, #405189, #0ab39c)', color: '#fff' }}>
  <div>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{selected.profile.loyaltyPoints || 0}</div>
    <div style={{ fontSize: 12, opacity: 0.8 }}>Total Points</div>
  </div>
  <div className="ms-auto text-end">
    <div style={{ fontSize: 14, fontWeight: 600 }}>
      PKR {((selected.profile.loyaltyPoints || 0) * 10).toLocaleString()} discount value
    </div>
    <div style={{ fontSize: 11, opacity: 0.8 }}>1 point = PKR 10</div>
  </div>
</div>

{/* eem */}
{selected.profile.loyaltyPoints > 0 && (
  <div className="d-flex gap-2 mb-3">
    <input
      type="number"
      className="form-control form-control-sm"
      placeholder="Points to eem"
      id="eemInput"
      max={selected.profile.loyaltyPoints}
      min={1}
    />
    <button className="btn btn-warning btn-sm" onClick={async () => {
      const points = Number(document.getElementById('eemInput').value);
      if (!points) return;
      const res = await api.post(
        `${API_URL}/guest-crm/${selected.user._id}/eem`,
        { points },
        { headers: headers() }
      );
      if (res.data.success) {
       setSuccessPopup({ show: true, message: `${points} points redeemed! PKR ${res.data.discountAmount} discount applied successfully.` });
        loadData();
        setSelected(prev => ({
          ...prev,
          profile: { ...prev.profile, loyaltyPoints: res.data.remainingPoints }
        }));
      }
    }}>
      eem
    </button>
  </div>
)}

{/* Tier badge */}
<div>
  {selected.profile.loyaltyPoints >= 1000 ? <span className="badge bg-info">💎 Platinum Member</span> :
   selected.profile.loyaltyPoints >= 500  ? <span className="badge bg-warning">🥇 Gold Member</span> :
   selected.profile.loyaltyPoints >= 100  ? <span className="badge bg-secondary">🥈 Silver Member</span> :
   <span className="badge bg-danger">🥉 Bronze Member</span>}
</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUCCESS POPUP */}
      {successPopup.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          minWidth: 300, maxWidth: 380, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderLeft: '4px solid #0ab39c'
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#0ab39c,#0a8f7f)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700
          }}>✓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 2 }}>Success</div>
            <div style={{ fontSize: 13, color: '#6c757d' }}>{successPopup.message}</div>
          </div>
          <button onClick={() => setSuccessPopup({ show: false, message: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: 18 }}>✕</button>
        </div>
      )}
    </div>
  );
};
export default GuestCRM;
import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const PricingRules = () => {
  const [rules, setRules] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'weekend', adjustment: 20,
    adjustmentType: 'percentage', days: [5, 6],
    startDate: '', endDate: '', roomTypes: [], isActive: true,
  });

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    try {
      const res = await api.get(`${API_URL}/pricing`, { headers: headers() });
      setRules(res.data.rules || []);
    } catch (err) {
      console.error(err);
      setRules([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${API_URL}/pricing`, form, { headers: headers() });
      setShowForm(false);
      setForm({ name: '', type: 'weekend', adjustment: 20, adjustmentType: 'percentage', days: [5, 6], startDate: '', endDate: '', roomTypes: [], isActive: true });
      loadRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save pricing rule.');
    }
  };

  const toggleActive = async (rule) => {
    try {
      await api.put(`${API_URL}/pricing/${rule._id}`, { isActive: !rule.isActive }, { headers: headers() });
      loadRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rule.');
    }
  };

  const deleteRule = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const confirmDeleteRule = async () => {
    try {
      await api.delete(`${API_URL}/pricing/${confirmDelete.id}`, { headers: headers() });
      setConfirmDelete({ show: false, id: null });
      loadRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete rule.');
    }
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
    }));
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Dynamic Pricing</h4>
          <p className="text-muted mb-0">Manage weekend, seasonal and special event rates</p>
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          + Add Rule
        </button>
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header"><h5 className="mb-0">New Pricing Rule</h5></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Rule Name</label>
                  <input className="form-control" placeholder="e.g. Weekend Surge"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="weekend">Weekend</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="special_event">Special Event</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Adjustment</label>
                  <input type="number" className="form-control"
                    value={form.adjustment} onChange={e => setForm({...form, adjustment: Number(e.target.value)})} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.adjustmentType}
                    onChange={e => setForm({...form, adjustmentType: e.target.value})}>
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">PKR Fixed</option>
                  </select>
                </div>

                {form.type === 'weekend' && (
                  <div className="col-12">
                    <label className="form-label">Days</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {DAYS.map((day, i) => (
                        <button key={i} type="button"
                          className={`btn btn-sm ${form.days.includes(i) ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => toggleDay(i)}>
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(form.type === 'seasonal' || form.type === 'special_event') && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-control"
                        value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-control"
                        value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                    </div>
                  </>
                )}

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-success">Save Rule</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="card">
        <div className="card-body">
          {rules.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bx bx-dollar-circle fs-48 d-block mb-2 opacity-25"></i>
              Koi pricing rule nahi — Add Rule se banao
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Name</th><th>Type</th><th>Adjustment</th><th>Details</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule._id}>
                      <td className="fw-medium">{rule.name}</td>
                      <td><span className="badge bg-primary-subtle text-primary">{rule.type}</span></td>
                      <td>
                        <span className={`fw-bold ${rule.adjustment > 0 ? 'text-danger' : 'text-success'}`}>
                          {rule.adjustment > 0 ? '+' : ''}{rule.adjustment}
                          {rule.adjustmentType === 'percentage' ? '%' : ' PKR'}
                        </span>
                      </td>
                      <td>
                        {rule.type === 'weekend'
                          ? rule.days.map(d => DAYS[d].slice(0,3)).join(', ')
                          : `${rule.startDate?.slice(0,10)} → ${rule.endDate?.slice(0,10)}`
                        }
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox"
                            checked={rule.isActive} onChange={() => toggleActive(rule)} />
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRule(rule._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {confirmDelete.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setConfirmDelete({ show: false, id: null })}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, maxWidth: 380, width: '100%',
            textAlign: 'center', padding: '36px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#CC5B55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 28, color: '#fff', fontWeight: 700
            }}>!</div>
            <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Delete Pricing Rule?</h5>
            <p style={{ color: '#6c757d', marginBottom: 24, fontSize: 14 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete({ show: false, id: null })}
                style={{ flex: 1, background: 'transparent', color: '#888', border: '1px solid #ddd',
                  borderRadius: 50, padding: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmDeleteRule}
                style={{ flex: 1, background: '#CC5B55', color: '#fff', border: 'none',
                  borderRadius: 50, padding: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PricingRules;
import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CATEGORIES = [
  { value: 'general',    label: 'General',    icon: 'ri-question-line',      color: '#6c757d' },
  { value: 'booking',    label: 'Booking',    icon: 'ri-calendar-check-line', color: '#405189' },
  { value: 'payment',    label: 'Payment',    icon: 'ri-bill-line',           color: '#0ab39c' },
  { value: 'room',       label: 'Room',       icon: 'ri-hotel-bed-line',      color: '#f06548' },
  { value: 'restaurant', label: 'Restaurant', icon: 'ri-restaurant-line',     color: '#d63384' },
];

const FAQs = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [faqs, setFaqs]               = useState([]);
  const [filter, setFilter]       = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [search, setSearch]           = useState('');
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [error, setError]             = useState('');

  const emptyForm = { question: '', answer: '', category: 'general', isActive: true };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadFAQs(); }, []);

  useEffect(() => {
    let result = faqs;
    if (filterCategory) result = result.filter(f => f.category === filterCategory);
    if (filterStatus === 'active')   result = result.filter(f => f.isActive);
    if (filterStatus === 'inactive') result = result.filter(f => !f.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterCategory, filterStatus, search, faqs]);

  const loadFAQs = async () => {
    try {
      const res = await api.get(`${API_URL}/faqs`, { headers });
      setFaqs(res.data);
    } catch (err) { console.error(err); }
  };

  const stats = {
    total:    faqs.length,
    active:   faqs.filter(f => f.isActive).length,
    inactive: faqs.filter(f => !f.isActive).length,
    categories: [...new Set(faqs.map(f => f.category))].length,
  };

  const categoryInfo = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  const handleAdd = async () => {
    setError('');
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    try {
      await api.post(`${API_URL}/faqs`, form, { headers });
      setShowAddModal(false);
      setForm(emptyForm);
      loadFAQs();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add FAQ.'); }
  };

  const handleEdit = async () => {
    setError('');
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    try {
      await api.put(`${API_URL}/faqs/${selected._id}`, form, { headers });
      setShowEditModal(false);
      loadFAQs();
    } catch (err) { setError(err.response?.data?.message || 'Failed to update FAQ.'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${API_URL}/faqs/${selected._id}`, { headers });
      setShowDeleteModal(false);
      loadFAQs();
    } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (faq) => {
    try {
      await api.put(`${API_URL}/faqs/${faq._id}`, { isActive: !faq.isActive }, { headers });
      loadFAQs();
    } catch (err) { console.error(err); }
  };

  const openEdit = (faq) => {
    setSelected(faq);
    setForm({
      question: faq.question,
      answer:   faq.answer,
      category: faq.category,
      isActive: faq.isActive,
    });
    setError('');
    setShowEditModal(true);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">FAQs Management</h4>
            <button className="btn btn-success" onClick={() => { setForm(emptyForm); setError(''); setShowAddModal(true); }}>
              <i className="ri-add-line me-1"></i> Add FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total FAQs',   value: stats.total,      icon: 'ri-question-answer-line', color: 'primary' },
          { label: 'Active',       value: stats.active,     icon: 'ri-checkbox-circle-line',  color: 'success' },
          { label: 'Inactive',     value: stats.inactive,   icon: 'ri-close-circle-line',     color: 'warning' },
          { label: 'Categories',   value: stats.categories, icon: 'ri-price-tag-3-line',      color: 'info'    },
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
          <h5 className="card-title mb-0 flex-grow-1">All FAQs</h5>

          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search question or answer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select className="form-select form-select-sm w-auto" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
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
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Category</th>
                  <th>Active</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No FAQs found.</td></tr>
                ) : filter.map((faq, i) => {
                  const cat = categoryInfo(faq.category);
                  return (
                    <tr key={faq._id} className={!faq.isActive ? 'opacity-75' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="fw-medium" style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {faq.question}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted" style={{ maxWidth: 250, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {faq.answer}
                        </small>
                      </td>
                      <td>
                        <span className="badge text-white" style={{ backgroundColor: cat.color }}>
                          <i className={`${cat.icon} me-1`}></i>
                          {cat.label}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={faq.isActive}
                            onChange={() => handleToggleActive(faq)}
                            style={{ cursor: 'pointer', width: 36, height: 20 }}
                          />
                        </div>
                      </td>
                      <td><small className="text-muted">{new Date(faq.createdAt).toLocaleDateString('en-PK')}</small></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-soft-primary btn-sm" onClick={() => openEdit(faq)} title="Edit">
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button className="btn btn-soft-danger btn-sm" onClick={() => { setSelected(faq); setShowDeleteModal(true); }} title="Delete">
                            <i className="ri-delete-bin-line"></i>
                          </button>
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

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add FAQ</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <FAQForm form={form} setForm={setForm} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>
                  <i className="ri-check-line me-1"></i>Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit FAQ</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <FAQForm form={form} setForm={setForm} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
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
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div className="avatar-md mx-auto mb-3">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                    <i className="ri-delete-bin-line text-danger"></i>
                  </span>
                </div>
                <h5>Delete FAQ?</h5>
                <p className="text-muted fs-13">{selected?.question}</p>
                <div className="d-flex gap-2 justify-content-center mt-3">
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

// ── FORM COMPONENT ──
const FAQForm = ({ form, setForm }) => (
  <div className="row g-3">
    <div className="col-md-8">
      <label className="form-label">Category</label>
      <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
        {[
          { value: 'general',    label: 'General'    },
          { value: 'booking',    label: 'Booking'    },
          { value: 'payment',    label: 'Payment'    },
          { value: 'room',       label: 'Room'       },
          { value: 'restaurant', label: 'Restaurant' },
        ].map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>

    <div className="col-md-4 d-flex align-items-end">
      <div className="form-check form-switch mb-1">
        <input
          type="checkbox"
          className="form-check-input"
          id="faqActive"
          checked={form.isActive}
          onChange={e => setForm({ ...form, isActive: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="faqActive">
          {form.isActive ? 'Active — visible on website' : 'Inactive — hidden from website'}
        </label>
      </div>
    </div>

    <div className="col-12">
      <label className="form-label">Question <span className="text-danger">*</span></label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. What is the check-in time?"
        value={form.question}
        onChange={e => setForm({ ...form, question: e.target.value })}
      />
    </div>

    <div className="col-12">
      <label className="form-label">Answer <span className="text-danger">*</span></label>
      <textarea
        className="form-control"
        rows={4}
        placeholder="Provide a clear and helpful answer..."
        value={form.answer}
        onChange={e => setForm({ ...form, answer: e.target.value })}
      />
    </div>
  </div>
);

export default FAQs;
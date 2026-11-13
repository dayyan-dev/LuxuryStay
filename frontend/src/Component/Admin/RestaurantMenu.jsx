import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BASE_URL = (process.env.REACT_APP_SERVER_URL || 'http://localhost:5001');
const CATEGORIES = ['Desi', 'Italian', 'Chinese', 'FastFood'];
const DIETARY_TAGS = [
  { value: 'spicy',   label: '🌶 Spicy' },
  { value: 'veg',     label: '🥗 Veg' },
  { value: 'non-veg', label: '🍗 Non-Veg' },
  { value: 'halal',   label: '✅ Halal' },
];

const RestaurantMenu = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [items, setItems]               = useState([]);
  const [filter, setFilter]         = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch]             = useState('');
  const [viewMode, setViewMode]         = useState('table'); // 'table' | 'card'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selected, setSelected]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [error, setError]               = useState('');
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const emptyForm = {
    name: '', description: '', price: '',
    category: 'Desi', isAvailable: true, dietaryTags: []
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadMenu(); }, []);

  useEffect(() => {
    let result = items;
    if (filterCategory) result = result.filter(i => i.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterCategory, search, items]);

  const loadMenu = async () => {
    try {
      const res = await api.get(`${API_URL}/restaurant/menu`, { headers });
      setItems(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const stats = {
    total:     items.length,
    available: items.filter(i => i.isAvailable).length,
    categories: [...new Set(items.map(i => i.category))].length,
  };

  const formatPKR = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');

  const getImageSrc = (item) => {
    if (!item.image) return null;
    if (item.image.startsWith('http')) return item.image;
    return `${BASE_URL}${item.image}`;
  };

  // Image file select karo — preview bhi dikhao
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('isAvailable', form.isAvailable);
    form.dietaryTags.forEach(tag => fd.append('dietaryTags[]', tag));
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleAdd = async () => {
    setError('');
    if (!form.name || !form.price || !form.category) {
      setError('Name, price, and category are required.');
      return;
    }
    try {
      await api.post(`${API_URL}/restaurant/menu`, buildFormData(), { headers });
      setShowAddModal(false);
      resetForm();
      loadMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item.');
    }
  };

  const handleEdit = async () => {
    setError('');
    if (!form.name || !form.price || !form.category) {
      setError('Name, price, and category are required.');
      return;
    }
    try {
      await api.put(`${API_URL}/restaurant/menu/${selected._id}`, buildFormData(), { headers });
      setShowEditModal(false);
      resetForm();
      loadMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item.');
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`${API_URL}/restaurant/menu/${deleteTarget._id}`, { headers });
      setDeleteTarget(null);
      if (selected?._id === deleteTarget._id) {
        setShowEditModal(false);
        setSelected(null);
      }
      loadMenu();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete menu item.');
    } finally {
      setDeleting(false);
    }
  };


  // Quick availability toggle — table/card se seedha
  const handleToggleAvailable = async (item) => {
    try {
      const fd = new FormData();
      fd.append('name', item.name);
      fd.append('description', item.description || '');
      fd.append('price', item.price);
      fd.append('category', item.category);
      fd.append('isAvailable', !item.isAvailable);
      (item.dietaryTags || []).forEach(tag => fd.append('dietaryTags[]', tag));
      await api.put(`${API_URL}/restaurant/menu/${item._id}`, fd, { headers });
      loadMenu();
    } catch (err) { console.error(err); }
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      dietaryTags: item.dietaryTags || [],
    });
    setImageFile(null);
    setImagePreview(getImageSrc(item) || '');
    setError('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
  };

  const toggleDietaryTag = (tag) => {
    setForm(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const categoryBadgeColor = {
    Desi: '#fd7e14', Italian: '#0dcaf0',
    Chinese: '#d63384', FastFood: '#198754'
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Restaurant Menu</h4>
            <button className="btn btn-success" onClick={() => { resetForm(); setError(''); setShowAddModal(true); }}>
              <i className="ri-add-line me-1"></i> Add Menu Item
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Items',  value: stats.total,      icon: 'ri-restaurant-line',     color: 'primary' },
          { label: 'Available',    value: stats.available,  icon: 'ri-checkbox-circle-line', color: 'success' },
          { label: 'Categories',   value: stats.categories, icon: 'ri-price-tag-3-line',    color: 'info' },
        ].map((s, i) => (
          <div className="col-md-4" key={i}>
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

      {/* Table / Card */}
      <div className="card">
        <div className="card-header d-flex align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0 flex-grow-1">Menu Items</h5>

          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Category Filter */}
          <select className="form-select form-select-sm w-auto" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* View Toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="ri-list-check"></i>
            </button>
            <button
              className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <i className="ri-layout-grid-line"></i>
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* ── TABLE VIEW ── */}
          {viewMode === 'table' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{width: 40}}>#</th>
                    <th style={{width: 60}}>Image</th>
                    <th>Name</th>
                    <th style={{width: 100}}>Category</th>
                    <th style={{width: 120}}>Tags</th>
                    <th style={{width: 110}}>Price</th>
                    <th style={{width: 100}}>Available</th>
                    <th style={{width: 70}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filter.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-4 text-muted">No menu items found.</td></tr>
                  ) : filter.map((item, i) => (
                    <tr key={item._id}>
                      <td>{i + 1}</td>
                      <td>
                        {getImageSrc(item) ? (
                          <img
                            src={getImageSrc(item)}
                            alt={item.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ri-image-line text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-medium">{item.name}</div>
                        {item.description && (
                          <small className="text-muted" style={{ display: 'block', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge text-white" style={{ backgroundColor: categoryBadgeColor[item.category] || '#6c757d' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {(item.dietaryTags || []).map(tag => (
                            <span key={tag} className="badge bg-light text-dark border" style={{ fontSize: '11px' }}>
                              {DIETARY_TAGS.find(d => d.value === tag)?.label || tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="fw-semibold">{formatPKR(item.price)}</td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={() => handleToggleAvailable(item)}
                            style={{ cursor: 'pointer', width: 40, height: 22 }}
                          />
                          <label className="form-check-label ms-1" style={{ fontSize: 12, color: item.isAvailable ? '#198754' : '#dc3545' }}>
                            {item.isAvailable ? 'Yes' : 'No'}
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button className="btn btn-soft-primary btn-sm" onClick={() => openEdit(item)} title="Edit">
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button className="btn btn-soft-danger btn-sm" onClick={() => setDeleteTarget(item)} title="Delete item">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CARD VIEW ── */}
          {viewMode === 'card' && (
            <div className="row g-3">
              {filter.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted">No menu items found.</div>
              ) : filter.map(item => (
                <div className="col-xl-3 col-md-4 col-sm-6" key={item._id}>
                  <div className="card h-100 border" style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {/* Image */}
                    <div style={{ height: 160, background: '#f8f9fa', overflow: 'hidden', position: 'relative' }}>
                      {getImageSrc(item) ? (
                        <img
                          src={getImageSrc(item)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ri-image-line text-muted fs-1"></i>
                        </div>
                      )}
                      {/* Category badge on image */}
                      <span
                        className="badge text-white position-absolute"
                        style={{ top: 8, left: 8, backgroundColor: categoryBadgeColor[item.category] || '#6c757d' }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div className="card-body p-3">
                      <h6 className="fw-semibold mb-1">{item.name}</h6>
                      {item.description && (
                        <p className="text-muted fs-12 mb-2" style={{ lineHeight: 1.4 }}>
                          {item.description.length > 60 ? item.description.slice(0, 60) + '...' : item.description}
                        </p>
                      )}

                      {/* Dietary Tags */}
                      {(item.dietaryTags || []).length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {item.dietaryTags.map(tag => (
                            <span key={tag} className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>
                              {DIETARY_TAGS.find(d => d.value === tag)?.label || tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span className="fw-bold text-success">{formatPKR(item.price)}</span>
                        {/* Quick toggle */}
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={() => handleToggleAvailable(item)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="card-footer bg-white p-2 d-flex gap-2">
                      <button className="btn btn-soft-primary btn-sm flex-grow-1" onClick={() => openEdit(item)}>
                        <i className="ri-pencil-line me-1"></i>Edit
                      </button>
                      <button className="btn btn-soft-danger btn-sm" onClick={() => setDeleteTarget(item)} title="Delete item">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Menu Item</h5>
                <button className="btn-close" onClick={() => { setShowAddModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <MenuForm
                  form={form} setForm={setForm}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  toggleDietaryTag={toggleDietaryTag}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>Add Item</button>
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
                <h5 className="modal-title">Edit Menu Item</h5>
                <button className="btn-close" onClick={() => { setShowEditModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <MenuForm
                  form={form} setForm={setForm}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  toggleDietaryTag={toggleDietaryTag}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-danger me-auto"
                  onClick={() => {
                    const target = selected;
                    setShowEditModal(false);
                    resetForm();
                    setDeleteTarget(target);
                  }}
                >
                  <i className="ri-delete-bin-line me-1"></i> Delete Item
                </button>
                <button className="btn btn-light" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg border-0 text-center p-4">
              <div
                className="avatar-md mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 56, background: '#fee2e2', color: '#dc2626', fontSize: 24 }}
              >
                <i className="ri-delete-bin-line" />
              </div>
              <h5 className="fw-bold mb-1">Delete Menu Item?</h5>
              <p className="text-muted mb-1 fw-semibold">{deleteTarget.name}</p>
              <p className="text-muted fs-12 mb-0">Category: {deleteTarget.category} &bull; Price: {formatPKR(deleteTarget.price || 0)}</p>
              <div className="alert alert-warning py-2 mt-3 fs-12 text-start">
                Yeh menu item permanently delete ho jayega aur guest restaurant menu se hat jayega.
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
                  onClick={handleDeleteMenuItem}
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
};

// ── FORM COMPONENT ──
const MenuForm = ({ form, setForm, imagePreview, onImageChange, toggleDietaryTag }) => (
  <div className="row g-3">
    {/* Name */}
    <div className="col-md-6">
      <label className="form-label">Name <span className="text-danger">*</span></label>
      <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken Karahi" />
    </div>

    {/* Category */}
    <div className="col-md-3">
      <label className="form-label">Category <span className="text-danger">*</span></label>
      <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
        {['Desi', 'Italian', 'Chinese', 'FastFood'].map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>

    {/* Price */}
    <div className="col-md-3">
      <label className="form-label">Price (PKR) <span className="text-danger">*</span></label>
      <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" min="0" />
    </div>

    {/* Description */}
    <div className="col-12">
      <label className="form-label">Description</label>
      <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
    </div>

    {/* Image Upload */}
    <div className="col-12">
      <label className="form-label">Image</label>
      <input type="file" className="form-control" accept="image/*" onChange={onImageChange} />
      {imagePreview && (
        <div className="mt-2">
          <img src={imagePreview} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #dee2e6' }} />
        </div>
      )}
    </div>

    {/* Dietary Tags */}
    <div className="col-12">
      <label className="form-label">Dietary Tags</label>
      <div className="d-flex flex-wrap gap-2">
        {[
          { value: 'spicy',   label: '🌶 Spicy' },
          { value: 'veg',     label: '🥗 Veg' },
          { value: 'non-veg', label: '🍗 Non-Veg' },
          { value: 'halal',   label: '✅ Halal' },
        ].map(tag => (
          <button
            key={tag.value}
            type="button"
            className={`btn btn-sm ${form.dietaryTags.includes(tag.value) ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => toggleDietaryTag(tag.value)}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <small className="text-muted">Multiple select kar sakte ho</small>
    </div>

    {/* Availability */}
    <div className="col-12">
      <div className="form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          id="avail"
          checked={form.isAvailable}
          onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="avail">Available for ordering</label>
      </div>
    </div>
  </div>
);

export default RestaurantMenu;
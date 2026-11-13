import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BASE_URL = (process.env.REACT_APP_SERVER_URL || 'http://localhost:5001');

const DIETARY_TAGS = [
  { value: 'spicy',   label: '🌶 Spicy' },
  { value: 'veg',     label: '🥗 Veg' },
  { value: 'non-veg', label: '🍗 Non-Veg' },
  { value: 'halal',   label: '✅ Halal' },
];

const COLOR_PALETTE = [
  '#fd7e14', '#0dcaf0', '#d63384', '#198754',
  '#4F46E5', '#D97706', '#E11D48', '#0891B2',
  '#7C3AED', '#2563EB', '#059669', '#DB2777'
];

const RestaurantMenu = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [items, setItems]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [filter, setFilter]             = useState([]);
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
  const [isCustomCat, setIsCustomCat]   = useState(false);

  // Manage Categories Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName]               = useState('');
  const [newCatDesc, setNewCatDesc]               = useState('');
  const [newCatColor, setNewCatColor]             = useState('#1B365D');
  const [savingCat, setSavingCat]                 = useState(false);
  const [catError, setCatError]                   = useState('');
  const [catSuccess, setCatSuccess]               = useState('');
  const [catDeleteTarget, setCatDeleteTarget]     = useState(null);
  const [deletingCat, setDeletingCat]             = useState(false);

  const emptyForm = {
    name: '', description: '', price: '',
    category: 'Desi', isAvailable: true, dietaryTags: []
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadMenu();
    loadCategories();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get(`${API_URL}/restaurant/menu`, { headers });
      setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get(`${API_URL}/restaurant/menu/categories`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Merge categories from DB and existing items
  const allCategoryNames = Array.from(
    new Set([
      ...categories.map(c => c.name),
      ...items.map(i => i.category),
      'Desi', 'Italian', 'Chinese', 'FastFood'
    ].filter(Boolean))
  );

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

  const stats = {
    total:      items.length,
    available:  items.filter(i => i.isAvailable).length,
    categories: allCategoryNames.length,
  };

  const formatPKR = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');

  const getImageSrc = (item) => {
    if (!item.image) return null;
    if (item.image.startsWith('http')) return item.image;
    return `${BASE_URL}${item.image}`;
  };

  const getCategoryColor = (catName) => {
    if (!catName) return '#6c757d';
    const found = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase());
    if (found?.color) return found.color;
    let hash = 0;
    for (let i = 0; i < catName.length; i++) hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
  };

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
      loadCategories();
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
      loadCategories();
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
      loadCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete menu item.');
    } finally {
      setDeleting(false);
    }
  };

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

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    setCatError('');
    setCatSuccess('');
    if (!newCatName.trim()) {
      setCatError('Category name is required.');
      return;
    }
    setSavingCat(true);
    try {
      const res = await api.post(
        `${API_URL}/restaurant/menu/categories`,
        { name: newCatName.trim(), description: newCatDesc.trim(), color: newCatColor },
        { headers }
      );
      setCatSuccess(`Category "${res.data?.data?.name || newCatName}" added successfully!`);
      setNewCatName('');
      setNewCatDesc('');
      loadCategories();
    } catch (err) {
      setCatError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!catDeleteTarget?._id) return;
    setDeletingCat(true);
    try {
      await api.delete(`${API_URL}/restaurant/menu/categories/${catDeleteTarget._id}`, { headers });
      setCatDeleteTarget(null);
      loadCategories();
      loadMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeletingCat(false);
    }
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
    setIsCustomCat(!allCategoryNames.includes(item.category));
    setImageFile(null);
    setImagePreview(getImageSrc(item) || '');
    setError('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setIsCustomCat(false);
  };

  const toggleDietaryTag = (tag) => {
    setForm(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Restaurant Menu</h4>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => {
                  setCatError('');
                  setCatSuccess('');
                  setShowCategoryModal(true);
                }}
              >
                <i className="ri-folder-settings-line"></i> Manage Categories ({allCategoryNames.length})
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => {
                  resetForm();
                  setError('');
                  setShowAddModal(true);
                }}
              >
                <i className="ri-add-line me-1"></i> Add Menu Item
              </button>
            </div>
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

      {/* Table / Card Container */}
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
          <select
            className="form-select form-select-sm w-auto"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories ({items.length})</option>
            {allCategoryNames.map(c => {
              const count = items.filter(it => it.category === c).length;
              return (
                <option key={c} value={c}>{c} ({count})</option>
              );
            })}
          </select>

          {/* View Toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="ri-table-line"></i>
            </button>
            <button
              className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <i className="ri-grid-line"></i>
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
                    <th>#</th>
                    <th>Image</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Dietary</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th style={{ width: 90 }}>Actions</th>
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
                        <span
                          className="badge text-white"
                          style={{ backgroundColor: getCategoryColor(item.category) }}
                        >
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
                        style={{ top: 8, left: 8, backgroundColor: getCategoryColor(item.category) }}
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
                  form={form}
                  setForm={setForm}
                  categoryList={allCategoryNames}
                  isCustomCat={isCustomCat}
                  setIsCustomCat={setIsCustomCat}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  toggleDietaryTag={toggleDietaryTag}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                <button className="btn btn-success" onClick={handleAdd}>
                  <i className="ri-check-line me-1"></i>Save Item
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
                <h5 className="modal-title">Edit Menu Item</h5>
                <button className="btn-close" onClick={() => { setShowEditModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <MenuForm
                  form={form}
                  setForm={setForm}
                  categoryList={allCategoryNames}
                  isCustomCat={isCustomCat}
                  setIsCustomCat={setIsCustomCat}
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

      {/* ── MANAGE CATEGORIES MODAL ── */}
      {showCategoryModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="ri-folder-settings-line text-primary me-2"></i>
                  Menu Categories Manager
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCategoryModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                {catError && <div className="alert alert-danger py-2 fs-13 mb-3">{catError}</div>}
                {catSuccess && <div className="alert alert-success py-2 fs-13 mb-3">{catSuccess}</div>}

                {/* Add Category Card */}
                <div className="card border bg-light mb-4 rounded-3">
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-3 text-dark">
                      <i className="ri-add-circle-line text-success me-1"></i> Add Custom Category
                    </h6>
                    <form onSubmit={handleAddCategory}>
                      <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                          <label className="form-label fs-12 fw-semibold mb-1">
                            Category Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. BBQ, Beverages, Desserts"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fs-12 fw-semibold mb-1">Description (Optional)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Short description"
                            value={newCatDesc}
                            onChange={(e) => setNewCatDesc(e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fs-12 fw-semibold mb-1">Badge Color</label>
                          <div className="d-flex align-items-center gap-1">
                            <input
                              type="color"
                              className="form-control form-control-color form-control-sm p-0 border-0"
                              value={newCatColor}
                              title="Choose category color"
                              onChange={(e) => setNewCatColor(e.target.value)}
                              style={{ width: 34, height: 31, cursor: 'pointer' }}
                            />
                            <span
                              className="badge"
                              style={{ backgroundColor: newCatColor, color: '#fff', fontSize: 10 }}
                            >
                              Preview
                            </span>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <button
                            type="submit"
                            disabled={savingCat}
                            className="btn btn-primary btn-sm w-100"
                          >
                            {savingCat ? 'Adding...' : '+ Add'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Categories Table */}
                <h6 className="fw-bold mb-2 text-dark d-flex align-items-center justify-content-between">
                  <span>Current Categories ({categories.length})</span>
                  <small className="text-muted fw-normal fs-12">Custom categories can be deleted if unused</small>
                </h6>

                <div className="table-responsive border rounded-3" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th className="text-center">Dishes</th>
                        <th className="text-center">Type</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No categories found.
                          </td>
                        </tr>
                      ) : (
                        categories.map((cat, i) => {
                          const count = cat.itemCount || items.filter(it => it.category === cat.name).length || 0;
                          return (
                            <tr key={cat._id || cat.name}>
                              <td>{i + 1}</td>
                              <td>
                                <span
                                  className="badge text-white px-2 py-1"
                                  style={{ backgroundColor: cat.color || getCategoryColor(cat.name), fontSize: 12 }}
                                >
                                  {cat.name}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">{cat.description || '—'}</small>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-secondary-subtle text-secondary">
                                  {count}
                                </span>
                              </td>
                              <td className="text-center">
                                {cat.isDefault ? (
                                  <span className="badge bg-light text-muted border" style={{ fontSize: 10 }}>Default</span>
                                ) : (
                                  <span className="badge bg-success-subtle text-success" style={{ fontSize: 10 }}>Custom</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-soft-danger btn-sm p-1 py-0"
                                  title={count > 0 ? 'Cannot delete: items assigned' : 'Delete category'}
                                  disabled={count > 0 || cat.isDefault}
                                  onClick={() => setCatDeleteTarget(cat)}
                                >
                                  <i className="ri-delete-bin-line" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      {catDeleteTarget && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow-lg border-0 text-center p-4">
              <div
                className="avatar-md mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 50, height: 50, background: '#fee2e2', color: '#dc2626', fontSize: 22 }}
              >
                <i className="ri-delete-bin-line" />
              </div>
              <h5 className="fw-bold mb-1">Delete Category?</h5>
              <p className="text-muted mb-2 fw-semibold">"{catDeleteTarget.name}"</p>
              <div className="alert alert-warning py-2 fs-12 text-start">
                Yeh custom category permanently delete ho jayegi.
              </div>
              <div className="d-flex gap-2 justify-content-center mt-3">
                <button
                  type="button"
                  className="btn btn-light"
                  disabled={deletingCat}
                  onClick={() => setCatDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deletingCat}
                  onClick={handleDeleteCategory}
                >
                  {deletingCat ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE DISH CONFIRMATION MODAL ── */}
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
const MenuForm = ({
  form,
  setForm,
  categoryList,
  isCustomCat,
  setIsCustomCat,
  imagePreview,
  onImageChange,
  toggleDietaryTag
}) => (
  <div className="row g-3">
    {/* Name */}
    <div className="col-md-5">
      <label className="form-label">Name <span className="text-danger">*</span></label>
      <input
        className="form-control"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        placeholder="e.g. Chicken Karahi"
      />
    </div>

    {/* Category with inline Custom option */}
    <div className="col-md-4">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label className="form-label mb-0">Category <span className="text-danger">*</span></label>
        {!isCustomCat ? (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            style={{ fontSize: 11 }}
            onClick={() => setIsCustomCat(true)}
          >
            + Add Custom
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none text-secondary"
            style={{ fontSize: 11 }}
            onClick={() => {
              setIsCustomCat(false);
              if (!categoryList.includes(form.category)) {
                setForm({ ...form, category: categoryList[0] || 'Desi' });
              }
            }}
          >
            Back to List
          </button>
        )}
      </div>

      {!isCustomCat ? (
        <select
          className="form-select"
          value={form.category}
          onChange={(e) => {
            if (e.target.value === '__add_new__') {
              setIsCustomCat(true);
            } else {
              setForm({ ...form, category: e.target.value });
            }
          }}
        >
          {categoryList.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__add_new__">+ Custom Category...</option>
        </select>
      ) : (
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type new category..."
            value={form.category}
            autoFocus
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            title="Cancel custom"
            onClick={() => {
              setIsCustomCat(false);
              if (!categoryList.includes(form.category)) {
                setForm({ ...form, category: categoryList[0] || 'Desi' });
              }
            }}
          >
            <i className="ri-close-line" />
          </button>
        </div>
      )}
    </div>

    {/* Price */}
    <div className="col-md-3">
      <label className="form-label">Price (PKR) <span className="text-danger">*</span></label>
      <input
        type="number"
        className="form-control"
        value={form.price}
        onChange={e => setForm({ ...form, price: e.target.value })}
        placeholder="0"
        min="0"
      />
    </div>

    {/* Description */}
    <div className="col-12">
      <label className="form-label">Description</label>
      <textarea
        className="form-control"
        rows={2}
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        placeholder="Brief description..."
      />
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
        {DIETARY_TAGS.map(tag => (
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

import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

// Status ke baad kaunsa next step hoga
const NEXT_STATUS = {
  Pending:   'Confirmed',
  Confirmed: 'Preparing',
  Preparing: 'Ready',
  Ready:     'Delivered',
};

const RestaurantOrders = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [orders, setOrders]           = useState([]);
  const [filter, setFilter]       = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]           = useState('');
  const [menuItems, setMenuItems]     = useState([]);
  const [showNewModal, setShowNewModal]       = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState('');
  const [orderForm, setOrderForm]     = useState({
    guestName: '', roomNumber: '', notes: '',
    items: [{ menuItemId: '', name: '', quantity: 1, price: 0 }],
  });

  useEffect(() => { loadOrders(); loadMenu(); }, []);

  useEffect(() => {
    let result = orders;
    if (filterStatus) result = result.filter(o => o.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        (o.guestName || '').toLowerCase().includes(q) ||
        (o.roomNumber || '').toLowerCase().includes(q)
      );
    }
    setFilter(result);
  }, [filterStatus, search, orders]);

  const loadOrders = async () => {
    try {
      const res = await api.get(`${API_URL}/restaurant/orders`, { headers });
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const loadMenu = async () => {
    try {
      const res = await api.get(`${API_URL}/restaurant/menu`, { headers });
      setMenuItems((res.data.data || []).filter(i => i.isAvailable));
    } catch (err) { console.error(err); }
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'Pending').length,
    preparing: orders.filter(o => ['Confirmed', 'Preparing'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  const formatPKR = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');

  const statusBadge = (status) => {
    const map = {
      Pending:   'bg-warning-subtle text-warning',
      Confirmed: 'bg-info-subtle text-info',
      Preparing: 'bg-primary-subtle text-primary',
      Ready:     'bg-success-subtle text-success',
      Delivered: 'bg-success text-white',
      Cancelled: 'bg-danger-subtle text-danger',
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const calcTotal = (items) => items.reduce((s, i) => s + (i.price * i.quantity), 0);

  const addOrderLine = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { menuItemId: '', name: '', quantity: 1, price: 0 }],
    }));
  };

  const removeOrderLine = (idx) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const updateOrderLine = (idx, menuItemId) => {
    const item = menuItems.find(m => m._id === menuItemId);
    const items = [...orderForm.items];
    items[idx] = item
      ? { menuItemId: item._id, name: item.name, quantity: items[idx].quantity || 1, price: item.price }
      : { menuItemId: '', name: '', quantity: 1, price: 0 };
    setOrderForm({ ...orderForm, items });
  };

  const handleCreateOrder = async () => {
    setError('');
    const validItems = orderForm.items.filter(i => i.name && i.quantity > 0);
    if (!orderForm.guestName) { setError('Guest name is required.'); return; }
    if (validItems.length === 0) { setError('At least one item is required.'); return; }
    try {
      await api.post(`${API_URL}/restaurant/orders`, {
        guestName:   orderForm.guestName,
        roomNumber:  orderForm.roomNumber,
        notes:       orderForm.notes,
        items:       validItems,
        totalAmount: calcTotal(validItems),
        status:      'Pending',
      }, { headers });
      setShowNewModal(false);
      setOrderForm({ guestName: '', roomNumber: '', notes: '', items: [{ menuItemId: '', name: '', quantity: 1, price: 0 }] });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
    }
  };

  // Next step button — automatically agle status pe move karo
  const handleNextStatus = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await api.put(`${API_URL}/restaurant/orders/${order._id}`, { status: next }, { headers });
      loadOrders();
      // Agar detail modal open hai to wahan bhi update karo
      if (selected?._id === order._id) {
        setSelected({ ...order, status: next });
      }
    } catch (err) { console.error(err); }
  };

  // Cancel button
  const handleCancel = async (order) => {
    try {
      await api.put(`${API_URL}/restaurant/orders/${order._id}`, { status: 'Cancelled' }, { headers });
      loadOrders();
      if (selected?._id === order._id) {
        setSelected({ ...order, status: 'Cancelled' });
      }
    } catch (err) { console.error(err); }
  };

  // Delete button
  const handleDeleteOrder = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`${API_URL}/restaurant/orders/${deleteTarget._id}`, { headers });
      setDeleteTarget(null);
      if (selected?._id === deleteTarget._id) {
        setShowDetailModal(false);
        setSelected(null);
      }
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete order.');
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = (order) => {
    setSelected(order);
    setShowDetailModal(true);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Restaurant Orders</h4>
            <button className="btn btn-success" onClick={() => { setError(''); setShowNewModal(true); }}>
              <i className="ri-add-line me-1"></i> New Order
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Orders', value: stats.total,     icon: 'bx bx-receipt',       color: 'primary' },
          { label: 'Pending',      value: stats.pending,   icon: 'bx bx-time',           color: 'warning' },
          { label: 'In Kitchen',   value: stats.preparing, icon: 'bx bx-dish',           color: 'info'    },
          { label: 'Delivered',    value: stats.delivered, icon: 'bx bx-check-circle',   color: 'success' },
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
          <h5 className="card-title mb-0 flex-grow-1">All Orders</h5>

          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search guest or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Status Filter */}
          <select className="form-select form-select-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No orders found.</td></tr>
                ) : filter.map((o, i) => (
                  <tr key={o._id}>
                    <td>{i + 1}</td>
                    <td className="fw-medium">{o.guestName || 'Guest'}</td>
                    <td>{o.roomNumber || '—'}</td>
                    <td>
                      <small className="text-muted" style={{ maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.items?.map(it => `${it.name} x${it.quantity}`).join(', ')}
                      </small>
                    </td>
                    <td className="fw-semibold">{formatPKR(o.totalAmount)}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td><small className="text-muted">{new Date(o.createdAt).toLocaleString('en-PK')}</small></td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {/* View detail */}
                        <button className="btn btn-soft-info btn-sm" onClick={() => openDetail(o)} title="View Detail">
                          <i className="ri-eye-line"></i>
                        </button>

                        {/* Next step button — sirf tab dikhao jab next status ho */}
                        {NEXT_STATUS[o.status] && (
                          <button
                            className="btn btn-soft-success btn-sm"
                            onClick={() => handleNextStatus(o)}
                            title={`Move to ${NEXT_STATUS[o.status]}`}
                          >
                            <i className="ri-arrow-right-line me-1"></i>
                            {NEXT_STATUS[o.status]}
                          </button>
                        )}
                        {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => {
                              if (window.confirm('Cancel this order?')) handleCancel(o);
                            }}
                            title="Cancel order"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-soft-danger btn-sm"
                          onClick={() => setDeleteTarget(o)}
                          title="Delete permanently"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {showDetailModal && selected && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Detail</h5>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Guest + Room info */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">GUEST NAME</p>
                      <h6 className="mb-0 fw-semibold">{selected.guestName || '—'}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">ROOM NUMBER</p>
                      <h6 className="mb-0 fw-semibold">{selected.roomNumber || '—'}</h6>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">STATUS</p>
                      <div className="mt-1">{statusBadge(selected.status)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <p className="text-muted mb-1 fs-12">ORDER TIME</p>
                      <h6 className="mb-0">{new Date(selected.createdAt).toLocaleString('en-PK')}</h6>
                    </div>
                  </div>
                  {selected.notes && (
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <p className="text-muted mb-1 fs-12">NOTES</p>
                        <h6 className="mb-0">{selected.notes}</h6>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items table */}
                <h6 className="fw-semibold mb-2">Order Items</h6>
                <table className="table table-bordered mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price/Item</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items?.map((it, i) => (
                      <tr key={i}>
                        <td>{it.name}</td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-end">{formatPKR(it.price)}</td>
                        <td className="text-end fw-medium">{formatPKR(it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-light">
                      <td colSpan="3" className="text-end fw-bold">Total</td>
                      <td className="text-end fw-bold text-success">{formatPKR(selected.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Action buttons in modal */}
                {NEXT_STATUS[selected.status] && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => handleNextStatus(selected)}
                    >
                      <i className="ri-arrow-right-line me-1"></i>
                      Move to {NEXT_STATUS[selected.status]}
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline-danger me-auto"
                  onClick={() => {
                    const target = selected;
                    setShowDetailModal(false);
                    setDeleteTarget(target);
                  }}
                >
                  <i className="ri-delete-bin-line me-1"></i> Delete Order
                </button>
                <button className="btn btn-light" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW ORDER MODAL ── */}
      {showNewModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Restaurant Order</h5>
                <button className="btn-close" onClick={() => setShowNewModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Guest Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      placeholder="Enter guest name"
                      value={orderForm.guestName}
                      onChange={e => setOrderForm({ ...orderForm, guestName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Room Number</label>
                    <input
                      className="form-control"
                      placeholder="e.g. 101"
                      value={orderForm.roomNumber}
                      onChange={e => setOrderForm({ ...orderForm, roomNumber: e.target.value })}
                    />
                  </div>
                </div>

                <label className="form-label fw-semibold">Order Items <span className="text-danger">*</span></label>

                {orderForm.items.map((line, idx) => (
                  <div className="row mb-2 align-items-center" key={idx}>
                    {/* Item select */}
                    <div className="col-5">
                      <select
                        className="form-select"
                        value={line.menuItemId}
                        onChange={e => updateOrderLine(idx, e.target.value)}
                      >
                        <option value="">Select item</option>
                        {menuItems.map(m => (
                          <option key={m._id} value={m._id}>{m.name} — {formatPKR(m.price)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="col-2">
                      <input
                        type="number" min="1"
                        className="form-control"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={e => {
                          const items = [...orderForm.items];
                          items[idx].quantity = Number(e.target.value);
                          setOrderForm({ ...orderForm, items });
                        }}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="col-3">
                      <span className="fw-semibold text-success">{formatPKR(line.price * line.quantity)}</span>
                    </div>

                    {/* Remove line — sirf agar 1 se zyada items hon */}
                    <div className="col-2">
                      {orderForm.items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-soft-danger btn-sm"
                          onClick={() => removeOrderLine(idx)}
                          title="Remove item"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" className="btn btn-sm btn-outline-primary mt-1" onClick={addOrderLine}>
                  <i className="ri-add-line me-1"></i>Add Item
                </button>

                <div className="mt-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control" rows={2}
                    placeholder="Special instructions..."
                    value={orderForm.notes}
                    onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                  />
                </div>

                <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                  <span className="text-muted">Order Total</span>
                  <span className="fw-bold fs-5 text-success">{formatPKR(calcTotal(orderForm.items))}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleCreateOrder}>
                  <i className="ri-check-line me-1"></i>Place Order
                </button>
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
              <h5 className="fw-bold mb-1">Delete Order?</h5>
              <p className="text-muted mb-1 fw-semibold">
                {deleteTarget.guestName || 'Guest'} {deleteTarget.roomNumber ? `(Room ${deleteTarget.roomNumber})` : ''}
              </p>
              <p className="text-muted fs-12 mb-0">Total: {formatPKR(deleteTarget.totalAmount || 0)} &bull; Status: {deleteTarget.status}</p>
              <div className="alert alert-warning py-2 mt-3 fs-12 text-start">
                Yeh restaurant order permanently delete ho jayega.
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
                  onClick={handleDeleteOrder}
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

export default RestaurantOrders;
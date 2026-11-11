import { useState, useEffect } from 'react';
import api from '../../api/authApi';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

const Payments = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState([]);
  const [filterPayment, setFilterPayment] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { loadBookings(); }, []);

  useEffect(() => {
    setFilter(filterPayment ? bookings.filter(b => b.paymentStatus === filterPayment) : bookings);
    setSelectedIds([]);
  }, [filterPayment, bookings]);

  const loadBookings = async () => {
    try {
      const res = await api.get(`${API_URL}/bookings/all`, { headers });
      setBookings(res.data);
      setFilter(res.data);
    } catch (err) { console.error(err); }
  };

  const formatPKR = (amount) => 'PKR ' + Number(amount).toLocaleString('en-PK');

  // Exclude cancelled from revenue; unpaid includes pending/unpaid active bookings
  const activeBookings = bookings.filter(b => b.bookingStatus !== 'cancelled');
  const stats = {
    total: activeBookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0),
    paid: activeBookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0),
    unpaid: activeBookings.filter(b => b.paymentStatus !== 'paid').reduce((s, b) => s + b.totalAmount, 0),
    count: activeBookings.length,
  };

  const invoiceIndex = (b) => {
    const sorted = [...bookings].sort((a, c) => new Date(a.createdAt) - new Date(c.createdAt));
    const i = sorted.findIndex(x => x._id === b._id);
    return i >= 0 ? i : 0;
  };

  const markAsPaid = async (b) => {
    if (!window.confirm(`Mark invoice for ${b.guestName || b.userId?.name || 'Guest'} as paid?`)) return;
    try {
      await api.put(`${API_URL}/bookings/${b._id}/payment`, {}, { headers });
      loadBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark as paid.');
    }
  };

  const paymentBadge = (status) => (
    <span className={`badge ${status === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
      {status}
    </span>
  );

  const getHotelInfo = () => JSON.parse(localStorage.getItem('hotel_info') || '{}');

  const generateInvoiceHTML = (b, idx) => {
    const nights = Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24));
    const hotel = getHotelInfo();
    const hotelName = hotel.hotelName || 'Hotel Management System';
    const hotelAddress = hotel.address || 'Karachi, Pakistan';
    const hotelPhone = hotel.phone || '';
    const hotelEmail = hotel.email || '';

    return `
      <div class="invoice-page" style="page-break-after:always; padding:30px; font-family:Arial,sans-serif; max-width:800px; margin:0 auto;">
        <table width="100%" style="margin-bottom:20px;">
          <tr>
            <td>
              <h2 style="margin:0;color:#405189;">🏨 ${hotelName}</h2>
              <p style="margin:4px 0;color:#666;font-size:13px;">${hotelAddress}</p>
              ${hotelPhone ? `<p style="margin:2px 0;color:#666;font-size:13px;">📞 ${hotelPhone}</p>` : ''}
              ${hotelEmail ? `<p style="margin:2px 0;color:#666;font-size:13px;">✉️ ${hotelEmail}</p>` : ''}
            </td>
            <td style="text-align:right;">
              <h3 style="margin:0;color:#405189;">INVOICE</h3>
              <p style="margin:4px 0;font-size:14px;"><strong>INV-${String(idx + 1).padStart(4, '0')}</strong></p>
              <p style="margin:2px 0;color:#666;font-size:13px;">Date: ${new Date(b.createdAt).toLocaleDateString('en-PK')}</p>
              <span style="background:${b.paymentStatus === 'paid' ? '#d1e7dd' : '#fff3cd'};color:${b.paymentStatus === 'paid' ? '#0f5132' : '#664d03'};padding:3px 10px;border-radius:4px;font-size:12px;font-weight:bold;">
                ${b.paymentStatus.toUpperCase()}
              </span>
            </td>
          </tr>
        </table>
        <hr style="border:1px solid #dee2e6;margin:16px 0;" />
        <table width="100%" style="margin-bottom:20px;">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:10px;">
              <div style="background:#f8f9fa;padding:12px;border-radius:6px;">
                <h4 style="margin:0 0 8px 0;color:#405189;font-size:14px;">GUEST INFORMATION</h4>
                <p style="margin:3px 0;font-size:13px;"><strong>${b.guestName || b.userId?.name || 'Guest'}</strong></p>
                <p style="margin:3px 0;font-size:13px;color:#666;">📞 ${b.guestPhone || b.userId?.phone || '—'}</p>
                <p style="margin:3px 0;font-size:13px;color:#666;">✉️ ${b.guestEmail || (b.userId?.email?.includes('@walkin.hotel') ? '—' : b.userId?.email) || '—'}</p>
              </div>
            </td>
            <td width="50%" style="vertical-align:top;padding-left:10px;">
              <div style="background:#f8f9fa;padding:12px;border-radius:6px;">
                <h4 style="margin:0 0 8px 0;color:#405189;font-size:14px;">ROOM DETAILS</h4>
                <p style="margin:3px 0;font-size:13px;"><strong>${b.roomId ? `Room ${b.roomId.roomNumber}` : '—'}</strong></p>
                <p style="margin:3px 0;font-size:13px;color:#666;">Type: ${b.roomId?.type || '—'}</p>
                <p style="margin:3px 0;font-size:13px;color:#666;">Rate: ${formatPKR(b.roomId?.price || 0)}/night</p>
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" style="margin-bottom:20px;text-align:center;">
          <tr>
            <td width="32%" style="background:#d1e7dd;padding:10px;border-radius:6px;">
              <p style="margin:0;font-size:11px;color:#666;">CHECK IN</p>
              <p style="margin:4px 0 0;font-weight:bold;color:#0f5132;font-size:14px;">${new Date(b.checkInDate).toLocaleDateString('en-PK')}</p>
            </td>
            <td width="4%"></td>
            <td width="32%" style="background:#fff3cd;padding:10px;border-radius:6px;">
              <p style="margin:0;font-size:11px;color:#666;">CHECK OUT</p>
              <p style="margin:4px 0 0;font-weight:bold;color:#664d03;font-size:14px;">${new Date(b.checkOutDate).toLocaleDateString('en-PK')}</p>
            </td>
            <td width="4%"></td>
            <td width="28%" style="background:#cff4fc;padding:10px;border-radius:6px;">
              <p style="margin:0;font-size:11px;color:#666;">DURATION</p>
              <p style="margin:4px 0 0;font-weight:bold;color:#055160;font-size:14px;">${nights} Night(s)</p>
            </td>
          </tr>
        </table>
        <table width="100%" border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;font-size:13px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="text-align:left;border:1px solid #dee2e6;">Description</th>
              <th style="text-align:center;border:1px solid #dee2e6;">Nights</th>
              <th style="text-align:right;border:1px solid #dee2e6;">Rate/Night</th>
              <th style="text-align:right;border:1px solid #dee2e6;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #dee2e6;">${b.roomId ? `Room ${b.roomId.roomNumber} — ${b.roomId.type}` : 'Room'}</td>
              <td style="text-align:center;border:1px solid #dee2e6;">${nights}</td>
              <td style="text-align:right;border:1px solid #dee2e6;">${formatPKR(b.roomId?.price || 0)}</td>
              <td style="text-align:right;border:1px solid #dee2e6;">${formatPKR(b.totalAmount)}</td>
            </tr>
           ${b.specialRequests ? `<tr><td colspan="4" style="border:1px solid #dee2e6;color:#666;font-size:12px;">Special Request: ${b.specialRequests}</td></tr>` : ''}
            ${b.discountAmount > 0 ? `<tr><td colspan="3" style="border:1px solid #dee2e6;color:#0ab39c;">🎁 Loyalty Points Discount (${b.redeemedPoints} points redeemed)</td><td style="text-align:right;border:1px solid #dee2e6;color:#0ab39c;">- ${formatPKR(b.discountAmount)}</td></tr>` : ''}
          </tbody>
          <tfoot>
            <tr style="background:#f8f9fa;font-weight:bold;">
              <td colspan="3" style="text-align:right;border:1px solid #dee2e6;">TOTAL AMOUNT</td>
              <td style="text-align:right;border:1px solid #dee2e6;color:#0f5132;font-size:16px;">${formatPKR(b.totalAmount)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;border:1px solid #dee2e6;color:#666;">Payment Status</td>
              <td style="text-align:right;border:1px solid #dee2e6;font-weight:bold;color:${b.paymentStatus === 'paid' ? '#0f5132' : '#664d03'};">
                ${b.paymentStatus.toUpperCase()}
              </td>
            </tr>
          </tfoot>
        </table>
        <p style="text-align:center;color:#666;font-size:12px;margin-top:20px;">
          Thank you for choosing ${hotelName}! We hope to see you again. 🏨
        </p>
      </div>
    `;
  };

  const openPrintWindow = (html, title) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 0; }
          @page { margin: 10mm; size: A4; }
          .invoice-page:last-child { page-break-after: avoid; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const printInvoice = (b) => {
    const idx = invoiceIndex(b);
    openPrintWindow(generateInvoiceHTML(b, idx), `Invoice INV-${String(idx + 1).padStart(4, '0')}`);
  };

  const printMultiple = (list) => {
    const allHTML = list.map(b => generateInvoiceHTML(b, invoiceIndex(b))).join('');
    openPrintWindow(allHTML, `Invoices — Hotel Management System`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filter.length ? [] : filter.map(b => b._id));
  };

  const selectedBookings = filter.filter(b => selectedIds.includes(b._id));

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="mb-sm-0">Payments & Invoices</h4>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Total Revenue', value: formatPKR(stats.total), icon: 'bx bx-dollar-circle', color: 'success' },
          { label: 'Paid',          value: formatPKR(stats.paid),  icon: 'bx bx-check-circle',  color: 'info' },
          { label: 'Unpaid',        value: formatPKR(stats.unpaid),icon: 'bx bx-time',           color: 'warning' },
          { label: 'Total Bookings',value: stats.count,            icon: 'bx bx-receipt',        color: 'primary' },
        ].map((s, i) => (
          <div className="col-xl-3 col-md-6" key={i}>
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
          <h5 className="card-title mb-0 flex-grow-1">
            All Invoices
            {selectedIds.length > 0 && (
              <span className="badge bg-primary ms-2">{selectedIds.length} selected</span>
            )}
          </h5>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => printMultiple(selectedBookings)}>
                <i className="ri-printer-line me-1"></i>Print Selected ({selectedIds.length})
              </button>
            </div>
          )}

          <div className="d-flex gap-2">
            <select className="form-select form-select-sm w-auto" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            <button className="btn btn-sm btn-primary" onClick={() => printMultiple(filter)}>
              <i className="ri-printer-line me-1"></i>Print All
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>
                    <input type="checkbox" className="form-check-input"
                      checked={selectedIds.length === filter.length && filter.length > 0}
                      onChange={toggleSelectAll} />
                  </th>
                  <th>Invoice #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Nights</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filter.length === 0 ? (
                  <tr><td colSpan="10" className="text-center py-4 text-muted">No invoices found.</td></tr>
                ) : filter.map((b) => {
                  const nights = Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24));
                  const isSelected = selectedIds.includes(b._id);
                  return (
                    <tr key={b._id} className={isSelected ? 'table-active' : ''}>
                      <td>
                        <input type="checkbox" className="form-check-input"
                          checked={isSelected} onChange={() => toggleSelect(b._id)} />
                      </td>
                      <td><span className="fw-medium text-primary">INV-{String(invoiceIndex(b) + 1).padStart(4, '0')}</span></td>
                      <td>
                        <div className="fw-medium">{b.guestName || b.userId?.name || 'Guest'}</div>
                        <small className="text-muted">{b.guestPhone || b.userId?.phone || ''}</small>
                        {b.bookingStatus === 'cancelled' && (
                          <div><span className="badge bg-danger-subtle text-danger">cancelled</span></div>
                        )}
                      </td>
                      <td>{b.roomId ? `Room ${b.roomId.roomNumber}` : '—'}</td>
                      <td>{new Date(b.checkInDate).toLocaleDateString('en-PK')}</td>
                      <td>{new Date(b.checkOutDate).toLocaleDateString('en-PK')}</td>
                      <td>{nights}</td>
                      <td className="fw-semibold">{formatPKR(b.totalAmount)}</td>
                      <td>{paymentBadge(b.paymentStatus)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-soft-info btn-sm" title="View Invoice"
                            onClick={() => { setSelectedBooking(b); setShowInvoiceModal(true); }}>
                            <i className="ri-eye-line"></i>
                          </button>
                          <button className="btn btn-soft-primary btn-sm" title="Print Invoice"
                            onClick={() => printInvoice(b)}>
                            <i className="ri-printer-line"></i>
                          </button>
                          {b.paymentStatus !== 'paid' && b.bookingStatus !== 'cancelled' && (
                            <button className="btn btn-soft-success btn-sm" title="Mark Paid"
                              onClick={() => markAsPaid(b)}>
                              <i className="ri-money-dollar-circle-line"></i>
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

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedBooking && (() => {
        const b = selectedBooking;
        const nights = Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24));
        const idx = invoiceIndex(b);
        const hotel = getHotelInfo();
        return (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Invoice — INV-{String(idx + 1).padStart(4, '0')}</h5>
                  <button className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">🏨 {hotel.hotelName || 'Hotel Management System'}</h4>
                      <p className="text-muted mb-0">Official Invoice</p>
                    </div>
                    <div className="text-end">
                      <h5 className="fw-bold text-primary">INV-{String(idx + 1).padStart(4, '0')}</h5>
                      <p className="text-muted mb-1">Date: {new Date(b.createdAt).toLocaleDateString('en-PK')}</p>
                      {paymentBadge(b.paymentStatus)}
                    </div>
                  </div>
                  <hr />
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="fw-semibold mb-2 text-primary">Guest Information</h6>
                        <p className="mb-1">Name: <strong>{b.guestName || b.userId?.name || 'Guest'}</strong></p>
                        <p className="mb-1">Phone: {b.guestPhone || b.userId?.phone || '—'}</p>
                        <p className="mb-0">Email: {b.guestEmail || (b.userId?.email?.includes('@walkin.hotel') ? '—' : b.userId?.email) || '—'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="fw-semibold mb-2 text-primary">Room Details</h6>
                        <p className="mb-1">Room: <strong>{b.roomId ? `Room ${b.roomId.roomNumber}` : '—'}</strong></p>
                        <p className="mb-1">Type: {b.roomId?.type || '—'}</p>
                        <p className="mb-0">Price/Night: {formatPKR(b.roomId?.price || 0)}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <p className="text-muted mb-1 fs-12">CHECK IN</p>
                        <h6 className="text-success">{new Date(b.checkInDate).toLocaleDateString('en-PK')}</h6>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <p className="text-muted mb-1 fs-12">CHECK OUT</p>
                        <h6 className="text-warning">{new Date(b.checkOutDate).toLocaleDateString('en-PK')}</h6>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <p className="text-muted mb-1 fs-12">DURATION</p>
                        <h6 className="text-info">{nights} Night(s)</h6>
                      </div>
                    </div>
                  </div>
                  <table className="table table-bordered mb-3">
                    <thead className="table-light">
                      <tr>
                        <th>Description</th>
                        <th className="text-center">Nights</th>
                        <th className="text-end">Rate/Night</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{b.roomId ? `Room ${b.roomId.roomNumber} — ${b.roomId.type}` : 'Room'}</td>
                        <td className="text-center">{nights}</td>
                        <td className="text-end">{formatPKR(b.roomId?.price || 0)}</td>
                        <td className="text-end fw-medium">{formatPKR(b.totalAmount)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      {b.discountAmount > 0 && (
                        <tr>
                          <td colSpan="3" className="text-end text-success">🎁 Loyalty Discount ({b.redeemedPoints} points)</td>
                          <td className="text-end text-success">- {formatPKR(b.discountAmount)}</td>
                        </tr>
                      )}
                      <tr className="table-light">
                        <td colSpan="3" className="text-end fw-bold">Total Amount</td>
                        <td className="text-end fw-bold text-success fs-16">{formatPKR(b.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <p className="text-center text-muted fs-12 mb-0">Thank you for choosing our hotel! 🏨</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light" onClick={() => setShowInvoiceModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => printInvoice(selectedBooking)}>
                    <i className="ri-printer-line me-1"></i>Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Payments;
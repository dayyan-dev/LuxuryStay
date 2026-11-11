import { useState, useEffect } from 'react';
import api from '../../api/authApi';
import { downloadCsv } from '../../utils/exportCsv';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Reports = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [orders, setOrders]     = useState([]);
  const [activeTab, setActiveTab] = useState('revenue');

  // Date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, roomsRes, ordersRes] = await Promise.all([
        api.get(`${API_URL}/bookings/all`, { headers }),
        api.get(`${API_URL}/rooms`, { headers }),
        api.get(`${API_URL}/restaurant/orders`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
      setOrders(ordersRes.data.data || []);
    } catch (err) { console.error(err); }
  };

  const formatPKR = (amount) => 'PKR ' + Number(amount).toLocaleString('en-PK');
  const dateStamp = new Date().toISOString().slice(0, 10);

  // Date range filter logic
  const inRange = (dateStr) => {
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  };

  const filterBookings = bookings.filter(b => inRange(b.createdAt));
  const filterOrders   = orders.filter(o => inRange(o.createdAt));

  const clearDates = () => { setDateFrom(''); setDateTo(''); };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyRevenue  = new Array(12).fill(0);
  const monthlyBookings = new Array(12).fill(0);

  filterBookings.forEach(b => {
    if (b.bookingStatus === 'cancelled') return;
    const m = new Date(b.createdAt).getMonth();
    monthlyBookings[m]++;
    if (b.paymentStatus === 'paid') monthlyRevenue[m] += b.totalAmount;
  });

  const roomTypeStats = {};
  rooms.forEach(r => { roomTypeStats[r.type] = (roomTypeStats[r.type] || 0) + 1; });

  // Top performing rooms — most booked
  const roomBookingCount = {};
  filterBookings.forEach(b => {
    if (b.roomId) {
      const key = b.roomId._id || b.roomId;
      roomBookingCount[key] = (roomBookingCount[key] || { count: 0, room: b.roomId });
      roomBookingCount[key].count++;
    }
  });
  const topRooms = Object.values(roomBookingCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Payment method breakdown
  const paymentMethods = {};
  filterBookings.forEach(b => {
    const m = b.paymentMethod || 'unknown';
    paymentMethods[m] = (paymentMethods[m] || 0) + 1;
  });

  const bookingStats = {
    pending:   filterBookings.filter(b => b.bookingStatus === 'pending').length,
    confirmed: filterBookings.filter(b => b.bookingStatus === 'confirmed').length,
    completed: filterBookings.filter(b => b.bookingStatus === 'completed').length,
    cancelled: filterBookings.filter(b => b.bookingStatus === 'cancelled').length,
  };

  // Revenue excludes cancelled bookings
  const revenueBookings = filterBookings.filter(b => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled');
  const totalRevenue      = revenueBookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalUnpaid       = filterBookings.filter(b => b.paymentStatus !== 'paid' && b.bookingStatus !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0);
  const restaurantRevenue = filterOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Occupancy rate
  const occupiedRooms  = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate  = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const maxRevenue  = Math.max(...monthlyRevenue, 1);
  const maxBookings = Math.max(...monthlyBookings, 1);

  // ADR: paid non-cancelled nights (confirmed / checked_in / completed)
  const adrBookings = revenueBookings.filter(b =>
    ['confirmed', 'checked_in', 'completed'].includes(b.bookingStatus)
  );
  const totalNights = adrBookings.reduce((s, b) => {
    const nights = Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24));
    return s + Math.max(nights, 1);
  }, 0);
  const ADR    = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;
  const RevPAR = rooms.length > 0 ? Math.round(totalRevenue / rooms.length) : 0;
  const avgBookingValue = revenueBookings.length > 0 ? Math.round(totalRevenue / revenueBookings.length) : 0;
  const cancellationRate = filterBookings.length > 0
    ? Math.round((bookingStats.cancelled / filterBookings.length) * 100) : 0;

  // Export functions
  const exportRevenue = () => {
    downloadCsv(
      `revenue-report-${dateStamp}.csv`,
      ['Month', 'Revenue (PKR)', 'Bookings'],
      months.map((m, i) => [m, monthlyRevenue[i], monthlyBookings[i]])
    );
  };

  const exportBookings = () => {
    downloadCsv(
      `bookings-report-${dateStamp}.csv`,
      ['Guest', 'Room', 'Check In', 'Check Out', 'Amount', 'Booking Status', 'Payment Status', 'Payment Method', 'Created'],
      filterBookings.map(b => [
        b.guestName || b.userId?.name || 'Guest',
        b.roomId ? `Room ${b.roomId.roomNumber}` : '—',
        new Date(b.checkInDate).toLocaleDateString('en-PK'),
        new Date(b.checkOutDate).toLocaleDateString('en-PK'),
        b.totalAmount,
        b.bookingStatus,
        b.paymentStatus,
        b.paymentMethod || '—',
        new Date(b.createdAt).toLocaleDateString('en-PK'),
      ])
    );
  };

  const exportOccupancy = () => {
    downloadCsv(
      `occupancy-report-${dateStamp}.csv`,
      ['Room Number', 'Type', 'Price', 'Status', 'Capacity'],
      rooms.map(r => [r.roomNumber, r.type, r.price, r.status, r.capacity])
    );
  };

  const exportRestaurant = () => {
    downloadCsv(
      `restaurant-report-${dateStamp}.csv`,
      ['Guest', 'Room', 'Items', 'Total (PKR)', 'Status', 'Date'],
      filterOrders.map(o => [
        o.guestName || o.userId?.name || 'Guest',
        o.roomNumber || '—',
        o.items?.map(it => `${it.name} x${it.quantity}`).join('; ') || '',
        o.totalAmount,
        o.status,
        new Date(o.createdAt).toLocaleString('en-PK'),
      ])
    );
  };

  const exportHandlers = {
    revenue: exportRevenue, bookings: exportBookings,
    occupancy: exportOccupancy, restaurant: exportRestaurant,
  };

  // ✅ Forecasting — last 3 months average se next 3 months pict karo
  const today = new Date();
  const currentMonth = today.getMonth();

  // Last 3 months average
  const last3Months = [0, 1, 2].map(i => {
    const month = (currentMonth - 1 - i + 12) % 12;
    return { revenue: monthlyRevenue[month], bookings: monthlyBookings[month] };
  });

  const avgRevenue  = Math.round(last3Months.reduce((s, m) => s + m.revenue, 0) / 3);
  const avgBookings = Math.round(last3Months.reduce((s, m) => s + m.bookings, 0) / 3);

  // Next 3 months forecast
  const forecast = [1, 2, 3].map(i => {
    const month = (currentMonth + i) % 12;
    // Peak months — June, July, August, December (20% boost)
    const peakMonths = [5, 6, 7, 11];
    const multiplier = peakMonths.includes(month) ? 1.2 : 1.0;
    return {
      month: months[month],
      revenue:  Math.round(avgRevenue * multiplier),
      bookings: Math.round(avgBookings * multiplier),
      isPeak: peakMonths.includes(month),
    };
  });

  // Next 30/60/90 days
  const next30  = Math.round(avgBookings * 1);
  const next60  = Math.round(avgBookings * 2);
  const next90  = Math.round(avgBookings * 3);
  const rev30   = Math.round(avgRevenue * 1);
  const rev60   = Math.round(avgRevenue * 2);
  const rev90   = Math.round(avgRevenue * 3);

  // Date range label
  const rangeLabel = dateFrom || dateTo
    ? `${dateFrom || '...'} → ${dateTo || '...'}`
    : 'All Time';

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Reports & Analytics</h4>
            <button className="btn btn-success btn-sm" onClick={exportHandlers[activeTab]}>
              <i className="ri-download-2-line me-1"></i> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── DATE RANGE FILTER ── */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <span className="fw-medium text-muted fs-13">
              <i className="ri-calendar-line me-1"></i> Date Range:
            </span>
            <div className="d-flex align-items-center gap-2">
              <label className="text-muted fs-12 mb-0">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 145 }}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="text-muted fs-12 mb-0">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 145 }}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button className="btn btn-sm btn-light" onClick={clearDates}>
                <i className="ri-close-line me-1"></i>Clear
              </button>
            )}
            <span className="badge bg-primary-subtle text-primary ms-auto">
              Showing: {rangeLabel}
            </span>
          </div>
        </div>
      </div>

     {/* Stats */}
      <div className="row mb-3">
        {[
          { label: 'Hotel Revenue',      value: formatPKR(totalRevenue),      icon: 'bx bx-dollar-circle', color: 'success' },
          { label: 'Restaurant Revenue', value: formatPKR(restaurantRevenue), icon: 'ri-restaurant-line',  color: 'primary' },
          { label: 'Unpaid Amount',      value: formatPKR(totalUnpaid),       icon: 'bx bx-time',          color: 'warning' },
          { label: 'Occupancy Rate',     value: `${occupancyRate}%`,          icon: 'bx bx-building',      color: 'info'    },
          { label: 'ADR (Avg Daily Rate)',value: formatPKR(ADR),              icon: 'bx bx-trending-up',   color: 'success' },
          { label: 'RevPAR',             value: formatPKR(RevPAR),            icon: 'ri-hotel-line',       color: 'info'    },
          { label: 'Avg Booking Value',  value: formatPKR(avgBookingValue),   icon: 'bx bx-receipt',       color: 'primary' },
          { label: 'Cancellation Rate',  value: `${cancellationRate}%`,       icon: 'bx bx-x-circle',      color: 'danger'  },
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

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs-custom rounded card-header-tabs border-bottom-0">
            {[
              { key: 'revenue',    label: 'Revenue Report'    },
              { key: 'bookings',   label: 'Booking Report'    },
              { key: 'occupancy',  label: 'Occupancy Report'  },
              { key: 'restaurant', label: 'Restaurant Report' },
              { key: 'loyalty',    label: 'Loyalty Report'    },
              { key: 'forecast',   label: '📈 Forecasting'    },
            ].map(tab => (
              <li className="nav-item" key={tab.key}>
                <button className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">

          {/* ── REVENUE TAB ── */}
          {activeTab === 'revenue' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-semibold mb-0">Monthly Revenue (PKR)</h6>
                <span className="text-muted fs-12">{filterBookings.length} bookings in selected range</span>
              </div>

              {/* Payment method breakdown */}
              {Object.keys(paymentMethods).length > 0 && (
                <div className="row g-2 mb-4">
                  <div className="col-12"><p className="fw-medium text-muted fs-12 mb-2">PAYMENT METHOD BREAKDOWN</p></div>
                  {Object.entries(paymentMethods).map(([method, count], i) => (
                    <div className="col-auto" key={i}>
                      <div className="p-2 px-3 bg-light rounded d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary">{method}</span>
                        <span className="fw-semibold">{count} bookings</span>
                        <span className="text-muted fs-12">
                          ({filterBookings.length > 0 ? Math.round((count / filterBookings.length) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Month</th><th>Revenue</th><th>Bookings</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {months.map((m, i) => (
                      <tr key={i}>
                        <td className="fw-medium">{m}</td>
                        <td className="fw-semibold text-success">{formatPKR(monthlyRevenue[i])}</td>
                        <td>{monthlyBookings[i]}</td>
                        <td style={{ minWidth: 150 }}>
                          <div className="progress" style={{ height: 6 }}>
                            <div className="progress-bar bg-success" style={{ width: `${(monthlyRevenue[i] / maxRevenue) * 100}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td className="fw-bold">Total</td>
                      <td className="fw-bold text-success">{formatPKR(totalRevenue)}</td>
                      <td className="fw-bold">{filterBookings.length}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              <h6 className="fw-semibold mb-3">Booking Status Summary</h6>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Pending',   value: bookingStats.pending,   color: 'warning' },
                  { label: 'Confirmed', value: bookingStats.confirmed, color: 'success' },
                  { label: 'Completed', value: bookingStats.completed, color: 'info'    },
                  { label: 'Cancelled', value: bookingStats.cancelled, color: 'danger'  },
                ].map((s, i) => (
                  <div className="col-md-3 col-6" key={i}>
                    <div className={`p-3 bg-${s.color}-subtle rounded text-center`}>
                      <h3 className={`fw-bold text-${s.color} mb-1`}>{s.value}</h3>
                      <p className="text-muted mb-0 fs-12">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top performing rooms */}
              {topRooms.length > 0 && (
                <>
                  <h6 className="fw-semibold mb-3">Top Booked Rooms</h6>
                  <div className="table-responsive mb-4">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr><th>Room</th><th>Type</th><th>Total Bookings</th><th>Progress</th></tr>
                      </thead>
                      <tbody>
                        {topRooms.map((item, i) => (
                          <tr key={i}>
                            <td className="fw-medium">Room {item.room?.roomNumber || '—'}</td>
                            <td>{item.room?.type || '—'}</td>
                            <td><span className="badge bg-primary-subtle text-primary">{item.count}</span></td>
                            <td style={{ minWidth: 150 }}>
                              <div className="progress" style={{ height: 6 }}>
                                <div className="progress-bar bg-primary" style={{ width: `${(item.count / topRooms[0].count) * 100}%` }}></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <h6 className="fw-semibold mb-3">Monthly Bookings</h6>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Month</th><th>Bookings</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {months.map((m, i) => (
                      <tr key={i}>
                        <td className="fw-medium">{m}</td>
                        <td>{monthlyBookings[i]}</td>
                        <td style={{ minWidth: 150 }}>
                          <div className="progress" style={{ height: 6 }}>
                            <div className="progress-bar bg-info" style={{ width: `${(monthlyBookings[i] / maxBookings) * 100}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── OCCUPANCY TAB ── */}
          {activeTab === 'occupancy' && (
            <div>
              <h6 className="fw-semibold mb-3">Room Status Overview</h6>

              {/* Occupancy rate highlight */}
              <div className="p-3 mb-4 rounded" style={{ background: occupancyRate >= 70 ? '#d1e7dd' : occupancyRate >= 40 ? '#fff3cd' : '#f8d7da' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="fw-bold mb-0" style={{ color: occupancyRate >= 70 ? '#0f5132' : occupancyRate >= 40 ? '#664d03' : '#842029' }}>
                      {occupancyRate}%
                    </h2>
                    <p className="mb-0 text-muted">Current Occupancy Rate</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-0 text-muted fs-13">{occupiedRooms} of {rooms.length} rooms occupied</p>
                    <small className="text-muted">
                      {occupancyRate >= 70 ? '🟢 High occupancy' : occupancyRate >= 40 ? '🟡 Moderate occupancy' : '🔴 Low occupancy'}
                    </small>
                  </div>
                </div>
                <div className="progress mt-2" style={{ height: 8 }}>
                  <div className="progress-bar" style={{
                    width: `${occupancyRate}%`,
                    background: occupancyRate >= 70 ? '#198754' : occupancyRate >= 40 ? '#ffc107' : '#dc3545'
                  }}></div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                {[
                  { label: 'Available',   value: rooms.filter(r => r.status === 'available').length,   color: 'success' },
                  { label: 'Occupied',    value: rooms.filter(r => r.status === 'occupied').length,    color: 'danger'  },
                  { label: 'Reserved',    value: rooms.filter(r => r.status === 'reserved').length,    color: 'info'    },
                  { label: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: 'warning' },
                ].map((s, i) => (
                  <div className="col-md-3 col-6" key={i}>
                    <div className={`p-3 bg-${s.color}-subtle rounded text-center`}>
                      <h3 className={`fw-bold text-${s.color} mb-1`}>{s.value}</h3>
                      <p className="text-muted mb-0 fs-12">{s.label}</p>
                      <small className="text-muted">{rooms.length > 0 ? Math.round((s.value / rooms.length) * 100) : 0}%</small>
                    </div>
                  </div>
                ))}
              </div>

              <h6 className="fw-semibold mb-3">Rooms by Type</h6>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Room Type</th><th>Total Rooms</th><th>Percentage</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(roomTypeStats).map(([type, count], i) => (
                      <tr key={i}>
                        <td className="fw-medium text-capitalize">{type}</td>
                        <td>{count}</td>
                        <td>{rooms.length > 0 ? Math.round((count / rooms.length) * 100) : 0}%</td>
                        <td style={{ minWidth: 150 }}>
                          <div className="progress" style={{ height: 6 }}>
                            <div className="progress-bar bg-info" style={{ width: `${rooms.length > 0 ? (count / rooms.length) * 100 : 0}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── RESTAURANT TAB ── */}
          {activeTab === 'restaurant' && (
            <div>
              <h6 className="fw-semibold mb-3">Restaurant Orders Summary</h6>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Total Orders', value: filterOrders.length,                                       color: 'primary' },
                  { label: 'Delivered',    value: filterOrders.filter(o => o.status === 'Delivered').length, color: 'success' },
                  { label: 'Pending',      value: filterOrders.filter(o => o.status === 'Pending').length,   color: 'warning' },
                  { label: 'Revenue',      value: formatPKR(restaurantRevenue),                                color: 'info'    },
                ].map((s, i) => (
                  <div className="col-md-3 col-6" key={i}>
                    <div className={`p-3 bg-${s.color}-subtle rounded text-center`}>
                      <h3 className={`fw-bold text-${s.color} mb-1 fs-18`}>{s.value}</h3>
                      <p className="text-muted mb-0 fs-12">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Guest</th><th>Room</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {filterOrders.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted py-3">No restaurant orders</td></tr>
                    ) : filterOrders.map(o => (
                      <tr key={o._id}>
                        <td>{o.guestName || o.userId?.name || 'Guest'}</td>
                        <td>{o.roomNumber || '—'}</td>
                        <td><small className="text-muted">{o.items?.map(it => `${it.name} x${it.quantity}`).join(', ')}</small></td>
                        <td className="fw-semibold">{formatPKR(o.totalAmount)}</td>
                        <td><span className="badge bg-primary-subtle text-primary">{o.status}</span></td>
                        <td><small>{new Date(o.createdAt).toLocaleString('en-PK')}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
{/* ── LOYALTY TAB ── */}
          {activeTab === 'loyalty' && (
            <div>
              <h6 className="fw-semibold mb-3">Loyalty Points Overview</h6>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Total Points Issued',   value: filterBookings.reduce((s, b) => s + Math.floor(b.totalAmount / 100), 0), color: 'success' },
                  { label: 'Total Points Redeemed', value: filterBookings.reduce((s, b) => s + (b.redeemedPoints || 0), 0),          color: 'warning' },
                  { label: 'Discount Given',        value: formatPKR(filterBookings.reduce((s, b) => s + (b.discountAmount || 0), 0)), color: 'danger' },
                  { label: 'Bookings with Discount',value: filterBookings.filter(b => b.discountAmount > 0).length,                  color: 'info'   },
                ].map((s, i) => (
                  <div className="col-md-3 col-6" key={i}>
                    <div className={`p-3 bg-${s.color}-subtle rounded text-center`}>
                      <h3 className={`fw-bold text-${s.color} mb-1 fs-18`}>{s.value}</h3>
                      <p className="text-muted mb-0 fs-12">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h6 className="fw-semibold mb-3">Bookings with Loyalty Discount</h6>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Guest</th><th>Room</th><th>Points Redeemed</th><th>Discount</th><th>Final Amount</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {filterBookings.filter(b => b.discountAmount > 0).length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted py-3">No loyalty discounts yet</td></tr>
                    ) : filterBookings.filter(b => b.discountAmount > 0).map(b => (
                      <tr key={b._id}>
                        <td className="fw-medium">{b.guestName || b.userId?.name || 'Guest'}</td>
                        <td>{b.roomId ? `Room ${b.roomId.roomNumber}` : '—'}</td>
                        <td><span className="badge bg-warning-subtle text-warning">🎁 {b.redeemedPoints} pts</span></td>
                        <td className="text-success fw-medium">- {formatPKR(b.discountAmount)}</td>
                        <td className="fw-bold">{formatPKR(b.totalAmount)}</td>
                        <td><small>{new Date(b.createdAt).toLocaleDateString('en-PK')}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ── FORECASTING TAB ── */}
          {activeTab === 'forecast' && (
            <div>
              <h6 className="fw-semibold mb-1">📈 Revenue & Booking Forecast</h6>
              <p className="text-muted fs-13 mb-4">Last 3 months ke average se aglay 90 din ka estimate</p>

              {/* 30/60/90 days */}
              <div className="row g-3 mb-4">
                {[
                  { label: 'Next 30 Days', bookings: next30, revenue: rev30,  color: 'success' },
                  { label: 'Next 60 Days', bookings: next60, revenue: rev60,  color: 'primary' },
                  { label: 'Next 90 Days', bookings: next90, revenue: rev90,  color: 'info'    },
                ].map((s, i) => (
                  <div className="col-md-4" key={i}>
                    <div className={`card border-${s.color} h-100`}>
                      <div className="card-body text-center">
                        <h6 className={`text-${s.color} fw-bold mb-3`}>{s.label}</h6>
                        <div className="mb-2">
                          <div className="fs-24 fw-bold">{s.bookings}</div>
                          <div className="text-muted fs-12">Expected Bookings</div>
                        </div>
                        <hr />
                        <div>
                          <div className={`fs-18 fw-bold text-${s.color}`}>{formatPKR(s.revenue)}</div>
                          <div className="text-muted fs-12">Expected Revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly forecast */}
              <h6 className="fw-semibold mb-3">Next 3 Months Breakdown</h6>
              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr><th>Month</th><th>Expected Bookings</th><th>Expected Revenue</th><th>Season</th><th>Progress</th></tr>
                  </thead>
                  <tbody>
                    {forecast.map((f, i) => (
                      <tr key={i}>
                        <td className="fw-medium">{f.month}</td>
                        <td>{f.bookings}</td>
                        <td className="fw-semibold text-success">{formatPKR(f.revenue)}</td>
                        <td>
                          {f.isPeak
                            ? <span className="badge bg-danger-subtle text-danger">🔥 Peak Season</span>
                            : <span className="badge bg-secondary-subtle text-secondary">Normal</span>
                          }
                        </td>
                        <td style={{ minWidth: 150 }}>
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className={`progress-bar ${f.isPeak ? 'bg-danger' : 'bg-success'}`}
                              style={{ width: `${f.isPeak ? 100 : 75}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              <h6 className="fw-semibold mb-3">💡 Insights</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 bg-success-subtle rounded">
                    <div className="fw-semibold text-success mb-1">📊 Avg Monthly Revenue</div>
                    <div className="fs-18 fw-bold">{formatPKR(avgRevenue)}</div>
                    <div className="text-muted fs-12">Based on last 3 months</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-primary-subtle rounded">
                    <div className="fw-semibold text-primary mb-1">🛏️ Avg Monthly Bookings</div>
                    <div className="fs-18 fw-bold">{avgBookings}</div>
                    <div className="text-muted fs-12">Based on last 3 months</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-warning-subtle rounded">
                    <div className="fw-semibold text-warning mb-1">⚡ Peak Months</div>
                    <div className="fs-18 fw-bold">Jun, Jul, Aug, Dec</div>
                    <div className="text-muted fs-12">20% higher expected bookings</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
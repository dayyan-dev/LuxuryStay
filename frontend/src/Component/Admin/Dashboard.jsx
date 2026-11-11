import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/authApi';
import { useTheme } from '../../Context/ThemeContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LiveRoomDashboard from './LiveRoomDashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const { primary = '#0D9488', secondary = '#14B8A6' } = useTheme() || {};
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats] = useState({
    totalRevenue: 0, totalBookings: 0,
    availableRooms: 0, occupiedRooms: 0, reservedRooms: 0,
    pendingBookings: 0, confirmedBookings: 0,
    cancelledBookings: 0, completedBookings: 0,
    totalRooms: 0
  });
  const [recentBookings, setRecentBookings]   = useState([]);
  const [activity, setActivity]               = useState([]);
  const [monthlyData, setMonthlyData]         = useState([]);
  const [roomTypeData, setRoomTypeData]       = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [restaurantStats, setRestaurantStats] = useState({
    menuItems: 0, totalOrders: 0, pendingOrders: 0, todayOrders: 0, restaurantRevenue: 0,
  });
  const [recentOrders, setRecentOrders]       = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatPKR = (amount) => 'PKR ' + Number(amount).toLocaleString('en-PK');

  const COLORS = [primary, '#368568', secondary, '#CC5B55', '#668AA8', 'var(--theme-text-muted, #94A3B8)'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [roomsRes, bookingsRes, menuRes, ordersRes] = await Promise.all([
        api.get(`${API_URL}/rooms`, { headers }),
        api.get(`${API_URL}/bookings/all`, { headers }),
        api.get(`${API_URL}/restaurant/menu`, { headers }).catch(() => ({ data: { data: [] } })),
        api.get(`${API_URL}/restaurant/orders`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      const rooms    = roomsRes.data;
      const bookings = bookingsRes.data;
      const menu     = menuRes.data.data || [];
      const orders   = ordersRes.data.data || [];
      const today    = new Date().toDateString();

      setRestaurantStats({
        menuItems:         menu.length,
        totalOrders:       orders.length,
        pendingOrders:     orders.filter(o => ['Pending','Confirmed','Preparing'].includes(o.status)).length,
        todayOrders:       orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
        restaurantRevenue: orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0),
      });
      setRecentOrders(orders.slice(0, 5));
      setOrderStatusData([
        { name: 'Pending',   value: orders.filter(o => o.status === 'Pending').length },
        { name: 'Preparing', value: orders.filter(o => ['Confirmed','Preparing'].includes(o.status)).length },
        { name: 'Ready',     value: orders.filter(o => o.status === 'Ready').length },
        { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
      ].filter(d => d.value > 0));

      setStats({
        totalRevenue:        bookings.filter(b => b.paymentStatus === 'paid' && b.bookingStatus !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0),
        totalBookings:       bookings.length,
        availableRooms:      rooms.filter(r => r.status === 'available').length,
        occupiedRooms:       rooms.filter(r => r.status === 'occupied').length,
        reservedRooms:       rooms.filter(r => r.status === 'reserved').length,
        totalGuests:         bookings.reduce((sum, b) => sum + (Number(b.guests) || 1), 0),
        pendingBookings:     bookings.filter(b => b.bookingStatus === 'pending').length,
        confirmedBookings:   bookings.filter(b => b.bookingStatus === 'confirmed').length,
        cancelledBookings:   bookings.filter(b => b.bookingStatus === 'cancelled').length,
        completedBookings:   bookings.filter(b => b.bookingStatus === 'completed').length,
        checkinsToday:       bookings.filter(b => b.checkInDate && new Date(b.checkInDate).toDateString() === today).length,
        checkoutsToday:      bookings.filter(b => b.checkOutDate && new Date(b.checkOutDate).toDateString() === today).length,
        totalRooms:          rooms.length,
      });

      setRecentBookings(bookings.slice(0, 8));
      setActivity(bookings.slice(0, 6));

      const monthly = months.map((month, i) => {
        const monthBookings = bookings.filter(b => new Date(b.createdAt).getMonth() === i);
        return {
          month,
          revenue:  monthBookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0),
          bookings: monthBookings.length,
        };
      });
      setMonthlyData(monthly);

      const typeCount = {};
      rooms.forEach(r => { typeCount[r.type] = (typeCount[r.type] || 0) + 1; });
      setRoomTypeData(Object.entries(typeCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), value
      })));

      setBookingStatusData([
        { name: 'Confirmed', value: bookings.filter(b => b.bookingStatus === 'confirmed').length },
        { name: 'Completed', value: bookings.filter(b => b.bookingStatus === 'completed').length },
        { name: 'Pending',   value: bookings.filter(b => b.bookingStatus === 'pending').length },
        { name: 'Cancelled', value: bookings.filter(b => b.bookingStatus === 'cancelled').length },
      ].filter(d => d.value > 0));

    } catch (err) { console.error(err); }
  };

  const statusBadge = (status) => {
    const map = {
      pending:   'bg-warning-subtle text-warning',
      confirmed: 'bg-success-subtle text-success',
      cancelled: 'bg-danger-subtle text-danger',
      completed: 'bg-info-subtle text-info'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const avatarColors = [primary, '#668AA8', '#D49A46', '#CC5B55', '#368568'];
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="container-fluid">

      {/* Welcome */}
      <div className="d-flex align-items-lg-center flex-lg-row flex-column justify-content-between mb-4 pb-1">
        <div className="flex-grow-1">
          <p style={{ letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: 'var(--ls-gold-dark)', marginBottom: '0.35rem' }}>
            {dateStr}
          </p>
          <h2 style={{ fontFamily: 'var(--ls-font-serif)', fontSize: '1.9rem', color: 'var(--ls-dark)', marginBottom: '0.25rem', fontWeight: 600 }}>
            {greeting}, {user.name || 'Admin'}
          </h2>
          <p className="text-muted mb-0">Here's what's happening at your hotel today.</p>
        </div>
      </div>

      {/* Hotel Analytics & KPI Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue',        value: formatPKR(stats.totalRevenue), icon: 'ri-wallet-3-line',       color: 'success', sub: 'Paid bookings only' },
          { label: 'Total Bookings',       value: stats.totalBookings,           icon: 'ri-calendar-check-line', color: 'info',    sub: `${stats.confirmedBookings} confirmed` },
          { label: 'Available Rooms',      value: stats.availableRooms,          icon: 'ri-door-open-line',      color: 'gold',    sub: `of ${stats.totalRooms} total rooms` },
          { label: 'Occupied Rooms',       value: stats.occupiedRooms,           icon: 'ri-hotel-bed-line',      color: 'danger',  sub: `${occupancyRate}% occupancy` },
          { label: 'Total Guests',         value: stats.totalGuests || 0,        icon: 'ri-user-star-line',      color: 'info',    sub: 'Registered & booked guests' },
          { label: 'Pending Reservations', value: stats.pendingBookings,         icon: 'ri-time-line',           color: 'warning', sub: 'Awaiting confirmation' },
          { label: 'Check-ins Today',      value: stats.checkinsToday || 0,      icon: 'ri-login-box-line',      color: 'success', sub: 'Arrivals for today' },
          { label: 'Check-outs Today',     value: stats.checkoutsToday || 0,     icon: 'ri-logout-box-line',     color: 'gold',    sub: 'Departures for today' },
        ].map((s, i) => (
          <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6" key={i}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="card card-animate h-100 ls-dash-kpi"
            >
              <div className="ls-kpi-body">
                <div>
                  <p className="ls-kpi-label">{s.label}</p>
                  <h4 className="ls-kpi-value num-stat">{s.value}</h4>
                  <small className="ls-kpi-sub">{s.sub}</small>
                </div>
                <div className={`ls-kpi-icon ls-kpi-icon-${s.color}`}>
                  <i className={s.icon} aria-hidden="true"></i>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Live rooms */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card ls-dash-panel">
            <div className="card-body p-4">
              <LiveRoomDashboard />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Stats */}
      <div className="ls-section mb-3">
        <span className="ls-section-label">Restaurant Overview</span>
        <span className="ls-section-divider"></span>
      </div>
      <div className="row g-4 mb-4">
        {[
          { label: 'Menu Items',          value: restaurantStats.menuItems,                    icon: 'ri-restaurant-2-line',        color: 'gold',    sub: 'Active dishes' },
          { label: 'Orders Today',        value: restaurantStats.todayOrders,                  icon: 'ri-shopping-bag-3-line',      color: 'info',    sub: `${restaurantStats.totalOrders} total orders` },
          { label: 'Pending Orders',      value: restaurantStats.pendingOrders,                icon: 'ri-time-line',                color: 'warning', sub: 'Awaiting preparation' },
          { label: 'Restaurant Revenue',  value: formatPKR(restaurantStats.restaurantRevenue), icon: 'ri-wallet-3-line',            color: 'success', sub: 'Delivered orders' },
        ].map((s, i) => (
          <div className="col-xl-3 col-md-6" key={`rest-${i}`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="card card-animate border-dashed h-100 ls-dash-kpi"
            >
              <div className="ls-kpi-body">
                <div>
                  <p className="ls-kpi-label">{s.label}</p>
                  <h4 className="ls-kpi-value">{s.value}</h4>
                  <small className="ls-kpi-sub">{s.sub}</small>
                </div>
                <div className={`ls-kpi-icon ls-kpi-icon-${s.color}`}>
                  <i className={s.icon} aria-hidden="true"></i>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Booking Status Pie */}
      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center">
              <h4 className="card-title mb-0 flex-grow-1">Revenue & Bookings</h4>
              <small className="text-muted">Monthly Overview</small>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={secondary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--theme-text-muted, #94A3B8)' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: 'var(--theme-text-muted, #94A3B8)' }} width={60} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--theme-text-muted, #94A3B8)' }} width={30} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `PKR ${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]} />
                  <Legend iconType="circle" iconSize={8} />
                  <Area yAxisId="left"  type="monotone" dataKey="revenue"  name="revenue"
                    stroke={primary} fill="url(#colorRev)"  strokeWidth={2.5} />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" name="bookings"
                    stroke={secondary} fill="url(#colorBook)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Booking Status</h4>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              {bookingStatusData.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="ri-calendar-line fs-48 d-block mb-2 opacity-25"></i>
                  No booking data yet
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={bookingStatusData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                    {bookingStatusData.map((entry, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                        <small className="text-muted">{entry.name} ({entry.value})</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Type Bar + Occupancy */}
      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Rooms by Type</h4>
            </div>
            <div className="card-body">
              {roomTypeData.length === 0 ? (
                <div className="text-center text-muted py-4">No rooms added yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={roomTypeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--theme-text-muted, #94A3B8)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--theme-text-muted, #94A3B8)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Rooms" radius={[6, 6, 0, 0]} fill={primary}>
                      {roomTypeData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Room Occupancy</h4>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                {[
                  { label: 'Available', value: stats.availableRooms, color: 'success' },
                  { label: 'Occupied',  value: stats.occupiedRooms,  color: 'danger'  },
                  { label: 'Reserved',  value: stats.reservedRooms,  color: 'primary' },
                ].map((s, i) => (
                  <div className="col-4" key={i}>
                    <div className={`p-3 bg-${s.color}-subtle rounded text-center`}>
                      <h3 className={`fw-bold text-${s.color} mb-1`}>{s.value}</h3>
                      <p className="text-muted mb-0 fs-12">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted fs-12">Occupancy Rate</span>
                <span className="fw-semibold">{occupancyRate}%</span>
              </div>
              <div className="progress mb-4" style={{ height: '10px' }}>
                <div className="progress-bar bg-danger"  style={{ width: `${occupancyRate}%` }}></div>
                <div className="progress-bar bg-success" style={{ width: `${100 - occupancyRate}%` }}></div>
              </div>
              <div className="row g-2">
                {[
                  { label: 'Pending',   value: stats.pendingBookings,   color: 'warning' },
                  { label: 'Confirmed', value: stats.confirmedBookings, color: 'success' },
                  { label: 'Completed', value: stats.completedBookings, color: 'info'    },
                  { label: 'Cancelled', value: stats.cancelledBookings, color: 'danger'  },
                ].map((s, i) => (
                  <div className="col-6" key={i}>
                    <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                      <div className={`bg-${s.color} rounded`} style={{ width: 8, height: 8, flexShrink: 0 }}></div>
                      <div>
                        <div className="fw-semibold">{s.value}</div>
                        <div className="text-muted fs-12">{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Orders + Status */}
      {recentOrders.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-xl-8">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">Recent Restaurant Orders</h4>
                <Link to="/admin/restaurant-orders" className="btn btn-sm btn-soft-primary">View All</Link>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>Guest</th><th>Room</th><th>Items</th><th>Total</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(o => (
                        <tr key={o._id}>
                          <td className="fw-medium">{o.guestName || o.userId?.name || 'Guest'}</td>
                          <td>{o.roomNumber || '—'}</td>
                          <td><small>{o.items?.map(it => `${it.name} x${it.quantity}`).join(', ')}</small></td>
                          <td>{formatPKR(o.totalAmount)}</td>
                          <td><span className="badge bg-primary-subtle text-primary">{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="card h-100">
              <div className="card-header"><h4 className="card-title mb-0">Order Status</h4></div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                {orderStatusData.length === 0 ? (
                  <p className="text-muted">No orders yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={orderStatusData} cx="50%" cy="50%"
                          innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {orderStatusData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                      {orderStatusData.map((entry, index) => (
                        <div key={index} className="d-flex align-items-center gap-1">
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                          <small className="text-muted">{entry.name} ({entry.value})</small>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings + Activity */}
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Recent Bookings</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless table-hover table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr><td colSpan="6" className="text-center text-muted py-4">No bookings yet</td></tr>
                    ) : recentBookings.map(b => (
                      <tr key={b._id}>
                        <td><div className="fw-medium">{b.guestName || b.userId?.name || 'Guest'}</div></td>
                        <td>{b.roomId ? `Room ${b.roomId.roomNumber}` : '—'}</td>
                        <td>{new Date(b.checkInDate).toLocaleDateString('en-PK')}</td>
                        <td>{new Date(b.checkOutDate).toLocaleDateString('en-PK')}</td>
                        <td className="fw-medium">{formatPKR(b.totalAmount)}</td>
                        <td>{statusBadge(b.bookingStatus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Recent Activity</h4>
            </div>
            <div className="card-body">
              {activity.length === 0 ? (
                <div className="text-center text-muted py-4">No activity yet</div>
              ) : activity.map((b, i) => {
                const name = b.guestName || b.userId?.name || 'Guest';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const text = b.bookingStatus === 'confirmed' ? 'confirmed a booking' :
                  b.bookingStatus === 'pending'   ? 'requested a booking' :
                  b.bookingStatus === 'cancelled' ? 'cancelled booking'   : 'completed stay';
                return (
                  <div key={b._id} className="d-flex align-items-center mb-3">
                    <div className="avatar-xs flex-shrink-0 me-3">
                      <span className="avatar-title rounded-circle text-white fw-semibold"
                        style={{ background: avatarColors[i % avatarColors.length], fontSize: '12px' }}>
                        {initials}
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium">{name}</p>
                      <small className="text-muted">{text} · {new Date(b.createdAt).toLocaleDateString('en-PK')}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
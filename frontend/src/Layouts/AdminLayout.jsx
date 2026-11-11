import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Component/Admin/sidebar';
import Navbar from '../Component/Admin/navbar';
import ThemePanel from '../Component/Admin/ThemePanel';

const ADMIN_ROUTES = [
  '/admin/dashboard', '/admin/rooms', '/admin/bookings', '/admin/booking-new',
  '/admin/checkin-checkout', '/admin/users', '/admin/staff', '/admin/payments',
  '/admin/housekeeping', '/admin/maintenance', '/admin/feedback', '/admin/reports',
  '/admin/settings', '/admin/restaurant-menu', '/admin/restaurant-orders',
  '/admin/services', '/admin/faqs', '/admin/hotel-services', '/admin/about-us',
  '/admin/pricing', '/admin/guest-crm', '/admin/audit-logs',
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const role = user.role || 'guest';

  const isAdminRoute = ADMIN_ROUTES.includes(location.pathname);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const allowedRoles = ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'kitchen'];
    if (!allowedRoles.includes(role)) { navigate('/login'); return; }
  }, [token, role, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleCollapse = () => setCollapsed(!collapsed);
  const handleClose = () => setSidebarOpen(false);
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="ls-modal-overlay"
          onClick={handleClose}
          style={{ zIndex: 1090, position: 'fixed' }}
          aria-hidden="true"
        />
      )}

      {/* Top Navbar */}
      <Navbar
        collapsed={collapsed}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onCollapse={handleCollapse}
        onLogout={handleLogout}
        user={user}
        role={role}
      />

      {/* Sidebar — full-height (flush with top bar), drawer on mobile */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'ls-drawer-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed ? '80px' : '260px',
          zIndex: 1100,
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: collapsed ? 'none' : '4px 0 24px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        <Sidebar collapsed={collapsed} open={sidebarOpen} onClose={handleClose} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <main
        className="admin-main"
        style={{
          flex: 1,
          marginLeft: collapsed ? '80px' : '260px',
          paddingTop: 'var(--ls-header-height)',
          minHeight: '100vh',
        }}
      >
        <div className="admin-content" style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {isAdminRoute ? <Outlet /> : null}
        </div>
      </main>
      <ThemePanel />
    </div>
  );
};

export default AdminLayout;

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const roleInfo = {
  admin: { label: 'Administrator', color: 'var(--theme-primary, #0D9488)' },
  manager: { label: 'Manager', color: '#668AA8' },
  receptionist: { label: 'Receptionist', color: '#368568' },
  housekeeping: { label: 'Housekeeping', color: '#D49A46' },
  maintenance: { label: 'Maintenance', color: '#CC5B55' },
  kitchen: { label: 'Kitchen Staff', color: 'var(--theme-secondary, #14B8A6)' },
};

const SEARCH_ROUTES = [
  { keys: ['booking', 'bookings', 'reservation'], path: '/admin/bookings' },
  { keys: ['checkin', 'check-in', 'checkout', 'check-out'], path: '/admin/checkin-checkout' },
  { keys: ['room', 'rooms'], path: '/admin/rooms' },
  { keys: ['guest', 'guests', 'user', 'users'], path: '/admin/users' },
  { keys: ['staff', 'employee'], path: '/admin/staff' },
  { keys: ['payment', 'invoice', 'billing'], path: '/admin/payments' },
  { keys: ['restaurant', 'order', 'orders', 'menu', 'kitchen'], path: '/admin/restaurant-orders' },
  { keys: ['housekeeping', 'clean'], path: '/admin/housekeeping' },
  { keys: ['maintenance', 'repair'], path: '/admin/maintenance' },
  { keys: ['feedback', 'review'], path: '/admin/feedback' },
  { keys: ['report', 'analytics'], path: '/admin/reports' },
  { keys: ['crm'], path: '/admin/guest-crm' },
  { keys: ['audit', 'log'], path: '/admin/audit-logs' },
  { keys: ['pricing', 'price'], path: '/admin/pricing' },
  { keys: ['faq'], path: '/admin/faqs' },
  { keys: ['setting', 'settings'], path: '/admin/settings' },
  { keys: ['service', 'services'], path: '/admin/services' },
  { keys: ['dashboard', 'home'], path: '/admin/dashboard' },
];

const Navbar = ({ collapsed, sidebarOpen, onToggleSidebar, onCollapse, onLogout, user, role }) => {
  const navigate = useNavigate();
  const name = user.name || 'Team Member';
  const email = user.email || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const currentRole = roleInfo[role] || { label: role, color: 'var(--theme-text-secondary, #475569)' };

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userRef = useRef(null);

  const handleLogout = (e) => { e.preventDefault(); onLogout(e); };

  const runSearch = (raw = searchQuery) => {
    const q = String(raw || '').trim().toLowerCase();
    if (!q) return;
    const hit = SEARCH_ROUTES.find(r => r.keys.some(k => q.includes(k) || k.includes(q)));
    if (hit) {
      navigate(hit.path);
      setSearchQuery('');
      return;
    }
    // Default: guests directory with query in session for page search
    sessionStorage.setItem('admin_global_search', q);
    navigate('/admin/users');
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className="admin-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: collapsed ? '80px' : '260px',
        right: 0,
        height: 'var(--ls-header-height)',
        zIndex: 1050,
        transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 1.25rem 0 0.85rem',
      }}
    >
      <button
        type="button"
        className="admin-hamburger ls-btn-ghost admin-nav-icon-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
      >
        <span aria-hidden="true">{sidebarOpen ? '×' : '☰'}</span>
      </button>

      <button
        type="button"
        className="admin-collapse-toggle ls-btn-ghost admin-nav-icon-btn"
        onClick={onCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} aria-hidden="true" />
      </button>

      <form
        className="admin-nav-search ls-admin-search d-none d-sm-block"
        style={{ flex: 1, maxWidth: 420, minWidth: 0 }}
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
      >
        <i className="ri-search-line" aria-hidden="true" />
        <input
          className="form-control"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookings, rooms, guests..."
          aria-label="Search bookings, rooms, guests"
        />
      </form>

      <div style={{ flex: 1 }} aria-hidden="true" />

      <div className="admin-nav-actions">
        <NotificationBell />
        <div ref={userRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="admin-nav-user-btn"
            aria-label="Account menu"
            aria-expanded={showUserDropdown}
          >
            <div
              className="admin-nav-avatar"
              style={{ background: currentRole.color }}
            >
              {initials}
            </div>
            <div className="admin-nav-user-meta d-none d-md-flex">
              <span className="admin-nav-user-name">{name}</span>
              <span className="admin-nav-user-role">{currentRole.label}</span>
            </div>
            <i className="ri-arrow-down-s-line d-none d-md-inline" style={{ color: '#A8A29A', fontSize: 18 }} aria-hidden="true" />
          </button>
          {showUserDropdown && (
            <div className="admin-nav-dropdown">
              <div className="admin-nav-dropdown-head">
                <div
                  className="admin-nav-avatar"
                  style={{ background: currentRole.color, width: 44, height: 44, fontSize: 16 }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ls-dark)' }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ls-gray)', marginTop: 2 }}>{email}</div>
                  <span
                    style={{
                      display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700,
                      letterSpacing: 0.5, background: currentRole.color, color: '#fff',
                      padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase',
                    }}
                  >
                    {currentRole.label}
                  </span>
                </div>
              </div>
              <div style={{ padding: 6 }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="admin-nav-logout"
                >
                  <i className="ri-logout-box-r-line" aria-hidden="true" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

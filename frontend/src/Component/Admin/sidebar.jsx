import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ collapsed = false, open = false, onClose, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'guest';
  const name = user.name || 'Team Member';
  const [openMenus, setOpenMenus] = useState({});

  const hasRole = (...roles) => roles.includes(role);
  const isActive = (path) => location.pathname === path;
  const isParentActive = (...paths) => paths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const MENU_ROUTES = {
      bookings: ['/admin/bookings', '/admin/booking-new', '/admin/checkin-checkout'],
      users: ['/admin/users', '/admin/staff'],
      billing: ['/admin/payments'],
      restaurant: ['/admin/restaurant-menu', '/admin/restaurant-orders'],
    };
    setOpenMenus(prev => {
      const next = { ...prev };
      Object.entries(MENU_ROUTES).forEach(([key, paths]) => {
        if (paths.some(p => location.pathname === p || location.pathname.startsWith(p))) next[key] = true;
      });
      return next;
    });
  }, [location.pathname]);

  const toggleMenu = (key) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const linkStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
    padding: collapsed ? '0.7rem 0' : '0.85rem 1.2rem',
    color: active ? 'var(--theme-sidebar-text, #FFFFFF)' : 'rgba(255, 255, 255, 0.82)',
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
    borderRadius: collapsed ? 10 : 10,
    margin: collapsed ? '4px 12px' : '4px 10px',
    transition: 'all 0.2s ease', cursor: 'pointer', border: 'none',
    background: active ? 'var(--theme-primary-soft, rgba(13,148,136,0.28))' : 'transparent',
    boxShadow: active ? 'inset 3px 0 0 0 var(--theme-primary, #0D9488)' : 'none',
    width: collapsed ? 'calc(100% - 24px)' : 'auto',
    justifyContent: collapsed ? 'center' : 'flex-start',
    minWidth: collapsed ? 0 : 'auto',
  });

  const iconStyle = {
    fontSize: 20, flexShrink: 0, width: collapsed ? 24 : 24,
    textAlign: 'center', color: 'inherit',
  };

  const chevronStyle = (open) => ({
    marginLeft: collapsed ? 0 : 'auto',
    fontSize: 16,
    lineHeight: 1,
    width: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
    color: 'rgba(247,245,240,0.55)',
  });

  const SectionLabel = ({ children }) => {
    if (collapsed) return null;
    return (
      <div style={{
        padding: '0.85rem 1.2rem 0.4rem',
        color: 'rgba(247,245,240,0.38)',
        fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700,
      }}>
        {children}
      </div>
    );
  };

  const applyHover = (e, active, enter) => {
    if (active) return;
    e.currentTarget.style.color = enter ? 'var(--theme-sidebar-text, #FFFFFF)' : 'rgba(255, 255, 255, 0.7)';
    e.currentTarget.style.background = enter
      ? (collapsed ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)')
      : 'transparent';
  };

  const NavLink = ({ to, icon, label, active }) => (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      style={linkStyle(active)}
      onMouseEnter={e => applyHover(e, active, true)}
      onMouseLeave={e => applyHover(e, active, false)}
    >
      <i className={icon} style={iconStyle}></i>
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  const DropdownToggle = ({ menuKey, icon, label, parentActive, defaultTo }) => (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={() => {
        if (collapsed) {
          if (defaultTo) navigate(defaultTo);
          return;
        }
        toggleMenu(menuKey);
      }}
      style={linkStyle(parentActive)}
      onMouseEnter={e => applyHover(e, parentActive, true)}
      onMouseLeave={e => applyHover(e, parentActive, false)}
    >
      <i className={icon} style={iconStyle}></i>
      {!collapsed && <span>{label}</span>}
      {!collapsed && (
        <i className="ri-arrow-right-s-line" style={chevronStyle(openMenus[menuKey])} aria-hidden="true" />
      )}
    </button>
  );

  const SubLink = ({ to, label }) => {
    if (collapsed) return null;
    const active = isActive(to);
    return (
      <Link
        to={to}
        style={{
          ...linkStyle(active),
          paddingLeft: '2.6rem',
          fontSize: 13,
          minWidth: 'auto',
        }}
        onMouseEnter={e => applyHover(e, active, true)}
        onMouseLeave={e => applyHover(e, active, false)}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--theme-secondary-soft, rgba(37, 99, 235, 0.20))', flexShrink: 0, display: 'inline-block', marginRight: 8 }} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand — matches top bar height so sidebar + navbar meet flush */}
      <div className="admin-sidebar-brand" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/assets/images/logo.png"
            alt="LuxuryStay Logo"
            style={{
              height: 36,
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'drop-shadow(0 2px 8px var(--theme-primary-soft, rgba(13, 148, 136, 0.45)))',
            }}
          />
          {!collapsed && (
            <span className="admin-sidebar-brand-name">
              Luxury<span style={{ color: 'var(--theme-secondary-light, #2DD4BF)' }}>Stay</span>
            </span>
          )}
        </Link>
      </div>

      {/* Scroll area */}
      <div className="admin-sidebar-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '30px', paddingTop: collapsed ? 8 : 0 }}>
        <SectionLabel>Main Menu</SectionLabel>
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/dashboard" icon="ri-dashboard-2-line" label="Dashboard" active={isActive('/admin/dashboard')} />
        )}
        {hasRole('admin', 'manager', 'receptionist') && (
          <>
            <DropdownToggle menuKey="bookings" icon="ri-calendar-check-line" label="Bookings" defaultTo="/admin/bookings" parentActive={isParentActive('/admin/bookings', '/admin/booking-new', '/admin/checkin-checkout')} />
            {openMenus.bookings && (
              <div>
                <SubLink to="/admin/bookings" label="All Bookings" />
                <SubLink to="/admin/booking-new" label="New Booking" />
                <SubLink to="/admin/checkin-checkout" label="Check-in / Check-out" />
              </div>
            )}
          </>
        )}
        {hasRole('admin', 'manager', 'receptionist') && (
          <NavLink to="/admin/rooms" icon="ri-building-line" label="Manage Rooms" active={isActive('/admin/rooms')} />
        )}
        {hasRole('admin') && (
          <>
            <DropdownToggle menuKey="users" icon="ri-user-line" label="Users & Staff" defaultTo="/admin/users" parentActive={isParentActive('/admin/users', '/admin/staff')} />
            {openMenus.users && (
              <div>
                <SubLink to="/admin/users" label="Registered Guests" />
                <SubLink to="/admin/staff" label="Manage Staff" />
              </div>
            )}
          </>
        )}
        {hasRole('admin', 'manager') && (
          <>
            <DropdownToggle menuKey="billing" icon="ri-bill-line" label="Billing & Invoices" defaultTo="/admin/payments" parentActive={isActive('/admin/payments')} />
            {openMenus.billing && <div><SubLink to="/admin/payments" label="Payments & Invoices" /></div>}
          </>
        )}
        {hasRole('admin', 'manager', 'receptionist', 'kitchen') && (
          <>
            <DropdownToggle menuKey="restaurant" icon="ri-restaurant-line" label="Restaurant" defaultTo="/admin/restaurant-orders" parentActive={isParentActive('/admin/restaurant-menu', '/admin/restaurant-orders')} />
            {openMenus.restaurant && (
              <div>
                {hasRole('admin', 'manager', 'kitchen') && <SubLink to="/admin/restaurant-menu" label="Menu Management" />}
                <SubLink to="/admin/restaurant-orders" label="Orders" />
              </div>
            )}
          </>
        )}
        {hasRole('admin', 'manager', 'receptionist') && (
          <NavLink to="/admin/services" icon="ri-customer-service-2-line" label="Guest Services" active={isActive('/admin/services')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/hotel-services" icon="ri-hotel-line" label="Hotel Services" active={isActive('/admin/hotel-services')} />
        )}
        {hasRole('admin', 'manager', 'housekeeping') && (
          <NavLink to="/admin/housekeeping" icon="ri-brush-line" label="Housekeeping" active={isActive('/admin/housekeeping')} />
        )}
        {hasRole('admin', 'manager', 'maintenance') && (
          <NavLink to="/admin/maintenance" icon="ri-tools-line" label="Maintenance" active={isActive('/admin/maintenance')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/feedback" icon="ri-star-line" label="Guest Feedback" active={isActive('/admin/feedback')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/reports" icon="ri-bar-chart-line" label="Reports" active={isActive('/admin/reports')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/guest-crm" icon="ri-user-heart-line" label="Guest CRM" active={isActive('/admin/guest-crm')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/audit-logs" icon="ri-file-list-line" label="Audit Logs" active={isActive('/admin/audit-logs')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/pricing" icon="bx bx-dollar-circle" label="Dynamic Pricing" active={isActive('/admin/pricing')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/faqs" icon="ri-question-answer-line" label="FAQs" active={isActive('/admin/faqs')} />
        )}
        {hasRole('admin', 'manager') && (
          <NavLink to="/admin/about-us" icon="ri-information-line" label="About Us" active={isActive('/admin/about-us')} />
        )}
        {hasRole('admin') && (
          <>
            <SectionLabel>System</SectionLabel>
            <NavLink to="/admin/settings" icon="ri-settings-3-line" label="System Settings" active={isActive('/admin/settings')} />
          </>
        )}

        {/* Mobile drawer footer: user + logout */}
        <div className="admin-sidebar-footer d-lg-none" style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(247,245,240,0.1)', marginTop: 'auto', display: collapsed ? 'none' : 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: roleInfoColor(role), display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {initials(name)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{roleLabel(role)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { onClose?.(); onLogout?.(e); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(247,245,240,0.7)', fontWeight: 600, fontSize: 13 }}
          >
            <i className="ri-logout-box-r-line" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const roleInfoColor = (r) => ({ admin: 'var(--theme-primary, #1B365D)', manager: '#668AA8', receptionist: '#368568', housekeeping: '#D49A46', maintenance: '#CC5B55', kitchen: 'var(--theme-secondary, #2563EB)' }[r] || 'var(--theme-text-muted, #94A3B8)');
const roleLabel = (r) => ({ admin: 'Administrator', manager: 'Manager', receptionist: 'Receptionist', housekeeping: 'Housekeeping', maintenance: 'Maintenance', kitchen: 'Kitchen Staff' }[r] || r);

export default Sidebar;

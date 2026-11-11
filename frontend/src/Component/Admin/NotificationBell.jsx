import { useState, useEffect, useRef } from 'react';
import { connectSocket } from '../../services/socketService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();

    socket.on('new_notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 20)); // max 20
      setUnread(prev => prev + 1);

      // Browser notification (agar permission ho)
      if (Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message });
      }
    });

    // Browser notification permission maango
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Outside click se close karo
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.off('new_notification');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllRead = () => setUnread(0);
  const clearAll = () => { setNotifications([]); setUnread(0); };

  const bgColor = (severity) => ({
    success: '#e8f5e9',
    warning: '#fff8e1',
    danger:  '#fce4ec',
    info:    '#e3f2fd',
  }[severity] || '#f5f5f5');

  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="admin-notif-wrap" ref={dropdownRef}>
      {/* Bell Button — same 40px box as collapse / avatar controls */}
      <button
        type="button"
        className="admin-notif-btn"
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <i className="bx bx-bell" aria-hidden="true" />
        {unread > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: 10, padding: '2px 5px', lineHeight: 1.2 }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow"
          style={{
            position: 'absolute', right: 0, top: '110%',
            width: 320, maxHeight: 420, overflowY: 'auto',
            zIndex: 9999, borderRadius: 12, padding: 0,
          }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <span className="fw-semibold fs-14">Notifications</span>
            {notifications.length > 0 && (
              <button className="btn btn-sm btn-link text-danger p-0" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bx bx-bell-off fs-32 d-block mb-1 opacity-25"></i>
              No notifications yet
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                className="px-3 py-2 border-bottom"
                style={{ background: bgColor(n.severity) }}
              >
                <div className="fw-semibold fs-13">{n.title}</div>
                <div className="text-muted fs-12">{n.message}</div>
                <div className="text-muted fs-11 mt-1">{timeAgo(n.timestamp)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
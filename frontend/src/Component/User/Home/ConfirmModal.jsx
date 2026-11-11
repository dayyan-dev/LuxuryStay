import React from 'react';

/**
 * Reusable confirm dialog — matches the booking success modal style.
 * Usage:
 *   const [confirmModal, setConfirmModal] = useState({ show: false });
 *   setConfirmModal({
 *     show: true,
 *     title: 'Cancel Booking?',
 *     message: 'Are you sure you want to cancel this booking?',
 *     confirmText: 'Yes, Cancel',
 *     onConfirm: () => { ...do thing...; setConfirmModal({ show: false }); }
 *   });
 */
const ConfirmModal = ({ show, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm, onClose }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%',
          textAlign: 'center', padding: '40px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          fontFamily: "'Jost', sans-serif",
        }}
      >
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: danger ? '#CC5B55' : 'var(--theme-primary-gradient, var(--theme-primary, #1B365D))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 28, color: '#fff', fontWeight: 700,
          }}
        >
          {danger ? '!' : '?'}
        </div>

        <h4 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--theme-text-dark, #0F172A)' }}>{title}</h4>
        <p style={{ color: 'var(--theme-text-secondary, #475569)', marginBottom: 28, lineHeight: 1.6, fontSize: 14 }}>{message}</p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'transparent', color: 'var(--theme-text-secondary, #475569)',
              border: '1px solid var(--theme-border, #E2E8F0)', borderRadius: 50, padding: '12px',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: danger ? '#CC5B55' : 'var(--theme-primary-gradient, var(--theme-primary, #1B365D))',
              color: '#fff', border: 'none', borderRadius: 50, padding: '12px',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
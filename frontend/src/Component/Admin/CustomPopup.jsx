import { useEffect } from 'react';

const TYPES = {
  success: {
    bar:    '#0ab39c',
    icon:   '✅',
    iconBg: '#e6f9f6',
    titleColor: '#0a3d35',
    btnBg:  '#0ab39c',
    btnText:'#fff',
    label:  'Success!',
  },
  error: {
    bar:    '#f06548',
    icon:   '❌',
    iconBg: '#fdecea',
    titleColor: '#7a1c0d',
    btnBg:  '#f06548',
    btnText:'#fff',
    label:  'Error!',
  },
  warning: {
    bar:    '#f7b84b',
    icon:   '⚠️',
    iconBg: '#fff8e6',
    titleColor: '#7a4f00',
    btnBg:  '#f7b84b',
    btnText:'#4a2e00',
    label:  'Warning!',
  },
  confirm: {
    bar:    '#405189',
    icon:   '🗑️',
    iconBg: '#eef0f9',
    titleColor: '#1e2a5e',
    btnBg:  '#f06548',
    btnText:'#fff',
    label:  'Confirm Delete',
  },
};

const CustomPopup = ({ type = 'success', message, onClose, onConfirm }) => {
  const t = TYPES[type] || TYPES.success;

  useEffect(() => {
    if (type !== 'confirm') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(15,20,40,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  };
  const box = {
    background: '#fff', borderRadius: 14,
    width: 400, maxWidth: '90vw',
    overflow: 'hidden',
    animation: 'popIn 0.2s ease',
  };
  const inner  = { padding: '22px 24px 20px' };
  const head   = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 };
  const icon   = { width: 40, height: 40, borderRadius: '50%', background: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 };
  const title  = { fontSize: 15, fontWeight: 700, margin: 0, color: t.titleColor };
  const msg    = { fontSize: 13, color: '#6c7080', margin: '0 0 18px', lineHeight: 1.55 };
  const foot   = { display: 'flex', justifyContent: 'flex-end', gap: 8 };
  const btnOk  = { padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: t.btnBg, color: t.btnText };
  const btnCan = { padding: '7px 16px', borderRadius: 8, border: '1.5px solid #e0e3ef', background: '#fff', color: '#6c7080', fontSize: 13, fontWeight: 600, cursor: 'pointer' };

  return (
    <>
      <style>{`@keyframes popIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      <div style={overlay} onClick={type !== 'confirm' ? onClose : undefined}>
        <div style={box} onClick={e => e.stopPropagation()}>
          <div style={{ height: 4, background: t.bar }} />
          <div style={inner}>
            <div style={head}>
              <div style={icon}>{t.icon}</div>
              <p style={title}>{t.label}</p>
            </div>
            <p style={msg}>{message}</p>
            <div style={foot}>
              {type === 'confirm' && (
                <button style={btnCan} onClick={onClose}>Cancel</button>
              )}
              <button style={btnOk} onClick={type === 'confirm' ? onConfirm : onClose}>
                {type === 'confirm' ? 'Yes, Delete' : 'OK, Got it'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomPopup;
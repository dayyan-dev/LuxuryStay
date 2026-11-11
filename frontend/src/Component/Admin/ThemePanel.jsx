// src/Component/Admin/ThemePanel.jsx
// Floating theme customization panel — changes primary/secondary colors
// LIVE across the whole site via CSS variables. Presets + custom hex / named color pickers
// + dark mode toggle + reset. Saved to localStorage.
import { useState, useEffect } from 'react';
import { useTheme, THEME_PRESETS, DEFAULTS } from '../../Context/ThemeContext';
import './ThemePanel.css';

// Helper to convert named color (e.g., 'gold', 'crimson', 'navy', 'teal')
// or bare hex ('a58d72') to standard #rrggbb hex string
function resolveToHex(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim().toLowerCase();

  // 1. Direct hex with #
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) {
    return str.length === 4
      ? '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]
      : str;
  }
  // 2. Direct hex without #
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) {
    const full = str.length === 3 ? str[0] + str[0] + str[1] + str[1] + str[2] + str[2] : str;
    return '#' + full;
  }

  // 3. CSS Named color via browser canvas context
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#010203'; // non-default baseline
    ctx.fillStyle = str;
    const computed = ctx.fillStyle;
    if (computed && computed !== '#010203') {
      return computed;
    }
    if (str === 'black') return '#000000';
  } catch {
    /* ignore */
  }
  return null;
}

const QUICK_COLORS = [
  { name: 'Teal (Default)', hex: '#0D9488' },
  { name: 'Soft Teal', hex: '#14B8A6' },
  { name: 'Regal Navy', hex: '#1B365D' },
  { name: 'Sapphire Blue', hex: '#2563EB' },
  { name: 'Crisp White', hex: '#FFFFFF' },
  { name: 'Royal Gold', hex: '#D4AF37' },
  { name: 'Emerald', hex: '#2E8B57' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Warm Taupe', hex: '#A58D72' },
];

export default function ThemePanel() {
  const [open, setOpen] = useState(false);
  const {
    primary, secondary, mode,
    setPrimary, setSecondary, toggleMode, reset, applyPreset,
  } = useTheme();

  const [pInput, setPInput] = useState(primary);
  const [sInput, setSInput] = useState(secondary);

  useEffect(() => {
    setPInput(primary);
  }, [primary]);

  useEffect(() => {
    setSInput(secondary);
  }, [secondary]);

  const handleInputChange = (type, val) => {
    if (type === 'primary') {
      setPInput(val);
      const hex = resolveToHex(val);
      if (hex) setPrimary(hex);
    } else {
      setSInput(val);
      const hex = resolveToHex(val);
      if (hex) setSecondary(hex);
    }
  };

  return (
    <>
      {/* Floating launcher trigger — positioned on the LEFT side */}
      <button
        type="button"
        className="tp-fab tp-fab-left"
        onClick={() => setOpen((o) => !o)}
        title="Customize Theme & Palette (Theme Studio)"
        aria-label="Customize Theme"
        aria-expanded={open}
      >
        <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-palette'}></i>
        <span className="tp-fab-tooltip">Theme Studio</span>
      </button>

      {/* Floating Studio Panel — opens from the LEFT side */}
      <div className={`tp-panel tp-panel-left ${open ? 'tp-open' : ''}`}>
        <div className="tp-header">
          <div className="d-flex align-items-center gap-2">
            <span className="tp-header-badge">
              <i className="fa-solid fa-palette"></i>
            </span>
            <div>
              <h6 className="mb-0">Theme Studio</h6>
              <small className="tp-header-sub">Luxury Hospitality Tokens</small>
            </div>
          </div>
          <button
            type="button"
            className="tp-close"
            onClick={() => setOpen(false)}
            aria-label="Close Studio"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="tp-body">
          {/* Preset Palettes */}
          <div className="tp-section">
            <label className="tp-label">
              <i className="fa-solid fa-swatchbook me-1"></i> Signature Palettes
            </label>
            <div className="tp-presets-list">
              {THEME_PRESETS.map((p) => {
                const isActive =
                  primary.toLowerCase() === p.primary.toLowerCase() &&
                  secondary.toLowerCase() === p.secondary.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    className={`tp-preset-card ${isActive ? 'tp-active' : ''}`}
                    onClick={() => applyPreset(p)}
                    title={`Apply ${p.name}`}
                  >
                    <span
                      className="tp-preset-swatch"
                      style={{
                        background: `linear-gradient(135deg, ${p.primary} 50%, ${p.secondary} 50%)`,
                      }}
                    />
                    <span className="tp-preset-title">{p.name}</span>
                    {isActive && <i className="fa-solid fa-check ms-auto text-success fs-12"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers, Hex & Named Color Input */}
          <div className="tp-section">
            <label className="tp-label">
              <i className="fa-solid fa-sliders me-1"></i> Custom Brand Colors (Hex or Name)
            </label>
            <div className="tp-colors-grid">
              {/* Primary Color */}
              <div className="tp-color-box">
                <span className="tp-color-label">Primary Brand</span>
                <div className="tp-input-group">
                  <input
                    type="color"
                    className="tp-color-picker"
                    value={primary.length === 7 ? primary : DEFAULTS.primary}
                    onChange={(e) => {
                      setPrimary(e.target.value);
                      setPInput(e.target.value);
                    }}
                    title="Choose primary brand color"
                  />
                  <input
                    type="text"
                    className="tp-hex-input"
                    value={pInput}
                    onChange={(e) => handleInputChange('primary', e.target.value)}
                    placeholder="#1B365D or navy, gold, teal"
                    title="Enter Hex code (#1B365D) or named color (navy, gold, crimson, teal)"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="tp-color-box">
                <span className="tp-color-label">Secondary Accent</span>
                <div className="tp-input-group">
                  <input
                    type="color"
                    className="tp-color-picker"
                    value={secondary.length === 7 ? secondary : DEFAULTS.secondary}
                    onChange={(e) => {
                      setSecondary(e.target.value);
                      setSInput(e.target.value);
                    }}
                    title="Choose secondary accent color"
                  />
                  <input
                    type="text"
                    className="tp-hex-input"
                    value={sInput}
                    onChange={(e) => handleInputChange('secondary', e.target.value)}
                    placeholder="#2563EB or white, slate"
                    title="Enter Hex code (#2563EB) or named color"
                  />
                </div>
              </div>
            </div>

            {/* Quick Color Shortcuts */}
            <div className="mt-2">
              <small className="text-muted d-block mb-1" style={{ fontSize: '11px' }}>
                Quick Named Shades:
              </small>
              <div className="d-flex flex-wrap gap-1">
                {QUICK_COLORS.map((qc) => (
                  <button
                    key={qc.name}
                    type="button"
                    className="btn btn-sm py-0 px-2"
                    style={{
                      fontSize: '11px',
                      borderRadius: '4px',
                      background: 'rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.12)',
                      color: 'var(--theme-text-dark, #0F172A)',
                    }}
                    onClick={() => {
                      setPrimary(qc.hex);
                      setPInput(qc.hex);
                    }}
                    title={`Set Primary to ${qc.name} (${qc.hex})`}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: qc.hex,
                        marginRight: '4px',
                      }}
                    />
                    {qc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls: Mode & Reset */}
          <div className="tp-actions">
            <button
              type="button"
              className="tp-btn tp-btn-mode"
              onClick={toggleMode}
            >
              <i className={`fa-solid ${mode === 'dark' ? 'fa-sun text-warning' : 'fa-moon'}`}></i>
              <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              type="button"
              className="tp-btn tp-btn-reset"
              onClick={() => {
                reset();
                setPInput(DEFAULTS.primary);
                setSInput(DEFAULTS.secondary);
              }}
              title="Reset to default Luxury Teal & Crisp White"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Reset</span>
            </button>
          </div>

          <div className="tp-footer-hint">
            <i className="fa-solid fa-bolt text-warning me-1"></i>
            Live CSS variables applied globally &amp; saved to local browser.
          </div>
        </div>
      </div>
    </>
  );
}

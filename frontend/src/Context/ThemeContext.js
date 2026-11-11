// src/Context/ThemeContext.js
// Centralized Variable-based theme system for LuxuryStay Hospitality
// Default Palette: Luxury Teal (#0D9488) & Crisp White Luxury Hospitality Design System
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'luxurystay-theme';
const THEME_VERSION_KEY = 'luxurystay-theme-v5-teal-default';

export const THEME_PRESETS = [
  { name: 'Luxury Teal & Crisp White (Default)', primary: '#0D9488', secondary: '#14B8A6' },
  { name: 'Regal Navy & Crisp White',           primary: '#1B365D', secondary: '#2563EB' },
  { name: 'Deep Midnight Navy & Ice Blue',      primary: '#0F294A', secondary: '#38BDF8' },
  { name: 'Warm Taupe & Ivory',                 primary: '#A58D72', secondary: '#C5AD91' },
  { name: 'Royal Gold & Champagne',             primary: '#B89B62', secondary: '#D9C59A' },
  { name: 'Emerald Luxe & Mint',                 primary: '#166534', secondary: '#4ADE80' },
  { name: 'Sapphire Ocean & Silver',             primary: '#1E40AF', secondary: '#94A3B8' },
  { name: 'Burgundy Velvet & Rose',              primary: '#831843', secondary: '#F472B6' },
  { name: 'Midnight Charcoal & Slate',          primary: '#1E293B', secondary: '#64748B' },
];

export const DEFAULTS = {
  primary: '#0D9488',    // Luxury Teal (by default across full website & dashboard)
  secondary: '#14B8A6',  // Soft Teal Accent
  mode: 'light',         // 'light' | 'dark'
  isCustom: false,
};

const ThemeContext = createContext(null);

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 13, g: 148, b: 136 };
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (isNaN(n)) return { r: 13, g: 148, b: 136 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function shade(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const f = v => Math.max(0, Math.min(255, Math.round(v + (pct < 0 ? v * pct : (255 - v) * pct))));
  return `#${[f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// ITU-R BT.709 perceived luminance
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Dynamic contrast text: pure white on dark backgrounds, deep slate on light backgrounds
export function getContrastColor(hex) {
  return getLuminance(hex) > 0.45 ? '#0F172A' : '#FFFFFF';
}

export function applyTheme({ primary, secondary, mode }) {
  const root = document.documentElement;
  const p = primary || DEFAULTS.primary;
  const s = secondary || DEFAULTS.secondary;
  const pRgb = hexToRgb(p);
  const sRgb = hexToRgb(s);

  const onPrimary = getContrastColor(p);
  const onSecondary = getContrastColor(s);

  // 1. Core Design Tokens (Navy + White architecture)
  root.style.setProperty('--theme-primary', p);
  root.style.setProperty('--theme-primary-hover', shade(p, -0.15));
  root.style.setProperty('--theme-primary-soft', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.14)`);
  root.style.setProperty('--theme-primary-rgb', `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty('--theme-primary-gradient', `linear-gradient(135deg, ${p} 0%, ${shade(p, -0.22)} 100%)`);

  root.style.setProperty('--theme-secondary', s);
  root.style.setProperty('--theme-secondary-light', shade(s, 0.16));
  root.style.setProperty('--theme-secondary-dark', shade(s, -0.16));
  root.style.setProperty('--theme-secondary-soft', `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.14)`);
  root.style.setProperty('--theme-secondary-rgb', `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
  root.style.setProperty('--theme-secondary-gradient', `linear-gradient(135deg, ${s} 0%, ${shade(s, -0.22)} 100%)`);

  // Dynamic High-Contrast Tokens
  root.style.setProperty('--theme-on-primary', onPrimary);
  root.style.setProperty('--theme-on-secondary', onSecondary);
  root.style.setProperty('--theme-primary-text', onPrimary);
  root.style.setProperty('--theme-secondary-text', onSecondary);
  root.style.setProperty('--btn-primary-text', onPrimary);
  root.style.setProperty('--btn-secondary-text', onSecondary);

  // 2. Compatibility & Legacy Mappings (Overrides all hardcoded gold/taupe)
  root.style.setProperty('--ls-gold', p);
  root.style.setProperty('--ls-gold-hover', shade(p, -0.15));
  root.style.setProperty('--ls-gold-light', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.14)`);
  root.style.setProperty('--ls-gold-gradient', `linear-gradient(135deg, ${p} 0%, ${shade(p, -0.22)} 100%)`);
  root.style.setProperty('--ls-brand', p);
  root.style.setProperty('--ls-accent', s);

  root.style.setProperty('--lx-gold', p);
  root.style.setProperty('--lx-brand', p);
  root.style.setProperty('--theme-btn-primary', p);
  root.style.setProperty('--theme-link', p);

  // Bootstrap 5 Global Variables Override
  root.style.setProperty('--bs-primary', p);
  root.style.setProperty('--bs-primary-rgb', `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty('--bs-secondary', s);
  root.style.setProperty('--bs-secondary-rgb', `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
  root.style.setProperty('--bs-themecolor', p);
  root.style.setProperty('--bs-themecolor-rgb', `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty('--bs-themehovercolor', shade(p, -0.15));
  root.style.setProperty('--bs-link-color', p);
  root.style.setProperty('--bs-link-color-rgb', `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty('--bs-link-hover-color', shade(p, -0.15));

  root.style.setProperty('--color-primary', p);
  root.style.setProperty('--color-secondary', s);
  root.style.setProperty('--color-accent', p);
  root.style.setProperty('--color-accent-light', s);
  root.style.setProperty('--color-accent-dark', shade(p, -0.15));
  root.style.setProperty('--color-accent-gradient', `linear-gradient(135deg, ${p} 0%, ${shade(p, -0.22)} 100%)`);
  root.style.setProperty('--brand-primary', p);
  root.style.setProperty('--brand-secondary', s);

  // 3. Dark / Light Mode attribute
  root.setAttribute('data-theme', mode || 'light');
}

export function loadSavedTheme() {
  try {
    const v = localStorage.getItem(THEME_VERSION_KEY);
    if (!v) {
      // First boot or upgrade to Teal default: activate Teal #0D9488
      localStorage.setItem(THEME_VERSION_KEY, 'v5');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
      return DEFAULTS;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.primary && saved.secondary && saved.isCustom) {
      return { ...DEFAULTS, ...saved };
    }
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadSavedTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const value = {
    ...theme,
    setPrimary: primary => setTheme(t => ({ ...t, primary, isCustom: true })),
    setSecondary: secondary => setTheme(t => ({ ...t, secondary, isCustom: true })),
    toggleMode: () => setTheme(t => ({ ...t, mode: t.mode === 'light' ? 'dark' : 'light' })),
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      setTheme(DEFAULTS);
    },
    applyPreset: p => setTheme(t => ({ ...t, primary: p.primary, secondary: p.secondary, isCustom: true })),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

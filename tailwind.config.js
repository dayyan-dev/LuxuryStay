// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    // Add additional paths as needed
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2744',
          light: '#1E3A5F',
          dark: '#0B1220',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E0B93D',
          dark: '#A8861D', // optional darker for hover/focus
        },
        status: {
          available: '#16A34A',
          occupied: '#DC2626',
          reserved: '#F59E0B',
          cleaning: '#2563EB',
          maintenance: '#6B7280',
          ready: '#0D9488',
        },
        background: {
          DEFAULT: '#F8F9FB',
          dark: '#0B1220',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#131C2E',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#243049',
        },
        text: {
          primary: {
            DEFAULT: '#111827',
            dark: '#F3F4F6',
          },
          muted: {
            DEFAULT: '#6B7280',
            dark: '#9CA3AF',
          },
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        modal: '16px',
      },
      spacing: {
        1: '4px', // 4px grid step
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        modal: '0 10px 30px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        /* Rosa: acento secundario de la marca (sustituye al teal anterior). */
        accent: {
          DEFAULT: 'rgb(var(--color-pink) / <alpha-value>)',
          50: '#fdf2f8',
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        /* Pantalla de la calculadora: fija, no cambia entre tema claro/oscuro. */
        screen: 'rgb(var(--color-screen) / <alpha-value>)',
        danger: '#f43f5e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 2px 8px rgb(15 23 42 / 0.06)',
        'soft-lg': '0 4px 10px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.10)',
        'soft-xl': '0 8px 16px rgb(15 23 42 / 0.08), 0 16px 40px rgb(15 23 42 / 0.14)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translate(-50%, 12px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'fade-slide-up': 'fade-slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-in': 'toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
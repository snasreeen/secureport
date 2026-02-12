/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0f0f',
        surface: '#111717',
        accent: '#00ff88',
        accentHover: '#00cc66',
        danger: '#FF3B3B',
        textPrimary: '#e6fef2',
        textSecondary: '#9db3a6',
      },
      boxShadow: {
        'glow-soft': '0 0 20px rgba(0, 255, 136, 0.2)',
        'glow-strong': '0 0 32px rgba(0, 255, 136, 0.35)',
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shake': 'shake 300ms ease-in-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
};


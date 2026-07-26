/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0F172A',
          800: '#111c33',
          700: '#1E293B',
        },
        neon: '#22C55E',
        danger: '#EF4444',
      },
      boxShadow: {
        'glow-green': '0 0 40px -8px rgba(34,197,94,0.5)',
        'glow-red': '0 0 40px -8px rgba(239,68,68,0.55)',
        'glow-amber': '0 0 40px -8px rgba(245,158,11,0.5)',
        'glow-cyan': '0 0 40px -8px rgba(34,211,238,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'scan': 'scan 3.5s ease-in-out infinite',
        'float': 'float 7s ease-in-out infinite',
        'spin-slow': 'spin 1.4s linear infinite',
        'ticker': 'ticker 18s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%,100%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.9' },
          '90%': { transform: 'translateY(2400%)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

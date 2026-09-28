/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f3ff', 100: '#e0e6ff', 200: '#c5ceff', 300: '#a5b3ff', 400: '#8599ff', 500: '#6980f5', 600: '#5368da', 700: '#4354b2', 800: '#37458a', 900: '#303b6d' },
        dark: { 50: '#46506a', 100: '#313b53', 200: '#252d43', 300: '#171e30', 400: '#121829', 500: '#0e1423', 600: '#0c1120', 700: '#090d19', 800: '#070a13', 900: '#05070d' },
        accent: { blue: '#8ba8ff', cyan: '#80c9e8', emerald: '#47c6a4', rose: '#f286a3', amber: '#f4bd83', neon: '#a9b7ff', purple: '#b29dff', pink: '#f2a2c5' },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        bounceSoft: { '0%': { transform: 'scale(0.95)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

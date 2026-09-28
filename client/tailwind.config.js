/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#edfcf9', 100: '#d4f7ef', 200: '#a9eadb', 300: '#76dbc6', 400: '#46c9ad', 500: '#20b397', 600: '#12947d', 700: '#107765', 800: '#115e52', 900: '#124e45' },
        dark: { 50: '#33435b', 100: '#26364d', 200: '#1d2b40', 300: '#111e31', 400: '#0e192a', 500: '#0b1626', 600: '#091321', 700: '#07101c', 800: '#050b15', 900: '#03070e' },
        accent: { blue: '#71aaff', cyan: '#60decf', emerald: '#24c79a', rose: '#ff758e', amber: '#f1bd6b', neon: '#67e0d0', purple: '#9c91ff', pink: '#ff8eb1' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'DM Sans', 'sans-serif'],
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

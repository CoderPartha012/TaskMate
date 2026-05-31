/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        noir: {
          900: '#07070B',
          800: '#0A0A0F',
          700: '#13131A',
          600: '#1C1C28',
        },
        jade: {
          DEFAULT: '#00C896',
          light:   '#33D4A8',
          dark:    '#00A07A',
        },
        priority: {
          high:   '#FF4757',
          medium: '#FFA502',
          low:    '#00C896',
        },
        category: {
          work:     '#5382ED',
          personal: '#AF52DE',
          urgent:   '#FF4757',
          other:    '#9CA3AF',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-out': 'slideOut 0.2s ease-in',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(100%)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
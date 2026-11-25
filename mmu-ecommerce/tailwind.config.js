/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '400px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        henna: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4dcad',
          300: '#ecc47a',
          400: '#e3a645',
          500: '#d4832a',
          600: '#c06720',
          700: '#a04e1c',
          800: '#833f1e',
          900: '#6c341b',
          950: '#3d1a0c',
        },
        earth: {
          50:  '#f9f6f2',
          100: '#f0e9de',
          200: '#dfd0bb',
          300: '#c8b091',
          400: '#b18e6b',
          500: '#9e7651',
          600: '#876045',
          700: '#6e4c38',
          800: '#5b3f31',
          900: '#4c352b',
          950: '#281b16',
        },
        forest: {
          500: '#3d6b4f',
          600: '#2e5440',
          700: '#1e3d2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'carousel': 'carousel 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        carousel: {
          '0%': { transform: 'translateX(8px)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

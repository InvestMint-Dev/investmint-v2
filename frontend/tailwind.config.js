/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#e8f5ee',
          100: '#c8e6d4',
          200: '#a3d4b7',
          300: '#6fc09a',
          400: '#3aad7a',
          500: '#0d9b5c',
          600: '#0a7a48',
          700: '#075c36',
          800: '#044024',
          900: '#022413',
        },
        gray: {
          50: '#f7f9f8',
          100: '#eef2f0',
          200: '#dce3df',
          300: '#b8c4bd',
          400: '#8d9e95',
          500: '#64756c',
          600: '#4a5750',
          700: '#343d38',
          800: '#1f2723',
          900: '#111111',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        green: '0 4px 14px rgba(13, 155, 92, 0.15)',
        'green-lg': '0 8px 24px rgba(13, 155, 92, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

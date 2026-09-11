/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f2f6fa', 100: '#e3eaf3', 600: '#173b66', 700: '#102e52', 800: '#0b2545', 900: '#0b1f3a' },
        civic: { 500: '#0e9f6e', 600: '#087f5b' }
      },
      boxShadow: { soft: '0 10px 35px rgba(11, 31, 58, 0.08)' }
    }
  },
  plugins: []
}

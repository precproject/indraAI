/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: '#2c1810',
        bark: '#5c3317',
        mud: '#8b5e3c',
        wheat: { light: '#fdf8f0', DEFAULT: '#d4a853' },
        leaf: { light: '#d4edda', DEFAULT: '#4a9e4a', dark: '#2d6a2d' },
      },
      fontFamily: {
        sans: ['"Baloo 2"', 'sans-serif'],
        marathi: ['"Tiro Devanagari Marathi"', 'serif'],
      }
    },
  },
  plugins: [],
}
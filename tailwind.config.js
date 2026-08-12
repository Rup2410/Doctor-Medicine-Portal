/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medred: {
          50: '#fdecec',
          100: '#f9d5d5',
          200: '#f4b0b0',
          500: '#e53935',
          600: '#c62828',
          700: '#a61b1b',
          800: '#851414',
          900: '#691212',
        },
        slate: {
          850: '#172033',
          900: '#111827',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

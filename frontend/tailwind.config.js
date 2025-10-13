/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d97706',
          dark: '#b45309',
          light: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}

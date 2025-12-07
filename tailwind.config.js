/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 這行一定要有且路徑正確
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
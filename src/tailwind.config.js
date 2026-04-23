/** @type {import('tailwindcss').Config} */
export default {
content: [
  "index.html",
  "./src/**/*.{js,ts,jsx,tsx,html}",
],
  theme: {
    
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5FB3E6',
          dark: '#3B9DD9',
          light: '#87C7EC',
        },
        accent: {
          green: '#4CAF50',
          orange: '#FF9800',
          red: '#F44336',
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
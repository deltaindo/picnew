/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        dark: {
          bg: '#1a2332',
          bg2: '#233347',
          bg3: '#2d3e52',
          text: '#8fa3b8',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

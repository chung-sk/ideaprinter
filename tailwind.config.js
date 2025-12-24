/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'printer-beige': '#F5E6D3',
        'printer-brown': '#8B4513',
        'printer-green': '#00FF00',
        'paper-white': '#FFFEF7',
      },
      fontFamily: {
        'mono-retro': ['Courier New', 'monospace'],
        'dot-matrix': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

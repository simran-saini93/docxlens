/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  safelist: [
    // Dynamic opacity variants used in code
    'bg-blue-700/10',
    'bg-blue-700/5',
    'border-blue-700/30',
    'border-blue-700/50',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Figtree', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
        heading: ['Outfit', 'sans-serif'],
        brand:   ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'blue-700': '#1d4ed8',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        border: '#2A2A2A',
        primary: '#3B82F6',
        auto: '#EF4444',
        transition: '#F59E0B',
        teleop: '#22C55E',
        'text-primary': '#F5F5F5',
        'text-secondary': '#9CA3AF',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: "#0A0F1E",
        surface: "#111827",
        "surface-light": "#1E293B",
        border: "#1E293B",
        primary: "#3B82F6",
        auto: "#EF4444",
        transition: "#F59E0B",
        teleop: "#22C55E",
        "text-primary": "#F5F5F5",
        "text-secondary": "#9CA3AF",
        accent: {
          green: "#10B981",
          blue: "#3B82F6",
          yellow: "#F59E0B",
          purple: "#8B5CF6",
        },
      },
    },
  },
  plugins: [],
};

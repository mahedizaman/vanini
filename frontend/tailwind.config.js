/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./store/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#111111", light: "#333333" },
        accent: { DEFAULT: "#E63946", hover: "#C1121F" },
        neutral: { 50: "#F8F8F8", 100: "#F0F0F0", 800: "#2D2D2D" },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};

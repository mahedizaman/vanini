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
        primary: { DEFAULT: "#3D2B1F", light: "#5A3A24" },
        accent: { DEFAULT: "#FF6347", hover: "#E5533D" },
        neutral: { 50: "#F8F8F8", 100: "#F0F0F0", 800: "#2D2D2D" },
      },
      fontFamily: {
        // utilities: font-roboto, font-poppins, font-montserrat
        roboto: ["var(--font-roboto)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "system-ui", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        // defaults used by Tailwind's font-sans & font-display
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

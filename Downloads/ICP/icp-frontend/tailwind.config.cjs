/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"], // Clean SaaS font
      },
      colors: {
        brand: {
          DEFAULT: "#6C5CE7", // main accent
          soft: "#EAE5FF", // backgrounds, tags
          dark: "#3A2E6E", // headings
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(20,20,43,0.06)", // matches SaaS cards
      },
      borderRadius: {
        xl: "1rem", // slightly softer corners for panels
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

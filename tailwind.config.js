// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}" // in case of future src dir
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(220, 90%, 56%)",
        secondary: "hsl(210, 15%, 30%)"
      }
    }
  },
  plugins: []
};

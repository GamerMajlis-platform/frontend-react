/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        alice: ["Alice-Regular", "Helvetica", "sans-serif"],
        scheherazade: ["Scheherazade New", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dark: "#0b132b",
        "dark-secondary": "#1e293b",
        primary: "#6fffe9",
        "primary-hover": "#5ee6d3",
        text: "#ffffff",
        "text-secondary": "#94a3b8",
      },
    },
  },
  plugins: [],
};

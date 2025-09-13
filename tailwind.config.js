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

        // Enhanced Palette Colors
        "rich-black": "#0B132B",
        "dark-gunmetal": "#1C2541",
        independence: "#3A506B",
        "tiffany-blue": "#5BC0BE",
        aquamarine: "#6FFFE9",

        // Secondary palette
        "persian-green": "#07BEB8",
        turquoise: "#3DCCC7",
        "medium-turquoise": "#68D8D6",
        "powder-blue": "#9CEAEF",
        "light-cyan": "#C4FFF9",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

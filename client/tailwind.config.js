/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f0f0f",
        panel: "#171717",
        border: "#262626",
        muted: "#737373",
        "muted-light": "#a3a3a3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        bubble: "0 1px 2px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        field: {
          base: "#020c1b",
          surface: "#071428",
          green: "#00e676",
          "green-dim": "rgba(0,230,118,0.12)",
          cyan: "#00e5ff",
          amber: "#ffd54f",
          text: "#c8d8f0",
          muted: "#4a6080",
        },
      },
      fontFamily: {
        display: ["Barlow Condensed", "sans-serif"],
        body: ["Outfit", "sans-serif"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(0,230,118,0.5)" },
          "70%": { boxShadow: "0 0 0 10px rgba(0,230,118,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,230,118,0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

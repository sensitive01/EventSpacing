import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf7fd",
          100: "#f5eff8",
          200: "#ebd8f4",
          300: "#dbb9eb",
          400: "#c38fde",
          500: "#8e2b9f",
          600: "#701a82",
          700: "#5a136b",
          800: "#431050",
          900: "#2b0d38",
          950: "#1b0724",
        },
        gold: {
          50: "#fdfbf6",
          100: "#faeed9",
          200: "#f5dcaf",
          300: "#ecc47d",
          400: "#e5b14f",
          500: "#d49b2c",
          600: "#be811f",
          700: "#98601b",
          800: "#7a4c1b",
          900: "#643f1b",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(43, 13, 56, 0.07), 0 4px 6px -2px rgba(43, 13, 56, 0.03)",
        card: "0 10px 25px -5px rgba(43, 13, 56, 0.08), 0 8px 10px -6px rgba(43, 13, 56, 0.04)",
        hover: "0 20px 30px -10px rgba(43, 13, 56, 0.15), 0 10px 10px -5px rgba(43, 13, 56, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030711",
          900: "#070d1f",
          850: "#0a142e",
          800: "#0d1a3a",
          700: "#11265a",
          600: "#1a3a8c",
          500: "#2c52c4",
          400: "#4f7cf0",
          300: "#7fa2ff",
        },
        accent: {
          cyan: "#22d3ee",
          electric: "#3b82f6",
          glow: "#60a5fa",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "spin-slow": "spin 18s linear infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(79, 124, 240, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 124, 240, 0.07) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(59, 130, 246, 0.25), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(59, 130, 246, 0.35)",
        "glow-lg": "0 0 60px rgba(59, 130, 246, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme — near-black ink (#030407) + electric blue (#1558cb) +
        // lime accent (#d4ff24). Standard dark ramp: low numbers = darkest
        // surfaces (page background), high numbers = light text/headings.
        navy: {
          950: "#030407", // page background (near-black)
          900: "#070a12", // raised background
          850: "#0b0f1a",
          800: "#121a2b", // cards / surfaces
          700: "#202c44", // borders / dividers
          600: "#304162", // strong border / muted accent
          500: "#1558cb", // brand blue
          400: "#4a84e6", // links / accent text
          300: "#cfe0fb", // light headings / eyebrow text
        },
        // Primary text color (replaces white) — near-white, cool.
        ink: {
          DEFAULT: "#eef3fc",
          soft: "#c2cfe6",
          mute: "#8fa0bd",
        },
        accent: {
          cyan: "#d4ff24", // lime — vivid secondary accent / highlights
          electric: "#1558cb", // brand blue
          glow: "#2f6fe0", // lighter blue for glows / particles
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
          "linear-gradient(rgba(21, 88, 203, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(21, 88, 203, 0.10) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(21, 88, 203, 0.22), transparent 60%)",
      },
      boxShadow: {
        glow: "0 18px 40px -12px rgba(21, 88, 203, 0.45)",
        "glow-lg": "0 30px 70px -16px rgba(21, 88, 203, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;

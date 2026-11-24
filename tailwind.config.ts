import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep-ocean-blue + white light theme.
        // The `navy` ramp is intentionally INVERTED vs a dark theme: high
        // numbers are near-white surfaces, low numbers are deep ocean ink.
        // This lets the site's existing `bg-navy-900`, `border-navy-700`,
        // `text-navy-300` classes read correctly on a light background.
        navy: {
          950: "#f4f8ff", // page background
          900: "#eaf2ff", // raised background
          850: "#e2ecfe",
          800: "#d7e6fc", // cards / surfaces
          700: "#b8cff3", // borders / dividers
          600: "#6c90d8", // strong border / muted accent
          500: "#2f5ec9", // brand
          400: "#1e4fa8", // links / accent text
          300: "#0a2f6b", // deep ocean headings / eyebrow text
        },
        // Deep-ocean "ink" used as the primary text color (replaces white).
        // Darkened `soft`/`mute` so secondary text reads clearly on the light
        // page instead of looking washed out.
        ink: {
          DEFAULT: "#0a2540",
          soft: "#2b4668",
          mute: "#425a79",
        },
        accent: {
          cyan: "#0e7490", // deep teal — readable on white
          electric: "#1d4ed8",
          glow: "#2563eb",
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
          "linear-gradient(rgba(13, 71, 161, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 71, 161, 0.06) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(37, 99, 235, 0.14), transparent 60%)",
      },
      boxShadow: {
        glow: "0 18px 40px -12px rgba(37, 99, 235, 0.28)",
        "glow-lg": "0 30px 70px -16px rgba(37, 99, 235, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

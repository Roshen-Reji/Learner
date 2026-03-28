import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B1B3D", // Deep Navy Blue
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#0B1B3D",
          950: "#00112C", // Ultra deep navy
        },
        secondary: {
          DEFAULT: "#0D9488", // Deep Teal
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          mint: "#A7F3D0", // Soft Mint Green
        },
        accent: {
          DEFAULT: "#00F2FE", // Neon Cyan
          cyan: "#00F2FE",
          emerald: "#059669",
          lavender: "#C4B5FD",
        },
        surface: {
          light: "rgb(var(--surface-light) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
          dark: "#121212", 
          "card-dark": "#1A1A1A",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          "primary-dark": "#FAFAFA",
          "secondary-dark": "#BCCCDC",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          dark: "#2A2A2A",
        },
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B",
        gamify: {
          red: "#EF4444",
          black: "#111827",
          gold: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "bounce-soft": "bounceSoft 0.6s ease-out",
        "streak-glow": "streakGlow 2s infinite",
        "heartbeat": "heartbeat 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        streakGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(239,68,68,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(239,68,68,0.6)" },
        },
        heartbeat: {
          "0%": { strokeDashoffset: "2000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

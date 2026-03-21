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
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },
        secondary: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        surface: {
          light: "#F9FAFB",
          card: "#FFFFFF",
          dark: "#111827",
          "card-dark": "#1F2937",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          "primary-dark": "#E5E7EB",
          "secondary-dark": "#9CA3AF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#374151",
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

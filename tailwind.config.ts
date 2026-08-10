import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base surfaces — charcoal gradient, not flat black
        ink: {
          950: "#0B0B0D",
          900: "#131316",
          800: "#1A1A1F",
          700: "#232329",
          600: "#2E2E36",
          500: "#3D3D47"
        },
        // Signature mustard, sampled from the Lellahi logo
        mustard: {
          50: "#FEFAE8",
          100: "#FDF2C2",
          200: "#FCE68A",
          300: "#FBD84F",
          400: "#FCCF04", // exact logo tone
          500: "#E0B400",
          600: "#B88F00",
          700: "#8C6D00"
        },
        line: "rgba(255,255,255,0.08)",
        glass: "rgba(255,255,255,0.045)"
      },
      fontFamily: {
        sans: ["var(--font-vazir)", "Vazirmatn", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      backdropBlur: { xs: "2px" },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.45)",
        "glow-mustard": "0 0 0 1px rgba(252,207,4,0.25), 0 0 24px rgba(252,207,4,0.15)"
      },
      keyframes: {
        "dot-pulse": {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "dot-pulse": "dot-pulse 1.1s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;

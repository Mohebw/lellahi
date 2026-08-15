import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Static dark tone — used ONLY where a color must stay dark regardless of
        // theme (e.g. text on a mustard button). Not theme-aware on purpose.
        ink: {
          950: "#0B0B0D",
          900: "#131316",
          800: "#1A1A1F",
          700: "#232329",
          600: "#2E2E36",
          500: "#3D3D47"
        },
        // Theme-aware page/panel background — flips between charcoal (dark theme)
        // and cream/white (light theme) via CSS variables set in globals.css.
        surface: {
          950: "rgb(var(--surface-950) / <alpha-value>)",
          900: "rgb(var(--surface-900) / <alpha-value>)",
          800: "rgb(var(--surface-800) / <alpha-value>)",
          700: "rgb(var(--surface-700) / <alpha-value>)"
        },
        // Theme-aware foreground: white text on dark theme, near-black on light theme.
        // Overriding Tailwind's built-in "white" means every existing text-white,
        // border-white/10, bg-white/5 usage automatically becomes theme-correct.
        white: "rgb(var(--fg) / <alpha-value>)",
        // Signature mustard, sampled from the Lellahi logo — same in both themes.
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
        line: "rgb(var(--fg) / 0.1)",
        glass: "rgb(var(--fg) / 0.05)"
      },
      fontFamily: {
        sans: ["var(--font-vazir)", "Vazirmatn", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      backdropBlur: { xs: "2px" },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        glass: "0 8px 32px 0 rgb(var(--shadow-tint) / 0.35)",
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

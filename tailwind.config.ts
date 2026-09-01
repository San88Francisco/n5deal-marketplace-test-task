import type { Config } from "tailwindcss";

/**
 * Visual language borrowed from n5deal.com: a dark navy chrome, restrained
 * type, and a single warm accent used sparingly for verification and value.
 * Deliberately not a default Tailwind palette — a marketplace for regulated
 * financial assets should read as institutional, not as a SaaS template.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070d1a",
          900: "#0b1425",
          800: "#132038",
          700: "#1c2f4f",
          600: "#2a4269",
          500: "#3d5b88",
        },
        accent: {
          50: "#fbf7ee",
          100: "#f4ead2",
          300: "#dcc286",
          500: "#c1994a",
          600: "#a67c33",
          700: "#835f26",
        },
        ink: {
          900: "#111823",
          700: "#2f3a4a",
          500: "#5c6879",
          300: "#94a0b1",
          200: "#c8d0da",
          100: "#e4e8ee",
          50: "#f4f6f9",
        },
        positive: { 50: "#eef7f1", 500: "#1f7a4d", 700: "#155c39" },
        caution: { 50: "#fdf4e7", 500: "#b3711a", 700: "#8a5613" },
        critical: { 50: "#fdeeee", 500: "#b3261e", 700: "#8c1d17" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 35, 0.06), 0 8px 24px -12px rgba(17, 24, 35, 0.18)",
        lift: "0 2px 4px rgba(17, 24, 35, 0.08), 0 16px 40px -16px rgba(17, 24, 35, 0.28)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;

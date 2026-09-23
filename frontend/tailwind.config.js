/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // These map to CSS custom properties in src/index.css, which flip
        // between the light and dark palette. The rgb(var(...) / <alpha-value>)
        // form is what lets classes like bg-accent/10 or border-teal/30 work.
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-ink": "rgb(var(--accent-ink) / <alpha-value>)",
        teal: "rgb(var(--teal) / <alpha-value>)",
        low: "rgb(var(--low) / <alpha-value>)",
        moderate: "rgb(var(--moderate) / <alpha-value>)",
        high: "rgb(var(--high) / <alpha-value>)",
        critical: "rgb(var(--critical) / <alpha-value>)",
      },
      fontFamily: {
        // No Google Fonts import on purpose (keeps the app usable the moment
        // it loads on a slow connection) - this is just the device's own serif.
        display: ["Georgia", "Iowan Old Style", "Noto Serif", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 24, 18, 0.04), 0 10px 24px -16px rgba(30, 24, 18, 0.25)",
      },
    },
  },
  plugins: [],
};

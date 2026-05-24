import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          muted: "rgb(var(--c-muted) / <alpha-value>)",
          faint: "rgb(var(--c-faint) / <alpha-value>)",
          bg: "rgb(var(--c-bg) / <alpha-value>)",
          surface: "rgb(var(--c-surface) / <alpha-value>)",
          elevated: "rgb(var(--c-elevated) / <alpha-value>)",
          page: "rgb(var(--c-page) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          muted: "rgb(var(--c-accent) / 0.12)",
        },
      },
      borderColor: {
        notion: "var(--border-notion)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
    },
  },
  plugins: [],
};

export default config;

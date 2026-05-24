import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          DEFAULT: "#37352f",
          muted: "#787774",
          faint: "#9b9a97",
          bg: "#ffffff",
          surface: "#f7f6f3",
          page: "#fafaf9",
        },
        accent: {
          DEFAULT: "#2563eb",
          muted: "#eff6ff",
        },
      },
      borderColor: {
        notion: "rgba(55, 53, 47, 0.09)",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(55, 53, 47, 0.04), 0 4px 12px rgba(55, 53, 47, 0.03)",
      },
    },
  },
  plugins: [],
};

export default config;

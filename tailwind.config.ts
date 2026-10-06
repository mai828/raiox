import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./config/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        wine: "var(--wine)",
        "wine-dark": "var(--wine-dark)",
        "wine-soft": "var(--wine-soft)",
        line: "var(--line)",
        gold: "var(--gold-muted)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { question: "720px", insight: "760px", result: "1040px" },
      boxShadow: { soft: "0 1px 2px rgba(42,34,41,.05), 0 10px 30px rgba(42,34,41,.06)" },
    },
  },
  plugins: [],
};
export default config;

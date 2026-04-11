import type { Config } from "tailwindcss";

export default {
  darkMode: ["selector", 'html[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel)",
        "panel-deep": "var(--panel-deep)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "border-highlight": "var(--border-highlight)",
        "border-shadow": "var(--border-shadow)",
        "retro-raised-t": "var(--retro-raised-t)",
        "retro-raised-l": "var(--retro-raised-l)",
        "retro-raised-b": "var(--retro-raised-b)",
        "retro-raised-r": "var(--retro-raised-r)",
        "retro-inset-t": "var(--retro-inset-t)",
        "retro-inset-l": "var(--retro-inset-l)",
        "retro-inset-b": "var(--retro-inset-b)",
        "retro-inset-r": "var(--retro-inset-r)",
      },
    },
  },
  plugins: [],
} satisfies Config;

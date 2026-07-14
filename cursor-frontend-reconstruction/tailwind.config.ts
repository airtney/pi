import type { Config } from "tailwindcss";

/**
 * Design tokens extracted from cursor.com's compiled CSS
 * (_artifacts/css/*.css). Theme colors resolve through CSS custom
 * properties defined in app/globals.css so that light/dark schemes work,
 * matching the site's `bg-theme-*` / `text-theme-*` utility naming.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "var(--color-theme-bg)",
          fg: "var(--color-theme-fg)",
          text: "var(--color-theme-text)",
          "text-sec": "var(--color-theme-text-sec)",
          "text-mid": "var(--color-theme-text-mid)",
          "text-tertiary": "var(--color-theme-text-tertiary)",
          "text-ter": "var(--color-theme-text-tertiary)",
          accent: "var(--color-theme-accent)",
          border: "var(--color-theme-border)",
          "border-01": "var(--color-theme-border-01)",
          "border-02": "var(--color-theme-border-02)",
          "border-03": "var(--color-theme-border-03)",
          card: "var(--color-theme-card-hex)",
          "card-02": "var(--color-theme-card-02-hex)",
          "card-03": "var(--color-theme-card-03-hex)",
          "product-syntax-string": "var(--color-theme-product-syntax-string)",
          "product-syntax-keyword": "var(--color-theme-product-syntax-keyword)",
          "product-syntax-function": "var(--color-theme-product-syntax-function)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
      fontSize: {
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-tight)", letterSpacing: "var(--tracking-2xl)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-2xsnug)", letterSpacing: "var(--tracking-xl)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-xsnug)", letterSpacing: "var(--tracking-lg)" }],
        md: ["var(--text-md)", { lineHeight: "var(--leading-snug-plus)", letterSpacing: "var(--tracking-md)" }],
        "md-lg": ["var(--text-md-lg)", { lineHeight: "var(--leading-snug)", letterSpacing: "var(--tracking-md-lg)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-normal)", letterSpacing: "var(--tracking-base)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)", letterSpacing: "var(--tracking-sm)" }],
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)", letterSpacing: "var(--tracking-sm)" }],
      },
      spacing: {
        g1: "var(--spacing-g1)",
        g2: "var(--spacing-g2)",
        g3: "var(--spacing-g3)",
        v1: "var(--spacing-v1)",
        v2: "var(--spacing-v2)",
        v3: "var(--spacing-v3)",
        v4: "var(--spacing-v4)",
      },
      borderRadius: {
        "2xs": "var(--radius-2xs)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      screens: {
        xs: "420px",
        sm: "660px",
        md: "900px",
        lg: "1140px",
        xl: "1380px",
        "2xl": "1470px",
      },
    },
  },
  plugins: [],
};

export default config;

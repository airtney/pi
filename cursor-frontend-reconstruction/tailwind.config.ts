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
          "fg-10": "var(--color-theme-fg-10)",
          text: "var(--color-theme-text)",
          "text-sec": "var(--color-theme-text-sec)",
          "text-mid": "var(--color-theme-text-mid)",
          "text-tertiary": "var(--color-theme-text-tertiary)",
          "text-ter": "var(--color-theme-text-tertiary)",
          "text-pri": "var(--color-theme-text-pri)",
          accent: "var(--color-theme-accent)",
          primary: "var(--color-theme-primary)",
          border: "var(--color-theme-border)",
          "border-01": "var(--color-theme-border-01)",
          "border-02": "var(--color-theme-border-02)",
          "border-03": "var(--color-theme-border-03)",
          "bg-hover": "var(--color-theme-bg-hover)",
          "bg-muted": "var(--color-theme-bg-muted)",
          "bg-01": "var(--color-theme-bg-01)",
          card: "var(--color-theme-card-hex)",
          "card-02": "var(--color-theme-card-02-hex)",
          "card-03": "var(--color-theme-card-03-hex)",
          "card-hex": "var(--color-theme-card-hex)",
          "card-01-hex": "var(--color-theme-card-01-hex)",
          "card-02-hex": "var(--color-theme-card-02-hex)",
          "card-03-hex": "var(--color-theme-card-03-hex)",
          "card-04-hex": "var(--color-theme-card-04-hex)",
          "card-hover-hex": "var(--color-theme-card-hover-hex)",
          "product-chrome": "var(--color-theme-product-chrome)",
          "product-editor": "var(--color-theme-product-editor)",
          "product-ansi-green": "var(--color-theme-product-ansi-green)",
          "product-ansi-red": "var(--color-theme-product-ansi-red)",
          "product-text-sec": "var(--color-theme-product-text-sec)",
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
        "0.75": "0.1875rem",
        "1.25": "0.3125rem",
        "g0.25": "calc(var(--g) * 0.25)",
        "g0.5": "calc(var(--g) * 0.5)",
        "g0.75": "calc(var(--g) * 0.75)",
        g1: "var(--spacing-g1)",
        "g1.5": "var(--spacing-g1-5)",
        "g1.75": "var(--spacing-g1-75)",
        g2: "var(--spacing-g2)",
        g3: "var(--spacing-g3)",
        v1: "var(--spacing-v1)",
        v2: "var(--spacing-v2)",
        v3: "var(--spacing-v3)",
        v4: "var(--spacing-v4)",
      },
      zIndex: {
        "1": "1",
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

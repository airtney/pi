import type { Metadata } from "next";
import "./globals.css";
import "./marketing-spacing.css";
import "./product-theme.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cursor: AI coding agent",
  description: "Built to make you extraordinarily productive, Cursor is the best AI coding agent.",
  icons: {
    // cursor.com serves favicon.svg for dark scheme, favicon-light.svg for light
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
    ],
  },
  openGraph: {
    title: "Cursor: AI coding agent",
    description: "Built to make you extraordinarily productive, Cursor is the best AI coding agent.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // cursor.com sets `data-theme` on <html> via next-themes (attribute
  // "data-theme", defaultTheme "system", storageKey "theme") and mirrors the
  // resolved theme to `style.colorScheme`. This static replica has no theme
  // switcher, so the dark theme is pinned at render time.
  return (
    <html lang="en-US" data-os="mac" data-theme="dark" style={{ colorScheme: "dark" }}>
      <body className="bg-theme-bg text-theme-text min-h-screen pt-[var(--site-header-height)]">
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

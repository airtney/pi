import type { Metadata } from "next";
import "./globals.css";
import "./marketing-spacing.css";
import "./product-theme.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/lib/theme";

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
  // cursor.com sets `data-theme` on <html> via next-themes, reconstructed in
  // lib/theme.tsx (module 956347). The live bootstrap script runs with
  // attribute "data-theme", storageKey "marketing-theme", defaultTheme
  // "system", themes ["light","dark"], enableSystem and enableColorScheme —
  // the provider defaults except for the storage key. The blocking inline
  // script it injects sets the attribute before first paint, so <html> needs
  // suppressHydrationWarning.
  return (
    <html lang="en-US" data-os="mac" suppressHydrationWarning>
      <body className="bg-theme-bg text-theme-text min-h-screen pt-[var(--site-header-height)]">
        <ThemeProvider attribute="data-theme" defaultTheme="system" storageKey="marketing-theme">
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

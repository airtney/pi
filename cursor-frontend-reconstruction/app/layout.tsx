import type { Metadata } from "next";
import "./globals.css";
import "./marketing-spacing.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cursor: AI coding agent",
  description: "Built to make you extraordinarily productive, Cursor is the best AI coding agent.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Cursor: AI coding agent",
    description: "Built to make you extraordinarily productive, Cursor is the best AI coding agent.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" data-os="mac">
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

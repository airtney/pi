"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { CursorLogo } from "@/components/CursorLogo";

/**
 * Site header, reconstructed from the SSR nav markup on cursor.com.
 * Fixed to the top, height `--site-header-height`. Contains the brand mark,
 * primary navigation with two dropdown menus (Product / Resources), and the
 * sign-in + download CTAs on the right.
 */

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

const PRODUCT_MENU: NavItem[] = [
  { label: "Agents", href: "/product" },
  { label: "Cloud", href: "/cloud" },
  { label: "CLI", href: "/cli" },
  { label: "Mobile", href: "/mobile" },
  { label: "Automations", href: "/automate" },
  { label: "Review", href: "/bugbot" },
  { label: "Tab", href: "/tab" },
  { label: "Marketplace", href: "https://cursor.com/marketplace", external: true },
  { label: "Enterprise", href: "/enterprise" },
];

const RESOURCES_MENU: NavItem[] = [
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
  { label: "Community", href: "/community" },
  { label: "Help", href: "https://cursor.com/help", external: true },
  { label: "Workshops", href: "/workshops" },
  { label: "Forum", href: "https://forum.cursor.com/", external: true },
  { label: "Careers", href: "/careers" },
];

function NavMenu({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" className="nav__btn" aria-expanded={open}>
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full min-w-[200px] pt-2">
          <div className="card stack gap-y-1 p-2">
            {items.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav__btn justify-start"
                >
                  {item.label} <span aria-hidden="true">&#8599;</span>
                </a>
              ) : (
                <Link key={item.label} href={item.href} className="nav__btn justify-start">
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-theme-border bg-theme-bg/80 backdrop-blur"
      style={{ height: "var(--site-header-height)" }}
    >
      <div className="container flex h-full items-center justify-between gap-g2">
        <div className="flex items-center gap-g2">
          <Link href="/home" aria-label="Cursor" className="flex items-center text-theme-text">
            <CursorLogo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <NavMenu label="Product" items={PRODUCT_MENU} />
            <Link href="/pricing" className="nav__btn">
              Pricing
            </Link>
            <NavMenu label="Resources" items={RESOURCES_MENU} />
          </nav>
        </div>

        <div className="hidden items-center gap-g1 lg:flex">
          <Link href="/dashboard" className="nav__btn">
            Sign in
          </Link>
          <Link href="/contact-sales?source=navbar" className="nav__btn">
            Contact sales
          </Link>
          <Link href="/download" className="btn btn--secondary text-sm">
            Download
          </Link>
        </div>

        <button
          type="button"
          className="nav__btn lg:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span aria-hidden="true">{mobileOpen ? "\u2715" : "\u2630"}</span>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-theme-border bg-theme-bg lg:hidden">
          <div className="container stack gap-y-1 py-4">
            {[...PRODUCT_MENU, { label: "Pricing", href: "/pricing" }, ...RESOURCES_MENU].map(
              (item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn("nav__btn justify-start")}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link href="/download" className="btn btn--secondary mt-2 justify-center">
              Download
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

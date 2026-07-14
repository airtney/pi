import Link from "next/link";
import { CursorLogo } from "@/components/CursorLogo";

/**
 * Footer, reconstructed from the SSR footer markup (link groups Product /
 * Resources / Company / Legal / Connect, plus the Anysphere + SOC 2 line).
 */

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Agents", href: "/product" },
      { label: "Teams", href: "/business/teams" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pricing", href: "/pricing" },
      { label: "Code Review", href: "/bugbot" },
      { label: "Tab", href: "/tab" },
      { label: "CLI", href: "/cli" },
      { label: "Cloud Agents", href: "/agents" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Learn", href: "https://cursor.com/learn", external: true },
      { label: "Workshops", href: "/workshops" },
      { label: "Status", href: "https://status.cursor.com/", external: true },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Students", href: "/students" },
      { label: "Brand", href: "/brand" },
      { label: "Future", href: "/future" },
      { label: "Anysphere", href: "https://anysphere.inc/", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Data Use", href: "/data-use" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X", href: "https://x.com/cursor_ai", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/cursorai", external: true },
      { label: "YouTube", href: "https://www.youtube.com/@cursor_ai", external: true },
      { label: "Forum", href: "https://forum.cursor.com/", external: true },
    ],
  },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = "link-arrow type-sm";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label} <span aria-hidden="true">&#8599;</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-theme-border bg-theme-bg text-theme-text">
      <div className="container py-v2">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <Link href="/home" aria-label="Cursor" className="text-theme-text">
              <CursorLogo className="w-[90px]" />
            </Link>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="stack gap-y-2">
              <span className="type-sm text-theme-text-tertiary">{col.title}</span>
              {col.links.map((link) => (
                <FooterAnchor key={link.label} link={link} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-theme-border pt-6 type-xs text-theme-text-tertiary md:flex-row md:items-center md:justify-between">
          <a
            href="https://anysphere.inc"
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow"
          >
            &copy; {new Date().getFullYear()} Anysphere, Inc.
          </a>
          <Link href="/security" className="link-arrow">
            SOC 2 Certified
          </Link>
        </div>
      </div>
    </footer>
  );
}

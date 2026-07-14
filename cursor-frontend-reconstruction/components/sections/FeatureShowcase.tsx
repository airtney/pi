import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared layout for the four homepage feature sections:
 *   "Agents turn ideas into code", "Works autonomously, runs in parallel",
 *   "In every tool, at every step", "Automate repetitive work".
 * A heading + description + "Learn about..." link sits above a framed demo.
 */
export function FeatureShowcase({
  eyebrow,
  title,
  description,
  linkLabel,
  linkHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  children: ReactNode;
}) {
  return (
    <section className="section bg-theme-bg text-theme-text">
      <div className="container">
        <div className="max-w-2xl">
          {eyebrow && <p className="type-sm text-theme-text-tertiary">{eyebrow}</p>}
          <h2 className="type-lg text-balance">{title}</h2>
          <p className="mt-4 type-md text-theme-text-sec text-balance">{description}</p>
          <Link href={linkHref} className="link-arrow mt-4 inline-flex type-base">
            {linkLabel} <span aria-hidden="true">&nbsp;&#8594;</span>
          </Link>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

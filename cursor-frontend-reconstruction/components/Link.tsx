import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Link wrapper standing in for the compiled Link (module 297166) and the
 * CTA-tracking link (module 413676). Absolute URLs render as plain anchors
 * with the site's `↗` new-tab convention; internal paths use `next/link`.
 * The original fires analytics on click (`ctaTracking`); that is a no-op here.
 */
export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
  openInNewTab?: boolean;
}

function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("//");
}

export function Link({ href, children, openInNewTab, ...rest }: LinkProps) {
  const external = isAbsoluteUrl(href);
  if (external || openInNewTab) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}

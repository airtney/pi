import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  getFlexAlignment,
  getMarginAlignment,
  getTextAlignment,
  type Alignment,
} from "@/lib/button";
import { getTextSize, type HeadingLevel, type TextSize } from "@/lib/typography";
import { hasValidLink, type SiteLink } from "@/lib/links";
import { Actions, type CtaItem } from "@/components/Button";
import type { IconName } from "@/components/Icons";
import { Link } from "@/components/Link";
import { SemanticHeading } from "@/components/SemanticHeading";

/**
 * Section headline block (banner / eyebrow / title / body / CTA) reconstructed
 * from module 329329. React Compiler `useMemoCache` scaffolding removed; the
 * class-string composition (including the original's incidental double spaces
 * from `${textAlign} ${marginAlign}` when the margin class is empty) is kept
 * verbatim so the output matches the SSR markup byte for byte.
 */

interface SectionBanner extends SiteLink {
  actionLabel?: string;
}

/** Shorthand CTA shape accepted alongside full `CtaItem`s (see normalizeCta). */
export interface SimpleCta {
  href: string;
  label?: string;
  external?: boolean;
  variant?: CtaItem["variant"];
  icon?: IconName;
}

export type SectionCta = CtaItem | SimpleCta;

export interface SectionHeadlineProps {
  banner?: SectionBanner;
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleClassName?: string;
  body?: ReactNode;
  textSize?: TextSize;
  alignment?: Alignment;
  cta?: SectionCta | SectionCta[];
  semanticLevel?: HeadingLevel;
  isSolo?: boolean;
  containerClassName?: string;
  children?: ReactNode;
  mobileFullWidthCta?: boolean;
}

function normalizeCta(cta?: SectionCta | SectionCta[]): CtaItem[] | undefined {
  if (!cta) return undefined;
  const items = Array.isArray(cta) ? cta : [cta];
  if (items.length === 0) return undefined;
  const first = items[0];
  if (first && "link" in first) return items as CtaItem[];
  return items.map((item, index) =>
    item && "href" in item && typeof item.href === "string" && !("link" in item)
      ? {
          key: `cta-${index}`,
          link: {
            linkType: "href",
            href: item.href,
            label: item.label,
            openInNewTab: item.external,
          },
          variant: item.variant || "primary",
          icon: item.icon,
        }
      : (item as CtaItem),
  );
}

function isTertiaryVariant(item: CtaItem): boolean {
  return item.variant === "tertiary" || item.variant === "quaternary";
}

export function SectionHeadline({
  banner,
  eyebrow,
  title,
  titleClassName,
  body,
  textSize,
  alignment,
  cta,
  semanticLevel,
  isSolo,
  containerClassName,
  children,
  mobileFullWidthCta,
}: SectionHeadlineProps) {
  const normalizedCta = normalizeCta(cta);

  const textSizeClass = getTextSize(textSize || "lg");
  const textAlign = getTextAlignment(alignment || "left");
  const marginAlign = getMarginAlignment(alignment || "left");
  const hasTertiaryCta = normalizedCta?.some(isTertiaryVariant);
  const bodyContent = body || children;

  const isTitleOnly = title && !bodyContent && (!normalizedCta || normalizedCta.length === 0);
  const size = textSize || "lg";
  const isWide = size !== "md";
  const proseWidthClass = isTitleOnly
    ? "max-w-prose-narrow"
    : isWide
      ? "max-w-prose-medium-wide"
      : "max-w-prose";

  const containerClasses = (() => {
    if (containerClassName) return containerClassName;
    if (isSolo) return size === "md" ? "max-w-prose" : "max-w-prose-medium-wide";
    return {
      "mb-v2.5 max-w-prose-medium-wide": size !== "md",
      "mb-v2":
        size === "md" &&
        ((normalizedCta && normalizedCta.length > 0) || (title && bodyContent)),
      "mb-v1":
        size === "md" && (!normalizedCta || normalizedCta.length === 0) && title && !bodyContent,
      "mb-v6/12":
        size === "md" && hasTertiaryCta && (!normalizedCta || normalizedCta.length === 0),
      [proseWidthClass]: size === "md",
    };
  })();

  const wrapperClass = cn(`${textAlign} ${marginAlign}`, containerClasses);

  const bannerNode = banner && hasValidLink(banner) && (
    <Link href={banner.href ?? "#"} className="btn btn--banner btn--sm mb-v8/12">
      {banner.label && banner.label}
      {banner.label && banner.actionLabel && <span> &middot; </span>}
      {banner.actionLabel && (
        <span className="text-theme-accent">{banner.actionLabel + " →"}</span>
      )}
    </Link>
  );

  const eyebrowNode = eyebrow && (
    <small className="type-base text-theme-text-sec mb-v2/12 block">{eyebrow}</small>
  );

  const titleNode = title && (
    <SemanticHeading
      className={cn(`${titleClassName || textSizeClass} text-balance ${marginAlign}`, {
        "mb-v1": normalizedCta && normalizedCta.length > 0 && !body && !hasTertiaryCta,
        "mb-v8/12": hasTertiaryCta && !body,
      })}
      semanticLevel={semanticLevel || "h2"}
    >
      {title}
    </SemanticHeading>
  );

  const bodyNode = bodyContent && (
    <div
      className={cn(`flex ${getFlexAlignment(alignment)}`, {
        "mb-v1": normalizedCta && normalizedCta.length > 0 && !hasTertiaryCta,
        "mb-v8/12": hasTertiaryCta,
      })}
    >
      <div className={`${textSizeClass} text-theme-text-sec stack text-balance`}>
        {children ?? (typeof body === "string" ? <p>{body}</p> : body)}
      </div>
    </div>
  );

  const actionsNode = normalizedCta && normalizedCta.length > 0 && (
    <Actions
      cta={normalizedCta}
      alignment={alignment}
      mobileFullWidth={mobileFullWidthCta}
      className={banner || eyebrow || title || bodyContent ? undefined : "mt-v2.5"}
    />
  );

  return (
    <div className={wrapperClass}>
      {bannerNode}
      {eyebrowNode}
      {titleNode}
      {bodyNode}
      {actionsNode}
    </div>
  );
}

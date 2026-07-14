"use client";

import type { ReactNode } from "react";
import { Fragment, useState } from "react";
import { cn } from "@/lib/cn";
import { getButtonAlignment, getButtonVariant } from "@/lib/button";
import type { Alignment, ButtonSize, ButtonVariant } from "@/lib/button";
import { getIcon } from "@/components/Icons";
import type { IconName } from "@/components/Icons";
import { Link } from "@/components/Link";
import { ContextualDownloadButton } from "@/components/ContextualDownloadButton";

/**
 * Reconstruction of module 634408:
 *   SyntaxHighlightedShellCommand, Actions, Button, ButtonBlock.
 * React Compiler `useMemoCache` scaffolding has been removed in favour of
 * plain JSX; behaviour and class names are preserved.
 */

export interface ButtonLink {
  label?: string;
  href: string;
  openInNewTab?: boolean;
  linkType?: string;
}

export interface CtaTracking {
  eventName?: string;
  eventProperties?: { key: string; value: string }[];
}

export interface CtaItem {
  key?: string;
  link?: ButtonLink;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  component?: ReactNode;
  downloadButton?: boolean;
  copyButton?: boolean;
  mobileLabel?: string;
  mobileHref?: string;
  mobileTracking?: CtaTracking;
  tracking?: CtaTracking;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

const SHELL_KEYWORDS =
  /^(curl|bash|sh|zsh|wget|npm|npx|pnpm|yarn|brew|apt|pip|python|node|irm|iex)\b/;

export function SyntaxHighlightedShellCommand({ command }: { command: string }) {
  const parts: ReactNode[] = [];
  let rest = command;
  let key = 0;

  while (rest.length > 0) {
    const pipe = rest.match(/^(\s*\|\s*)/);
    if (pipe) {
      parts.push(
        <span key={key++} className="text-theme-text-ter">
          {pipe[1]}
        </span>,
      );
      rest = rest.slice(pipe[1].length);
      continue;
    }
    const url = rest.match(/^(https?:\/\/[^\s'"]+)/);
    if (url) {
      parts.push(
        <span key={key++} className="text-theme-product-syntax-string">
          {url[1]}
        </span>,
      );
      rest = rest.slice(url[1].length);
      continue;
    }
    const flag = rest.match(/^(\s)(-{1,2}[a-zA-Z][a-zA-Z0-9-]*)/);
    if (flag) {
      parts.push(
        <span key={key++}>
          {flag[1]}
          <span className="text-theme-product-syntax-keyword">{flag[2]}</span>
        </span>,
      );
      rest = rest.slice(flag[0].length);
      continue;
    }
    const fn = rest.match(SHELL_KEYWORDS);
    if (fn) {
      parts.push(
        <span key={key++} className="text-theme-product-syntax-function">
          {fn[1]}
        </span>,
      );
      rest = rest.slice(fn[1].length);
      continue;
    }
    const space = rest.match(/^(\s+)/);
    if (space) {
      parts.push(<span key={key++}>{space[1]}</span>);
      rest = rest.slice(space[1].length);
      continue;
    }
    parts.push(<span key={key++}>{rest[0]}</span>);
    rest = rest.slice(1);
  }

  return <Fragment>{parts}</Fragment>;
}

export interface ButtonProps {
  link?: ButtonLink;
  className?: string;
  icon?: IconName;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ctaTracking?: CtaTracking;
}

export function Button({ link, className = "btn", icon, type, disabled, onClick }: ButtonProps) {
  if (type) {
    return (
      <button type={type} disabled={disabled} className={className} onClick={onClick}>
        {link?.label}
        {icon && (
          <div aria-hidden="true" className="btn-icon">
            {getIcon(icon)}
          </div>
        )}
      </button>
    );
  }

  const hasContent = link?.label || icon;
  if (!hasContent) return null;

  return (
    <Link
      href={link?.href ?? "#"}
      className={className}
      openInNewTab={link?.openInNewTab}
      onClick={onClick}
      download={link?.linkType === "file" || undefined}
    >
      {link?.label}
      {icon && (
        <div aria-hidden="true" className="btn-icon">
          {getIcon(icon)}
        </div>
      )}
    </Link>
  );
}

function CopyButton({ command, children }: { command: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--secondary font-mono"
      onClick={() => {
        navigator.clipboard?.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {children}
      <span aria-hidden="true" className="btn-icon">
        {copied ? "\u2713" : "\u2398"}
      </span>
    </button>
  );
}

export interface ActionsProps {
  alignment?: Alignment;
  cta?: CtaItem[];
  className?: string;
  mobileFullWidth?: boolean;
}

export function Actions({ alignment = "left", cta, className, mobileFullWidth }: ActionsProps) {
  const wrapClass = cn(
    "flex",
    getButtonAlignment(alignment),
    "gap-x-g1 items-center",
    mobileFullWidth && "max-md:flex-col max-md:w-full max-md:gap-y-3",
    className,
  );

  const items = cta?.map((item, index) => {
    const key = item.key || String(index);
    let rendered: ReactNode = null;

    if (item.component) {
      rendered = <Fragment key={key}>{item.component}</Fragment>;
    } else if (item.downloadButton) {
      rendered = (
        <ContextualDownloadButton
          key={key}
          variant={getButtonVariant(item.variant, item.size)}
          size={item.size}
          mobileLabel={item.mobileLabel}
          mobileHref={item.mobileHref}
          mobileTracking={item.mobileTracking}
          tracking={item.tracking}
        />
      );
    } else if (item.copyButton) {
      const label = String(item.link?.label || "");
      rendered = (
        <CopyButton key={key} command={label}>
          <SyntaxHighlightedShellCommand command={label} />
        </CopyButton>
      );
    } else if (item.link) {
      rendered = (
        <Button
          key={key}
          link={item.link}
          className={getButtonVariant(item.variant, item.size)}
          icon={item.icon}
          ctaTracking={item.tracking}
        />
      );
    }

    if (item.hideOnMobile) {
      return (
        <div key={`desktop-${key}`} className="hidden md:block">
          {rendered}
        </div>
      );
    }
    if (item.hideOnDesktop) {
      return (
        <div
          key={`mobile-${key}`}
          className={cn(
            "md:hidden",
            mobileFullWidth && "w-full [&_a]:w-full [&_button]:w-full [&>div]:w-full",
          )}
        >
          {rendered}
        </div>
      );
    }
    if (mobileFullWidth) {
      return (
        <div
          key={`fw-${key}`}
          className="max-md:w-full [&_a]:max-md:w-full [&_button]:max-md:w-full [&>div]:max-md:w-full"
        >
          {rendered}
        </div>
      );
    }
    return <Fragment key={key}>{rendered}</Fragment>;
  });

  return <div className={wrapClass}>{items}</div>;
}

export interface ButtonBlockProps {
  href: string;
  className?: string;
  title?: string;
  description?: string;
}

export function ButtonBlock({ href, className, title, description }: ButtonBlockProps) {
  return (
    <Link href={href} className={cn("btn-block card--pagination type-base", className)}>
      {description && <span className="text-theme-text-sec">{description}</span>}
      {title && <span className="text-theme-text">{title}</span>}
    </Link>
  );
}

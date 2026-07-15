import type { HTMLAttributes, ReactNode } from "react";
import type { HeadingLevel } from "@/lib/typography";

/**
 * Semantic heading component reconstructed from module 620487: renders the
 * requested h1–h6 element (default h1) and passes everything else through.
 */
export interface SemanticHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  semanticLevel?: HeadingLevel;
  children?: ReactNode;
  className?: string;
}

export function SemanticHeading({
  semanticLevel,
  children,
  className,
  ...rest
}: SemanticHeadingProps) {
  const Tag = semanticLevel || "h1";
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}

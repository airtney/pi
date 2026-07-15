"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useGT, useMessages } from "@/lib/gt-shim";
import type { HeadingLevel } from "@/lib/typography";
import { CardScroller, CardScrollerItem } from "@/components/CardScroller";
import { useChangelog, type ChangelogEntry } from "@/components/ChangelogProvider";
import { FormattedDate } from "@/components/FormattedDate";
import { Link } from "@/components/Link";
import { SemanticHeading } from "@/components/SemanticHeading";

/**
 * "Changelog" section card row, reconstructed from module 924561 (default
 * export). Entries come from `useChangelog()` (module 359689); dates render
 * through `FormattedDate` (module 756464). React Compiler `useMemoCache`
 * scaffolding has been removed.
 */

function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
  const { title, slug, date, version } = entry;
  const versionLabel = (() => {
    if (!version) return null;
    const trimmed = version.trim();
    return trimmed && /^\d/.test(trimmed) ? trimmed : null;
  })();
  const href = `/changelog/${slug}`;
  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="card flex h-full grow-1 flex-col pb-g2">
        <div className="text-theme-text-mid relative left-[-1px] flex items-center gap-x-(--grid-gap)">
          {versionLabel && <span className="label">{versionLabel}</span>}
          <FormattedDate className="type-base" dateString={date} />
        </div>
        {title && <p className="type-base text-theme-text">{title}</p>}
      </Link>
    </article>
  );
}

export interface ChangelogProps {
  title?: ReactNode;
  titleClassName?: string;
  titleSpacingClassName?: string;
  sectionId?: string;
  useSectionPadding?: boolean;
  semanticLevel?: HeadingLevel;
}

export function Changelog({
  title,
  titleClassName,
  titleSpacingClassName,
  sectionId,
  useSectionPadding,
  semanticLevel = "h2",
}: ChangelogProps) {
  const messages = useMessages();
  const t = useGT();
  const { changelogData } = useChangelog();
  if (!changelogData || changelogData.length === 0) return null;

  const headingClass = titleClassName || "type-md-lg";
  const headingSpacing =
    titleSpacingClassName || (/\btype-md(?:-lg)?\b/.test(headingClass) ? "mb-v1" : "mb-v9/12");
  const paddingClass = useSectionPadding === undefined || useSectionPadding ? "section" : "my-v4.5";

  return (
    <section className={cn("bg-theme-bg text-theme-text", paddingClass)} id={sectionId}>
      <div className="container">
        {title && (
          <SemanticHeading
            className={cn("text-theme-text", headingSpacing, headingClass)}
            semanticLevel={semanticLevel}
          >
            {typeof title === "string" ? messages(title) : title}
          </SemanticHeading>
        )}
        <CardScroller>
          {changelogData.map((entry, index) => (
            <CardScrollerItem key={entry.id} index={index}>
              <ChangelogEntryCard entry={entry} />
            </CardScrollerItem>
          ))}
        </CardScroller>
        <Link href="/changelog" className="btn-text mt-v9/12 inline-flex">
          {t("See what's new in Cursor")} →
        </Link>
      </div>
    </section>
  );
}

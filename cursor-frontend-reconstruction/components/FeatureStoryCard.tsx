import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { hasValidLink, isExternalLink, type SiteLink } from "@/lib/links";
import { stepDownHeadingLevel, type HeadingLevel } from "@/lib/typography";
import { Actions, Button, type CtaItem } from "@/components/Button";
import {
  FeatureMediaContainer,
  type FeatureMediaContainerProps,
} from "@/components/FeatureMediaContainer";
import { Link } from "@/components/Link";
import { SemanticHeading } from "@/components/SemanticHeading";

/**
 * Full-width feature/customer-story card reconstructed from module 503342
 * (also registered as 625857): a `card--large` on the section grid with a
 * text column (title/body/CTA or link/testimonial quote) on one side and a
 * `FeatureMediaContainer` on the other. The two halves are stacked as
 * separate 24-column overlays (`grid-rows-[auto_1fr]` + `row-span-full`) so
 * the media never affects the text row's height on mobile.
 * React Compiler `useMemoCache` scaffolding removed.
 */

export interface StoryTestimonial {
  quote: string;
  name: string;
  jobTitle?: string;
  company?: string;
  avatar?: { src: string; alt?: string };
  post?: { slug?: string };
}

function TestimonialQuote({ testimonial }: { testimonial: StoryTestimonial }) {
  const { quote, name, jobTitle, company, avatar, post } = testimonial;
  return (
    <figure className="mt-v1 border-theme-border-02 pl-g1.5 border-l-2 pb-[2px]">
      <blockquote>
        <p className="type-base text-pretty whitespace-pre-wrap">{quote}</p>
      </blockquote>
      <div className="mt-v1 flex items-center space-x-(--grid-gap)">
        {avatar?.src && (
          <div className="avatar-border-container h-[42px] w-[42px] shrink-0">
            <Image
              src={avatar.src}
              alt={avatar.alt || ""}
              width={42}
              height={42}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <figcaption>
          <div className="type-sm">
            {name}{" "}
            <span className="type-sm text-theme-text-sec block">
              {jobTitle && jobTitle}
              {jobTitle && company && ", "}
              {company && company}
            </span>
          </div>
          {post && (
            <Button
              link={{
                label: "Read Story →",
                linkType: "post",
                href: post.slug ? `/blog/${post.slug}` : "#",
                openInNewTab: false,
              }}
              className="btn-tertiary mt-v1 justify-start"
            />
          )}
        </figcaption>
      </div>
    </figure>
  );
}

interface TextColumnProps {
  title?: ReactNode;
  body?: ReactNode;
  testimonial?: StoryTestimonial;
  link?: SiteLink;
  cta?: CtaItem[];
  ctaSpacingClassName?: string;
  textColumns: string;
  textAlignment: string;
  mediaColumns: string;
  semanticLevel: HeadingLevel;
}

function TextColumn({
  title,
  body,
  testimonial,
  link,
  cta,
  ctaSpacingClassName = "mt-v1",
  textColumns,
  textAlignment,
  mediaColumns,
  semanticLevel,
}: TextColumnProps) {
  const hasCta = !!cta && cta.length > 0;
  return (
    <>
      <div
        className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-3 lg:items-center ${textColumns}`}
      >
        <div className={`w-full max-w-prose ${textAlignment}`}>
          <div className="type-base">
            {title && (
              <SemanticHeading
                className="type-base md:type-md text-pretty"
                semanticLevel={stepDownHeadingLevel(semanticLevel)}
              >
                {title}
              </SemanticHeading>
            )}
            {body && (
              <div className="type-base md:type-md text-theme-text-sec text-pretty">
                {typeof body === "string" ? <p>{body}</p> : body}
              </div>
            )}
          </div>
          {hasCta && (
            <div className={ctaSpacingClassName}>
              <Actions cta={cta} />
            </div>
          )}
          {!hasCta && link && hasValidLink(link) && (
            <div className={cn({ "mt-v8/12": body })}>
              <span className="btn-tertiary">
                {link.label}
                {isExternalLink(link) ? " ↗" : " →"}
              </span>
            </div>
          )}
          {testimonial && <TestimonialQuote testimonial={testimonial} />}
        </div>
      </div>
      <div
        className={`max-lg:mt-g1.75 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-1 lg:row-end-3 lg:items-center ${mediaColumns}`}
      />
    </>
  );
}

interface MediaColumnProps
  extends Pick<
    FeatureMediaContainerProps,
    | "mediaBgColor"
    | "mediaBgHex"
    | "mediaBgHexDark"
    | "mediaPosition"
    | "mediaType"
    | "mediaBg"
    | "media"
    | "mediaImageClassName"
    | "children"
    | "preload"
  > {
  mediaAllowOverflow?: boolean;
  textColumns: string;
  mediaColumns: string;
}

function MediaColumn({
  mediaAllowOverflow,
  textColumns,
  mediaColumns,
  children,
  mediaBg,
  ...mediaProps
}: MediaColumnProps) {
  return (
    <>
      <div
        className={`col-span-full row-start-1 row-end-2 grid lg:row-start-1 lg:row-end-2 lg:items-center ${textColumns}`}
      />
      <div
        className={`max-lg:pt-v1 col-span-full row-start-2 row-end-3 grid cursor-default items-end lg:row-start-2 lg:row-end-3 lg:items-center ${mediaColumns}`}
      >
        <FeatureMediaContainer
          {...mediaProps}
          mediaBg={mediaBg}
          enableWallpaperZoom={mediaBg?.isWallpaper ?? false}
          enableWallpaperBrightness={mediaBg?.isWallpaper ?? false}
          allowOverflow={mediaAllowOverflow ?? false}
        >
          {children}
        </FeatureMediaContainer>
      </div>
    </>
  );
}

const TEXT_COLUMNS: Record<"left" | "right", Record<string, string>> = {
  left: {
    default: "lg:col-start-17 lg:col-end-25 lg:pr-g0.25 lg:pl-g3",
    wide: "lg:col-start-16 lg:col-end-25 lg:pr-g0.25 lg:pl-g2",
    equal: "lg:col-start-13 lg:col-end-25 lg:pr-g0.25 lg:pl-g1.5",
  },
  right: {
    default: "lg:col-start-1 lg:col-end-9 lg:pl-g0.25 lg:pr-g3",
    wide: "lg:col-start-1 lg:col-end-10 lg:pl-g0.25 lg:pr-g2",
    equal: "lg:col-start-1 lg:col-end-13 lg:pl-g0.25 lg:pr-g1.5",
  },
};

const MEDIA_COLUMNS: Record<"left" | "right", Record<string, string>> = {
  left: {
    default: "lg:col-start-1 lg:col-end-17",
    wide: "lg:col-start-1 lg:col-end-16",
    equal: "lg:col-start-1 lg:col-end-13",
  },
  right: {
    default: "lg:col-start-9 lg:col-end-25",
    wide: "lg:col-start-10 lg:col-end-25",
    equal: "lg:col-start-13 lg:col-end-25",
  },
};

export interface FeatureStoryCardProps
  extends Pick<
    FeatureMediaContainerProps,
    | "mediaBgColor"
    | "mediaBgHex"
    | "mediaBgHexDark"
    | "mediaPosition"
    | "mediaType"
    | "mediaBg"
    | "media"
    | "mediaImageClassName"
    | "preload"
  > {
  title?: ReactNode;
  body?: ReactNode;
  ctaSpacingClassName?: string;
  sectionId?: string;
  link?: SiteLink;
  cta?: CtaItem[];
  testimonial?: StoryTestimonial;
  mediaSide?: "left" | "right";
  children?: ReactNode;
  mediaAllowOverflow?: boolean;
  semanticLevel?: HeadingLevel;
  splitRatio?: "default" | "wide" | "equal";
  flush?: boolean;
  spacing?: "default" | "compact" | "none";
}

export function FeatureStoryCard({
  title,
  body,
  ctaSpacingClassName,
  sectionId,
  link,
  cta,
  testimonial,
  mediaSide,
  mediaPosition,
  mediaType,
  mediaBgColor,
  mediaBgHex,
  mediaBgHexDark,
  mediaBg,
  media,
  mediaImageClassName,
  children,
  mediaAllowOverflow,
  preload,
  semanticLevel,
  splitRatio = "default",
  flush,
  spacing = "default",
}: FeatureStoryCardProps) {
  const side = mediaSide === "right" ? "right" : "left";
  const textColumns = TEXT_COLUMNS[side][splitRatio ?? "default"];
  const textAlignment = side === "right" ? "lg:justify-self-start" : "lg:justify-self-end";
  const mediaColumns = MEDIA_COLUMNS[side][splitRatio ?? "default"];

  const sectionClass = cn("section", "bg-theme-bg text-theme-text", {
    "section--flush-y": flush,
  });
  const containerClass = cn("container", {
    "mb-v4": spacing === "default",
    "mb-g1": spacing === "compact",
  });

  const textColumn = (
    <TextColumn
      title={title}
      body={body}
      testimonial={testimonial}
      link={link}
      cta={cta}
      ctaSpacingClassName={ctaSpacingClassName}
      textColumns={textColumns}
      textAlignment={textAlignment}
      mediaColumns={mediaColumns}
      semanticLevel={semanticLevel ?? "h2"}
    />
  );

  const textOverlay =
    link && hasValidLink(link) && !cta ? (
      <Link
        href={link.href ?? (link.slug ? `/${link.slug}` : "#")}
        openInNewTab={link.openInNewTab}
        className="card card--large card--feature grid-cursor col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid"
      >
        {textColumn}
      </Link>
    ) : (
      <div className="card card--large grid-cursor col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid">
        {textColumn}
      </div>
    );

  return (
    <section className={sectionClass} id={sectionId}>
      <div className={containerClass}>
        <div className="grid grid-rows-[auto_1fr]">
          {textOverlay}
          <div className="grid-cursor p-g1.75 col-span-full row-span-full gap-y-0 max-lg:grid-rows-subgrid">
            <MediaColumn
              mediaBgColor={mediaBgColor}
              mediaBgHex={mediaBgHex}
              mediaBgHexDark={mediaBgHexDark}
              mediaPosition={mediaPosition}
              mediaType={mediaType}
              mediaBg={mediaBg}
              media={media}
              mediaImageClassName={mediaImageClassName}
              mediaAllowOverflow={mediaAllowOverflow}
              preload={preload ?? false}
              textColumns={textColumns}
              mediaColumns={mediaColumns}
            >
              {children}
            </MediaColumn>
          </div>
        </div>
      </div>
    </section>
  );
}

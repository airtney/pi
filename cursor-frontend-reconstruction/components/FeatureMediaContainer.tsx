"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DemoPlaybackProvider } from "@/lib/demo/DemoPlayback";
import { hasValidLink, type SiteLink } from "@/lib/links";
import { Link } from "@/components/Link";

/**
 * Feature media container reconstructed from module 446295 (default export):
 * the bordered `media-border-container` frame every section demo sits in. It
 * layers an optional themed background color or light/dark background image
 * behind either a static image (`mediaType: "image"`) or an interactive demo
 * (`mediaType: "reactComponent"`, passed as children and wrapped in a
 * `DemoPlaybackProvider` gated on the play-on-hover pointer state).
 * The original's `mediaType: "video"` branch (module 180185 player) is not
 * used on the homepage and is omitted. `useMemoCache` scaffolding removed.
 */

export interface MediaBg {
  src: string;
  darkSrc?: string;
  isWallpaper?: boolean;
}

export interface MediaImage {
  src: string;
  darkSrc?: string;
  alt?: string;
}

export type MediaBgColor =
  | "bg"
  | "card-hex"
  | "card-01-hex"
  | "card-02-hex"
  | "card-03-hex"
  | "card-04-hex"
  | "card-warm-hex"
  | "accent";

export type MediaPosition = "bottomLeft" | "bottomRight" | "bottomCenter" | "center";

export interface FeatureMediaContainerProps {
  mediaBgColor?: MediaBgColor;
  mediaBgHex?: string;
  mediaBgHexDark?: string;
  mediaPosition?: MediaPosition;
  mediaType?: "image" | "reactComponent";
  mediaBg?: MediaBg;
  media?: MediaImage;
  mediaImageClassName?: string;
  children?: ReactNode;
  preload?: boolean;
  wallpaperClassName?: string;
  link?: SiteLink;
  enableWallpaperZoom?: boolean;
  enableWallpaperBrightness?: boolean;
  allowOverflow?: boolean;
  height?: number | string;
  heightMobile?: number | string;
  maxHeightMobile?: string;
  playOnHover?: boolean;
}

function ignoresPlayOnHover(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("[data-ignore-play-on-hover]");
}

export function FeatureMediaContainer({
  mediaBgColor,
  mediaBgHex,
  mediaBgHexDark,
  mediaPosition,
  mediaType,
  mediaBg,
  media,
  mediaImageClassName,
  children,
  preload = false,
  wallpaperClassName,
  link,
  enableWallpaperZoom = false,
  enableWallpaperBrightness = false,
  allowOverflow = false,
  height,
  heightMobile,
  maxHeightMobile,
  playOnHover = false,
}: FeatureMediaContainerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [hasTouched, setHasTouched] = useState(false);

  const hasLayeredHex = !!(mediaBgHex && mediaBgHexDark);
  const hasSolidHex = !!(mediaBgHex && !mediaBgHexDark);
  const isPlaying = !playOnHover || isHovering || hasTouched;

  const containerClass = cn(
    "media-border-container relative grid grid-cols-1 grid-rows-1",
    allowOverflow ? "overflow-hidden xl:overflow-visible" : null,
    wallpaperClassName,
    heightMobile ? "responsive-media-height" : null,
    maxHeightMobile ? "max-h-mobile" : null,
    hasSolidHex || hasLayeredHex
      ? undefined
      : {
          "bg-[image:var(--color-theme-card-03)]": !mediaBgColor,
          "bg-theme-bg": mediaBgColor === "bg",
          "bg-theme-card-hex": mediaBgColor === "card-hex",
          "bg-theme-card-01-hex": mediaBgColor === "card-01-hex",
          "bg-theme-card-02-hex": mediaBgColor === "card-02-hex",
          "bg-theme-card-03-hex": mediaBgColor === "card-03-hex",
          "bg-theme-card-04-hex": mediaBgColor === "card-04-hex",
          "bg-theme-card-warm-hex": mediaBgColor === "card-warm-hex",
          "bg-theme-accent": mediaBgColor === "accent",
        },
  );

  const containerStyle: CSSProperties = {
    ...(hasSolidHex ? { backgroundColor: mediaBgHex } : {}),
    ...(hasLayeredHex
      ? { "--layered-media-bg-light": mediaBgHex, "--layered-media-bg-dark": mediaBgHexDark }
      : {}),
    ...(height && !heightMobile ? { height } : {}),
    ...(heightMobile
      ? { "--layered-media-height": height, "--layered-media-height-mobile": heightMobile }
      : {}),
    ...(maxHeightMobile ? { "--max-h-mobile": maxHeightMobile } : {}),
  } as CSSProperties;

  const wallpaperImageClass = (base: string) =>
    cn(
      base,
      enableWallpaperZoom ? "scale-[1.1] transform" : undefined,
      enableWallpaperBrightness ? "wallpaper-brightness-dark" : undefined,
    );

  const mediaImage = (imageClass?: string) =>
    media?.darkSrc ? (
      <>
        <Image
          src={media.src}
          alt={media.alt || ""}
          width={800}
          height={450}
          className={cn("media-light h-auto w-full", imageClass)}
          priority={preload}
        />
        <Image
          src={media.darkSrc}
          alt={media.alt || ""}
          width={800}
          height={450}
          className={cn("media-dark h-auto w-full", imageClass)}
          priority={preload}
        />
      </>
    ) : media ? (
      <Image
        src={media.src}
        alt={media.alt || ""}
        width={800}
        height={450}
        className={cn("h-auto w-full", imageClass)}
        priority={preload}
      />
    ) : null;

  return (
    <div
      className={containerClass}
      style={containerStyle}
      onPointerEnter={
        playOnHover
          ? (event: ReactPointerEvent) => {
              if (event.pointerType === "mouse" && !ignoresPlayOnHover(event.target)) {
                setIsHovering(true);
              }
            }
          : undefined
      }
      onPointerMove={
        playOnHover && !isHovering
          ? (event: ReactPointerEvent) => {
              if (event.pointerType !== "mouse") return;
              if (event.target instanceof Element && !ignoresPlayOnHover(event.target)) {
                setIsHovering(true);
              }
            }
          : undefined
      }
      onPointerLeave={
        playOnHover
          ? (event: ReactPointerEvent) => {
              if (event.pointerType === "mouse") setIsHovering(false);
            }
          : undefined
      }
      onPointerDownCapture={
        playOnHover
          ? (event: ReactPointerEvent) => {
              if (event.pointerType !== "mouse") setHasTouched(true);
            }
          : undefined
      }
    >
      {hasLayeredHex && (
        <>
          <div
            className="media-light absolute inset-0 z-0"
            style={{ backgroundColor: mediaBgHex }}
          />
          <div
            className="media-dark absolute inset-0 z-0"
            style={{ backgroundColor: mediaBgHexDark }}
          />
        </>
      )}
      {mediaBg?.src && (
        <div className="relative z-1 col-span-full row-span-full overflow-hidden">
          {mediaBg.darkSrc ? (
            <>
              <Image
                src={mediaBg.src}
                alt=""
                fill
                className={wallpaperImageClass("media-light absolute inset-0 object-cover")}
                priority={preload}
              />
              <Image
                src={mediaBg.darkSrc}
                alt=""
                fill
                className={wallpaperImageClass("media-dark absolute inset-0 object-cover")}
                priority={preload}
              />
            </>
          ) : (
            <Image
              src={mediaBg.src}
              alt=""
              fill
              className={wallpaperImageClass("absolute inset-0 object-cover")}
              priority={preload}
            />
          )}
        </div>
      )}
      {children && (
        <div className="z-20 col-span-full row-span-full">
          <DemoPlaybackProvider value={{ isPlaying }}>{children}</DemoPlaybackProvider>
        </div>
      )}
      {mediaType === "image" && media?.src && (
        <div
          className={cn("z-20 col-span-full row-span-full grid", {
            "pt-g1.75 pr-g1.75": mediaPosition === "bottomLeft",
            "pt-g1.75 pl-g1.75": mediaPosition === "bottomRight",
            "pt-g1.75 pl-g1.75 pr-g1.75 items-center": mediaPosition === "bottomCenter",
            "p-g1.75 place-center": mediaPosition === "center",
          })}
        >
          {link && hasValidLink(link) ? (
            <Link
              href={link.href ?? (link.slug ? `/${link.slug}` : "#")}
              className="block h-full w-full"
              openInNewTab={link.openInNewTab}
              download={link.linkType === "file" || undefined}
            >
              {mediaImage(mediaImageClassName)}
            </Link>
          ) : (
            mediaImage(mediaImageClassName)
          )}
        </div>
      )}
    </div>
  );
}

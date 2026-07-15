import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

/**
 * Icon glyphs reconstructed from module 906967. The original renders single
 * characters styled by the `CursorIcons16` icon font; here we render the same
 * Unicode glyphs so the visual affordance survives without the font binary.
 */
export type IconName = "arrow" | "up-arrow" | "down-arrow" | "ne-arrow" | "download";

const GLYPHS: Record<IconName, string> = {
  arrow: "\u2192", // →
  "up-arrow": "\u2191", // ↑
  "down-arrow": "\u2193", // ↓
  "ne-arrow": "\u2197", // ↗
  download: "\u2913", // ⤓
};

export function getIcon(name: IconName): ReactElement {
  return (
    <span aria-hidden="true" className="icon-glyph">
      {GLYPHS[name]}
    </span>
  );
}

/**
 * Named glyph components from the same module, used by the footer theme
 * switcher (275252). Like the originals they render a bare character span
 * with an optional pass-through class.
 */
export interface IconProps {
  className?: string;
}

export function MonitorIcon({ className }: IconProps) {
  return (
    <span className={cn(className)} aria-hidden="true">
      {"\u{1F5A5}"}
    </span>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <span className={cn(className)} aria-hidden="true">
      {"\u2609"}
    </span>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <span className={cn(className)} aria-hidden="true">
      {"\u263E"}
    </span>
  );
}

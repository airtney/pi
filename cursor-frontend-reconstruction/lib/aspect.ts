/**
 * Aspect-box class builder reconstructed from module 22672
 * (`buildAspectClasses`). Maps an aspect ratio (or per-breakpoint map of
 * ratios) onto the site's `aspect-*-box` CSS grid helpers.
 */

const ASPECT_CLASSES: Record<string, string> = {
  "1/1": "aspect-1/1-box",
  "8/9": "aspect-8/9-box",
  "4/5": "aspect-4/5-box",
  "5/4": "aspect-5/4-box",
  "4/3": "aspect-4/3-box",
  "3/2": "aspect-3/2-box",
  "8/5": "aspect-8/5-box",
  "16/9": "aspect-16/9-box",
  "2/1": "aspect-2/1-box",
  natural: "aspect-natural-box",
};

const BREAKPOINTS = ["base", "sm", "md", "lg", "xl", "2xl"] as const;

export type AspectRatio = string | Partial<Record<(typeof BREAKPOINTS)[number], string>>;

function lookup(ratio: string): string | null {
  return ASPECT_CLASSES[ratio.replace(/\s+/g, "").replace(":", "/")] || null;
}

export function buildAspectClasses(ratio: AspectRatio): string {
  if (typeof ratio === "string") return lookup(ratio) || ASPECT_CLASSES["1/1"];
  const classes: string[] = [];
  for (const breakpoint of BREAKPOINTS) {
    const value = ratio[breakpoint];
    if (!value) continue;
    const cls = lookup(value);
    if (cls) classes.push(breakpoint === "base" ? cls : `${breakpoint}:${cls}`);
  }
  return classes.length ? classes.join(" ") : ASPECT_CLASSES["1/1"];
}

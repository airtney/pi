/**
 * Type-scale helpers reconstructed from modules
 *   941710  getTextSize        — headline size → type-* utility class
 *   54518   stepDownHeadingLevel — h1→h2→…→h6 semantic step-down
 */

export type TextSize = "md" | "lg" | "xl" | "2xl";
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export function getTextSize(size?: TextSize): string {
  switch (size) {
    case "md":
      return "type-md-lg";
    case "xl":
      return "type-xl";
    case "2xl":
      return "type-xl sm:type-2xl";
    case "lg":
    default:
      return "type-lg";
  }
}

export function stepDownHeadingLevel(level?: HeadingLevel): HeadingLevel {
  const levels: HeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const index = levels.indexOf(level as HeadingLevel);
  if (index === -1 || index >= 5) return "h6";
  return levels[index + 1];
}

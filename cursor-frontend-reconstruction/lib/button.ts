/**
 * Button variant + alignment helpers, reconstructed from modules
 *   560817  getButtonVariant
 *   861352  getButtonAlignment / getFlexAlignment / getMarginAlignment /
 *           getTextAlignment
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "ghost"
  | "quinary";
export type ButtonSize = "default" | "small" | "sm";
export type Alignment = "left" | "right" | "center";

export function getButtonVariant(variant?: ButtonVariant, size?: ButtonSize): string {
  let cls: string;
  switch (variant) {
    case "secondary":
      cls = "btn btn--secondary";
      break;
    case "tertiary":
      cls = "btn-tertiary";
      break;
    case "quaternary":
      cls = "btn--quaternary";
      break;
    case "ghost":
      cls = "btn--ghost";
      break;
    case "quinary":
      cls = "btn--quinary";
      break;
    case "primary":
    default:
      cls = "btn";
      break;
  }
  if (size === "small" || size === "sm") cls += " btn--sm";
  return cls;
}

export function getButtonAlignment(alignment?: Alignment): string {
  switch (alignment) {
    case "right":
      return "justify-end";
    case "center":
      return "justify-center";
    case "left":
    default:
      return "justify-start";
  }
}

export function getFlexAlignment(alignment?: Alignment): string {
  switch (alignment) {
    case "right":
      return "justify-end";
    case "center":
      return "justify-center";
    case "left":
    default:
      return "justify-start";
  }
}

export function getMarginAlignment(alignment?: Alignment): string {
  switch (alignment) {
    case "center":
      return "mx-auto";
    case "left":
    default:
      return "";
  }
}

export function getTextAlignment(alignment?: Alignment): string {
  switch (alignment) {
    case "right":
      return "text-right";
    case "center":
      return "text-center";
    case "left":
    default:
      return "text-left";
  }
}

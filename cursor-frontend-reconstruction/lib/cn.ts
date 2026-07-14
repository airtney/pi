/**
 * Minimal `classnames` helper, standing in for the compiled module 264458
 * (`clsx`-style utility). Accepts strings, falsy values, and joins truthy
 * class fragments with a single space.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

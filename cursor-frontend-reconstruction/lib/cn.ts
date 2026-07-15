/**
 * Minimal `classnames` helper, standing in for the compiled module 264458
 * (`clsx`-style utility). Accepts strings, falsy values, and conditional
 * class maps (`{ "class": condition }`), joining truthy fragments with a
 * single space — the two input shapes the homepage bundles actually use.
 */
export type ClassValue = string | number | false | null | undefined | Record<string, unknown>;

export function cn(...values: ClassValue[]): string {
  const classes: (string | number)[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "object") {
      for (const key of Object.keys(value)) {
        if (value[key]) classes.push(key);
      }
    } else {
      classes.push(value);
    }
  }
  return classes.join(" ");
}

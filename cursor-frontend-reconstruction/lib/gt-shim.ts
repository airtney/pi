"use client";

/**
 * Local replacement for `gt-next`'s `useGT()` / `useMessages()` hooks.
 *
 * The original bundle uses General Translation (`gt-next`) for i18n. Since
 * this reconstruction ships only the `en-US` copy, the shim treats the key
 * string as the message template and interpolates `{placeholder}` tokens with
 * the values passed in the second argument.
 */

export type MessageValues = Record<string, string | number>;

function interpolate(template: string, values?: MessageValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type TranslateFn = (template: string, values?: MessageValues) => string;

export function useGT(): TranslateFn {
  return interpolate;
}

/**
 * `useMessages` in the original returns a resolver that accepts either a raw
 * string message or a pre-resolved node. We mirror that loose contract.
 */
export function useMessages(): (value?: string | null) => string | null {
  return (value) => (typeof value === "string" ? interpolate(value) : (value ?? null));
}

"use client";

import type { CSSProperties } from "react";
import { useMessages } from "@/lib/gt-shim";
import { buildAspectClasses, type AspectRatio } from "@/lib/aspect";
import { LATEST_1P_MODEL } from "@/lib/models";

/**
 * Demo model picker menu reconstructed from module 740719 (`DEFAULT_MODELS` +
 * default export). React Compiler `useMemoCache` scaffolding removed.
 *
 * Faithfulness notes:
 * - the highlighted-and-current item's class string reproduces the upstream
 *   missing-space bug (`"…text-left" + "bg-theme-card-02-hex"` →
 *   `text-leftbg-theme-card-02-hex`), matching the captured SSR markup;
 * - `embedded` (default true) centers the menu inside an aspect box; the
 *   hero prompt card renders it non-embedded with the drop shadow.
 */

export interface MenuModel {
  label: string;
  tag?: string;
}

export const DEFAULT_MODELS: MenuModel[] = [
  { label: "Auto", tag: "Suggested" },
  { label: LATEST_1P_MODEL.label, tag: LATEST_1P_MODEL.effort },
  { label: "GPT-5.6 Sol", tag: "High Fast" },
  { label: "Sonnet 4.5" },
  { label: "Opus 4.8" },
  { label: "Gemini 3.1 Pro" },
  { label: "Grok 4.5" },
];

export interface ModelMenuProps {
  models?: MenuModel[];
  currentModel?: string;
  highlightIndex?: number;
  onHighlightChange?: (index: number) => void;
  onSelect?: (label: string) => void;
  className?: string;
  container?: boolean;
  embedded?: boolean;
  role?: string;
  ariaLabel?: string;
  aspectRatio?: AspectRatio;
  foregroundMaxWidth?: number | string;
  height?: number | string;
}

function toCssSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function ModelMenu({
  models = DEFAULT_MODELS,
  currentModel,
  highlightIndex,
  onHighlightChange,
  onSelect,
  className,
  container,
  embedded = true,
  role = "menu",
  ariaLabel = "Model menu",
  aspectRatio = "1/1",
  foregroundMaxWidth = 320,
  height,
}: ModelMenuProps) {
  const messages = useMessages();

  const items = (
    <div className="p-1">
      {models.map((model, index) => {
        const isCurrent = currentModel === model.label;
        const isHighlighted = typeof highlightIndex === "number" && index === highlightIndex;
        return (
          <button
            key={model.label}
            type="button"
            className={
              (isHighlighted ? "text-theme-text " : "text-theme-text-sec ") +
              "px-g0.75 type-product-lg py-v3/12 flex w-full items-center rounded-xs text-left" +
              (isCurrent ? "bg-theme-card-02-hex" : "")
            }
            style={
              isHighlighted ? { backgroundColor: "var(--color-theme-card-hover-hex)" } : undefined
            }
            onMouseEnter={() => onHighlightChange?.(index)}
            onClick={() => onSelect?.(model.label)}
            role={role === "menu" ? "menuitem" : undefined}
          >
            <span className="flex flex-1 items-baseline gap-2">
              <span className="text-theme-text">{model.label}</span>
              {model.tag ? (
                <span className="text-theme-text-tertiary type-product-sm">
                  {messages(model.tag)}
                </span>
              ) : null}
            </span>
            {isCurrent ? <span className="font-feature-case ml-2">✓</span> : null}
          </button>
        );
      })}
    </div>
  );

  if (container === false) return items;

  const boxShadow = embedded
    ? "var(--shadow-outline-theme)"
    : "var(--shadow-outline-theme), 0 18px 36px -18px rgba(0,0,0,0.28)";

  if (embedded) {
    const aspectClasses = buildAspectClasses(aspectRatio);
    const wrapperClass = (className ? className + " " : "") + (aspectClasses || "");
    const wrapperStyle: CSSProperties = {
      position: "relative",
      width: "100%",
      backgroundColor: "transparent",
      ...(height && { height: toCssSize(height) }),
    };
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-theme-card-hex text-theme-text min-w-[180px] overflow-hidden rounded-md"
            role={role}
            aria-label={ariaLabel}
            style={{
              boxShadow,
              minWidth: 180,
              maxWidth: `min(83.333333%, ${toCssSize(foregroundMaxWidth)})`,
              width: "100%",
            }}
          >
            {items}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-theme-card-hex text-theme-text min-w-[180px] overflow-hidden rounded-md ${className ?? ""}`}
      role={role}
      aria-label={ariaLabel}
      style={{ boxShadow, minWidth: 180, ...(height && { height: toCssSize(height) }) }}
    >
      {items}
    </div>
  );
}

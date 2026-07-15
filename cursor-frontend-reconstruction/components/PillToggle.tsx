"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Animated pill segment control, reconstructed from the compiled module
 * 594221 (the select control used by the footer theme switcher). A sliding
 * indicator is measured from the selected option's bounding box and animated
 * with the site's spring easing. Two variants exist in the bundle:
 *
 * - "default": radio inputs with visible text labels (`name` groups them)
 * - "theme":   icon-only buttons, used by the theme switcher
 */

export type PillToggleSize = "sm" | "md-sm" | "md" | "lg";
export type PillToggleVariant = "default" | "theme";

export interface PillToggleOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface PillToggleProps {
  options: PillToggleOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  optionClassName?: string;
  size?: PillToggleSize;
  variant?: PillToggleVariant;
}

const CONTAINER_PADDING: Record<PillToggleSize, string> = {
  sm: "p-0.5",
  "md-sm": "p-0.5",
  md: "p-0.5",
  lg: "p-1",
};

const OPTION_PADDING: Record<PillToggleSize, string> = {
  sm: "pill-padding-sm text-sm",
  "md-sm": "pill-padding-md-sm text-base",
  md: "pill-padding-md text-base",
  lg: "pill-padding-lg text-lg",
};

// The theme variant inherits its font size from the container (which sets
// `md:type-sm`) instead of fixing one per size.
const THEME_CONTAINER_PADDING: Record<PillToggleSize, string> = {
  sm: "p-0.5",
  "md-sm": "p-0.5",
  md: "p-0.5",
  lg: "p-1",
};

const THEME_OPTION_PADDING: Record<PillToggleSize, string> = {
  sm: "pill-padding-sm font-size-inherit",
  "md-sm": "pill-padding-md-sm font-size-inherit",
  md: "pill-padding-md font-size-inherit",
  lg: "pill-padding-lg font-size-inherit",
};

export function PillToggle({
  options,
  value,
  onChange,
  name = "pill-toggle",
  className,
  optionClassName = "",
  size = "md",
  variant = "default",
}: PillToggleProps) {
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [isIndicatorReady, setIsIndicatorReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const updateIndicator = () => {
      const index = options.findIndex((option) => option.value === value);
      if (index >= 0 && optionRefs.current[index] && containerRef.current) {
        const optionEl = optionRefs.current[index];
        const containerRect = containerRef.current.getBoundingClientRect();
        const optionRect = optionEl.getBoundingClientRect();
        setIndicator({ left: optionRect.left - containerRect.left, width: optionRect.width });
        setIsIndicatorReady(true);
      }
    };
    updateIndicator();
    // Re-measure shortly after mount so late layout (fonts) is picked up.
    const timeout = setTimeout(updateIndicator, 10);
    window.addEventListener("resize", updateIndicator);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [value, options]);

  const containerVariant =
    variant === "theme" ? "md:type-sm rounded-full bg-theme-card-03-hex" : "bg-theme-card-hex";
  const containerPadding =
    variant === "theme" ? THEME_CONTAINER_PADDING[size] : CONTAINER_PADDING[size];
  const containerClassName = `${containerVariant} relative flex rounded-full text-center ${containerPadding} ${className ?? ""}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      {isIndicatorReady && (
        <div
          className={`absolute rounded-full transition-all ${
            variant === "theme" ? "bg-theme-fg-10" : "bg-theme-card-03-hex"
          }`}
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
            top: "2px",
            bottom: "2px",
            transitionDuration: "var(--duration)",
            transitionTimingFunction: "var(--ease-out-spring)",
          }}
        />
      )}
      {options.map((option, index) => {
        const isSelected = value === option.value;
        if (variant === "theme") {
          return (
            <button
              key={option.value}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              onClick={() => onChange(option.value)}
              className={`font-size-inherit relative inline-flex cursor-pointer items-center justify-center rounded-full leading-none outline-none focus:outline-none focus-visible:outline-none ${THEME_OPTION_PADDING[size]} ${
                isSelected ? "text-theme-text" : "text-theme-text-sec hover:text-theme-text"
              }`}
              aria-label={typeof option.label === "string" ? option.label : undefined}
            >
              {option.icon}
            </button>
          );
        }
        return (
          <label
            key={option.value}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            className={`group relative cursor-pointer rounded-full border border-transparent ${OPTION_PADDING[size]} leading-[1] ${optionClassName}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={(event) => onChange(event.target.value)}
              className="absolute inset-0 cursor-pointer appearance-none rounded-full outline-none focus:outline-none focus-visible:outline-none"
            />
            <span
              className={
                isSelected ? "text-theme-text" : "text-theme-text-sec group-hover:text-theme-text"
              }
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

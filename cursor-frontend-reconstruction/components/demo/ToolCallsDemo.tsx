"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useDemoPlayback } from "@/lib/demo/DemoPlayback";
import { useMessages } from "@/lib/gt-shim";
import { buildAspectClasses, type AspectRatio } from "@/lib/aspect";

/**
 * Agent tool-call progress demo reconstructed from module 760872 (default
 * export): the "Where are these menu label colors defined?" prompt followed
 * by Grepped/Searched/Read steps that activate one by one (active steps
 * shimmer, completed steps dim their argument) and loop forever.
 *
 * The original animates entrances with framer-motion
 * (`initial={opacity:0,y:6}` → `animate={opacity:1,y:0}`, 0.18s ease-out);
 * this repo has no framer-motion, so the `.tool-call-enter` CSS animation in
 * marketing-spacing.css reproduces the same values. The AnimatePresence exit
 * fade on loop restart is dropped. React Compiler scaffolding removed.
 */

export interface ToolCallStep {
  active: string;
  complete: string;
}

type StepStatus = "inactive" | "active" | "complete";

const DEFAULT_STEPS: ToolCallStep[] = [
  { active: "Grepping", complete: "Grepped Choose a model" },
  { active: "Searching", complete: "Searched Where is the model picker UI implemented?" },
  { active: "Searching", complete: "Searched How are model labels colored in the UI?" },
  { active: "Reading", complete: "Read ContextMenu.tsx" },
];

function toCssSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export interface ToolCallsDemoProps {
  className?: string;
  aspectRatio?: AspectRatio;
  foregroundMaxWidth?: number | string;
  role?: string;
  ariaLabel?: string;
  children?: ReactNode;
  inputText?: string;
  outputSteps?: ToolCallStep[];
  width?: number | string;
  height?: number | string;
}

export function ToolCallsDemo({
  className,
  aspectRatio = "1/1",
  foregroundMaxWidth = 360,
  role = "region",
  ariaLabel = "Tool calls",
  children,
  inputText = "Where are these menu label colors defined?",
  outputSteps,
  width,
  height,
}: ToolCallsDemoProps) {
  const messages = useMessages();
  const { isPlaying } = useDemoPlayback();
  const aspectClasses = buildAspectClasses(aspectRatio);
  const steps = useMemo(() => outputSteps || DEFAULT_STEPS, [outputSteps]);

  const [statuses, setStatuses] = useState<StepStatus[]>(() => steps.map(() => "inactive"));
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (children) return;
    if (!isPlaying) {
      setVisibleCount(steps.length);
      setStatuses(steps.map(() => "complete"));
      return;
    }
    let cancelled = false;
    let timers: number[] = [];

    (function run() {
      if (cancelled) return;
      setVisibleCount(0);
      setStatuses(steps.map(() => "inactive"));
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      for (let index = 0; index < steps.length; index += 1) {
        const activate = window.setTimeout(
          () => {
            if (cancelled) return;
            setVisibleCount((count) => Math.min(steps.length, Math.max(count, index + 1)));
            setStatuses((current) =>
              current.map((status, i) => (i === index ? "active" : status)),
            );
            const complete = window.setTimeout(() => {
              if (!cancelled) {
                setStatuses((current) =>
                  current.map((status, i) => (i === index ? "complete" : status)),
                );
              }
            }, 1400);
            timers.push(complete);
          },
          200 + 1500 * index,
        );
        timers.push(activate);
      }
      const cycle = 200 + (steps.length - 1) * 1500 + 1400 + 2000;
      const restart = window.setTimeout(() => {
        if (!cancelled) run();
      }, cycle);
      timers.push(restart);
    })();

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [children, steps, isPlaying]);

  return (
    <div
      className={(className ? className + " " : "") + (aspectClasses || "")}
      style={{
        position: "relative",
        width: width ? toCssSize(width) : "100%",
        height: height ? toCssSize(height) : undefined,
        backgroundColor: "transparent",
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-full max-h-[var(--max-h-mobile)] items-center justify-center xl:inset-0 xl:max-h-none">
        <div
          role={role}
          aria-label={ariaLabel}
          style={{
            minWidth: 180,
            maxWidth: `min(83.333333%, ${toCssSize(foregroundMaxWidth)})`,
            width: "100%",
          }}
        >
          {children ?? (
            <div>
              <div className="space-y-v9/12">
                <div className="tool-call-enter border-theme-border-02 bg-theme-card-04-hex text-theme-text type-product-lg px-g1 py-g0.75 w-full rounded-md border">
                  {messages(inputText)}
                </div>
                <ul className="space-y-v6/12 pl-g0.5">
                  {steps.slice(0, visibleCount).map((step, index) => {
                    const isActive = statuses[index] === "active";
                    const label =
                      (isActive ? messages(step.active) : messages(step.complete)) ?? "";
                    const match = label.match(/^(\S+)([\s\S]*)$/);
                    const head = match ? (match[1] ?? "") : label;
                    const tail = match ? (match[2] ?? "") : "";
                    return (
                      <li
                        key={index}
                        className="tool-call-enter type-product-lg text-theme-text-sec leading-snug"
                      >
                        <div className="text-theme-text-sec flex items-baseline gap-1 overflow-hidden">
                          {isActive ? (
                            <span
                              className="shimmer"
                              style={
                                {
                                  "--shimmer-color": "var(--color-theme-text-sec)",
                                  "--shimmer-intensity": "80%",
                                } as CSSProperties
                              }
                            >
                              {label}
                            </span>
                          ) : (
                            <>
                              <span className="text-theme-text-sec flex-shrink-0">{head}</span>
                              {tail ? (
                                <span className="text-theme-text-sec min-w-0 truncate opacity-60">
                                  {tail}
                                </span>
                              ) : null}
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

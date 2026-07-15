"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/lib/gt-shim";
import { buildAspectClasses, type AspectRatio } from "@/lib/aspect";
import { LATEST_1P_MODEL } from "@/lib/models";
import { ModelMenu, type MenuModel } from "@/components/ModelMenu";

/**
 * "Ask Cursor to plan or build anything" prompt card reconstructed from
 * module 316688 (default export). The card renders a fake composer input with
 * the Agent pill, the model dropdown (kept permanently open — the original
 * seeds `useState(true)` and never toggles it), and a send button; an effect
 * walks the menu highlight through the six models every two seconds.
 * React Compiler `useMemoCache` scaffolding removed.
 *
 * The module carries its own model list (distinct from the shared
 * `DEFAULT_MODELS` in components/ModelMenu.tsx: no "Sonnet 4.5", no effort
 * tag on GPT-5.6 Sol), matching the captured SSR markup.
 */

const MODELS: MenuModel[] = [
  { label: "Auto", tag: "Suggested" },
  { label: LATEST_1P_MODEL.label, tag: LATEST_1P_MODEL.effort },
  { label: "GPT-5.6 Sol" },
  { label: "Opus 4.8" },
  { label: "Gemini 3.1 Pro" },
  { label: "Grok 4.5" },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });
}

/** Infinity glyph rendered inside the Agent pill (module 538411). */
function AgentIcon({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24.7969 11.3555"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M0 5.67188C0 9.11719 2.13281 11.3438 5.30859 11.3438C6.98438 11.3438 8.41406 10.6406 9.9375 9.17578L12.2227 6.96094L14.5078 9.17578C16.0312 10.6406 17.4609 11.3438 19.1367 11.3438C22.3125 11.3438 24.4453 9.11719 24.4453 5.67188C24.4453 2.22656 22.3125 0 19.1367 0C17.4609 0 16.0312 0.703125 14.5078 2.16797L12.2227 4.38281L9.9375 2.16797C8.41406 0.703125 6.98438 0 5.30859 0C2.13281 0 0 2.22656 0 5.67188ZM1.91016 5.67188C1.91016 3.36328 3.28125 1.91016 5.30859 1.91016C6.44531 1.91016 7.45312 2.44922 8.60156 3.52734L10.8867 5.67188L8.60156 7.81641C7.45312 8.89453 6.44531 9.43359 5.30859 9.43359C3.28125 9.43359 1.91016 7.98047 1.91016 5.67188ZM13.5586 5.67188L15.8438 3.52734C16.9922 2.44922 18 1.91016 19.1367 1.91016C21.1641 1.91016 22.5352 3.36328 22.5352 5.67188C22.5352 7.98047 21.1641 9.43359 19.1367 9.43359C18 9.43359 16.9922 8.89453 15.8438 7.81641Z" />
    </svg>
  );
}

/** Caret-down glyph (module 267878; the stray trailing space is original). */
function CaretDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M7.00342 9.62646C6.86377 9.62646 6.74023 9.57275 6.63818 9.4707L2.48096 5.2168C2.38965 5.12012 2.33594 5.00195 2.33594 4.86768C2.33594 4.58838 2.54541 4.37354 2.82471 4.37354C2.96436 4.37354 3.08789 4.42725 3.17383 4.51318L7.00342 8.42334L10.8276 4.51318C10.9189 4.42725 11.0425 4.37354 11.1768 4.37354C11.4561 4.37354 11.6655 4.58838 11.6655 4.86768C11.6655 5.00195 11.6118 5.12012 11.5205 5.21143L7.36328 9.4707C7.27197 9.57275 7.1377 9.62646 7.00342 9.62646Z" />{" "}
    </svg>
  );
}

/** Bold arrow-up glyph from the phosphor set (module 13600 `ArrowUp`). */
function ArrowUpIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
    </svg>
  );
}

export interface PromptCardProps {
  aspectRatio?: AspectRatio;
  className?: string;
  height?: number | string;
}

export function PromptCard({
  aspectRatio = { base: "4/3", md: "1/1" },
  className,
  height,
}: PromptCardProps) {
  const messages = useMessages();
  const [menuOpen] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [currentModel, setCurrentModel] = useState(MODELS[0]?.label ?? "Auto");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const total = MODELS.length;
      let index = 0;
      setHighlightIndex(0);
      const first = MODELS[0];
      if (first) setCurrentModel(first.label);
      while (!cancelled) {
        await sleep(2000);
        if (cancelled) return;
        index = (index + 1) % total;
        setHighlightIndex(index);
        const model = MODELS[index];
        if (model) setCurrentModel(model.label);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const aspectClasses = buildAspectClasses(aspectRatio);
  const wrapperClass = (className ? className + " " : "") + (aspectClasses || "");
  const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    backgroundColor: "transparent",
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
  };

  const menuClass =
    "absolute left-0 top-[calc(100%+8px)] transition-all duration-200 ease-out origin-top-left " +
    (menuOpen
      ? "opacity-100 scale-100 translate-y-0"
      : "pointer-events-none opacity-0 scale-95 -translate-y-1");

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="absolute inset-0 flex items-start justify-center pt-[12%]">
        <div className="relative w-[88%] max-w-[360px]">
          <div className="border-theme-border-02 bg-theme-product-editor rounded-lg border shadow-lg">
            <div
              className="text-theme-text-ter type-product-lg w-full bg-transparent px-3 pt-2.5 pb-2 opacity-60"
              style={{ lineHeight: "1.8" }}
            >
              {messages("Ask Cursor to plan or build anything")}
            </div>
            <div className="px-2 py-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="bg-theme-card-03-hex type-product-sm text-theme-text-sec flex items-center gap-1 rounded-full px-2 py-0.75"
                  >
                    <AgentIcon size={12} className="opacity-60" />
                    <span>{messages("Agent")}</span>
                    <CaretDownIcon className="h-3 w-3 opacity-60" />
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      className="text-theme-text-sec type-product-sm flex items-center gap-0.5 rounded-md bg-transparent py-0.75"
                    >
                      <span>{currentModel}</span>
                      <CaretDownIcon className="h-3 w-3 opacity-60" />
                    </button>
                    <div className={menuClass}>
                      <ModelMenu
                        models={MODELS}
                        currentModel={currentModel}
                        highlightIndex={highlightIndex}
                        onHighlightChange={setHighlightIndex}
                        onSelect={setCurrentModel}
                        embedded={false}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Send message"
                  className="bg-theme-button-bg text-theme-button-text flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <ArrowUpIcon size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

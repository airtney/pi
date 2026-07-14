import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Stylized application-window chrome used to frame the homepage's interactive
 * product demos. The live site ships full interactive React demos; this is a
 * static, visually-faithful stand-in (traffic-light chrome + title bar).
 */
export function DemoWindow({
  title,
  children,
  className,
  toolbar,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  toolbar?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-theme-border-02 bg-theme-card shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-theme-border-01 bg-theme-card-02 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        {title && (
          <span className="ml-3 type-xs font-mono text-theme-text-tertiary">{title}</span>
        )}
        {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
      </div>
      <div className="bg-theme-card">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/Icons";
import { PillToggle } from "@/components/PillToggle";
import { useGT } from "@/lib/gt-shim";
import { useTheme } from "@/lib/theme";

/**
 * Footer theme switcher (system / light / dark), reconstructed from the
 * compiled module 275252. Renders nothing until mounted — the stored theme is
 * only known on the client, so the pill would otherwise mismatch the server
 * HTML. Once active it also swaps the favicon to match the resolved theme.
 *
 * The original swaps both the `.ico` and `.svg` favicons under
 * `/marketing-static/`; this replica only mirrors the SVG favicons in
 * `public/`, so the `.ico` branch is dropped.
 */
export function ThemeSwitcher() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const faviconLinks = useRef<{ svg?: HTMLLinkElement }>({});
  const gt = useGT();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const activeTheme = theme === "system" ? resolvedTheme : theme;
    if (activeTheme !== "light" && activeTheme !== "dark") return;
    const svgHref = activeTheme === "light" ? "/favicon-light.svg" : "/favicon.svg";
    // Small delay (as in the original) so rapid toggling doesn't thrash <head>.
    const timeout = window.setTimeout(() => {
      if (faviconLinks.current.svg) {
        faviconLinks.current.svg.href = svgHref;
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = svgHref;
        link.type = "image/svg+xml";
        document.head.appendChild(link);
        faviconLinks.current.svg = link;
      }
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [isMounted, theme, resolvedTheme]);

  if (!isMounted) return null;

  const options = [
    { value: "system", label: gt("System theme"), icon: <MonitorIcon /> },
    { value: "light", label: gt("Light theme"), icon: <SunIcon /> },
    { value: "dark", label: gt("Dark theme"), icon: <MoonIcon /> },
  ];

  return (
    <PillToggle
      options={options}
      value={theme || "system"}
      onChange={setTheme}
      variant="theme"
      size="sm"
    />
  );
}

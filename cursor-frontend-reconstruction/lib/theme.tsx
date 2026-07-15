"use client";

import * as React from "react";

/**
 * Light/dark/system theming, reconstructed from the compiled module 956347
 * (`ThemeProvider` / `useTheme`). The module is an inlined copy of
 * `next-themes`: a context provider that applies the active theme to the
 * `<html>` element (as an attribute and/or class), mirrors the resolved
 * scheme to `style.colorScheme`, persists the selection in localStorage,
 * follows the OS preference while the theme is "system", syncs the choice
 * across tabs via the `storage` event, and injects a blocking inline script
 * during SSR so the first paint already uses the right theme.
 *
 * cursor.com instantiates it with `attribute="data-theme"`,
 * `storageKey="marketing-theme"`, `defaultTheme="system"`,
 * `themes=["light","dark"]`, `enableSystem` and `enableColorScheme` (seen in
 * the inline bootstrap script of `_artifacts/index.html`).
 */

export type Attribute = "class" | `data-${string}`;

export interface UseThemeProps {
  /** Selectable theme names (plus "system" when `enableSystem` is on). */
  themes: string[];
  /** Theme forced for the current page, if any. */
  forcedTheme?: string;
  /** Update the active theme (persisted to localStorage). */
  setTheme: (theme: string | ((current: string | undefined) => string)) => void;
  /** Active theme name ("system" while following the OS preference). */
  theme?: string;
  /** Active theme with "system" resolved to "light" or "dark". */
  resolvedTheme?: string;
  /** The OS preference, when `enableSystem` is on. */
  systemTheme?: "light" | "dark";
}

export interface ThemeProviderProps {
  children?: React.ReactNode;
  /** List of theme names (default `["light", "dark"]`). */
  themes?: string[];
  /** Force a specific theme regardless of the stored preference. */
  forcedTheme?: string;
  /** Allow "system" as a theme that follows the OS preference. */
  enableSystem?: boolean;
  /** Disable CSS transitions while the theme attribute flips. */
  disableTransitionOnChange?: boolean;
  /** Mirror the resolved theme to `documentElement.style.colorScheme`. */
  enableColorScheme?: boolean;
  /** localStorage key holding the preference (default "theme"). */
  storageKey?: string;
  /** Theme used when nothing is stored (default "system"). */
  defaultTheme?: string;
  /** Attribute(s) set on `<html>`: "class" and/or `data-*`. */
  attribute?: Attribute | Attribute[];
  /** Optional theme-name → attribute-value mapping. */
  value?: Record<string, string>;
  nonce?: string;
  scriptProps?: React.ScriptHTMLAttributes<HTMLScriptElement>;
}

const colorSchemes = ["light", "dark"];
const MEDIA = "(prefers-color-scheme: dark)";
const isServer = typeof window === "undefined";
const ThemeContext = React.createContext<UseThemeProps | undefined>(undefined);
const defaultContext: UseThemeProps = { setTheme: () => {}, themes: [] };
const defaultThemes = ["light", "dark"];

export function useTheme(): UseThemeProps {
  return React.useContext(ThemeContext) ?? defaultContext;
}

export function ThemeProvider(props: ThemeProviderProps): React.ReactNode {
  const context = React.useContext(ThemeContext);
  // Nested providers are no-ops; only the outermost one manages the DOM.
  if (context) return <React.Fragment>{props.children}</React.Fragment>;
  return <Theme {...props} />;
}

function Theme({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  themes = defaultThemes,
  defaultTheme = enableSystem ? "system" : "light",
  attribute = "data-theme",
  value,
  children,
  nonce,
  scriptProps,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState(() => getTheme(storageKey, defaultTheme));
  const [resolvedTheme, setResolvedTheme] = React.useState(() =>
    theme === "system" ? getSystemTheme() : theme,
  );
  const attrValues = value ? Object.values(value) : themes;

  const applyTheme = React.useCallback(
    (nextTheme: string | undefined) => {
      let resolved = nextTheme;
      if (!resolved) return;
      if (nextTheme === "system" && enableSystem) resolved = getSystemTheme();

      const attrValue = value ? value[resolved] : resolved;
      const enableTransitions = disableTransitionOnChange ? disableAnimation(nonce) : null;
      const el = document.documentElement;

      const handleAttribute = (attr: Attribute) => {
        if (attr === "class") {
          el.classList.remove(...attrValues);
          if (attrValue) el.classList.add(attrValue);
        } else if (attr.startsWith("data-")) {
          if (attrValue) el.setAttribute(attr, attrValue);
          else el.removeAttribute(attr);
        }
      };
      if (Array.isArray(attribute)) attribute.forEach(handleAttribute);
      else handleAttribute(attribute);

      if (enableColorScheme) {
        const fallback = colorSchemes.includes(defaultTheme) ? defaultTheme : null;
        const colorScheme = colorSchemes.includes(resolved) ? resolved : fallback;
        el.style.colorScheme = colorScheme ?? "";
      }

      enableTransitions?.();
    },
    // Matches the compiled module: only `nonce` invalidates this callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nonce],
  );

  const setTheme = React.useCallback<UseThemeProps["setTheme"]>(
    (nextTheme) => {
      const resolved = typeof nextTheme === "function" ? nextTheme(theme) : nextTheme;
      setThemeState(resolved);
      try {
        localStorage.setItem(storageKey, resolved);
      } catch (e) {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const handleMediaQuery = React.useCallback(
    (event: MediaQueryList | MediaQueryListEvent) => {
      setResolvedTheme(getSystemTheme(event));
      if (theme === "system" && enableSystem && !forcedTheme) applyTheme("system");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, forcedTheme],
  );

  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);
    // addListener/removeListener kept (over addEventListener) as in the
    // compiled module, for Safari < 14 compatibility.
    media.addListener(handleMediaQuery);
    handleMediaQuery(media);
    return () => media.removeListener(handleMediaQuery);
  }, [handleMediaQuery]);

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      if (event.newValue) setThemeState(event.newValue);
      else setTheme(defaultTheme);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTheme]);

  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedTheme, theme]);

  const providerValue = React.useMemo<UseThemeProps>(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === "system" ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: enableSystem ? (resolvedTheme as "light" | "dark" | undefined) : undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes],
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      <ThemeScript
        forcedTheme={forcedTheme}
        storageKey={storageKey}
        attribute={attribute}
        enableSystem={enableSystem}
        enableColorScheme={enableColorScheme}
        defaultTheme={defaultTheme}
        value={value}
        themes={themes}
        nonce={nonce}
        scriptProps={scriptProps}
      />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * The no-flash bootstrap. Serialized with `.toString()` into an inline
 * <script>, so it must stay self-contained (no references to module scope).
 */
const script = (
  attribute: Attribute | Attribute[],
  storageKey: string,
  defaultTheme: string,
  forcedTheme: string | null,
  themes: string[],
  value: Record<string, string> | null,
  enableSystem: boolean,
  enableColorScheme: boolean,
) => {
  const el = document.documentElement;
  const systemThemes = ["light", "dark"];

  function updateDOM(theme: string) {
    (Array.isArray(attribute) ? attribute : [attribute]).forEach((attr) => {
      const isClass = attr === "class";
      const classes = isClass && value ? themes.map((name) => value[name] || name) : themes;
      if (isClass) {
        el.classList.remove(...classes);
        el.classList.add(value && value[theme] ? value[theme] : theme);
      } else {
        el.setAttribute(attr, theme);
      }
    });
    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme;
    }
  }

  if (forcedTheme) {
    updateDOM(forcedTheme);
  } else {
    try {
      const themeName = localStorage.getItem(storageKey) || defaultTheme;
      const resolved =
        enableSystem && themeName === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : themeName;
      updateDOM(resolved);
    } catch (e) {}
  }
};

type ThemeScriptProps = Omit<ThemeProviderProps, "children" | "defaultTheme"> & {
  defaultTheme: string;
};

const ThemeScript = React.memo(function ThemeScript({
  forcedTheme,
  storageKey,
  attribute,
  enableSystem,
  enableColorScheme,
  defaultTheme,
  value,
  themes,
  nonce,
  scriptProps,
}: ThemeScriptProps) {
  // Server-only, as in the compiled module: by the time hydration runs the
  // blocking script has already executed, and React skips the unexpected
  // <script> tag in the server HTML instead of reconciling it.
  if (!isServer) return null;
  const scriptArgs = JSON.stringify([
    attribute,
    storageKey,
    defaultTheme,
    forcedTheme,
    themes,
    value,
    enableSystem,
    enableColorScheme,
  ]).slice(1, -1);

  return (
    <script
      {...scriptProps}
      suppressHydrationWarning
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: `(${script.toString()})(${scriptArgs})` }}
    />
  );
});

function getTheme(key: string, fallback: string): string | undefined {
  if (isServer) return undefined;
  let theme: string | undefined;
  try {
    theme = localStorage.getItem(key) || undefined;
  } catch (e) {}
  return theme || fallback;
}

function disableAnimation(nonce?: string) {
  const css = document.createElement("style");
  if (nonce) css.setAttribute("nonce", nonce);
  css.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(css);
  return () => {
    // Force a restyle before re-enabling transitions.
    window.getComputedStyle(document.body);
    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
}

function getSystemTheme(event?: MediaQueryList | MediaQueryListEvent): "light" | "dark" {
  const media = event ?? window.matchMedia(MEDIA);
  return media.matches ? "dark" : "light";
}

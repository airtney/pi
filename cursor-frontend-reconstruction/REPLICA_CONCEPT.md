# REPLICA_CONCEPT — cursor.com 首页复原概念

## 中文摘要

**复原（Replica）** 不是「抄 headline 再画一个 SaaS 落地页」，而是：

1. 从线上 `cursor.com` 抓取 HTML + 32 个 JS chunk + 4 个 CSS chunk；
2. 用 Prettier 美化后，按 Turbopack 的 `e.s(["ExportName"], moduleId)` 定位模块；
3. 剥离 React Compiler 的 `useMemoCache`，手写等价 React 组件；
4. 从 CSS 提取 `theme-*` / `type-*` token，从 CDN 下载真实字体与图片；
5. 搭出可 `npm run build` 的 Next.js 工程，`app/` 在根目录（禁止 `src/app/`）。

**禁止**：Inter 替代 CursorGothic、手绘假 Hero、仅 curl 文案。

**首版完整工程**：Cloud Agent `bc-7e63fc4e`（fable xhigh）。本目录为该方法的严格复刻执行，替代曾错误的仿写版。

---

# Methodology (English)

Reproducible methodology for reverse-engineering the cursor.com marketing
homepage into a standalone Next.js App Router project. This is an educational
frontend reconstruction: no original bundles are shipped, no iframe embedding,
and no server code is copied. Every component is rewritten by hand from the
publicly served HTML/CSS/JS.

## 1. Target stack (observed)

- cursor.com is **Next.js App Router + Turbopack**, hosted on Vercel.
- Static assets live under `/marketing-static/_next/static/chunks/*.js?dpl=<deploy id>`.
- No sourcemaps are published (`.map` requests 404), so components are
  reconstructed from **beautified** production JS.
- **React Compiler** is enabled. Compiled artifacts look like
  `useMemoCache(n)` / `(0,r.c)(n)` with `Symbol.for("react.memo_cache_sentinel")`
  guards. These are stripped back to idiomatic hooks (`useState`, `useEffect`,
  derived values).
- **Turbopack module format**: modules are declared as `<id>, (e) => { ... }`
  and export symbols via `e.s(["ExportName", 0, fn], <id>)`; imports use
  `e.i(<id>)`. Top-level module ids appear as bare numbers (e.g. `634408,`).
- **Styling**: Tailwind with a themed token layer — `bg-theme-bg`,
  `text-theme-text`, `type-md`, `gap-x-g1`, `nav__btn`, `.btn`, `.container`,
  `.section`.
- **i18n**: `gt-next`'s `useGT()` / `useMessages()`. Replaced with a local shim
  that interpolates `{placeholder}` tokens in the en-US strings.

## 2. Extraction pipeline (in order)

1. `curl` the homepage HTML with a desktop User-Agent into `_artifacts/index.html`.
2. `grep -oE '/marketing-static/_next/static/chunks/[^"?]*\.js'` → `chunk-list.txt`;
   download every chunk into `_artifacts/chunks/`.
3. Extract `*.css` chunk URLs the same way; download into `_artifacts/css/`.
4. `npm i -D prettier@3.3.3`; beautify each chunk into `_artifacts/beautified/`.
5. Grep the SSR HTML for UI copy, section headings, nav/footer links, and asset
   URLs. Grep the beautified chunks for `e.s([` export tables and module ids.
6. Extract design tokens from CSS: `--color-theme-*`, `--text-*`, `--leading-*`,
   `--tracking-*`, `--spacing-g*/v*`, `--radius-*`, font-family vars.
7. Mirror real fonts (CursorGothic, BerkeleyMono) and images (avatars, team
   photo, favicon) from the CDN into `public/`.

## 3. Module → component map (key reconstructed modules)

| Module id | Export(s) | Reconstructed as |
|-----------|-----------|------------------|
| `641852` | App Router `error` default | `app/error.tsx` |
| `136952` | `ContextualDownloadButton` | `components/ContextualDownloadButton.tsx` |
| `634408` | `Actions`, `Button`, `ButtonBlock`, `SyntaxHighlightedShellCommand` | `components/Button.tsx` |
| `733812` | `detectArchitecture`, `detectPlatform`, `findBestDownloadOption`, `getOSName` | `lib/platform.ts` |
| `942982` | `usePlatformDetection` | `lib/platform.ts` |
| `229207` | `getDownloadUrl` | `lib/platform.ts` |
| `560817` | `getButtonVariant` | `lib/button.ts` |
| `861352` | `getButtonAlignment`, `getTextAlignment` | `lib/button.ts` |
| `750624` | `getIcon` | `components/Icons.tsx` |
| `906967` | arrow/download icon glyphs | `components/Icons.tsx` |
| `264458` | `clsx`-style class join | `lib/cn.ts` |
| (`gt-next`) | `useGT`, `useMessages` | `lib/gt-shim.ts` |

## 4. Homepage section order (from SSR HTML)

1. Hero — "Cursor is your coding agent for building ambitious software."
2. Logo garden — "Trusted every day by teams that build world-class software"
3. "Agents turn ideas into code"
4. "Works autonomously, runs in parallel"
5. "In every tool, at every step"
6. "Automate repetitive work"
7. Testimonials — "The new way to build software."
8. "Stay on the frontier" (3 sub-features)
9. "Changelog" (recent releases)
10. Research — "Cursor is an applied research team…" + Recent highlights
11. Closing CTA — "Try Cursor now."

Plus the fixed `Header` and the `Footer` (Product / Resources / Company / Legal
/ Connect).

## 5. Design tokens (extracted values)

- Colors (light): `--color-theme-bg #f7f7f4`, `--color-theme-fg #26251e`,
  `--color-theme-accent #f54e00`; secondary/tertiary text and borders are
  `color-mix` derivations of `--color-theme-fg`. Dark: bg `#14120b`, fg `#edecec`.
- Type scale: `2xl 4.5rem`, `xl 3.25rem`, `lg 2.25rem`, `md-lg 1.625rem`,
  `md 1.375rem`, `base 1rem`, `sm .875rem`, `xs .75rem`, with matching
  line-height/letter-spacing tokens.
- Spacing grid: `--g = 10rem/16` (10px), `--v = 1rem * 1.4`; utilities `g1/g2/g3`
  and `v1..v4`.
- Radii `2xs..2xl`; container breakpoints 660/900/1140/1380/1470px.

## 6. Deliverables & acceptance

- `app/` at the project root (NOT `src/app/`).
- `npm install && npm run build` passes; `npm run dev` serves on `:3000`.
- Real CursorGothic/BerkeleyMono fonts and the real Cursor brand logo SVG are
  used (no Inter/JetBrains substitutes, no text wordmark for Cursor's own logo).

## 7. Scope / non-goals

- The live interactive product demos (React state machines rendered client-side)
  are represented by static, visually-faithful window mockups.
- Third-party customer logos are shown as muted wordmarks (their artwork is
  inlined SVG on the live site, not referenced by URL) to avoid embedding
  external trademark assets.
- Only the `en-US` homepage route is reconstructed.

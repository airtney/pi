# cursor.com Homepage Reconstruction

An **educational reconstruction** of the [cursor.com](https://cursor.com/) homepage as a standalone Next.js project. This is not an official Cursor/Anysphere project and is not affiliated with them. All Cursor branding, product names, copy, and CDN-hosted imagery belong to Anysphere, Inc. Built purely to study the page's layout, design tokens, and component structure.

## Running

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
npm run start  # serve production build
```

Requires Node.js 22+.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 3

## How it was built

1. Fetched `https://cursor.com/` and its CSS chunks (`/marketing-static/_next/static/chunks/*.css`) with `curl`.
2. Extracted section structure, headings, nav/footer link trees, and image URLs from the server-rendered HTML.
3. Extracted design tokens from the CSS custom properties (`--color-theme-*`, `--site-header-height`, type scale) and mapped them into `tailwind.config.ts` / `src/app/globals.css`.
4. Rewrote everything as React components — no code, markup, or assets were copied from the original bundle.

## Page structure

`src/app/page.tsx` composes, in original order:

| Component | Original section |
| --- | --- |
| `Header` | Fixed nav: Product/Resources dropdowns, Enterprise, Pricing, Sign in, Contact sales, Download |
| `Hero` | "Cursor is your coding agent for building ambitious software." + download CTAs + desktop/CLI demo |
| `LogoCloud` | "Trusted every day by teams that build world-class software" |
| `FeatureSections` | Agents / cloud agents / every tool / Automations feature blocks |
| `Testimonials` | "The new way to build software." quote wall |
| `Frontier` | "Stay on the frontier": models, codebase understanding, enterprise |
| `Changelog` | Recent changelog entries |
| `TeamSection` | Applied-research-team blurb + team photos |
| `Highlights` | "Recent highlights" blog cards |
| `CtaSection` | "Try Cursor now." |
| `Footer` | Product/Resources/Company/Legal/Connect columns + legal bar |

## Known differences from the original

- **Fonts**: the original uses the proprietary `CursorGothic` and `Berkeley Mono` typefaces. This reconstruction substitutes **Inter** (sans) and **JetBrains Mono** (mono) from Google Fonts via `next/font`. Metrics and letterforms differ slightly (CursorGothic is a narrower grotesque; Berkeley Mono has more distinctive terminals).
- **Hero demo**: the original hero embeds a fully interactive multi-window product demo (agent sidebar, editor, CLI, Mission Control) with animations. This is a static, hand-drawn approximation of its layout.
- **Company logos**: the "trusted by" strip renders styled text wordmarks instead of the trademarked SVG logos.
- **Cursor logo**: a simplified isometric-cube approximation drawn from scratch, not the original asset.
- **Testimonials**: quotes are abridged excerpts of the public statements shown on the original page; one avatar (Jensen Huang) uses a generic placeholder because the original asset URL is not directly exposed.
- **Images**: team photos, blog thumbnails, and avatars hot-link to the same public Vercel Blob CDN the original uses (`ptht05hbb1ssoooe.public.blob.vercel-storage.com`). If those URLs rot, swap in local files under `public/`.
- **Light theme only**: the original supports light/dark via theme classes; dark-token values are defined in `tailwind.config.ts` (`theme-dark-*`) but no theme toggle is implemented (used only for the CLI window mock).
- **Omitted**: analytics/GTM scripts, cookie banner, locale switcher behavior, marketing A/B logic, KaTeX/EB Garamond/Lato font faces (used by other routes), and page-load animations.

## Design tokens (light theme, extracted from the original CSS)

| Token | Value |
| --- | --- |
| Background | `#f7f7f4` |
| Foreground | `#26251e` |
| Accent | `#f54e00` |
| Card | `#f2f1ed` (steps to `#e1e0db`) |
| Success / error | `#1f8a65` / `#cf2d56` |
| Header height | `52px` |
| Base tracking | `0.005em` |

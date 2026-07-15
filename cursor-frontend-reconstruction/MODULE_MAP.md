# MODULE_MAP — Turbopack chunk → module → homepage section → repo status

Phase 0 inventory of every JS chunk served by cursor.com's homepage, produced by
scanning `_artifacts/beautified/*.js` (Prettier-beautified copies of
`_artifacts/chunks/*.js`). No deobfuscation is performed here; this document
only maps what exists in the bundles against what has already been
reconstructed in `components/`, `lib/`, and `app/`.

How to read this file:

- **Module ids** are Turbopack ids: bare numbers in the pushed module array
  (`<id>, (e) => {...}`) plus explicit ids passed to `e.s([...], <id>)`.
  Consecutive bare ids (e.g. `861352, 560817, (e) => {...}`) share one factory
  that registers each id with its own `e.s(..., id)` call.
- **Exports** are the names in `e.s([...])` tables. Two formats coexist:
  triples `"Name", 0, value` and pairs `"Name", () => binding`.
- **Status** (per module, judged against the current repo):
  - `DONE` — exports exist in `components/`/`lib/`/`app/` by name or as a
    direct equivalent (e.g. `clsx` → `lib/cn.ts`).
  - `PARTIAL` — a hand-written counterpart covers the role (usually a static
    mockup of an interactive demo) or only some of the module's exports exist.
  - `MISSING` — no counterpart in the repo.
  - `VENDOR` — third-party/framework code (React, Next.js runtime, framer
    motion, statsig, hls.js, …). Not a reconstruction target; excluded from
    DONE/MISSING counts.

Shared runtime ids referenced from almost every module (all VENDOR):
`505278` react/jsx-runtime, `612793` react, `207849` react-compiler runtime
(`useMemoCache`, seen as `(0, r.c)(n)`), `264458` clsx (reconstructed →
`lib/cn.ts`, DONE), `94884` icon base component (phosphor-style `weight`
wrapper used by every glyph module).

---

## Summary

| Status | App modules |
|--------|-------------|
| DONE | 18 |
| PARTIAL | 39 |
| MISSING | 58 |
| VENDOR / runtime / out-of-scope | 551 (of 666 total registered ids) |

Out-of-scope: `0z_dby3r97nyg.js` is blog/research **post** content (interactive
blog demos), not rendered on the homepage.

### Top 10 highest-priority MISSING modules for homepage fidelity

1. `565182` (+`961327`) `demoScenarios` — scenario data + state machine driving
   the hero multi-window interactive demo (`0qiav2qssorxk.js`, 120 KB). The
   single biggest fidelity gap: the repo hero demo is a static frame.
2. `417038` `DemoPlaybackProvider`/`useDemoPlayback` + `152831`
   `getDelayForRole`/`isToolRole` — the playback engine that sequences every
   section demo (typing, tool calls, timed reveals).
3. ~~`956347` `ThemeProvider`/`useTheme` + `275252` theme switcher + `594221`
   select control~~ — now DONE: `lib/theme.tsx`,
   `components/ThemeSwitcher.tsx`, `components/PillToggle.tsx` (switcher wired
   into the footer, provider into `app/layout.tsx`).
4. `359689` `ChangelogProvider`/`useChangelog` — data source for the
   "Changelog" section; repo `Changelog.tsx` hardcodes entries.
5. ~~`618689`/`121585` `getFadeClassName` + `FadeInImage`~~ — now DONE:
   `lib/fade.ts` + `components/FadeInImage.tsx`, wired into the team photo
   and logo-garden images.
6. `387944` `FigmaLogo`/`GitHubLogo`/`JiraLogo`/`LinearLogo`/`NotionLogo`/
   `PagerDutyLogo`/`SlackLogo` — integration glyphs used by the "Automate
   repetitive work" automation demo.
7. `995201` `MobileAgentChatContent`/`MobileAgentDefaultContent` — the mobile
   variant of the hero/agent demo; responsive fidelity currently degrades.
8. `599167` walkthrough suite (`WalkthroughLightbox`,
   `VideoWalkthroughCardAsset`, `MiniDesktopRecording`, `useWalkthroughAnimation`)
   + `698926` `Play` / `Pause` — the "Works autonomously, runs in parallel"
   video/walkthrough media.
9. `740719` `DEFAULT_MODELS` + `932341` `LATEST_1P_MODEL` — model list data
   rendered in the demo model pickers (GPT-5.6, Gemini 3.1 Pro, Composer …);
   repo hardcodes a single "Composer 2.5" string.
10. `506565` `getFooterSpacing`/`hasFooterContent`/`hasItemContent` + `941710`
    `getTextSize` + `54518`/`620487` heading-level helpers — section layout
    plumbing (spacing, semantic heading levels, text scale) that keeps the
    feature sections visually exact.

---

## Chunk-by-chunk inventory

### 1. `02084l3n5byim.js` (324 KB, 3 module ids)

Hero interactive product demo (desktop windows: "Ask Cursor to plan or build
anything", browser preview, health metrics dashboard, terminal).

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `311498` | `Microphone`, `TEMPLATE_OPTIONS`, `default` | Hero product demo | PARTIAL — static `components/sections/HeroProductDemo.tsx` |
| `974593` | (helper registered in the same factory as `311498`) | Hero product demo | PARTIAL (with `311498`) |
| `692420` | `Terminal` | Hero / CLI demos | PARTIAL — `AgentCliWindow` in `components/demo/SlackCliWindows.tsx` |

### 2. `03h7_gfiqul9j.js` (13 KB, 9 module ids)

App Router error page + next/link internals.
Ids: `18964`, `29167`, `77460` (`useMergedRef`), `207849`, `297166`, `335159`
(`errorOnce`), `522336` (`warnOnce`), `547725` (`isLocalURL`), `641852`.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `641852` | `default` | Error page | DONE — `app/error.tsx` |
| others | next/react internals | — | VENDOR |

### 3. `03~yq9q893hmn.js` (202 KB)

Browser polyfill bundle (core-js style IIFE; **not** a Turbopack module array —
no module ids). VENDOR.

### 4. `04kvlyqnlrxc-.js` (37 KB, 12 module ids)

Radix UI primitives. Ids: `9413` (`createContextScope`), `18731`
(`useLayoutEffect`), `136567` (`useControllableState`), `160310`
(`createSlot`/`createSlottable`), `223854` (`composeRefs`/`useComposedRefs`),
`291967` (`composeEventHandlers`), `363584`
(`AccordionRoot`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`),
`411207` (`useId`), `714463` (`Primitive`), `770621`, `775649`
(`createCollection`/`useDirection`), `967154` (`Presence`). All VENDOR.

### 5. `0572hgflw542..js` (233 KB, 26 module ids) — **main homepage sections chunk**

Contains the SSR'd homepage section components (hero, features, testimonials,
changelog card, Slack demo). Strings match every homepage headline.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `677869` | `HomeHeroSection`, `HomeFeaturesSection` | Hero + all four feature sections | PARTIAL — `Hero.tsx`, `FeatureSections.tsx` (static) |
| `329329` | `default` (two-column feature layout: banner/eyebrow/title/body/cta) | Feature sections | PARTIAL — layout inlined in `FeatureSections.tsx` |
| `270837` | `default` (agent chat with model picker: "GPT-5.6", "Gemini 3.1 Pro", "Add a follow-up") | Agents demo | PARTIAL — approximated by `ComposerBox`/`AgentPlanWindow` |
| `316688` | `default` ("Ask Cursor to plan or build anything" prompt card) | Hero demo | PARTIAL — `HeroProductDemo.tsx` |
| `616662` | `default` (Slack conversation demo, "Open in Cursor", "Launched an agent…") | "In every tool" | PARTIAL — `SlackWindow` in `SlackCliWindows.tsx` |
| `760872` | `default` (agent CLI progress demo, `msg()`-driven: "Grepped", "Searched") | "Automate repetitive work" | PARTIAL — `AgentCliWindow` |
| `693744` | `StaggeredShuffleTestimonials` | Testimonials | PARTIAL — static grid in `Testimonials.tsx`, no shuffle animation |
| `625857` + `503342` | `default` (customer story cards, "Read Story →") | Testimonials | PARTIAL — `Testimonials.tsx` |
| `924561` | `default` ("See what's new in Cursor" card) | Changelog | PARTIAL — `Changelog.tsx` |
| `359689` | `ChangelogProvider`, `useChangelog` | Changelog | MISSING |
| `506565` | `getFooterSpacing`, `hasFooterContent`, `hasItemContent` | Section layout helpers | MISSING |
| `300815` | `CursorIcon`, `CursorIconStyle` | Brand | DONE — `components/CursorLogo.tsx` |
| `387944` | `FigmaLogo`, `GitHubLogo`, `JiraLogo`, `LinearLogo`, `NotionLogo`, `PagerDutyLogo`, `SlackLogo` | Automation demo logos | MISSING |
| `434070` | `default` (platform label, "Linux / WSL") | Download CTA | PARTIAL — labels in `ContextualDownloadButton.tsx` |
| `54518` | `default` (heading step-down helper h1→h2…) | Layout | MISSING |
| `620487` | `default` (semantic heading component) | Layout | MISSING |
| `756464` | `default` (date formatter, timeZone) | Changelog | MISSING |
| `941710` | `getTextSize` | Layout | MISSING |
| `264445` | `default` (unnamed 16×16 SVG glyph) | Icon | MISSING |
| `444229` | `Check` | Icon | PARTIAL — `CheckCircleIcon` in `demo/primitives.tsx` |
| `939843` | `X`, `XIcon` | Icon | PARTIAL — `CloseIcon` in `demo/primitives.tsx` |
| `632045` | `MagnifyingGlass` | Icon | MISSING |
| `914358` | `Plus` | Icon | MISSING |
| `983074` | `GitBranch` | Icon | MISSING |
| `679699` | (helper in shared factory) | — | — |

### 6. `0.76mvbwd71i_.js` (51 KB, 14 module ids)

Cookies + analytics attribution. Ids: `67541`, `139890`, `174927`, `191605`,
`222792`, `263450`, `272187`, `413676`, `455980`, `524575`, `659929`, `678439`,
`870132`, `937174`.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `413676` | `default` (tracked `Link`), `LinkProvider` | Site-wide links | PARTIAL — `components/Link.tsx` (no tracking/provider) |
| `263450` | `useCTATracking` | CTA analytics | MISSING |
| `678439` | `trackEvent`, `getPageContext`, `getSourceInfo`, … | Analytics | MISSING |
| `139890` | marketing attribution store (`captureFromUrl`, …) | Analytics | MISSING |
| `659929` | `getAnonymousId` | Analytics | MISSING |
| `67541`/`272187` | cookies-next | — | VENDOR |
| `174927` + rest | CJS helper lib internals | — | VENDOR |

### 7. `081pyjdj6y60t.js` (106 KB, 31 module ids)

App shell: i18n client, platform detection, theming, analytics, shared icons.
Ids: `96053`, `146682`, `148742`, `152490`, `167803`, `193771`, `229207`,
`275252`, `280542`, `311031`, `336795`, `338280`, `346140`, `367135`, `411318`,
`449153`, `500120`, `548116`, `594221`, `707328`, `716516`, `733812`, `760850`,
`773206`, `777685`, `792661`, `843695`, `906967`, `928402`, `942982`, `956347`.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `733812` | `detectArchitecture`, `detectPlatform`, `findBestDownloadOption`, `getOSName` | Download CTA | DONE — `lib/platform.ts` |
| `942982` | `usePlatformDetection` | Download CTA | DONE — `lib/platform.ts` |
| `229207` | `getDownloadUrl` | Download CTA | DONE — `lib/platform.ts` |
| `346140`/`411318` | gt-next client (`useGT`, `useMessages`, `T`, `Var`, …) | i18n | DONE (by design) — `lib/gt-shim.ts` implements the two hooks the homepage needs |
| `906967` | `CheckmarkIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `DownwardsArrowIcon`, `DownwardsArrowToBarIcon`, `MonitorIcon`, `MoonIcon`, `NorthEastArrowIcon`, `RightwardsArrowIcon`, `SunIcon`, `UpwardsArrowIcon` | Shared icons | PARTIAL — `components/Icons.tsx` has 8 (arrow/up/down/ne/download + Sun/Moon/Monitor); Chevron/Checkmark missing |
| `956347` | `ThemeProvider`, `useTheme` | Theming | DONE — `lib/theme.tsx` |
| `275252` | `default` (theme switcher: Sun/Moon/Monitor select) | Footer | DONE — `components/ThemeSwitcher.tsx` |
| `594221` | `default` (select/dropdown control) | Footer | DONE — `components/PillToggle.tsx` |
| `338280` | `default` (locale selector) | Footer | MISSING |
| `707328` | `default` ("Cursor logo animation", "Get brand assets" context menu) | Header | PARTIAL — static `CursorLogo.tsx` |
| `548116` | `useMediaQuery` | Utility | MISSING |
| `928402` | `usePrefersReducedMotion` | Utility | MISSING |
| `280542` | `addLocalePrefix`, `generateBlogUrl`, `generateChangelogUrl` | URL helpers | MISSING |
| `148742` | `default` (hash scroll handler) | Utility | MISSING |
| `167803` | `ClientToaster` | Toasts | MISSING |
| `367135` | `identifyConceptualUser`, `trackConceptualEvent` (+ `152490` `useDownloadTracking`) | Analytics | MISSING |
| `449153`/`500120`/`760850` | GA4 identity/events/pageview | Analytics | MISSING |
| `311031` | `whenGtagReady` | Analytics | MISSING |
| `843695` | `MarketingAttributionCapture` | Analytics | MISSING |
| `716516` | `default` (Statsig provider bootstrap) | Experimentation | MISSING |
| `773206`/`777685`/`96053` | Vercel SpeedInsights / Analytics / next script | — | VENDOR |

### 8. `09-zgo-z~gsem.js` (440 KB, 24 module ids)

Next.js App Router client bootstrap (hydrate, appBootstrap, router state,
`AppRouterAnnouncer`). Ids: `93420`, `95589`, `115355`, `115472`, `161196`,
`179716`, `195879`, `197890`, `238544`, `284701`, `324730`, `385154`, `419843`,
`540749`, `545080`, `558033`, `664776`, `695158`, `767453`, `775965`, `785741`,
`797671`, `841531`, `856151`. All VENDOR.

### 9. `0a573kobc1opg.js` (88 KB, 9 module ids)

Demo playback engine + feature media blocks.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `417038` | `DemoPlaybackProvider`, `useDemoPlayback` | All section demos | MISSING |
| `152831` | `getDelayForRole`, `isToolRole` | Demo timing | MISSING |
| `388537` | `hasValidLink`, `isExternalLink` | Link helpers | MISSING |
| `446295` | `default` (feature media container, play-on-hover, `media-border-container`) | Feature sections | PARTIAL — media styling in `FeatureSections.tsx` |
| `919473` | `default` (agent plan demo: "Planning next moves", "Plan updated. Ready to build!") | Agents demo | PARTIAL — `components/demo/AgentPlanWindow.tsx` |
| `644745` | `default` (SVG glyph) | Icon | MISSING |
| `680976` | `CaretLeft` | Icon | MISSING |
| `798791` | `default` (animation utils: `CSS.supports`, matchMedia) | Utility | MISSING |
| `992741` | (helper) | — | — |

### 10. `0bvhregxbt1vw.js` (234 KB, 61 module ids)

Next.js router internals (reducers, prefetch, path utils, `callServer`). Ids:
`43716`, `55236`, `85674`, `87161`, `94948`, `96246`, `109927`, `125722`,
`168168`, `171446`, `187829`, `189932`, `195315`, `198609`, `232897`, `233127`,
`241574`, `251031`, `251051`, `306574`, `307528`, `318999`, `352511`, `355567`,
`403298`, `413767`, `457030`, `465417`, `480094`, `486384`, `514832`, `517282`,
`571074`, `588612`, `607203`, `615887`, `616633`, `628550`, `644861`, `657795`,
`660641`, `691472`, `727289`, `729364`, `746778`, `779212`, `783561`, `784694`,
`787300`, `792450`, `802289`, `815381`, `822751`, `842176`, `850113`, `851180`,
`878874`, `930552`, `930707`, `983866`, `995654`. All VENDOR.

### 11. `0gptkp4k9usob.js` (199 KB, 79 module ids)

Statsig JS SDK (majority of ids) + three app modules.
App-relevant ids below; the remaining 76 (`7339`, `8688`, `17600`, `26523`,
`26837`, `32139`, `37287`, `75887`, `96226`, `102870`, `106332`, `121691`,
`147803`, `152368`, `157622`, `157874`, `158169`, `183247`, `242224`, `250070`,
`259860`, `284610`, `287717`, `301476`, `342831`, `344520`, `349023`, `365839`,
`371445`, `372343`, `386812`, `393600`, `397727`, `407600`, `412364`, `429143`,
`432971`, `447177`, `511793`, `521536`, `544905`, `546115`, `546997`, `550080`,
`571029`, `586920`, `594061`, `619646`, `624495`, `627768`, `646250`, `655449`,
`675577`, `703905`, `707761`, `727403`, `734285`, `735237`, `785401`, `799209`,
`800533`, `806344`, `810056`, `817099`, `842004`, `844897`, `849827`, `863584`,
`885579`, `929837`, `934635`, `947156`, `949850`, `961141`, `973301`, `982505`)
are VENDOR.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `210859` | `HeaderDownloadButton` | Header | PARTIAL — download CTA inlined in `components/Header.tsx` |
| `806211` | `default` (mobile nav drawer, "Back to main navigation") | Header | PARTIAL — mobile menu in `Header.tsx` |
| `483470` | `default` (footer link column with locale-aware links) | Footer | PARTIAL — `components/Footer.tsx` |

### 12. `0id4kgsv6.qtk.js` (86 KB, 2 module ids)

Automation demo windows ("Automate repetitive work").

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `147841` | `default` (trigger picker: "Any incident event", "New message in", "GitHub / GitLab") | Automation demo | PARTIAL — `components/demo/AutomationWindow.tsx` |
| `395394` | `default` (action list: "Send to Slack", "Open Pull Request", "Resolve git conflicts automatically") | Automation demo | PARTIAL — `AutomationWindow.tsx` |

### 13. `0ihovnw0k95w5.js` (63 KB, 13 module ids)

next/link internals + site config + clsx. Ids: `18964`, `29167`, `77460`,
`152858`, `207849`, `225927`, `264458`, `297166`, `335159`, `522336`, `533715`,
`547725`, `605226`.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `264458` | clsx-style class join (CJS) | Utility | DONE — `lib/cn.ts` |
| `605226` | `BREAKPOINTS`, `defaultLanguage`, `experimentBasePaths`, `supportedLanguages` | Site config | MISSING |
| others | next/link internals | — | VENDOR |

### 14. `0j0-ri9gr3tl..js` (254 KB, 7 module ids)

Remote desktop / walkthrough demos ("Works autonomously, runs in parallel").

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `700185` | `RemoteDesktopPanel`, `RemoteDesktopViewport`, `DraggableMiniWindow`, `MiniDashboardWindow`, `MiniTerminalWindow`, `MiniWindowChrome`, `MiniTitleBar`, `LabeledCursor`, `ClickRipple`, … | Parallel-agents demo | PARTIAL — static mockups in `FeatureSections.tsx` / `demo/primitives.tsx` |
| `599167` | `Pause`, `WalkthroughLightbox`, `VideoWalkthroughCardAsset`, `MiniDesktopRecording`, `MiniScreenRecording`, `MiniBrowserWindow`, `ArtifactRevealShell`, `useWalkthroughAnimation`, `DESKTOP_ANIMATION` | Parallel-agents demo | MISSING |
| `698926` | `Play` | Icon | MISSING |
| `189266` | `REMOTE_WALLPAPER_1`, `REMOTE_WALLPAPER_4` | Demo wallpapers | PARTIAL — wallpaper approximations in CSS/`HeroProductDemo.tsx` |
| `995201` | `MobileAgentChatContent`, `MobileAgentDefaultContent`, `default` | Hero (mobile) | MISSING |
| `64604`, `707217` | (helpers in shared factories) | — | — |

### 15. `0l3lu0cb53.v5.js` (96 KB, 1 module id)

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `44620` | `default` (web agents dashboard demo: "Acme Research Dashboard", "Live Telemetry Pipeline", …) | Parallel-agents / web demo | PARTIAL — `components/demo/WebAgentsWindow.tsx` |

### 16. `0n2qf0eb4x497.js` (66 KB, 9 module ids)

Hero demo shell + small glyphs.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `36135` | `default` (hero demo container; aria: "Interactive demo with multiple windows showing Cursor's AI-powered features") | Hero demo | PARTIAL — `HeroProductDemo.tsx` |
| `80800` | `Spinner` | Icon | MISSING |
| `483363` | `DotsThree`, `DotsThreeIcon` | Icon | MISSING |
| `573772` | `Globe` | Icon | MISSING |
| `587888` | `CaretRight` | Icon | MISSING |
| `125467`, `204786`, `415730`, `449008` | `default` (small SVG glyphs) | Icons | MISSING |

### 17. `0n8phzttu9nva.js` (50 KB, 31 module ids)

React + Next.js shared runtime: `505278` (react/jsx-runtime), `612793` (react),
`969567` (`InvariantError`), `136308`/`298598` (action async storage),
`115142`/`356400` (work async storage), `306540` (`RedirectStatusCode`),
`661140`, `943339`, plus ids `24543`, `31344`, `76647`, `258794`, `260206`,
`277469`, `286135`, `306139`, `355396`, `481258`, `545868`, `588518`, `643884`,
`645696`, `680648`, `744066`, `888539`, `912357`, `925032`, `954512`, `981094`.
All VENDOR.

### 18. `0pb5p8l232hdt.js` (1.4 MB, 6 module ids)

Video stack: hls.js + media-chrome + Mux player (`180185` exports `Video`,
`MediaUIEvents`, `formatTime`, …) + prop-types shims (`35305`, `561227`,
`304153`) + `209048`, `212973`. All VENDOR (used by walkthrough videos).

### 19. `0pndbgv1nwvs5.js` (71 KB, 3 module ids)

Code editor demo with shiki syntax highlighting.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `39014` | `default` (editor window: file explorer + shiki themes, "Created Cursor IDE demo with file explorer and syntax highlighting") | Agents demo | PARTIAL — static editor mock in `AgentPlanWindow.tsx` |
| `686699` | `default` (file "Explorer" tree) | Agents demo | PARTIAL — same |
| `472768` | `CaretDown` | Icon | PARTIAL — `ChevronDown` in `demo/primitives.tsx` |

### 20. `0qiav2qssorxk.js` (120 KB, 2 module ids)

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `565182` | `demoScenarios`, `default` | Hero demo scenario data/state machine | MISSING |
| `961327` | `default` (registered in same factory) | Hero demo | MISSING (with `565182`) |

### 21. `0.r46s6y65my3.js` (242 KB, 114 module ids)

framer-motion / `motion` package (all of it: `motion`, `AnimatePresence`,
`MotionConfigContext`, gestures, projection, easing, color mixers, …).
Ids: `16919`, `19563`, `21280`, `26809`, `33795`, `57307`, `69886`, `92727`,
`94801`, `94907`, `96819`, `105110`, `108817`, `119058`, `136656`, `138526`,
`149921`, `161560`, `168741`, `181142`, `185770`, `193009`, `221007`, `226112`,
`235629`, `236585`, `241058`, `250438`, `253422`, `254336`, `265546`, `282466`,
`287120`, `290932`, `324032`, `324169`, `328437`, `329957`, `340059`, `341639`,
`341807`, `348971`, `357318`, `364238`, `364646`, `369379`, `369844`, `409138`,
`413316`, `420460`, `427139`, `427684`, `430598`, `431227`, `431772`, `448272`,
`453396`, `461736`, `462160`, `470919`, `478328`, `488599`, `490692`, `493858`,
`502225`, `524785`, `530017`, `556507`, `560926`, `562493`, `568731`, `570606`,
`597719`, `604445`, `611920`, `623714`, `634907`, `639068`, `645744`, `652381`,
`656731`, `665901`, `673513`, `678468`, `679091`, `679514`, `692672`, `702915`,
`730525`, `742917`, `751915`, `756321`, `786843`, `796402`, `796457`, `828301`,
`831388`, `838752`, `840900`, `850669`, `870820`, `891945`, `919496`, `921496`,
`921692`, `926490`, `929289`, `957798`, `961417`, `967682`, `972643`, `991363`,
`994450`, `994452`. All VENDOR.

### 22. `0s-~o46x2o3-k.js` (52 KB, 20 module ids) — **core CTA chunk**

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `136952` | `ContextualDownloadButton` | Hero / CTA | DONE — `components/ContextualDownloadButton.tsx` |
| `634408` | `Actions`, `Button`, `ButtonBlock`, `SyntaxHighlightedShellCommand` | All CTAs | DONE — `components/Button.tsx` |
| `560817` | `getButtonVariant` | Buttons | DONE — `lib/button.ts` |
| `861352` | `getButtonAlignment`, `getFlexAlignment`, `getMarginAlignment`, `getTextAlignment` | Buttons | PARTIAL — `lib/button.ts` has 2 of 4 (`getFlexAlignment`, `getMarginAlignment` missing) |
| `750624` | `getIcon` | Buttons | DONE — `components/Icons.tsx` |
| `183558` | `DownloadPlatformProvider`, `useDownloadPlatform` | Download CTA | PARTIAL — hook in `lib/platform.ts`; provider missing |
| `144384` | `default` (copy-to-clipboard button) | Shell command CTA | PARTIAL — copy logic inlined in `Button.tsx` |
| `694042` | `Image`, `target` (next/image wrapper) | Images | VENDOR (next/image) |
| `362192`, `564154`, `800850`, `900326`, `523476`, `229138`, `512975`, `668344`, `914302`, `540796`, `643991`, `986848` | next/image + router context internals | — | VENDOR |

### 23. `0-s6avy_5tur_.js` (20 KB, 12 module ids)

Next.js internals (`HeadManagerContext`, `handleISRError`,
`useUntrackedPathname`, `createRouterCacheKey`, …). Ids: `101955`, `217934`,
`251083`, `252393`, `421159`, `471683`, `474626`, `561572`, `600993`, `626140`,
`628535`, `755082`. All VENDOR.

### 24. `0.~slk7z2erdp.js` (2.8 KB, 7 module ids)

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `618689` | `getFadeClassName` | Site-wide image fade-in | DONE — `lib/fade.ts` |
| `121585` | `FadeInImage` | Site-wide image fade-in | DONE — `components/FadeInImage.tsx` |
| `427772` | `resolveElements` (motion util) | — | VENDOR |
| `938243`, `712202`, `657547`, `731784` | async chunk loader stubs (`t.v(...)`) | — | runtime glue |

### 25. `0xx5mh9btj-pb.js` (57 KB, 23 module ids)

Next.js client internals (`ClientPageRoot`, `ClientSegmentRoot`,
`HTTPAccessFallbackBoundary`, `IconMark`, async storage instances, …).
Ids: `39325`, `42467`, `69194`, `88001`, `190112`, `202562`, `229033`,
`271653`, `313435`, `374840`, `427824`, `538535`, `564913`, `610973`, `678738`,
`702692`, `721340`, `743867`, `775572`, `800408`, `854821`, `927383`, `971760`.
All VENDOR.

### 26. `0z_dby3r97nyg.js` (554 KB, 65 module ids)

Blog/research **post** content: interactive article demos (`MmapIndexDemo`,
`SuffixArrayDemo`, `TrigramIndexDemo`, `SparseNgramsDemo`, `PhraseIndexDemo`,
`AgentTimelineDemo`, `PerformanceChart`, `RewardHackingBenchmarkTable`,
`MDXSlideshow`, `ProseColumn`/`TwoColumnSection`, `CustomerQuoteSelector`, …).
Ids: `4928`, `20276`, `31299`, `36148`, `45875`, `50878`, `51260`, `54493`,
`64023`, `78731`, `82265`, `99196`, `126617`, `133422`, `139643`, `144009`,
`158203`, `164552`, `165694`, `182764`, `205048`, `232057`, `248683`, `252271`,
`253199`, `253922`, `256528`, `292061`, `292661`, `311124`, `311275`, `314144`,
`362994`, `382602`, `396440`, `396702`, `422552`, `429158`, `449475`, `459717`,
`469176`, `522221`, `550466`, `552246`, `554118`, `555092`, `564319`, `652299`,
`653956`, `675144`, `710253`, `722601`, `781354`, `807226`, `815954`, `828779`,
`836357`, `839262`, `856656`, `892503`, `895837`, `900749`, `932319`, `934685`,
`963753`. **Out of scope** — not rendered on the homepage (only linked from the
Research section).

### 27. `0zpcdpkmxmnc1.js` (101 KB, 36 module ids)

Next.js navigation/error internals (`notFound`, `forbidden`, `unauthorized`,
`ReadonlyURLSearchParams`, `isNextRouterError`, …). Ids: `11417`, `44762`,
`82620`, `98638`, `102355`, `109304`, `117528`, `222956`, `260310`, `268179`,
`299609`, `313145`, `350468`, `362450`, `376555`, `425232`, `444101`, `444285`,
`457723`, `491309`, `576706`, `589428`, `615906`, `645443`, `661675`, `680112`,
`732338`, `749845`, `757220`, `759941`, `762533`, `784485`, `837228`, `895714`,
`895884`, `922498`. All VENDOR.

### 28. `0~e2ceqe0b_nr.js` (136 KB, 2 module ids)

Agent plan/editor window demo (shiki-highlighted files, plan tasks
"Add a task, ⌘K to generate...", "Join our team →").

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `654011` | `default` (plan + editor window demo) | Agents demo | PARTIAL — `components/demo/AgentPlanWindow.tsx` |
| `166843` | `isBrowserFile`, `isCodeFile`, `isPlanFile` | Agents demo helpers | MISSING |

### 29. `10u-qbmji7lqm.js` (57 KB, 12 module ids)

Chat composer + model data + glyphs.

| Module id | Exports | Section | Status |
|-----------|---------|---------|--------|
| `651466` | `default` (composer input, "Plan, search, build anything...") | Demos | PARTIAL — `ComposerBox` in `demo/primitives.tsx` |
| `740719` | `DEFAULT_MODELS`, `default` | Demo model pickers | MISSING |
| `932341` | `LATEST_1P_MODEL` | Demo model pickers | MISSING |
| `13600` | `ArrowUp`, `ArrowUpIcon` | Icon | PARTIAL — `SendArrowUp` in primitives |
| `170743` | `AtIcon` | Icon | MISSING |
| `22672` | `buildAspectClasses` | Layout | MISSING |
| `267878`, `514372`, `538411`, `936848`, `942956` | `default` (SVG glyphs/logos) | Icons | MISSING |
| `94884` | icon base wrapper (`weight="regular"`) | — | VENDOR |

### 30. `14s_myja48akq.js` (1.7 MB, 13 module ids)

gt-next full runtime + en-US locale data + polyfill deps (base64-js, ieee754,
buffer, events). `545880` re-exports the full gt-next API (`GTProvider`,
`useGT`, `useMessages`, `T`, `Var`, …); `16675`/`387595` are locale JSON
(`name`, `raw`, `default`). Remaining ids: `88225`, `210102`, `259390`,
`339352`, `453876`, `486704`, `561720`, `831501`, `931135`, `962866`.
Status: VENDOR, functionally replaced by `lib/gt-shim.ts` (DONE by design for
the two hooks the homepage uses).

### 31. `17nsuep_9254c.js` (102 KB, 18 module ids)

TanStack React Query (`QueryClient`, `QueryCache`, `useQueryClient`, …) +
toaster (`360112` `Toaster`/`toast`) + `735590` `ReactQueryProvider`.
Ids: `22358`, `44306`, `86296`, `134779`, `251759`, `354881`, `360112`,
`566130`, `629070`, `669406`, `717888`, `735590`, `794062`, `814023`, `869300`,
`895765`, `937486`, `965889`. All VENDOR (provider glue not needed by the
static reconstruction).

### 32. `turbopack-08av2-_rmz3t_.js` (19 KB)

Turbopack runtime (module registry, `e.s`/`e.i`/`e.r` implementation, chunk
loader). No module ids. VENDOR/runtime.

---

## Merged REPLICA_CONCEPT.md module table (verified against chunks)

All rows from the REPLICA_CONCEPT.md §3 table were located and confirmed:

| Module id | Export(s) | Chunk | Reconstructed as | Status |
|-----------|-----------|-------|------------------|--------|
| `641852` | App Router `error` default | `03h7_gfiqul9j.js` | `app/error.tsx` | DONE |
| `136952` | `ContextualDownloadButton` | `0s-~o46x2o3-k.js` | `components/ContextualDownloadButton.tsx` | DONE |
| `634408` | `Actions`, `Button`, `ButtonBlock`, `SyntaxHighlightedShellCommand` | `0s-~o46x2o3-k.js` | `components/Button.tsx` | DONE |
| `733812` | `detectArchitecture`, `detectPlatform`, `findBestDownloadOption`, `getOSName` | `081pyjdj6y60t.js` | `lib/platform.ts` | DONE |
| `942982` | `usePlatformDetection` | `081pyjdj6y60t.js` | `lib/platform.ts` | DONE |
| `229207` | `getDownloadUrl` | `081pyjdj6y60t.js` | `lib/platform.ts` | DONE |
| `560817` | `getButtonVariant` | `0s-~o46x2o3-k.js` | `lib/button.ts` | DONE |
| `861352` | `getButtonAlignment`, `getTextAlignment` (+ `getFlexAlignment`, `getMarginAlignment` not in concept table) | `0s-~o46x2o3-k.js` | `lib/button.ts` | PARTIAL — 2 of 4 exports |
| `750624` | `getIcon` | `0s-~o46x2o3-k.js` | `components/Icons.tsx` | DONE |
| `906967` | arrow/download icon glyphs (11 named icons) | `081pyjdj6y60t.js` | `components/Icons.tsx` | PARTIAL — 8 of 11 glyphs |
| `264458` | clsx-style class join | `0ihovnw0k95w5.js` | `lib/cn.ts` | DONE |
| (gt-next) | `useGT`, `useMessages` | `081pyjdj6y60t.js` (`346140`/`411318`), `14s_myja48akq.js` (`545880`) | `lib/gt-shim.ts` | DONE (shim by design) |

Corrections/additions relative to the concept table:

- `861352` also exports `getFlexAlignment` and `getMarginAlignment` (both
  missing from `lib/button.ts`).
- `183558` (`DownloadPlatformProvider`/`useDownloadPlatform`) was reconstructed
  hook-only; the provider is missing.
- The concept table attributed the icon glyphs to `906967` only; the full icon
  inventory also spans `0572hgflw542..js` (Check/X/Plus/MagnifyingGlass/
  GitBranch), `0n2qf0eb4x497.js` (Spinner/Globe/DotsThree/CaretRight),
  `0j0-ri9gr3tl..js` (Play/Pause), `0a573kobc1opg.js` (CaretLeft),
  `0pndbgv1nwvs5.js` (CaretDown), and `10u-qbmji7lqm.js` (ArrowUp/AtIcon).

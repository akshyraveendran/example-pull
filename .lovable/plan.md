# Horizontal Scroll Website — Implementation Plan

> Stack note: this project runs on **TanStack Start (React 19 + Vite 7)**, not Next.js. The architecture below is identical in intent to the Next.js recommendation in your brief, mapped 1:1 onto TanStack Start's file-based routing in `src/routes/`. No structural change to the Blueprint.

---

## 1. PROJECT FOUNDATION

**Framework**
- TanStack Start (already configured). Single route `src/routes/index.tsx` renders the entire experience (single-viewport site).

**Folder structure**
```
src/
├── routes/
│   └── index.tsx                  # mounts <App/>
├── components/
│   ├── layout/
│   │   ├── FixedNavbar.tsx
│   │   ├── MainViewport.tsx
│   │   ├── HorizontalScrollWrapper.tsx
│   │   └── ScrollTrack.tsx
│   ├── sections/
│   │   ├── SectionHero.tsx
│   │   ├── SectionHeritage.tsx
│   │   ├── SectionCuisine.tsx
│   │   ├── SectionWine.tsx
│   │   ├── SectionRooms.tsx
│   │   ├── SectionSpa.tsx
│   │   ├── SectionExperience.tsx
│   │   └── SectionRecommendations.tsx
│   └── hero/
│       └── HeroFrameCanvas.tsx    # frame-sequence container (no animation yet)
├── hooks/
│   ├── useHorizontalScroll.ts     # scroll engine
│   ├── useActiveSection.ts        # nav sync
│   ├── useViewportMode.ts         # desktop vs mobile switch
│   └── useFrameSequence.ts        # hero frames preloader (stub now)
├── utils/
│   ├── scrollMath.ts              # deltaY → translateX, boundaries
│   ├── sections.ts                # ordered section registry (single source of truth)
│   └── frames.ts                  # frame paths + naming
└── styles.css
```

**Naming conventions**
- Components: `PascalCase.tsx`. Hooks: `useCamelCase.ts`. Utils: `camelCase.ts`.
- Section files mirror Blueprint names exactly: `Section_Hero` → `SectionHero.tsx`.
- Section IDs (slugs): `hero | heritage | cuisine | wine | rooms | spa | experience | recommendations`.

**Separation of concerns (hard rule)**
- **Layout** components own DOM + size only. No animation, no scroll math.
- **Hooks** own all logic (scroll capture, math, state).
- **Sections** own their own content; they NEVER read or write scroll state.
- **utils/sections.ts** is the only place section order is defined. Navbar, ScrollTrack, and nav sync all import from it.

---

## 2. LAYOUT SHELL IMPLEMENTATION

Build order and responsibilities (top → bottom of tree):

1. **FixedNavbar** — `position: fixed; top:0; left:0; right:0; z-index:50`. Independent layer, never inside MainViewport. Contains LogoComponent + NavLinks (Home, Heritage, Cuisine, Wine, Rooms, Spa, Summer per Blueprint). **Does not move.**
2. **MainViewport** — `width:100vw; height:100vh; overflow:hidden; position:relative`. Locks the screen. **Does not move.** Disables native vertical scroll on `<html>/<body>` (set body `overflow:hidden` via a layout effect, restore on unmount).
3. **HorizontalScrollWrapper** — sits inside MainViewport, `width:100%; height:100%; position:relative; will-change:transform`. Acts as the clipping/positioning frame and the ref target the scroll engine reads dimensions from. **Does not move itself.**
4. **ScrollTrack** — the **ONLY** moving element. `display:flex; flex-wrap:nowrap; height:100%; width:<computed>px; transform:translate3d(x,0,0); will-change:transform`. Children = sections in order, each `width:100vw; height:100vh; flex:0 0 100vw`.

Movement contract (locked):
- Moves: `ScrollTrack` (transform only).
- Fixed: `FixedNavbar`, `MainViewport`, `HorizontalScrollWrapper`, page body.

---

## 3. SCROLL ENGINE (CRITICAL CORE)

**Tooling choice: GSAP + ScrollTrigger + ScrollSmoother (or Lenis as smoother).**
Why optimal:
- ScrollTrigger handles pinning, boundary clamping, resize recalculation, and progress mapping out of the box — eliminates the three failure modes (jitter, over-scroll, desync) that hand-rolled wheel listeners suffer from.
- It uses native vertical scroll as the input source, so trackpad inertia, keyboard PageDown, spacebar, and mobile gestures all work without bespoke handling.
- Lenis (or ScrollSmoother) interpolates the input → buttery cinematic feel, prerequisite for the hero frame sequence sync later.

**Mechanism**
- `document.body` height is set to `viewportWidth + (totalTrackWidth − viewportWidth)` so the browser produces real vertical scroll distance equal to the horizontal travel.
- A single ScrollTrigger pins `MainViewport`, with `scrub: true`, animating `ScrollTrack` from `x: 0` to `x: -(trackWidth − viewportWidth)`.
- Lenis wraps window scroll for interpolation; ScrollTrigger is connected via `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(...)`.

**State management**
- Source of truth = ScrollTrigger progress (0 → 1). Exposed through `useHorizontalScroll()` returning `{ progress, x, activeIndex, scrollToIndex }`.
- Active index = `Math.round(progress * (sectionCount − 1))` with a hysteresis buffer (±0.02) to avoid flicker at boundaries.
- No component holds duplicated scroll state; consumers subscribe via the hook only.

**Boundary calculations** (`utils/scrollMath.ts`)
- `trackWidth = sectionCount * viewportWidth`
- `maxX = -(trackWidth - viewportWidth)`
- `xForIndex(i) = -i * viewportWidth`
- `pageHeight = trackWidth` (used to size the scroll spacer).

**Resize handling**
- One `ResizeObserver` on `MainViewport` → recompute `viewportWidth`, `trackWidth`, `maxX`, `pageHeight`; call `ScrollTrigger.refresh()`.
- Debounced 120ms. Lock orientation-change recompute in the same handler.

**Anti-jitter / anti-desync rules**
- Only `transform: translate3d` on ScrollTrack — never `left`, `margin`, or width transitions.
- No competing wheel/touch listeners anywhere else.
- All section-internal animations (added later) must be **driven by the same ScrollTrigger progress**, never by their own scroll listeners.
- `ScrollTrigger.normalizeScroll(true)` enabled to harmonize touch + wheel.

---

## 4. SECTION MOUNTING STRATEGY

**Order (Blueprint, locked):**
1. Hero → 2. Heritage → 3. Cuisine → 4. Wine → 5. Rooms → 6. Spa → 7. Experience → 8. Recommendations.

Defined once in `utils/sections.ts` as an ordered array of `{ id, label, Component }`. ScrollTrack maps over it; Navbar maps over a filtered subset (Blueprint nav labels).

**Width math**
- Each section: `width: 100vw; height: 100vh; flex: 0 0 100vw`.
- Track: `width = sectionCount * 100vw` (computed in px after measuring viewport).
- Total horizontal travel: `(sectionCount − 1) * 100vw`.

**Isolation rules (non-negotiable)**
- Each Section component is a self-contained module: its own DOM subtree, own assets, own internal state.
- Sections **must not** import from each other.
- Sections **must not** read scroll progress directly except via a prop `progress: number` (0–1 local to that section), passed down by ScrollTrack. This guarantees a section can be removed/reordered without breaking others.
- No `position: fixed` inside any section (would escape the track).
- No global side effects in section mount (no body class toggles, no listeners on window).

---

## 5. NAVIGATION SYSTEM (SYNCED WITH SCROLL)

**Click → scroll**
- Each NavLink knows its section index from `utils/sections.ts`.
- On click: compute `targetScrollY = (index / (sectionCount − 1)) * (pageHeight − viewportHeight)`; call `lenis.scrollTo(targetScrollY, { duration: 1.2, easing })`.
- ScrollTrigger then drives ScrollTrack naturally — no direct transform writes from the navbar.

**Scroll → active link**
- `useActiveSection()` subscribes to ScrollTrigger progress, computes `activeIndex` with hysteresis (Section 3), exposes it to FixedNavbar.
- FixedNavbar applies an `aria-current="page"` + active style to the matching link.

**Sync guarantees**
- One direction of truth: scroll position → active index. Nav clicks only request a new scroll position; they never set active index manually.
- Prevents the classic "click flashes active, then snaps back" desync.

---

## 6. HERO SECTION — FRAME ANIMATION PREP

**Container strategy: `<canvas>` (chosen).**
Why canvas over stacked `<img>`:
- Single GPU-backed surface → no layout thrash when swapping frames.
- Trivially synced to ScrollTrigger progress (`drawImage(frames[Math.floor(progress * (n-1))])`).
- Avoids hundreds of DOM nodes and per-frame opacity transitions.

**Structure (no animation yet)**
- `SectionHero` renders `<HeroFrameCanvas/>` + an absolutely-positioned overlay text layer.
- `HeroFrameCanvas` mounts a `<canvas>` sized to its container via ResizeObserver; exposes `drawFrame(index)` via ref. **Currently draws frame 0 only.**
- An `animationHookSlot` prop placeholder is wired but a no-op today; later this will be the ScrollTrigger callback.

**Frame loading pipeline (stubbed now, ready to activate)**
- `utils/frames.ts` defines `frameUrl(i)` and `FRAME_COUNT`.
- `useFrameSequence()` will: preload first N frames eagerly (priority), rest in idle callbacks; resolve to an `Image[]`; expose `getFrame(i)`.
- For now the hook returns frame 0 only — pipeline shape is in place so adding the rest is a one-line change.

**Naming convention**
- `/public/frames/hero/frame_0001.webp … frame_0240.webp` (zero-padded, 4 digits, `.webp`).
- Generator (`frameUrl`) is the single place that knows the path format.

**Scroll-driven readiness**
- `HeroFrameCanvas` will accept `progress: 0..1` (passed by ScrollTrack as Section 4 mandates). When animation is wired, `frameIndex = Math.floor(progress * (FRAME_COUNT − 1))`. No internal scroll listener will ever be added inside the hero.

---

## 7. PERFORMANCE ARCHITECTURE

**Frame preloading (priority tiers)**
- Tier 1 (eager, before first paint of hero): frames 1–24 (first second of animation).
- Tier 2 (after `load` event, `requestIdleCallback`): frames 25–120.
- Tier 3 (idle, low priority): remainder.
- Use `<link rel="preload" as="image" fetchpriority="high">` for Tier 1, injected from the route `head()`.

**Lazy mounting non-visible sections**
- Sections beyond the next-adjacent one render a lightweight skeleton (fixed-size empty div) until `activeIndex` is within ±1.
- Skeletons preserve the 100vw width so track math stays valid (no CLS).
- Heavy assets (images, video) inside sections use `loading="lazy"` + `decoding="async"`.

**GPU acceleration**
- `transform: translate3d` + `will-change: transform` on ScrollTrack only (don't pollute every section — `will-change` everywhere defeats itself).
- Avoid `box-shadow` / `filter` animations during scroll.
- Sections promoted to their own layer only if they animate (added later, case by case).

**CLS prevention**
- Every image declares intrinsic `width` + `height` (or aspect-ratio CSS).
- Fonts (Cormorant Garamond, Century Gothic / Glacial Indifference per Blueprint) loaded with `font-display: swap` and preloaded; size-adjust metrics tuned to avoid reflow.
- Track width is computed from measured viewport, never from content — content can never push the track wider.

**Memory handling for image sequences**
- Frames stored as `HTMLImageElement[]` of fixed length; never recreated on resize (canvas is rescaled, frames are not).
- `.webp` (or `.avif` if browser support allows) at hero canvas resolution × DPR cap of 2.
- On `visibilitychange → hidden`, ScrollTrigger paused; on unmount, frame array cleared and canvas context released.

---

## 8. RESPONSIVE STRATEGY

**Desktop (≥ 1024px)**
- Full horizontal scroll system as specified.

**Mobile (< 768px)**
- Vertical fallback: `MainViewport` → `height: auto; overflow: visible`. ScrollTrack → `flex-direction: column; width: 100vw; transform: none`. Each section becomes `width:100vw; height: auto (min 100vh)`.
- Hero canvas renders a single static poster frame (no sequence load).
- ScrollTrigger / Lenis disabled entirely (hook returns no-ops).

**Tablet (768–1023px)**
- Default to mobile (vertical) mode for safety. Opt-in horizontal only if device has fine pointer (`(pointer: fine)` media query) AND landscape.

**Mode switch logic (`useViewportMode`)**
- Single matchMedia query evaluated once at mount + on `change`.
- Returns `'horizontal' | 'vertical'`.
- `App` reads this once and renders one of two trees. **No conditional logic inside sections** — sections are layout-agnostic.
- Switching modes triggers a full ScrollTrigger kill + re-init (handled in the hook's cleanup).

---

## 9. RISK PREVENTION SYSTEM

Hard rules enforced by code review and architecture:

| Risk | Rule |
|---|---|
| Hero animation interferes with other sections | Hero only writes to its own `<canvas>`. It must not call `ScrollTrigger.create` itself — it consumes the global progress passed via prop. |
| Scroll overlap between sections | Sections never register their own scroll listeners. All section-local progress is derived from the global timeline by ScrollTrack. |
| Flickering during scroll | Only `transform` animates on the track. No width/left/top transitions. `will-change` confined to ScrollTrack + hero canvas. |
| Navbar desync | Single source of truth = ScrollTrigger progress. Nav clicks request scroll, never set active index. Hysteresis buffer at section boundaries. |
| Layout breaks when animation added later | Hero's prop interface (`progress: number`) is fixed today; adding animation = implementing the function body, not changing the contract. Sections' `progress` prop is reserved now even if unused. |
| Body scroll leaking through | Body `overflow:hidden` set by `MainViewport` mount effect; spacer div sets document height for ScrollTrigger. Two responsibilities, two elements — never combined. |
| Asset count blowing memory on mobile | Frame pipeline gated by `useViewportMode === 'horizontal'`. Mobile loads a single poster. |
| Re-init storms on resize | ResizeObserver debounced 120ms; ScrollTrigger.refresh batched. |

---

## 10. FINAL BUILD EXECUTION ORDER (LOCKED)

1. **Project setup** — install `gsap`, `lenis`; register fonts; create the folder skeleton from Section 1; add `utils/sections.ts` with the 8-section registry.
2. **Layout shell** — `FixedNavbar`, `MainViewport` (body lock), `HorizontalScrollWrapper`, `ScrollTrack`. Render 8 placeholder sections (colored blocks, 100vw × 100vh) to validate horizontal layout statically.
3. **Scroll engine** — implement `useHorizontalScroll` with Lenis + ScrollTrigger pinning + spacer height + resize handler. Verify smooth horizontal travel and clean boundaries.
4. **Sections (one by one, in Blueprint order)** — replace placeholders: Hero → Heritage → Cuisine → Wine → Rooms → Spa → Experience → Recommendations. Each lands behind the `progress` prop contract; no cross-section imports.
5. **Navigation sync** — wire `useActiveSection` → FixedNavbar active state; wire NavLink clicks → `lenis.scrollTo`. Verify both directions.
6. **Hero animation container** — mount `HeroFrameCanvas` with single-frame draw, `useFrameSequence` stub, preload tags in route `head()`. Confirm progress prop arrives. (No animation logic yet — that's a follow-up phase.)
7. **Performance pass** — lazy section mounting, frame preload tiers, image dimensions/aspect-ratio audit, font preload, `will-change` audit, `visibilitychange` pause.
8. **Responsive pass** — implement `useViewportMode`, vertical fallback tree, disable scroll engine + frame pipeline on mobile, validate at 375 / 768 / 1024 / 1440 / 1920.

---

## Technical appendix (for the implementer)

- **Why GSAP ScrollTrigger over a custom wheel handler**: ScrollTrigger uses real document scroll, so it inherits OS-level inertia, accessibility (keyboard, screen-reader scroll commands), and browser-native overscroll prevention. Custom `wheel` handlers break all three and require manual touch handling.
- **Why Lenis alongside ScrollTrigger**: ScrollSmoother is paid; Lenis is free and integrates cleanly via the documented `lenis.on('scroll', ScrollTrigger.update)` bridge.
- **Why canvas for the hero**: 240 stacked `<img>` elements with opacity crossfades cost ~240 layers and constant compositor work; a single canvas is one layer, one draw call per frame.
- **Why `progress` prop instead of context**: makes sections trivially testable in isolation (Storybook-style) by passing a number, and prevents accidental coupling.

After approval I'll switch to build mode and execute steps 1–8 in order.
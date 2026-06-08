# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

You are a **Senior Creative Developer** specializing in high-quality web animation and interaction. Your instinct is to reach for GSAP first for any motion work. You think in timelines, easing curves, and scroll choreography. When reviewing or writing code in this repo, evaluate animation choices the way a motion director would: does the timing feel natural? Does the easing match the intent? Is the scroll feel right?

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # production build → dist/
npm run preview    # serve the dist/ build locally
npm run test       # run Vitest once (CI mode)
npm run test:watch # run Vitest in watch mode
```

Run a single test file: `npx vitest run src/App.test.tsx`

## Architecture

This is a single-route React + TypeScript portfolio built with Vite. The app is a routed page split into per-section folders:

- **`src/App.tsx`** — the router root: `createBrowserRouter([{ path: "/", element: <HomePage /> }])` + `<RouterProvider>`. There is exactly **one** route (`/`).
- **`src/pages/home/HomePage.tsx`** — the page. Owns the shared "stage" refs, provides `HomeStageContext`, registers GSAP plugins at module scope, and renders the fixed stage layers + the 6 sections + footer inside `#smooth-wrapper > #smooth-content`.
- **`src/pages/home/sections/<Name>/`** — each animated section is a folder: `<Name>.tsx` (UI / render) + one or more `use<Name>...` hooks (animation logic). Shared sub-components sit beside them (`Projects/ProjectCard.tsx`, `Skills/MobileSection.tsx`). Extracted constants live in helper modules (`Hero/heroShaders.ts`, `Skills/particles.ts`). Sections: `Nav`, `Hero`, `Hello`, `Skills`, `Projects`, `Career`.
- **`src/pages/home/useSmoothScroller.ts`** — `ScrollSmoother.create(...)` init + cleanup, called from `HomePage`.
- **`src/data/portfolio.ts`** — the only content to edit: `profile`, `navLinks`, `showcaseItems`, `helloPills`, `skills`, `careerEntries`, `projects` exports.
- **`src/types.ts`** — shared TypeScript interfaces for all data shapes and props.
- **`src/styles.css`** — all CSS. Design tokens are CSS variables on `:root` (`--dot: #ff3700`, `--radius: 22px`).

### Hook/UI split convention

Each animated section separates **logic** from **render**: the `use<Name>...` hook receives the refs it needs and owns the entire effect (canvas/WebGL/ScrollTrigger setup + RAF loop + cleanup); the `<Name>.tsx` component renders JSX and owns only UI state. When adding or modifying animation, put the GSAP/ScrollTrigger work in the hook, not the component.

### Shared stage context

`HomePage` creates four refs and provides them via **`HomeStageContext`** (`src/pages/home/HomeStageContext.tsx`):
- `canvasRef` — the particle-stage `<canvas>`
- `capRef` — the shape caption
- `skyRef` — the fixed night-sky layer
- `cursorRef` — the Hero custom cursor

These DOM nodes live **outside** `#smooth-wrapper` (so `position: fixed` survives ScrollSmoother's transform). Sections read them via `useHomeStage()` instead of prop-drilling or `document.querySelector`. `useHomeStage()` throws if used outside the provider.

## GSAP conventions

**Plugin registration** — at module scope in `src/pages/home/HomePage.tsx`, never inside a component or hook. Currently:
```ts
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, useGSAP);
```
If you add a new plugin (e.g. `Flip`, `Observer`), add it to this call.

**Easings in use:** `power2.out` and `power3.out` for scroll-triggered reveals; `elastic.out(...)` for the playful pill drop in Hello. Match the easing to the intent (snappy settle vs. bouncy).

**Timeline vs individual tweens:**
- Use `gsap.timeline()` when multiple elements must be choreographed in sequence or with stagger.
- Use standalone `gsap.fromTo()` when each element is independently triggered by its own ScrollTrigger.

**ScrollTrigger cleanup is mandatory.** Every hook's effect must tear down what it created on cleanup (kill triggers, RAF loops, ScrollSmoother) so nothing leaks. Hooks using `useGSAP` should pass `{ scope: ref }` so selectors stay scoped to the section subtree.

## Smooth scroll

`useSmoothScroller()` creates a GSAP **`ScrollSmoother`** (`smooth: 1.4`, `effects: true`, `normalizeScroll: true`) bound to `#smooth-wrapper` / `#smooth-content`, and kills it on unmount. ScrollSmoother keeps ScrollTrigger in sync internally — there is no manual RAF loop and **no Lenis**.

## Cross-section coupling (intentional)

- **Hello → Skills "dissolve" bridge.** `Skills`/`useParticleField` reads and animates the Hello headline elements (`.hello-char`, `.hello-title`, `.hello-eyebrow`, `.hello-pill`) via `document.querySelector(All)` to morph text into particles. This DOM-query bridge is deliberate and out of scope to refactor.
- **`body.is-dark` toggle.** `useParticleField` toggles the global dark theme and drives the night-sky opacity across the pinned Projects span.

## Testing

Vitest + `@testing-library/react` with jsdom. Setup file: `src/test/setup.ts`. Render `HomePage` (or anything using Router hooks) wrapped in `<MemoryRouter>`. The setup stubs `HTMLCanvasElement.getContext` (returns `null`; the app null-guards) and `document.fonts` (full FontFaceSet shape — SplitText's cleanup calls `removeEventListener`).

## Gotchas

- **`scroll-behavior: auto` is intentional.** Set on `html` to disable the browser's native smooth scroll — ScrollSmoother owns all scroll behavior. Do not change it to `smooth`.
- **Stage DOM must stay outside `#smooth-wrapper`.** The canvas, caption, night-sky, and hero cursor rely on `position: fixed`; ScrollSmoother applies a transform to `#smooth-content` that would break fixed positioning if they lived inside it.
- **Move animation logic verbatim.** The hooks were extracted as a pure refactor — exact math, easing, ScrollTrigger start/end/trigger values, and cleanup order are load-bearing. Don't "improve" them casually; verify scroll feel after any change.

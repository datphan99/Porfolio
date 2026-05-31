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

Run a single test file: `npx vitest run src/App.test.jsx`

## Architecture

This is a single-page React portfolio built with Vite. The entire app lives in two source files:

- **`src/App.jsx`** — all page components (Home, Work, About, Contact), Header, PageTransition, and the root `App`. Nothing is split into separate component files.
- **`src/data/portfolio.js`** — the only content to edit: `profile`, `projects`, and `services` exports.
- **`src/styles.css`** — all CSS. Design tokens are CSS variables on `:root` (`--ink`, `--paper`, `--accent`, `--muted`, `--line`).

## Animation system

GSAP + ScrollTrigger drive all animations. The convention:

- Add `data-animate` to any element that should fade-in on scroll. The `useGSAP` hook in `App` auto-discovers all `[data-animate]` elements via `gsap.utils.toArray`.
- Page transition: `.transition-layer span` animates `scaleX` from 1→0 on every route change, acting as a wipe.
- `useGSAP` is scoped to `appRef` and re-runs when `location.pathname` changes (kills all ScrollTriggers on cleanup).

## GSAP conventions

**Plugin registration** — always at module scope (top of the file), never inside a component or hook:
```js
gsap.registerPlugin(ScrollTrigger, useGSAP);
```

**Easing presets used in this project:**
- `power3.out` — scroll-triggered element reveals (feels snappy, settles naturally)
- `power3.inOut` — page transition wipe (symmetrical, cinematic)

**Timeline vs individual tweens:**
- Use `gsap.timeline()` when multiple elements must be choreographed in sequence or with stagger.
- Use standalone `gsap.fromTo()` (as done now) when each element is independently triggered by its own ScrollTrigger.

**ScrollTrigger cleanup is mandatory.** The `useGSAP` cleanup return must always kill all triggers to prevent ghost triggers on route change:
```js
return () => {
  ScrollTrigger.getAll().forEach((t) => t.kill());
};
```

**`useGSAP` scope** — always pass `{ scope: ref }` so GSAP selectors are scoped to the component subtree and don't bleed into other parts of the DOM.

## Smooth scroll

`useSmoothScroll()` creates a Lenis instance and drives it via a `requestAnimationFrame` loop that also calls `ScrollTrigger.update()`. This keeps GSAP ScrollTrigger in sync with Lenis's virtual scroll position. Lenis is destroyed on unmount.

## Routing

React Router v7 with four routes: `/`, `/work`, `/about`, `/contact`. All routes are declared in the `App` component's `<Routes>` block. Navigation uses `<NavLink>` so the active class is applied automatically.

## Testing

Vitest + `@testing-library/react` with jsdom. Setup file: `src/test/setup.js`. Wrap components in `<MemoryRouter>` when rendering anything that uses React Router hooks.

## Gotchas

- **`scroll-behavior: auto` is intentional.** It is set on `html` to disable the browser's native smooth scroll — Lenis owns all scroll behavior. Do not change it to `smooth`.
- **GSAP plugins must be registered before use.** If you add a new plugin (e.g., `Flip`, `Draggable`), add it to the `gsap.registerPlugin(...)` call at the top of `App.jsx`.
- **Lenis + ScrollTrigger RAF coupling.** `ScrollTrigger.update()` is called inside the Lenis RAF loop. If the RAF loop is removed or broken, ScrollTrigger-based animations will not fire at the correct scroll position.
- **All page components live in `App.jsx`.** This is intentional for simplicity. Do not extract them into separate files unless the user explicitly asks to restructure.

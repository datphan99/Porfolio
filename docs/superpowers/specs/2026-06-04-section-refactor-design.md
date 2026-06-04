# Section Refactor Design — route → section → hook/UI + page context

**Date:** 2026-06-04
**Status:** Approved (design), pending implementation plan
**Branch:** `convert-jsx-to-tsx` (continues after the JSX→TSX migration)

## Goal

Make the animated sections maintainable by separating animation **logic** (custom hooks) from **render** (UI components), organized as a routed page with per-section folders, and lifting shared "stage" resources into a single page-level context. This is a **pure refactor**: no visual or behavioral change.

## Current state (post TS migration)

Single scroll page; no router despite a stale CLAUDE.md note. `src/App.tsx` (68 lines) owns shared fixed-position "stage" layers and prop-drills refs into `Skills`:

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);  // particle-stage
const capRef = useRef<HTMLDivElement>(null);        // shape-cap
// renders: <Nav/>, [data-hs-cursor], [data-sky], <canvas particle-stage>, <div shape-cap>,
//          #smooth-wrapper > #smooth-content > <Hero/><Hello/><Skills canvasRef capRef/><Projects/><Career/><footer#contact>
// useEffect: ScrollSmoother.create(...) + cleanup
```

Section sizes (lines): `Skills.tsx` 682, `HeroStatement.tsx` 423, `Projects.tsx` 197, `Hello.tsx` 183, `Nav.tsx` 182, `Career.tsx` 89. The two large files are single giant `useEffect`s mixing canvas/WebGL setup, RAF loops, ScrollTrigger wiring, cross-section DOM mutation, and cleanup.

Cross-section couplings today:
- `App` → `Skills`: `canvasRef`/`capRef` via props.
- `Skills` → night-sky: `document.querySelector("[data-sky]")`.
- `HeroStatement` → cursor: `document.querySelector("[data-hs-cursor]")`.
- `Skills` → Hello headline: reads/writes `.hello-char`, `.hello-title`, `.hello-eyebrow`, `.hello-pill` (the "dissolve text into particles" bridge).

## Target structure

```
src/
  main.tsx                      # StrictMode + <App/>
  App.tsx                       # createBrowserRouter([{ path:"/", element:<HomePage/> }]) + RouterProvider
  pages/
    home/
      HomePage.tsx              # stage layers + <HomeStageProvider> + smooth-wrapper + 6 sections + footer
      HomeStageContext.tsx      # { canvasRef, capRef, skyRef, cursorRef } + HomeStageProvider + useHomeStage()
      useSmoothScroller.ts      # ScrollSmoother init/cleanup (moved out of App)
      sections/
        Nav/      Nav.tsx                + useNavReveal.ts
        Hero/     Hero.tsx               + useHeroCanvas.ts      + heroShaders.ts
        Hello/    Hello.tsx              + useHelloIntro.ts
        Skills/   Skills.tsx             + useParticleField.ts
                  MobileSection.tsx      + useMobileParticles.ts + particles.ts
        Projects/ Projects.tsx           + useProjectScroll.ts   + ProjectCard.tsx
        Career/   Career.tsx             + useCareerReveal.ts
  data/   portfolio.ts · particleSections.json
  types.ts · styles.css · test/setup.ts · App.test.tsx (→ HomePage render)
```

## Page-level context: `HomeStageContext`

Provides the shared stage refs so sections stop prop-drilling / DOM-querying for them:

```ts
interface HomeStage {
  canvasRef: RefObject<HTMLCanvasElement | null>; // particle-stage
  capRef: RefObject<HTMLDivElement | null>;       // shape-cap
  skyRef: RefObject<HTMLDivElement | null>;       // night-sky
  cursorRef: RefObject<HTMLDivElement | null>;    // hs-cursor
}
```

- `HomePage` creates all four refs with `useRef`, renders the stage DOM with the refs attached (replacing `data-sky`/`data-hs-cursor` query targets with real refs), and wraps the tree in `<HomeStageProvider>`.
- `useHomeStage()` returns the context (throws if used outside the provider).
- `Skills` consumes `canvasRef`, `capRef`, `skyRef` from context (drops its props and the `[data-sky]` query). `Hero` consumes `cursorRef` (drops the `[data-hs-cursor]` query).
- The night-sky/cursor DOM elements keep their CSS classes (`night-sky`, `hs-cursor`) so existing styles are untouched; only the lookup mechanism changes from query/prop to ref.

## Per-section hook/UI split

Each hook receives the refs it needs and encapsulates the effect (setup + RAF/ScrollTrigger + cleanup). The UI component renders JSX and owns only UI state. Logic is moved **verbatim** — same math, easing, ScrollTrigger configs, and cleanup order.

| Section | Hook(s) | UI / extra files |
|---|---|---|
| Nav | `useNavReveal(eyebrowRef)` — the scroll show/hide ScrollTrigger | `Nav.tsx` (markup + `open` UI state) |
| Hero | `useHeroCanvas(sectionRef, canvasRef, cursorRef)` — all WebGL, trail, cursor | `Hero.tsx`; `heroShaders.ts` (VERT/FRAG + shader constants) |
| Hello | `useHelloIntro(sectionRef, stageRef)` — useGSAP SplitText/Draggable/timeline | `Hello.tsx` (PILL_ROTATIONS/PILL_POSITIONS consts beside UI) |
| Skills | `useParticleField({ canvasRef, capRef, skyRef, sectRefs })` (desktop) + `useMobileParticles(canvasRef, shape)` (mobile) | `Skills.tsx`, `MobileSection.tsx`; `particles.ts` (SVGS, LABELS, SHAPE_KEYS, `sample`/`shuffle`/`toN`) shared by both hooks |
| Projects | `useProjectScroll({ sectionRef, stageRef, statementRef, cardRefs })` | `Projects.tsx`, `ProjectCard.tsx` |
| Career | `useCareerReveal(sectionRef)` | `Career.tsx` |

`useSmoothScroller()` (page-level) holds the `ScrollSmoother.create(...)` + cleanup currently in `App`; called from `HomePage`.

## Routing

- `react-router-dom@7.6.1` is already installed (currently unused).
- `App.tsx` becomes the router root: `createBrowserRouter([{ path: "/", element: <HomePage /> }])` + `<RouterProvider router={router} />`.
- `main.tsx` keeps rendering `<App/>` inside `<StrictMode>`.

## Tests

- `App.test.tsx`: render `<HomePage/>` wrapped in `<MemoryRouter>` (per CLAUDE.md testing note). Assertions on current markup stay the same (Nav role text, Menu button, footer contentinfo, mailto CTA, `--dot`/`--radius` tokens).
- `src/test/setup.ts` canvas/fonts stubs unchanged — still required because `HomePage` mounts the same canvas/WebGL effects.

## Scope boundaries (deliberate)

- **Pure refactor.** No change to animation math, easing, durations, ScrollTrigger start/end/trigger values, colors, or DOM/CSS class names.
- **Hello→Skills bridge stays as DOM queries.** Skills keeps reading/writing `.hello-*` elements via `document.querySelector(All)`. Fully decoupling it (e.g., sharing Hello refs through context) is risky surgery on the particle math and is out of scope for this refactor.
- **Nav stays under `home/sections`** for now (it is home chrome today). Promoting it to a shared layout is deferred until a second route exists.
- No new features, no dependency additions (react-router already present).

## Risks & verification

- Highest risk: `useHeroCanvas` and `useParticleField` — the extraction must preserve exact closure capture (refs read inside the effect), the RAF loop, ScrollTrigger registration/cleanup, and `body.is-dark` / sky-opacity side effects. Move logic as a unit; do not "improve" it.
- Per-section, incremental execution. After each section: `npx tsc --noEmit`, `npx vitest run`, `npm run build` must stay green. Final: manual `npm run dev` smoke test confirming hero WebGL, particle morph, project scroll, and dark-sky transition still behave.
- Final step: update `CLAUDE.md` (it currently claims "entire app lives in App.jsx" and describes a non-existent 4-route router and a Lenis `useSmoothScroll`) to reflect the new structure, `useSmoothScroller`, and the real single route.
```

# Section Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the single-page portfolio into a routed `pages/home` structure where each section is a folder split into an animation hook (logic) + UI component, with shared "stage" resources lifted into one page-level context — preserving all behavior.

**Architecture:** Add `react-router` (already installed) with one route `/` → `HomePage`. `HomePage` owns the shared stage refs (particle canvas, shape caption, night sky, hero cursor) and provides them via `HomeStageContext`. Each section becomes `pages/home/sections/<Name>/` containing `<Name>.tsx` (render) + `use<Name>...` hook(s) (the existing `useEffect`/`useGSAP` body moved verbatim). No animation math, easing, ScrollTrigger config, DOM class, or behavior changes.

**Tech Stack:** React 19, TypeScript (strict), Vite 6, Vitest 3 + Testing Library, GSAP 3.15 (ScrollTrigger/ScrollSmoother/SplitText/Draggable), react-router-dom 7.

**Spec:** `docs/superpowers/specs/2026-06-04-section-refactor-design.md`

**Branch:** `convert-jsx-to-tsx` (continues after the TS migration).

**Verification model:** Pure refactor → the gate after every task is all three of `npx tsc --noEmit`, `npx vitest run` (2 passed), `npm run build` (success). The final task adds a manual `npm run dev` smoke test. Keep all gates green at every commit.

**Pre-existing working tree:** `src/styles.css` and `dist/` have pre-existing uncommitted changes from earlier — do NOT stage/revert them; only `git add` the files named in each commit.

---

## File Structure

**Created:**
- `src/pages/home/HomePage.tsx` — renders stage layers, supplies `HomeStageContext` value, smooth-wrapper, the 6 sections, footer.
- `src/pages/home/HomeStageContext.tsx` — `HomeStage` type, `HomeStageContext`, `useHomeStage()`.
- `src/pages/home/useSmoothScroller.ts` — `ScrollSmoother.create(...)` + cleanup (moved from `App`).
- `src/pages/home/sections/<Name>/<Name>.tsx` + hook file(s), for Nav, Hero, Hello, Skills, Projects, Career.
- `src/pages/home/sections/Hero/heroShaders.ts` — `VERT`/`FRAG` + shader constants.
- `src/pages/home/sections/Skills/particles.ts` — `SVGS`, `LABELS`, `SHAPE_KEYS`, `sample`, `shuffle`, `toN`.
- `src/pages/home/sections/Skills/MobileSection.tsx` + `useMobileParticles.ts`.
- `src/pages/home/sections/Projects/ProjectCard.tsx`.

**Modified:**
- `src/App.tsx` — becomes the router root.
- `src/App.test.tsx` — render `HomePage` inside `MemoryRouter`.
- `CLAUDE.md` — describe the new structure (final task).

**Deleted (via git mv into new locations):** `src/components/Nav.tsx`, `src/sections/*.tsx`.

**Unchanged:** `src/main.tsx`, `src/data/*`, `src/types.ts`, `src/styles.css`, `src/test/setup.ts`.

> **Refactor mechanics used throughout:**
> - Use `git mv` to relocate a section file, then edit it.
> - "Move the effect body verbatim" means: cut the entire body of the existing `useEffect(() => { ... }, [deps])` (or `useGSAP(() => { ... }, {scope})`) into the new hook **without changing any statement**, except the explicit deltas listed. Move the GSAP/ScrollTrigger imports the body needs into the hook file; the component keeps only React + data + sub-component imports.
> - A hook returns `void` unless stated; it performs the effect internally.
> - After moving a file, update the import path in `HomePage.tsx`.

---

### Task 1: Scaffold router, HomePage, context, and smooth-scroller

**Files:**
- Create: `src/pages/home/HomeStageContext.tsx`, `src/pages/home/useSmoothScroller.ts`, `src/pages/home/HomePage.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`

This task introduces the structure WITHOUT moving sections yet. Sections are imported from their current paths; `Skills` still gets `canvasRef`/`capRef` as props; the sky/cursor DOM keeps its `data-*` attributes so `Skills`/`Hero` queries still work.

- [ ] **Step 1: Create `src/pages/home/HomeStageContext.tsx`**

```tsx
import { createContext, useContext, type RefObject } from "react";

export interface HomeStage {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
  skyRef: RefObject<HTMLDivElement | null>;
  cursorRef: RefObject<HTMLDivElement | null>;
}

export const HomeStageContext = createContext<HomeStage | null>(null);

export function useHomeStage(): HomeStage {
  const ctx = useContext(HomeStageContext);
  if (!ctx) throw new Error("useHomeStage must be used within HomeStageContext.Provider");
  return ctx;
}
```

- [ ] **Step 2: Create `src/pages/home/useSmoothScroller.ts`**

Move the `ScrollSmoother.create(...)` effect out of `App`. Plugins are already registered in `App.tsx` today; keep registration there for now (Task 6/7 do not need to move it — see note in Step 4).

```ts
import { useEffect } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export function useSmoothScroller(): void {
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
      normalizeScroll: true,
    });
    return () => smoother.kill();
  }, []);
}
```

- [ ] **Step 3: Create `src/pages/home/HomePage.tsx`**

This is the current `App` body, plus the context provider and the 4 stage refs. Import sections from their CURRENT paths (they move in later tasks). GSAP plugin registration moves here at module scope (it must run once before any section uses a plugin).

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

import { HomeStageContext } from "./HomeStageContext";
import { useSmoothScroller } from "./useSmoothScroller";

import Nav from "../../components/Nav";
import Hero from "../../sections/HeroStatement";
import Hello from "../../sections/Hello";
import Skills from "../../sections/Skills";
import Projects from "../../sections/Projects";
import Career from "../../sections/Career";
import { profile } from "../../data/portfolio";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, useGSAP);

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useSmoothScroller();

  return (
    <HomeStageContext.Provider value={{ canvasRef, capRef, skyRef, cursorRef }}>
      <Nav />
      <div ref={cursorRef} data-hs-cursor className="hs-cursor" aria-hidden="true" />
      <div ref={skyRef} data-sky className="night-sky" aria-hidden="true" />
      <canvas ref={canvasRef} className="particle-stage" />
      <div ref={capRef} className="shape-cap" />
      <div id="smooth-wrapper">
        <div id="smooth-content" className="min-h-screen">
          <Hero />
          <Hello />
          <Skills canvasRef={canvasRef} capRef={capRef} />
          <Projects />
          <Career />
          <footer
            className="flex justify-between items-center px-8 py-7 border-t border-black/[0.08] text-sm text-black/50"
            id="contact"
          >
            <span>{profile.name}</span>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1 text-[#111] font-medium transition-opacity duration-200 hover:opacity-[0.65]"
            >
              Start a project ↗
            </a>
          </footer>
        </div>
      </div>
    </HomeStageContext.Provider>
  );
}
```

> Copy the footer markup and the `data-*`/`className` strings EXACTLY from the current `src/App.tsx` (do not retype from memory — open it and copy). This preserves styling and the existing test assertions.

- [ ] **Step 4: Replace `src/App.tsx` with the router root**

```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";

const router = createBrowserRouter([{ path: "/", element: <HomePage /> }]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

The previous `App.tsx` content (refs, ScrollSmoother effect, plugin registration, stage DOM) now lives in `HomePage.tsx`/`useSmoothScroller.ts` — so removing it from `App.tsx` is correct, not a deletion of behavior.

- [ ] **Step 5: Update `src/App.test.tsx` to render `HomePage` in a router**

```tsx
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import HomePage from "./pages/home/HomePage";

test("renders the portfolio shell", () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.getByText("Dat Phan / Frontend Developer")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();

  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getByText("Dat Phan")).toBeInTheDocument();
  expect(
    within(footer).getByRole("link", { name: /start a project/i }),
  ).toHaveAttribute("href", "mailto:hello@example.com");
});

test("defines the expected design tokens", () => {
  const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
  expect(css).toMatch(/--dot:\s*#ff3700;/);
  expect(css).toMatch(/--radius:\s*22px;/);
});
```

- [ ] **Step 6: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc exit 0; `Tests 2 passed (2)`; Vite build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/HomeStageContext.tsx src/pages/home/useSmoothScroller.ts src/pages/home/HomePage.tsx src/App.tsx src/App.test.tsx
git commit -m "refactor: add router, HomePage, and HomeStageContext scaffold"
```

---

### Task 2: Career → folder + `useCareerReveal` (establishes the pattern)

**Files:**
- Create: `src/pages/home/sections/Career/useCareerReveal.ts`
- Move: `src/sections/Career.tsx` → `src/pages/home/sections/Career/Career.tsx`
- Modify: `src/pages/home/HomePage.tsx` (import path)

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Career
git mv src/sections/Career.tsx src/pages/home/sections/Career/Career.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Career/useCareerReveal.ts`**

Move the `useGSAP` body verbatim from `Career.tsx`. It takes the section ref so its `{ scope }` matches the original.

```ts
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

export function useCareerReveal(sectionRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      // MOVE VERBATIM: the entire body of the existing useGSAP callback in Career.tsx
      // (the three gsap.fromTo blocks for .career-headings, .career-cv, .career-row,
      //  and the `return () => ScrollTrigger.getAll().forEach((t) => t.kill());`).
      // Change NOTHING inside.
    },
    { scope: sectionRef },
  );
}
```

- [ ] **Step 3: Edit `Career.tsx` to use the hook**

Remove the `useGSAP`/`gsap`/`ScrollTrigger` imports and the inline `useGSAP(...)` call; keep `useRef`. New top + usage:

```tsx
import { useRef } from "react";
import { careerEntries } from "../../../../data/portfolio";
import { useCareerReveal } from "./useCareerReveal";

export default function Career() {
  const sectionRef = useRef<HTMLElement>(null);
  useCareerReveal(sectionRef);

  return (
    // UNCHANGED: the exact JSX currently returned by Career.tsx
  );
}
```

> Note the data import depth changes to `../../../../data/portfolio` (file is now 4 levels under `src`). Keep the JSX identical.

- [ ] **Step 4: Update the import in `HomePage.tsx`**

Change `import Career from "../../sections/Career";` to:
```tsx
import Career from "./sections/Career/Career";
```

- [ ] **Step 5: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/sections/Career src/pages/home/HomePage.tsx
git commit -m "refactor: extract Career into section folder + useCareerReveal hook"
```

---

### Task 3: Nav → folder + `useNavReveal`

**Files:**
- Create: `src/pages/home/sections/Nav/useNavReveal.ts`
- Move: `src/components/Nav.tsx` → `src/pages/home/sections/Nav/Nav.tsx`
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Nav
git mv src/components/Nav.tsx src/pages/home/sections/Nav/Nav.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Nav/useNavReveal.ts`**

Move the `useEffect` body verbatim from `Nav.tsx` (the `gsap.set` + `ScrollTrigger.create` show/hide + `return () => st.kill();`).

```ts
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useNavReveal(eyebrowRef: RefObject<HTMLParagraphElement | null>): void {
  useEffect(() => {
    // MOVE VERBATIM: the entire body of the existing useEffect in Nav.tsx,
    // starting at `const el = eyebrowRef.current;` through `return () => st.kill();`.
    // Change NOTHING inside.
  }, []);
}
```

- [ ] **Step 3: Edit `Nav.tsx` to use the hook**

Keep `useState`/`useRef`; remove `useEffect`/`gsap`/`ScrollTrigger` imports and the inline effect. New top:

```tsx
import { useState, useRef } from "react";
import { navLinks, profile } from "../../../../data/portfolio";
import { useNavReveal } from "./useNavReveal";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  useNavReveal(eyebrowRef);

  return (
    // UNCHANGED: the exact JSX currently returned by Nav.tsx
  );
}
```

> Data import depth becomes `../../../../data/portfolio`. Keep all JSX/SVG markup identical.

- [ ] **Step 4: Update `HomePage.tsx` import**

Change `import Nav from "../../components/Nav";` to:
```tsx
import Nav from "./sections/Nav/Nav";
```

- [ ] **Step 5: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/sections/Nav src/pages/home/HomePage.tsx
git commit -m "refactor: extract Nav into section folder + useNavReveal hook"
```

---

### Task 4: Hello → folder + `useHelloIntro`

**Files:**
- Create: `src/pages/home/sections/Hello/useHelloIntro.ts`
- Move: `src/sections/Hello.tsx` → `src/pages/home/sections/Hello/Hello.tsx`
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Hello
git mv src/sections/Hello.tsx src/pages/home/sections/Hello/Hello.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Hello/useHelloIntro.ts`**

Move the `useGSAP` body verbatim. It needs both refs (the body reads `sectionRef.current` and pins `stageRef.current`) and the `PILL_ROTATIONS` constant. Keep `PILL_ROTATIONS` next to the UI and pass it in, OR re-declare it in the hook — to avoid duplication, **move `PILL_ROTATIONS` into the hook file** and keep `PILL_POSITIONS` (used only by JSX) in `Hello.tsx`.

```ts
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import type { RefObject } from "react";

const PILL_ROTATIONS: Record<string, number> = { a: -3, b: 2, c: -2, d: 3, e: -2, f: 2 };

export function useHelloIntro(
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
): void {
  useGSAP(
    () => {
      // MOVE VERBATIM: the entire body of the existing useGSAP callback in Hello.tsx
      // (the `const section = sectionRef.current; if (!section) return;` guard,
      //  SplitText setup, gsap.set initial states, the pinned timeline using
      //  stageRef.current, the Draggable.create block, and the cleanup return).
      // It references PILL_ROTATIONS (now declared above) and stageRef — change NOTHING else.
    },
    { scope: sectionRef },
  );
}
```

- [ ] **Step 3: Edit `Hello.tsx` to use the hook**

Remove `useGSAP`/`gsap`/`SplitText`/`Draggable` imports and the inline `PILL_ROTATIONS`; keep `useRef`, `PILL_POSITIONS`, and `helloPills`.

```tsx
import { useRef } from "react";
import { helloPills } from "../../../../data/portfolio";
import { useHelloIntro } from "./useHelloIntro";

const PILL_POSITIONS: Record<string, string> = {
  a: "left-0 top-[18%]",
  b: "left-[40px] top-[42%]",
  c: "left-[14px] top-[66%]",
  d: "right-0 top-[18%]",
  e: "right-[34px] top-[42%]",
  f: "right-[14px] top-[66%]",
};

export default function Hello() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useHelloIntro(sectionRef, stageRef);

  return (
    // UNCHANGED: the exact JSX currently returned by Hello.tsx
  );
}
```

> Data import depth becomes `../../../../data/portfolio`. Keep JSX identical (it still references `PILL_POSITIONS[pill.id]`).

- [ ] **Step 4: Update `HomePage.tsx` import**

Change `import Hello from "../../sections/Hello";` to:
```tsx
import Hello from "./sections/Hello/Hello";
```

- [ ] **Step 5: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/sections/Hello src/pages/home/HomePage.tsx
git commit -m "refactor: extract Hello into section folder + useHelloIntro hook"
```

---

### Task 5: Projects → folder + `useProjectScroll` + `ProjectCard`

**Files:**
- Create: `src/pages/home/sections/Projects/ProjectCard.tsx`, `src/pages/home/sections/Projects/useProjectScroll.ts`
- Move: `src/sections/Projects.tsx` → `src/pages/home/sections/Projects/Projects.tsx`
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Projects
git mv src/sections/Projects.tsx src/pages/home/sections/Projects/Projects.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Projects/ProjectCard.tsx`**

Move the existing `Card` component + its `ProjectCard`/`CardProps` interfaces verbatim into this file as the default export named `ProjectCard`.

```tsx
import { type Ref } from "react";

export interface ProjectCard {
  name: string;
  tag: string;
  img: string;
}

interface CardProps {
  p: ProjectCard;
  i: number;
  ref: Ref<HTMLElement>;
}

export default function ProjectCard({ p, i, ref }: CardProps) {
  // UNCHANGED: the exact JSX body of the current `Card` function in Projects.tsx
}
```

> There is a name collision risk: the interface and the component are both `ProjectCard`. TypeScript allows a type and a value to share a name, but to avoid confusion rename the interface to `ProjectCardData` here AND in `useProjectScroll.ts`/`Projects.tsx` (Step 3/4 use `ProjectCardData`). Final names: component `ProjectCard` (default export), data type `ProjectCardData` (named export).

Corrected file:
```tsx
import { type Ref } from "react";

export interface ProjectCardData {
  name: string;
  tag: string;
  img: string;
}

interface CardProps {
  p: ProjectCardData;
  i: number;
  ref: Ref<HTMLElement>;
}

export default function ProjectCard({ p, i, ref }: CardProps) {
  // UNCHANGED: the exact JSX body of the current `Card` function in Projects.tsx
}
```

- [ ] **Step 3: Create `src/pages/home/sections/Projects/useProjectScroll.ts`**

Move the `useEffect` body verbatim. It reads four refs.

```ts
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useProjectScroll(refs: {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  statementRef: RefObject<HTMLHeadingElement | null>;
  cardRefs: RefObject<(HTMLElement | null)[]>;
}): void {
  const { sectionRef, stageRef, statementRef, cardRefs } = refs;
  useEffect(() => {
    // MOVE VERBATIM: the entire body of the existing useEffect in Projects.tsx
    // (reduced-motion guard, the cards filter/lerp/render functions, the
    //  ScrollTrigger.create with pin: stageRef.current, render(0)/loop(), the
    //  window load listener, and the cleanup return). Change NOTHING inside.
  }, []);
}
```

- [ ] **Step 4: Edit `Projects.tsx` to use the hook + `ProjectCard`**

Remove the inline `Card` and the `useEffect`/`gsap`/`ScrollTrigger` imports. Keep `useRef`, `projects`, the `mapped` array.

```tsx
import { useRef } from "react";
import { projects } from "../../../../data/portfolio";
import ProjectCard, { type ProjectCardData } from "./ProjectCard";
import { useProjectScroll } from "./useProjectScroll";

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useProjectScroll({ sectionRef, stageRef, statementRef, cardRefs });

  const mapped: ProjectCardData[] = projects.map((p) => ({
    name: p.name,
    tag: p.role,
    img: p.imageUrl,
  }));

  return (
    // UNCHANGED markup, except the card list now renders <ProjectCard ... /> instead of <Card ... />:
    //   {mapped.map((p, i) => (
    //     <ProjectCard key={i} p={p} i={i} ref={(el) => { cardRefs.current[i] = el; }} />
    //   ))}
  );
}
```

> Data import depth becomes `../../../../data/portfolio`. The only JSX change is `Card` → `ProjectCard`; everything else stays identical.

- [ ] **Step 5: Update `HomePage.tsx` import**

Change `import Projects from "../../sections/Projects";` to:
```tsx
import Projects from "./sections/Projects/Projects";
```

- [ ] **Step 6: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/sections/Projects src/pages/home/HomePage.tsx
git commit -m "refactor: extract Projects into section folder + useProjectScroll + ProjectCard"
```

---

### Task 6: Hero → folder + `useHeroCanvas` + `heroShaders`; consume `cursorRef` from context

**Files:**
- Create: `src/pages/home/sections/Hero/heroShaders.ts`, `src/pages/home/sections/Hero/useHeroCanvas.ts`
- Move: `src/sections/HeroStatement.tsx` → `src/pages/home/sections/Hero/Hero.tsx`
- Modify: `src/pages/home/HomePage.tsx`

> Hero has its OWN local `canvasRef` (the hero's WebGL canvas inside the section) — that stays local. Only the cursor element comes from `HomeStageContext`.

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Hero
git mv src/sections/HeroStatement.tsx src/pages/home/sections/Hero/Hero.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Hero/heroShaders.ts`**

Move the module-scope constants `LINE1`, `LINE2`, `TN`, `TRACK_EM`, `VERT`, `FRAG` verbatim from `HeroStatement.tsx` and export them.

```ts
export const LINE1 = "MAKE EVERY PIXEL";
export const LINE2 = "PAY FOR ITSELF";
export const TN = 20;
export const TRACK_EM = 0.06;

export const VERT = `...`;   // MOVE VERBATIM from HeroStatement.tsx
export const FRAG = [
  // MOVE VERBATIM: the exact array of shader source lines, then `].join("\n")`
].join("\n");
```

- [ ] **Step 3: Create `src/pages/home/sections/Hero/useHeroCanvas.ts`**

Move the `useEffect` body verbatim. Import the constants from `heroShaders`. The hook takes the section ref, the (Hero-local) canvas ref, and the shared cursor ref.

```ts
import { useEffect, type RefObject } from "react";
import { LINE1, LINE2, TN, TRACK_EM, VERT, FRAG } from "./heroShaders";

export function useHeroCanvas(
  sectionRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  cursorRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    // MOVE VERBATIM: the entire body of the existing useEffect in HeroStatement.tsx,
    // from `const section = sectionRef.current;` through the cleanup return.
    // EXACTLY ONE delta: replace
    //     const curEl = document.querySelector<HTMLElement>("[data-hs-cursor]");
    //   with
    //     const curEl = cursorRef.current;
    // Everything else (sec/cvs/GL aliases, WebGL setup, trail, RAF loop, pointer
    // handlers, cleanup) is unchanged. Keep the `if (!section || !canvas) return;` guard.
  }, []);
}
```

- [ ] **Step 4: Edit `Hero.tsx` to use the hook + context**

Strip everything except the component shell + JSX. Pull `cursorRef` from `useHomeStage()`.

```tsx
import { useRef } from "react";
import { useHomeStage } from "../../HomeStageContext";
import { useHeroCanvas } from "./useHeroCanvas";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursorRef } = useHomeStage();

  useHeroCanvas(sectionRef, canvasRef, cursorRef);

  return (
    // UNCHANGED: the exact JSX currently returned by HeroStatement.tsx
    // (<section ref={sectionRef} ...><canvas ref={canvasRef} ... /> ... </section>)
  );
}
```

- [ ] **Step 5: Update `HomePage.tsx`: import path + drop the cursor `data-*` attribute**

Change `import Hero from "../../sections/HeroStatement";` to:
```tsx
import Hero from "./sections/Hero/Hero";
```
The cursor element is now found via `cursorRef`, so remove the now-unused `data-hs-cursor` attribute (keep the `ref` and `className`):
```tsx
<div ref={cursorRef} className="hs-cursor" aria-hidden="true" />
```

- [ ] **Step 6: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/sections/Hero src/pages/home/HomePage.tsx
git commit -m "refactor: extract Hero into section folder + useHeroCanvas + heroShaders, use cursor from context"
```

---

### Task 7: Skills → folder + `particles` + `useParticleField` + `MobileSection`/`useMobileParticles`; consume stage refs from context

**Files:**
- Create: `src/pages/home/sections/Skills/particles.ts`, `useParticleField.ts`, `useMobileParticles.ts`, `MobileSection.tsx`
- Move: `src/sections/Skills.tsx` → `src/pages/home/sections/Skills/Skills.tsx`
- Modify: `src/pages/home/HomePage.tsx`

> This is the largest extraction. `Skills` currently receives `canvasRef`/`capRef` as props and queries `[data-sky]`. After this task it reads all three from `HomeStageContext`. `sectRefs` stays local.

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/pages/home/sections/Skills
git mv src/sections/Skills.tsx src/pages/home/sections/Skills/Skills.tsx
```

- [ ] **Step 2: Create `src/pages/home/sections/Skills/particles.ts`**

Move the module-scope helpers/constants shared by both the desktop and mobile particle systems: `SVGS`, `LABELS`, `SHAPE_KEYS`, `sample`, `shuffle`, `toN`. Export them.

```ts
export const SVGS: Record<string, string> = {
  // MOVE VERBATIM from Skills.tsx
};
export const LABELS: Record<string, string> = {
  // MOVE VERBATIM from Skills.tsx
};
export const SHAPE_KEYS = ["one", "creation", "growth", "modernization", "techstack"];

export function sample(frag: string): Promise<number[]> {
  // MOVE VERBATIM (including the `if (!c) { URL.revokeObjectURL(url); resolve([]); return; }` guard)
}
export function shuffle(pool: number[]): number[] {
  // MOVE VERBATIM
}
export function toN(pool: number[], N: number): { x: Float32Array; y: Float32Array } {
  // MOVE VERBATIM
}
```

- [ ] **Step 3: Create `src/pages/home/sections/Skills/useMobileParticles.ts`**

Move the `MobileSection` component's `useEffect` body verbatim. It needs `SVGS`/`sample`/`shuffle`/`toN` from `particles`.

```ts
import { useEffect, type RefObject } from "react";
import { SVGS, sample, shuffle, toN } from "./particles";

export function useMobileParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  shape: string,
): void {
  useEffect(() => {
    // MOVE VERBATIM: the body of the existing useEffect inside MobileSection in Skills.tsx,
    // from `const canvas = canvasRef.current; if (!canvas) return;` through the cleanup.
    // It currently references `s.shape` — replace those with the `shape` parameter.
    // Keep the `if (!ctx) return;` guard and the `project`/`frame` closures unchanged.
  }, [shape]);
}
```

> Delta: the original reads `s.shape` (the prop). In the hook it is the `shape` argument. The original dependency array `[s.shape]` becomes `[shape]`.

- [ ] **Step 4: Create `src/pages/home/sections/Skills/MobileSection.tsx`**

Move the `MobileSection` JSX render verbatim; it now calls `useMobileParticles`.

```tsx
import { useRef } from "react";
import type { ParticleSection } from "../../../../types";
import { useMobileParticles } from "./useMobileParticles";

export default function MobileSection({ s }: { s: ParticleSection }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMobileParticles(canvasRef, s.shape);

  return (
    // UNCHANGED: the exact JSX currently returned by MobileSection in Skills.tsx
    // (the <div ...><canvas ref={canvasRef} .../> ... lists ... </div>)
  );
}
```

- [ ] **Step 5: Create `src/pages/home/sections/Skills/useParticleField.ts`**

Move the big desktop `useEffect` body verbatim. It needs gsap + ScrollTrigger + ScrollSmoother + `sections` data + the `particles` helpers.

```ts
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import sectionsData from "../../../../data/particleSections.json";
import type { ParticleSection } from "../../../../types";
import { LABELS, SHAPE_KEYS, SVGS, sample, shuffle, toN } from "./particles";

const sections = sectionsData as ParticleSection[];

export function useParticleField(refs: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
  skyRef: RefObject<HTMLDivElement | null>;
  sectRefs: RefObject<(HTMLDivElement | null)[]>;
}): void {
  const { canvasRef, capRef, skyRef, sectRefs } = refs;
  useEffect(() => {
    // MOVE VERBATIM: the entire body of the existing desktop useEffect in Skills.tsx,
    // from `const canvas = canvasRef.current; const capEl = capRef.current;` through cleanup.
    // EXACTLY ONE delta: replace
    //     const skyEl = document.querySelector<HTMLElement>("[data-sky]");
    //   with
    //     const skyEl = skyRef.current;
    // Everything else — the cv/cap/context aliases, ready/SH state, computeTargets,
    // sampleTextPoints, setBlocks/clearBlocks, the frame() loop, the three
    // ScrollTrigger.create calls (#about / #work / #work), the Promise.all sampling,
    // and the cleanup return — is unchanged.
  }, [canvasRef, capRef, skyRef, sectRefs]);
}
```

> The original effect dependency array is `[canvasRef, capRef]`; expand to `[canvasRef, capRef, skyRef, sectRefs]` (all are stable refs, so this does not change runtime behavior). `sectRefs` was a component ref captured via closure before; it is now passed in.

- [ ] **Step 6: Edit `Skills.tsx` to render + wire context**

Remove the `SkillsProps` interface, the props, the inline `MobileSection`, the moved helpers/constants, and the big effect. Pull stage refs from `useHomeStage()`.

```tsx
import { useRef } from "react";
import sectionsData from "../../../../data/particleSections.json";
import type { ParticleSection } from "../../../../types";
import { useHomeStage } from "../../HomeStageContext";
import { useParticleField } from "./useParticleField";
import MobileSection from "./MobileSection";

const sections = sectionsData as ParticleSection[];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { canvasRef, capRef, skyRef } = useHomeStage();

  useParticleField({ canvasRef, capRef, skyRef, sectRefs });

  return (
    // UNCHANGED: the exact JSX currently returned by Skills (the desktop
    // particle-content map using sectRefs, and the mobile map rendering <MobileSection s={s} />).
  );
}
```

> `sectionRef` is currently declared but only used as `<section id="skills" ref={sectionRef}>`; keep it. The JSX is unchanged.

- [ ] **Step 7: Update `HomePage.tsx`: import path, drop Skills props, drop sky `data-*`**

Change `import Skills from "../../sections/Skills";` to:
```tsx
import Skills from "./sections/Skills/Skills";
```
Render `<Skills />` with NO props:
```tsx
<Skills />
```
The sky element is now found via `skyRef`, so remove `data-sky` (keep `ref`/`className`):
```tsx
<div ref={skyRef} className="night-sky" aria-hidden="true" />
```

- [ ] **Step 8: Verify gates**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; 2 passed; build OK.

- [ ] **Step 9: Commit**

```bash
git add src/pages/home/sections/Skills src/pages/home/HomePage.tsx
git commit -m "refactor: extract Skills into section folder + useParticleField/particles/MobileSection, use stage refs from context"
```

---

### Task 8: Final verification, cleanup, and docs

**Files:**
- Modify: `CLAUDE.md`
- Verify: whole tree

- [ ] **Step 1: Confirm old section directories are empty/gone**

Run:
```bash
ls src/sections src/components 2>&1; find src -name "*.tsx" -o -name "*.ts" | sort
```
Expected: `src/sections` and `src/components` no longer contain section files (remove the now-empty dirs with `rmdir src/sections src/components` if they are empty and still present). All section files live under `src/pages/home/sections/`.

- [ ] **Step 2: Full gate**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0; `Tests 2 passed (2)`; build success.

- [ ] **Step 3: Manual dev smoke test**

Run `npm run dev`, open the printed URL, and confirm (no console errors):
- Hero WebGL headline renders and the custom cursor follows the pointer.
- Scrolling into About/Hello pins and the headline dissolves into particles.
- Skills particle shapes morph; the night sky darkens then lifts.
- Projects cards scroll/stack; the statement blurs in/out.
- Career rows reveal.
Then stop the server.
Expected: behaves identically to before the refactor.

- [ ] **Step 4: Update `CLAUDE.md`**

Replace the stale architecture description. Specifically:
- The app is a single route (`/`) rendered by `src/App.tsx` (router root) → `src/pages/home/HomePage.tsx`. It is NOT "all in App.jsx", and there are not four routes.
- Each section lives in `src/pages/home/sections/<Name>/` as `<Name>.tsx` (UI) + `use<Name>...` hook(s); shared sub-components (`ProjectCard`, `MobileSection`) sit beside them.
- Shared stage resources (particle canvas, shape caption, night sky, hero cursor) are provided by `HomeStageContext` from `HomePage`; sections read them via `useHomeStage()`.
- Smooth scrolling is `useSmoothScroller()` (GSAP `ScrollSmoother`), not a Lenis `useSmoothScroll`.
- GSAP plugins are registered at module scope in `HomePage.tsx`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for routed pages/home section structure"
```

---

## Self-Review

**Spec coverage:**
- Target folder structure → Tasks 1–7 create exactly the files in the spec's tree. ✅
- `HomeStageContext` with `{canvasRef, capRef, skyRef, cursorRef}` → Task 1 Step 1; consumed by Hero (Task 6) and Skills (Task 7). ✅
- Per-section hook/UI split table → Task 2 (Career), 3 (Nav), 4 (Hello), 5 (Projects), 6 (Hero), 7 (Skills) with the exact hook names from the spec. ✅
- `useSmoothScroller` → Task 1 Step 2. ✅
- Router (`createBrowserRouter` `/` → HomePage) → Task 1 Step 4; react-router already installed (no install task needed). ✅
- Test renders HomePage in MemoryRouter → Task 1 Step 5. ✅
- Scope boundary: Hello→Skills bridge stays DOM-query → Task 7 only changes the `[data-sky]` lookup; the `.hello-*` queries are explicitly left untouched. ✅
- CLAUDE.md update → Task 8 Step 4. ✅

**Placeholder scan:** "MOVE VERBATIM" markers are intentional and precise (they name the exact source range and the exact deltas) — they are not vague TODOs. Every hook signature, every import path, every renamed identifier, and every gate command is concrete. No "handle edge cases"/"TBD"/"similar to Task N". ✅

**Type/identifier consistency:**
- Hook names match the spec and are used consistently: `useCareerReveal`, `useNavReveal`, `useHelloIntro`, `useProjectScroll`, `useHeroCanvas`, `useParticleField`, `useMobileParticles`, `useSmoothScroller`. ✅
- `HomeStage` field names (`canvasRef`/`capRef`/`skyRef`/`cursorRef`) are identical in the context (Task 1), Hero consumer (Task 6), and Skills consumer (Task 7). ✅
- Projects naming collision resolved: component `ProjectCard` (default export) vs data type `ProjectCardData` (named export), used consistently in Task 5 Steps 2–4. ✅
- Import-path depth: section files are 4 levels under `src` (`src/pages/home/sections/<Name>/`), so data/types imports use `../../../../data/...` and `../../../../types`; context import from a section uses `../../HomeStageContext`. Consistent across Tasks 2–7. ✅
- Effect dependency changes (`useParticleField` `[canvasRef, capRef, skyRef, sectRefs]`, `useMobileParticles` `[shape]`) are stable refs/values → no behavior change. ✅

**Behavior-neutrality guardrails:** every section task uses "move verbatim + enumerated deltas", and each lists exactly which one lookup changes (cursor query→ref in Hero; sky query→ref in Skills; `s.shape`→`shape` in mobile). The verify gate (tsc + vitest + build) runs after each task, with a manual dev smoke test at the end.

# Convert Portfolio from JSX to TSX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the entire React portfolio source from JavaScript/JSX to TypeScript/TSX with moderate-strict type-checking, full types for data and component props, and a working test suite.

**Architecture:** Add TypeScript tooling (compiler, React/Node types, `tsconfig.json`, ambient declarations) without changing any runtime behavior. Rename every `.jsx`/`.js` source file to `.tsx`/`.ts` and add the minimum type annotations + null-guards needed to satisfy `strict` mode. Vite already compiles `.tsx` via `@vitejs/plugin-react`, so no build-plugin changes are needed. Dead-code section files are deleted. The stale test is rewritten to assert the current markup and made deterministic in jsdom.

**Tech Stack:** TypeScript 5.x, React 19 + `@types/react`/`@types/react-dom`, Vite 6, Vitest 3, GSAP 3.15 (ships its own types), Lenis-free smooth scroll via GSAP ScrollSmoother.

**Decisions locked in (from brainstorming):**
- Strictness: **moderate strict** — `"strict": true` with `noUnusedLocals`/`noUnusedParameters` disabled (the animation code has intentional unused locals).
- Scope: **convert everything now** (no long-lived mixed JS/TS state, though `allowJs` is enabled to keep intermediate commits green).
- Type depth: **full types for data + props** — interfaces in `src/types.ts`, consumed by `portfolio.ts` and components.
- Dead code (`src/sections/Hero.jsx`, `HeroTagline.jsx`, `Showcase.jsx`, `src/data/status.json`): **delete** (not imported anywhere; recoverable via git).
- `src/App.test.jsx`: **rewrite assertions to match current markup** + convert to `.tsx` (current assertions reference removed hero markup and a non-existent `--bg` token; both tests fail today).

**Verification model:** This is a refactor/migration, so the per-task "test" is `npx tsc --noEmit` passing (type-check as the gate), plus `npm run build` and `npx vitest run` at the end. Run `npx tsc --noEmit` after **every** file conversion — keep it green at all times.

---

## File Structure

**Created:**
- `tsconfig.json` — compiler config (moderate-strict, `allowJs`, `resolveJsonModule`, `noEmit`).
- `src/vite-env.d.ts` — Vite client types reference + `Window.ScrollSmoother` augmentation.
- `src/types.ts` — shared data interfaces (`Profile`, `NavLink`, `ShowcaseItem`, `HelloPill`, `Skill`, `CareerEntry`, `Project`, `ParticleSection`).

**Renamed + typed (`.jsx`→`.tsx`, `.js`→`.ts`):**
- `src/main.jsx` → `src/main.tsx`
- `src/App.jsx` → `src/App.tsx`
- `src/components/Nav.jsx` → `src/components/Nav.tsx`
- `src/sections/HeroStatement.jsx` → `.tsx`
- `src/sections/Hello.jsx` → `.tsx`
- `src/sections/Skills.jsx` → `.tsx`
- `src/sections/Projects.jsx` → `.tsx`
- `src/sections/Career.jsx` → `.tsx`
- `src/data/portfolio.js` → `src/data/portfolio.ts`
- `src/test/setup.js` → `src/test/setup.ts`
- `src/App.test.jsx` → `src/App.test.tsx`
- `vite.config.js` → `vite.config.ts`

**Unchanged:** `src/data/particleSections.json` (typed via `resolveJsonModule` + cast), `src/styles.css`.

**Deleted:** `src/sections/Hero.jsx`, `src/sections/HeroTagline.jsx`, `src/sections/Showcase.jsx`, `src/data/status.json`.

**Modified:** `package.json` (devDeps + scripts).

> **Rename mechanic:** Use `git mv old new` so history is preserved, then edit the new file. Imports in this project currently use explicit `.jsx`/`.js` extensions (e.g. `'./components/Nav.jsx'`); after renaming, change those specifiers to **extensionless** (`'./components/Nav'`). Vite's default `resolve.extensions` includes `.tsx`/`.ts`, so extensionless imports resolve correctly, and TS `moduleResolution: "bundler"` resolves them too. `.json` imports keep their extension.

---

### Task 1: Install TypeScript tooling and add scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D typescript @types/react @types/react-dom @types/node
```
Expected: `package.json` `devDependencies` gains `typescript`, `@types/react`, `@types/react-dom`, `@types/node`; `node_modules/.bin/tsc` now exists.

- [ ] **Step 2: Add `typecheck` script and make `build` type-check first**

In `package.json`, change the `scripts` block to:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest --run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
```

- [ ] **Step 3: Verify the compiler is installed**

Run: `npx tsc --version`
Expected: prints `Version 5.x.x`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add TypeScript tooling and typecheck script"
```

---

### Task 2: Add tsconfig and ambient declarations

**Files:**
- Create: `tsconfig.json`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "checkJs": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Notes:
- `allowJs: true` keeps the project type-checkable while files are mid-migration (existing `.jsx`/`.js` files are allowed but not checked because `checkJs` is false).
- `types: ["vitest/globals", "node"]` makes the global `test`/`expect`/`describe` (Vitest globals are enabled via `globals: true` in the Vite config) and Node APIs (`process`, `node:fs`) available without per-file imports. Vite client types come in via the reference in `src/vite-env.d.ts`, not this array.
- `noUnusedLocals`/`noUnusedParameters` are off (moderate-strict): the canvas/WebGL code keeps intentionally-unused locals (`sectionRef` in Skills, etc.).

- [ ] **Step 2: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

// GSAP's ScrollSmoother attaches itself to window; the code feature-detects it.
declare global {
  interface Window {
    ScrollSmoother?: typeof import("gsap/ScrollSmoother").ScrollSmoother;
  }
}

export {};
```

- [ ] **Step 3: Verify type-check passes with no source files converted yet**

Run: `npx tsc --noEmit`
Expected: exits 0 with no output. (Existing `.jsx`/`.js` files are not checked; the only TS files are the two declaration/config files, which have no errors.)

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json src/vite-env.d.ts
git commit -m "chore: add tsconfig and vite ambient types"
```

---

### Task 3: Delete dead-code files

**Files:**
- Delete: `src/sections/Hero.jsx`, `src/sections/HeroTagline.jsx`, `src/sections/Showcase.jsx`, `src/data/status.json`

- [ ] **Step 1: Confirm none are imported anywhere**

Run:
```bash
grep -rn "sections/Hero\b\|sections/Hero\.\|HeroTagline\|Showcase\|status.json\|status\b" src
```
Expected: no import lines reference these files (only unrelated matches like `hero-status-dot` in tests/CSS, which are strings, not imports). If any real import appears, STOP and reassess — the file is not dead.

- [ ] **Step 2: Delete the files**

```bash
git rm src/sections/Hero.jsx src/sections/HeroTagline.jsx src/sections/Showcase.jsx src/data/status.json
```

- [ ] **Step 3: Verify type-check still passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused section files and status.json"
```

---

### Task 4: Create shared data types and convert `portfolio.js`

**Files:**
- Create: `src/types.ts`
- Rename + edit: `src/data/portfolio.js` → `src/data/portfolio.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export interface Profile {
  name: string;
  role: string;
  location: string;
  summary: string;
  email: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface ShowcaseItem {
  id: number;
  alt: string;
  tag: string | null;
}

export interface HelloPill {
  id: string;
  label: string;
  icon: string;
  color: string;
  side: "left" | "right";
}

export interface Skill {
  id: number;
  tag: string;
  name: string;
  description: string;
  items: string[];
}

export interface CareerEntry {
  role: string;
  company: string;
  period: string;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  videoUrl: string | null;
  detailUrl: string;
  tags: string;
  year: string;
}

export interface ParticleSection {
  shape: string;
  index: string;
  title: string;
  desc: string;
  unlock: string[];
  build: string[];
}
```

- [ ] **Step 2: Rename `portfolio.js` to `portfolio.ts`**

```bash
git mv src/data/portfolio.js src/data/portfolio.ts
```

- [ ] **Step 3: Annotate each export in `src/data/portfolio.ts`**

Add a type-only import at the top of the file:
```ts
import type {
  Profile,
  NavLink,
  ShowcaseItem,
  HelloPill,
  Skill,
  CareerEntry,
  Project,
} from "../types";
```

Then add a type annotation to each `export const` (keep all the existing array/object contents unchanged):
```ts
export const profile: Profile = { /* unchanged */ };
export const navLinks: NavLink[] = [ /* unchanged */ ];
export const showcaseItems: ShowcaseItem[] = [ /* unchanged */ ];
export const helloPills: HelloPill[] = [ /* unchanged */ ];
export const skills: Skill[] = [ /* unchanged */ ];
export const careerEntries: CareerEntry[] = [ /* unchanged */ ];
export const projects: Project[] = [ /* unchanged */ ];
export const services: never[] = [];
```

> The `helloPills` `side` values are the string literals `"left"`/`"right"`, which satisfy the `"left" | "right"` union. `services` is `[]`, typed `never[]` (it is unused; this preserves "empty array" without inventing a shape).

- [ ] **Step 4: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0. (Consumers still import `'../data/portfolio.js'`; that specifier resolves to `portfolio.ts` under bundler resolution, and the `.jsx` consumers are unchecked, so no errors yet.)

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/data/portfolio.ts
git commit -m "feat: add data type definitions and type portfolio data"
```

---

### Task 5: Convert `Career.jsx` (smallest component — establishes the pattern)

**Files:**
- Rename + edit: `src/sections/Career.jsx` → `src/sections/Career.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/sections/Career.jsx src/sections/Career.tsx
```

- [ ] **Step 2: Edit imports and the ref generic**

Change the data import specifier to extensionless:
```ts
import { careerEntries } from "../data/portfolio";
```

Type the section ref (it is attached to a `<section>`):
```ts
const sectionRef = useRef<HTMLElement>(null);
```

Everything else in `Career.tsx` is already valid TS: `careerEntries` is now `CareerEntry[]`, so `entry.role`/`entry.company`/`entry.period` are typed; the GSAP `fromTo` calls and `ScrollTrigger.getAll().forEach((t) => t.kill())` type-check unchanged.

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/sections/Career.tsx
git commit -m "refactor: convert Career section to TypeScript"
```

---

### Task 6: Convert `Nav.jsx`

**Files:**
- Rename + edit: `src/components/Nav.jsx` → `src/components/Nav.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/components/Nav.jsx src/components/Nav.tsx
```

- [ ] **Step 2: Edit imports, state, and ref generics**

Change the data import:
```ts
import { navLinks, profile } from "../data/portfolio";
```

Type the eyebrow ref (attached to a `<p>`):
```ts
const eyebrowRef = useRef<HTMLParagraphElement>(null);
```

The `useState(false)` infers `boolean` correctly — no change. Inside the `ScrollTrigger.create` `onUpdate(self)` callback, `self` is typed by GSAP; `self.direction` is `1 | -1` — no change. `navLinks.map(({ href, label }, i) => ...)` is typed via `NavLink[]` — no change.

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "refactor: convert Nav to TypeScript"
```

---

### Task 7: Convert `Projects.jsx`

**Files:**
- Rename + edit: `src/sections/Projects.jsx` → `src/sections/Projects.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/sections/Projects.jsx src/sections/Projects.tsx
```

- [ ] **Step 2: Add a `Ref` import and a card-prop interface**

Update the React import and data import at the top:
```ts
import { useEffect, useRef, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data/portfolio";

interface ProjectCard {
  name: string;
  tag: string;
  img: string;
}

interface CardProps {
  p: ProjectCard;
  i: number;
  ref: Ref<HTMLElement>;
}
```

- [ ] **Step 3: Type the `Card` component signature**

Change:
```jsx
function Card({ p, i, ref }) {
```
to:
```tsx
function Card({ p, i, ref }: CardProps) {
```
The body is unchanged (`p.img`, `p.name`, `p.tag` are now typed via `ProjectCard`).

- [ ] **Step 4: Type the refs in `Projects`**

```ts
const sectionRef = useRef<HTMLElement>(null);
const stageRef = useRef<HTMLDivElement>(null);
const statementRef = useRef<HTMLHeadingElement>(null);
const cardRefs = useRef<(HTMLElement | null)[]>([]);
```

- [ ] **Step 5: Type the local helpers and the filtered cards array**

`lerp` and `render` take numbers:
```ts
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
```
```ts
function render(p: number) {
```

`cardRefs.current.filter(Boolean)` does not narrow out `null` in TS — replace with a type-guard predicate so `cards[i]` is `HTMLElement`:
```ts
const cards = cardRefs.current.filter(
  (el): el is HTMLElement => el !== null,
);
```

`gsap.set(cards[i], ...)` and `gsap.set(statementRef.current, ...)` type-check (GSAP accepts elements; `statementRef.current` may be `null`, which `gsap.set` accepts). The `mapped` array is inferred as `ProjectCard[]` from `projects.map(...)` — no annotation needed, but you may annotate `const mapped: ProjectCard[] = projects.map(...)` for clarity.

- [ ] **Step 6: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/sections/Projects.tsx
git commit -m "refactor: convert Projects section to TypeScript"
```

---

### Task 8: Convert `Hello.jsx`

**Files:**
- Rename + edit: `src/sections/Hello.jsx` → `src/sections/Hello.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/sections/Hello.jsx src/sections/Hello.tsx
```

- [ ] **Step 2: Edit imports and type the lookup records + refs**

Change the data import:
```ts
import { helloPills } from "../data/portfolio";
```

Type the module-scope lookup objects so string indexing is allowed:
```ts
const PILL_ROTATIONS: Record<string, number> = { a: -3, b: 2, c: -2, d: 3, e: -2, f: 2 };

const PILL_POSITIONS: Record<string, string> = {
  a: "left-0 top-[18%]",
  b: "left-[40px] top-[42%]",
  c: "left-[14px] top-[66%]",
  d: "right-0 top-[18%]",
  e: "right-[34px] top-[42%]",
  f: "right-[14px] top-[66%]",
};
```

Type the refs:
```ts
const sectionRef = useRef<HTMLElement>(null);
const stageRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Guard the `useGSAP` body against null `section` and fix the pill-id indexing**

`sectionRef.current` is `HTMLElement | null`. Add a guard after grabbing it:
```ts
const section = sectionRef.current;
if (!section) return;
```

In the `forEach` that sets initial pill rotation, `id` is `string | undefined` (from the `?.replace(...)`); indexing a `Record<string, number>` with `undefined` is a type error. Change:
```js
const id = [...el.classList]
  .find((c) => c.startsWith("hello-pill--"))
  ?.replace("hello-pill--", "");
gsap.set(el, { opacity: 0, y: 12, rotation: PILL_ROTATIONS[id] ?? 0 });
```
to:
```ts
const id = [...el.classList]
  .find((c) => c.startsWith("hello-pill--"))
  ?.replace("hello-pill--", "");
gsap.set(el, { opacity: 0, y: 12, rotation: id ? PILL_ROTATIONS[id] ?? 0 : 0 });
```

- [ ] **Step 4: Annotate the Draggable callback `this`**

GSAP's `Draggable` callbacks bind `this` to the Draggable instance. Add explicit `this` parameters so `this.target` is typed and avoids any "implicit any `this`" error:
```ts
import { Draggable } from "gsap/Draggable";
```
```ts
const draggables = Draggable.create(
  section.querySelectorAll(".hello-pill"),
  {
    type: "x,y",
    onDragStart(this: Draggable) {
      gsap.killTweensOf(this.target);
    },
    onDragEnd(this: Draggable) {
      gsap.to(this.target, {
        x: 0,
        y: 0,
        ease: "elastic.out(0.18, 0.5)",
        duration: 0.6,
      });
    },
  },
);
```

The `helloPills.filter((p) => p.side === "left")` / `"right"` and `.map((pill) => ...)` are typed via `HelloPill[]`; `PILL_POSITIONS[pill.id]` indexes a `Record<string, string>` — valid. No other changes in the JSX.

- [ ] **Step 5: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Hello.tsx
git commit -m "refactor: convert Hello section to TypeScript"
```

---

### Task 9: Convert `HeroStatement.jsx` (WebGL + canvas)

**Files:**
- Rename + edit: `src/sections/HeroStatement.jsx` → `src/sections/HeroStatement.tsx`

> The shader source strings (`VERT`, `FRAG`) need no typing. The work is: ref generics, WebGL resource non-null assertions (idiomatic — creation only fails on context loss), the `2d` context, event-target casts, and the non-standard `letterSpacing` cast.

- [ ] **Step 1: Rename the file**

```bash
git mv src/sections/HeroStatement.jsx src/sections/HeroStatement.tsx
```

- [ ] **Step 2: Type the refs**

```ts
const sectionRef = useRef<HTMLElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);
```

- [ ] **Step 3: Type the `2d` texture context (non-null assertion)**

Change:
```js
const tex2d = document.createElement("canvas");
const t2 = tex2d.getContext("2d");
```
to:
```ts
const tex2d = document.createElement("canvas");
const t2 = tex2d.getContext("2d")!;
```
(`t2` is only dereferenced inside `drawText`/`drawLogo`, which run via `document.fonts.ready` callbacks; in a real browser the `2d` context is never null. The `!` keeps the WebGL plumbing readable.)

- [ ] **Step 4: Type the inner function signatures**

```ts
function drawLogo(cx: number, cy: number, s: number) {
```
Inside `drawText`, the non-standard `letterSpacing` property is not on `CanvasRenderingContext2D`. Change:
```js
if ("letterSpacing" in t2) t2.letterSpacing = `${px * TRACK_EM}px`;
```
to:
```ts
if ("letterSpacing" in t2) (t2 as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px * TRACK_EM}px`;
```

- [ ] **Step 5: Guard the section/canvas + type the WebGL context**

The existing guard `if (!section || !canvas) return;` narrows `section`/`canvas` to non-null. Keep it. The `gl` acquisition:
```ts
const gl = canvas.getContext("webgl", {
  premultipliedAlpha: false,
  antialias: true,
});
```
`gl` is `WebGLRenderingContext | null`. The existing `if (!gl) { ... return ...; }` fallback narrows `gl` to non-null afterward — no change needed to control flow.

- [ ] **Step 6: Non-null-assert WebGL resource creation**

In the post-`if (!gl)` section, WebGL creation calls return nullable handles. Apply `!` to the four creators and to the shader handle inside `compile`:

```ts
function compile(type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error("[HeroStatement] shader:", gl.getShaderInfoLog(s));
  return s;
}

const prog = gl.createProgram()!;
```
```ts
const vbuf = gl.createBuffer()!;
```
```ts
const tex = gl.createTexture()!;
```

> `gl.getUniformLocation(...)` returns `WebGLUniformLocation | null`, but `gl.uniform*` setters accept `WebGLUniformLocation | null`, so the `uTime`/`uAsp`/`uLogoL`/`uTrl`/`uRevealL`/`uBreathL` locals need **no** assertion.

- [ ] **Step 7: Type the trail/loop helpers and pointer handlers**

```ts
function pushPoint(x: number, y: number) {
```
```ts
function onMove(e: PointerEvent) {
```
For the `pointerover`/`pointerout` handlers, `e.target` is `EventTarget | null`; cast to `Element` for `.closest`:
```ts
function onOver(e: PointerEvent) {
  if ((e.target as Element).closest("a") && curEl) curEl.classList.add("lg");
}
function onOut(e: PointerEvent) {
  if ((e.target as Element).closest("a") && curEl) curEl.classList.remove("lg");
}
```

> `curEl` is `document.querySelector("[data-hs-cursor]")` → `Element | null`. The code already guards every use with `if (curEl)`, and `curEl.style` requires an `HTMLElement`. Change the lookup to:
> ```ts
> const curEl = document.querySelector<HTMLElement>("[data-hs-cursor]");
> ```
> so `curEl.style.transform = ...` (in the loop) type-checks.

- [ ] **Step 8: Type the remaining loop locals**

`let raf;` is used as a `requestAnimationFrame` handle and passed to `cancelAnimationFrame`. Annotate:
```ts
let t = 0,
  raf = 0;
```
`awakeTimer` holds a `setTimeout` handle and is passed to `clearTimeout`:
```ts
let awakeTimer: ReturnType<typeof setTimeout> | undefined;
```
(Adjust the original `let awakeTimer = null;` declaration accordingly.)

- [ ] **Step 9: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 10: Commit**

```bash
git add src/sections/HeroStatement.tsx
git commit -m "refactor: convert HeroStatement (WebGL) to TypeScript"
```

---

### Task 10: Convert `Skills.jsx` (particle canvas + JSON data)

**Files:**
- Rename + edit: `src/sections/Skills.jsx` → `src/sections/Skills.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/sections/Skills.jsx src/sections/Skills.tsx
```

- [ ] **Step 2: Edit imports and type the JSON + lookup records**

Add the React types and the `ParticleSection` type; type the JSON import:
```ts
import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import sectionsData from "../data/particleSections.json";
import type { ParticleSection } from "../types";

const sections = sectionsData as ParticleSection[];
```

Type the module-scope lookup objects for string indexing:
```ts
const SVGS: Record<string, string> = { /* unchanged */ };
const LABELS: Record<string, string> = { /* unchanged */ };
```

- [ ] **Step 3: Type the shared helper signatures**

```ts
function sample(frag: string): Promise<number[]> {
```
Inside `sample`, the `2d` context is nullable — guard it (resolve empty on failure):
```ts
img.onload = () => {
  const S = 200,
    cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const c = cv.getContext("2d");
  if (!c) {
    URL.revokeObjectURL(url);
    resolve([]);
    return;
  }
  c.drawImage(img, 0, 0, S, S);
  /* ...unchanged... */
};
```
```ts
function shuffle(pool: number[]): number[] {
```
```ts
function toN(pool: number[], N: number): { x: Float32Array; y: Float32Array } {
```

- [ ] **Step 4: Type the `MobileSection` props and guard its context**

```ts
function MobileSection({ s }: { s: ParticleSection }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    /* ...unchanged... */
```
Type the inner helpers:
```ts
function project(rx: number, ry: number): [number, number] {
```
`s.shape`, `s.index`, `s.title`, `s.desc`, `s.unlock`, `s.build` are all typed via `ParticleSection`. The `useEffect` dependency `[s.shape]` is unchanged.

- [ ] **Step 5: Type the `Skills` props and refs**

```ts
interface SkillsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
}

export default function Skills({ canvasRef, capRef }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sectRefs = useRef<(HTMLDivElement | null)[]>([]);
```

> `RefObject<T | null>` matches what `useRef<T>(null)` returns in React 19 (verified against `@types/react` v19), so the refs passed down from `App` are assignable.

- [ ] **Step 6: Guard the main `2d` context and type the typed-array/state locals**

After the existing `if (!canvas || !capEl) return;`, add:
```ts
const ctx = canvas.getContext("2d");
if (!ctx) return;
```
`skyEl` is used via `.style.opacity`, so type it as `HTMLElement`:
```ts
const skyEl = document.querySelector<HTMLElement>("[data-sky]");
```
Type the mutable state locals that are otherwise inferred as `null`:
```ts
let introPts: { x: Float32Array; y: Float32Array } | null = null;
let charEls: NodeListOf<Element> | null = null;
let prevScroll: number | null = null;
```
`SH` is a shape lookup filled later; type it:
```ts
const SH: Record<string, { x: Float32Array; y: Float32Array }> = {};
```

- [ ] **Step 7: Type the DOM lookups and `gsap.utils.toArray`**

```ts
const titleEl = document.querySelector<HTMLElement>(".hello-title");
const eyebrowEl = document.querySelector<HTMLElement>(".hello-eyebrow");
const fadeEls = gsap.utils.toArray<Element>(".hello-pill");
if (eyebrowEl) fadeEls.push(eyebrowEl);
```

- [ ] **Step 8: Fix the `window.ScrollSmoother` feature-detect and inner helpers**

`window.ScrollSmoother` is now typed via the `Window` augmentation from Task 2 — no cast needed:
```ts
function curScroll() {
  const sm =
    window.ScrollSmoother && ScrollSmoother.get && ScrollSmoother.get();
  return sm ? sm.scrollTop() : window.pageYOffset || 0;
}
```
Type the geometry/projection helpers:
```ts
const clamp = (a: number, b: number, v: number) => (v < a ? a : v > b ? b : v);
```
```ts
function project(
  rx: number,
  ry: number,
  scale: number,
  rot: number,
  cx: number,
  cy: number,
  D: number,
  out: number[],
) {
```
```ts
function setBlocks(alpha: number, opacity: number) {
```
`setBlocks`/`clearBlocks`/`ensureChars` operate on `ensureChars()` which returns `NodeListOf<Element>`; `c.style` requires `HTMLElement`. Change `ensureChars` to query HTML elements:
```ts
function ensureChars() {
  if (!charEls) charEls = document.querySelectorAll<HTMLElement>(".hello-char");
  return charEls;
}
```
and update the `charEls` type in Step 6 to:
```ts
let charEls: NodeListOf<HTMLElement> | null = null;
```
Inside `sampleTextPoints`, query HTML elements similarly (it reads `getBoundingClientRect`, available on `Element`, so either works; keep `Element`):
```ts
const chars = document.querySelectorAll(".hello-char");
```

- [ ] **Step 9: Fix `computeTargets` active-shape typing**

`active` starts `null` and may be assigned from `dataset.shape` (`string | undefined`). Type it and coalesce:
```ts
const sects = sectRefs.current.filter(
  (el): el is HTMLDivElement => el !== null,
);
let active: string | null = null,
  lp = 0;
```
In the loop, coalesce the optional dataset value:
```ts
active = sects[s].dataset.shape ?? null;
```
At the end where the caption text is set, `active` is guaranteed assigned by the fallback block above it; index `LABELS` with a cast and keep the `|| ""`:
```ts
capEl.style.left = cx + "px";
capEl.style.top = cy + D * 0.58 + "px";
capEl.textContent = (active && LABELS[active]) || "";
```

> The `SH.techstack` / `SH.one` / `SH.creation` etc. accesses use literal property names (not `active`), so they type-check directly against the `Record`.

- [ ] **Step 10: Type the `sectRefs`/`MobileSection` JSX callbacks**

The desktop map's ref callback receives `el: HTMLDivElement | null`:
```tsx
ref={(el) => {
  sectRefs.current[i] = el;
}}
```
No change to the JSX text — `s.index`, `s.title`, `s.desc`, `s.unlock.map(...)`, `s.build.map(...)` are typed via `ParticleSection`.

- [ ] **Step 11: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 12: Commit**

```bash
git add src/sections/Skills.tsx
git commit -m "refactor: convert Skills (particle canvas) to TypeScript"
```

---

### Task 11: Convert `App.jsx` and `main.jsx`

**Files:**
- Rename + edit: `src/App.jsx` → `src/App.tsx`
- Rename + edit: `src/main.jsx` → `src/main.tsx`

- [ ] **Step 1: Rename both files**

```bash
git mv src/App.jsx src/App.tsx
git mv src/main.jsx src/main.tsx
```

- [ ] **Step 2: Edit `src/App.tsx` imports and refs**

Drop the `.jsx` extensions from the local component imports and the data import:
```ts
import Nav from "./components/Nav";
import Hero from "./sections/HeroStatement";
import Hello from "./sections/Hello";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Career from "./sections/Career";
import { profile } from "./data/portfolio";
```
Type the two refs that are passed into `Skills`:
```ts
const canvasRef = useRef<HTMLCanvasElement>(null);
const capRef = useRef<HTMLDivElement>(null);
```
`ScrollSmoother.create(...)` returns a `ScrollSmoother` and `smoother.kill()` type-checks unchanged. `<Skills canvasRef={canvasRef} capRef={capRef} />` now matches `SkillsProps`.

- [ ] **Step 3: Edit `src/main.tsx`**

Drop the `.jsx` extension and non-null-assert the root element (`getElementById` returns `HTMLElement | null`):
```ts
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```
(`import "./styles.css"` is typed by the `vite/client` reference added in Task 2.)

- [ ] **Step 4: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "refactor: convert App and main entry to TypeScript"
```

---

### Task 12: Update `index.html` script reference

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Point the module script at `main.tsx`**

Find the script tag (it currently references the JS entry) and update it:
```html
<script type="module" src="/src/main.tsx"></script>
```
Run first to confirm the current value:
```bash
grep -n "src/main" index.html
```
Expected before: `src="/src/main.jsx"`. Change `.jsx` → `.tsx`.

- [ ] **Step 2: Verify the dev server boots**

Run: `npm run dev` (start, confirm it serves without a "failed to resolve /src/main.jsx" error, then stop with Ctrl-C).
Expected: Vite prints the local URL with no module-resolution error.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "chore: point HTML entry at main.tsx"
```

---

### Task 13: Convert the Vite config

**Files:**
- Rename + edit: `vite.config.js` → `vite.config.ts`

- [ ] **Step 1: Rename the file**

```bash
git mv vite.config.js vite.config.ts
```

- [ ] **Step 2: Import `defineConfig` from `vitest/config` and update the setup path**

So the `test` key is typed (it is a Vitest extension, not part of Vite's own `UserConfig`):
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0. (`vite.config.ts` is in the tsconfig `include`.)

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "chore: convert vite config to TypeScript"
```

---

### Task 14: Convert the test setup and make jsdom rendering deterministic

**Files:**
- Rename + edit: `src/test/setup.js` → `src/test/setup.ts`

> The current `App` mount in jsdom dies inside the canvas effects: `HTMLCanvasElement.prototype.getContext` is "not implemented" and throws. After Tasks 9–10 every `getContext` caller early-returns when it gets `null`, so stubbing `getContext` to return `null` lets `App` mount cleanly. `HeroStatement`'s no-WebGL fallback path calls `document.fonts.ready.then(...)`, which jsdom may not provide, so stub `document.fonts` with a never-resolving `ready` promise to keep tests synchronous (no RAF loop, no async draw).

- [ ] **Step 1: Rename the file**

```bash
git mv src/test/setup.js src/test/setup.ts
```

- [ ] **Step 2: Add canvas + fonts stubs and type the existing mocks**

Append to `src/test/setup.ts` (after the existing `window.matchMedia` / RAF / `ResizeObserver` mocks). Also add a parameter type to the `requestAnimationFrame` mock callback to satisfy strict mode:

```ts
// Existing RAF mock — type the callback parameter:
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  function requestAnimationFrame(callback: FrameRequestCallback) {
    return window.setTimeout(() => callback(Date.now()), 16);
  };

// jsdom has no canvas rendering context; every getContext caller in the app
// early-returns on null, so a null stub lets the tree mount without throwing.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;

// jsdom may not implement FontFaceSet; the hero fallback awaits document.fonts.ready.
// A never-resolving promise keeps the test synchronous (no async canvas draw).
if (!("fonts" in document)) {
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: new Promise<void>(() => {}) },
  });
}
```

The `ResizeObserverMock` class and `window.scrollTo`/`cancelAnimationFrame` stubs need a `cancelAnimationFrame` param type too:
```ts
window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  function cancelAnimationFrame(frame: number) {
    window.clearTimeout(frame);
  };
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/test/setup.ts
git commit -m "test: convert setup to TS and stub canvas/fonts for jsdom"
```

---

### Task 15: Rewrite and convert the App test to match current markup

**Files:**
- Rename + rewrite: `src/App.test.jsx` → `src/App.test.tsx`

> The current assertions reference removed markup (`Available to work`, `book a meeting`, `.hero-bg`, `.hero-beam`, `--bg: #F2F2F0`) and fail. Rewrite them against what `App` actually renders today: the `Nav` eyebrow (`profile.role`), the `Menu` button, and the footer (`contentinfo`) with `profile.name` and the `mailto` CTA. Replace the CSS-token check with tokens that exist in `styles.css` (`--dot`, `--radius`).

- [ ] **Step 1: Write the failing/updated test first**

Rename, then replace the file contents:
```bash
git mv src/App.test.jsx src/App.test.tsx
```
`src/App.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import App from "./App";

test("renders the portfolio shell", () => {
  render(<App />);

  // Nav eyebrow shows the profile role
  expect(
    screen.getByText("Dat Phan / Frontend Developer"),
  ).toBeInTheDocument();

  // Nav menu toggle
  expect(
    screen.getByRole("button", { name: /open menu/i }),
  ).toBeInTheDocument();

  // Footer with the profile name and a mailto CTA
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

- [ ] **Step 2: Run the test suite**

Run: `npx vitest run`
Expected: both tests in `src/App.test.tsx` **PASS** (2 passed). If `getByText("Dat Phan")` is ambiguous or the role query fails, re-read the rendered output (`screen.debug()`) and reconcile against `src/App.tsx`/`src/components/Nav.tsx` — do not weaken assertions blindly.

- [ ] **Step 3: Verify type-check still passes**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/App.test.tsx
git commit -m "test: rewrite App shell test for current markup, convert to TSX"
```

---

### Task 16: Final full verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no source `.jsx`/`.js` files remain**

Run:
```bash
find src -name "*.jsx" -o -name "*.js" | grep -v ".json"
```
Expected: no output (all source is `.ts`/`.tsx`; `particleSections.json` is intentionally JSON and excluded by the filter).

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: `2 passed`, exit 0.

- [ ] **Step 4: Production build (type-check + Vite build)**

Run: `npm run build`
Expected: `tsc --noEmit` passes, then Vite reports a successful build into `dist/`, exit 0.

- [ ] **Step 5: Smoke-test the dev server**

Run: `npm run dev`, open the printed URL, confirm the hero/particle animations render and there are no console errors, then stop the server.
Expected: page loads and animates as before the migration.

- [ ] **Step 6: Commit any build-artifact changes if the repo tracks `dist/`**

```bash
git add -A
git commit -m "chore: rebuild dist after TypeScript migration"
```
(Skip if `dist/` is gitignored or you don't want to commit build output.)

---

### Task 17 (optional): Update `CLAUDE.md` references

**Files:**
- Modify: `CLAUDE.md`

> `CLAUDE.md` predates both the component split and the TS migration (it claims "the entire app lives in two source files" and references `App.jsx`). This task only corrects file extensions and the obvious staleness; a full rewrite is out of scope.

- [ ] **Step 1: Update extensions and the single-file claim**

Replace `App.jsx` references with `App.tsx`, `src/data/portfolio.js` with `src/data/portfolio.ts`, and soften the "two source files" statement to reflect the `components/` + `sections/` structure. Add `npm run typecheck` to the Commands list.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for TS migration and current structure"
```

---

## Self-Review

**Spec coverage:**
- Install TS/TSX tooling (the original question) → Task 1. ✅
- Moderate-strict config → Task 2 (`strict` + `noUnusedLocals/Parameters` off). ✅
- Convert everything now → Tasks 4–15 cover all 12 source files + config. ✅
- Full data + props types → Task 4 (`src/types.ts`, typed `portfolio.ts`) + per-component prop interfaces (`SkillsProps`, `CardProps`, `MobileSection` props). ✅
- Delete dead code → Task 3. ✅
- Fix + convert the test → Tasks 14–15. ✅

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to above" — every step shows the exact code or command. ✅

**Type consistency check:**
- `ParticleSection` defined in Task 4, consumed in Task 10 (`sections`, `MobileSection` props). ✅
- `SkillsProps` (`RefObject<HTMLCanvasElement | null>` / `RefObject<HTMLDivElement | null>`) in Task 10 matches the `useRef<HTMLCanvasElement>(null)` / `useRef<HTMLDivElement>(null)` produced in `App.tsx` Task 11. ✅
- `ProjectCard`/`CardProps` defined and consumed within Task 7. ✅
- `charEls` typed `NodeListOf<HTMLElement> | null` consistently between Step 6 and Step 8 of Task 10 (Step 8 reconciles the earlier `Element` draft to `HTMLElement`). ✅
- Import specifiers: every local import is switched to extensionless; `.json` keeps its extension. ✅

**Risk notes for the implementer:**
- WebGL non-null assertions (`!`) in Task 9 are deliberate and idiomatic; do not replace them with runtime guards (that would change behavior on context loss).
- The test (Task 15) renders the full `App`; it depends on the canvas/fonts stubs from Task 14 and on the null-guards added in Tasks 9–10. If you run Task 15 before 14, the test will throw on `getContext`. Keep task order.

# Projects Parallax — Design Spec

**Date:** 2026-06-01
**Source prototype:** `Projects (Parallax).html` + `Projects-Parallax.README.md`

## Goal

Replace the existing `src/sections/Projects.jsx` with a pinned-scroll parallax section.
As the user scrolls, a headline mists in and stays centered while project cards rise up
behind it one at a time. A soft lerp lag adds a "drift" feel on top of ScrollSmoother.

ScrollSmoother replaces Lenis as the page-level smooth scroll driver.

---

## Files

| File | Action |
|---|---|
| `src/App.jsx` | Remove Lenis import + `useSmoothScroll` hook; register `ScrollSmoother`; wrap JSX in `#smooth-wrapper` / `#smooth-content`; create ScrollSmoother instance in `useEffect` |
| `src/sections/Projects.jsx` | Full rewrite — `Card` component + `ProjectsSection` default export |
| `tailwind.config.js` | Add `colors.mist: "#f2f2f0"` + `spacing.side: "clamp(24px,6vw,96px)"` |
| `src/styles.css` | Add `#smooth-wrapper { overflow: hidden }` + `.no-anim` fallback block |
| `package.json` | Remove `lenis` dependency |

---

## Architecture

### App.jsx changes

1. Delete `import Lenis from 'lenis'` and the `useSmoothScroll` function + its call.
2. Add `import { ScrollSmoother } from 'gsap/ScrollSmoother'`.
3. Add `ScrollSmoother` to the module-scope `gsap.registerPlugin(...)` call.
4. Create ScrollSmoother in a `useEffect` (empty deps — runs once on mount):

```js
useEffect(() => {
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.4,
    normalizeScroll: true,
  });
  return () => smoother.kill();
}, []);
```

5. Wrap the entire return JSX in:

```jsx
<div id="smooth-wrapper">
  <div id="smooth-content">
    {/* existing children */}
  </div>
</div>
```

---

### Projects.jsx — component structure

```
Projects.jsx
  ├── Card({ p, i, ref })          ← local component, React 19 ref-as-prop
  └── ProjectsSection()            ← default export
        ├── <section>              min-h-[680vh], ScrollTrigger trigger
        └── <div> stage            h-screen overflow-hidden, pin target
              ├── <p> eyebrow      "Selected Work"
              ├── <h2> statement   mists in via blur+opacity
              └── projects.map → <Card ref={el => cardRefs.current[i] = el} p={p} i={i} />
```

#### Card props

```ts
{ p: { name, tag, img }, i: number, ref: RefObject<HTMLElement> }
```

Data mapping from `portfolio.js` shape: `role → tag`, `imageUrl → img` — done inline in
the `projects.map()` call inside `ProjectsSection`.

#### Card markup

Matches the prototype's card markup exactly:

```jsx
<figure
  ref={ref}
  className={`project absolute top-1/2 z-[2] rounded-[30px]
    w-[clamp(280px,34vw,512px)] aspect-[512/570]
    ${i % 2 === 0 ? 'is-right right-side' : 'is-left left-side'}
    [will-change:transform,opacity,filter]
    after:content-[''] after:absolute after:-inset-px after:z-[3]
    after:rounded-[30px] after:pointer-events-none
    after:[box-shadow:inset_0_0_4rem_8rem_theme(colors.mist)]`}
>
  <div className="absolute inset-0 rounded-[30px] overflow-hidden">
    <img src={p.img} alt={`${p.name} — ${p.tag}`} className="w-full h-full object-cover" />
  </div>
  <figcaption className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4]
    whitespace-nowrap inline-flex items-baseline gap-[0.55em]
    px-[0.95em] py-[0.56em] rounded-full text-white
    bg-[rgba(120,120,120,0.28)] [backdrop-filter:blur(7px)_saturate(1.3)]
    [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_20px_-10px_rgba(0,0,0,0.4)]">
    <b className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</b>
    <span className="text-[14px] font-normal opacity-80">{p.tag}</span>
  </figcaption>
</figure>
```

---

### Animation system (`useEffect` in ProjectsSection)

Port of the prototype IIFE — runs once on mount, cleanup on unmount.

```
refs:
  sectionRef  → <section>         ScrollTrigger trigger
  stageRef    → <div> stage       pin target
  statementRef → <h2>             driven by render()
  cardRefs    → Card figures[]    driven by render()
```

#### Sequence timing (scroll progress 0 → 1)

```
MIST_END = 0.10   headline fully revealed
FIRST    = 0.14   card[0] starts entering
OVERLAP  = 0.66   each next card starts at 66% of prev's window
WIN      = (1 - FIRST) / ((N-1) * OVERLAP + 1)
STRIDE   = OVERLAP * WIN
```

#### render(p) — called every RAF frame with smoothed progress

- **Statement:** `opacity = mp * (1 - fadeOut)`, `filter: blur(...)`, `scale` — matches prototype exactly.
- **Cards:** each card gets its own `sp` (local progress within its window):
  - `sp ≤ 0` → hidden below (`y = startY`, `autoAlpha = 0`)
  - `sp ≥ 1` → hidden above (`y = endY`, `autoAlpha = 0`)
  - `0 < sp < 1` → `y = lerp(startY, endY, sp)`, `autoAlpha = min(fin, fout)`
  - `startY = 0.62 * vh`, `endY = -0.62 * vh`

#### Lerp float loop

```js
let targetP = 0, curP = 0, raf;
function loop() {
  curP += (targetP - curP) * 0.08;
  if (Math.abs(targetP - curP) < 0.00015) curP = targetP;
  render(curP);
  raf = requestAnimationFrame(loop);
}
```

#### ScrollTrigger

```js
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top top',
  end: 'bottom bottom',
  pin: stageRef.current,
  anticipatePin: 1,
  onUpdate: (self) => { targetP = self.progress; },
  onRefresh: (self) => { targetP = self.progress || 0; },
});
```

#### Cleanup

```js
return () => {
  cancelAnimationFrame(raf);
  ScrollTrigger.getAll().forEach(t => t.kill());
};
```

---

### Tailwind tokens (tailwind.config.js)

```js
colors: {
  mist: "#f2f2f0",   // existing bg color aliased — card vignette uses theme(colors.mist)
},
spacing: {
  side: "clamp(24px, 6vw, 96px)",  // right-side / left-side card gutters
},
```

---

### CSS additions (styles.css)

```css
#smooth-wrapper { overflow: hidden; }

/* .no-anim fallback — applied when GSAP is missing or prefers-reduced-motion */
.no-anim .projects        { min-height: auto; }
.no-anim .projects-stage  { height: auto; overflow: visible; padding: 18vh 0; }
.no-anim .statement-layer { position: static; }
.no-anim .statement       { opacity: 1 !important; filter: none !important; }
.no-anim .project {
  position: relative; top: auto; left: auto; right: auto;
  margin: 6vh clamp(24px,6vw,96px);
  opacity: 1 !important; filter: none !important; transform: none !important;
}
.no-anim .project.is-right { margin-left: auto; }
```

---

## Reduced-motion / no-GSAP fallback

If `prefers-reduced-motion: reduce` or GSAP fails to load, add `.no-anim` to `<body>`.
Cards render as a plain static vertical stack. This matches the prototype's fallback exactly.

Check at top of `useEffect`:

```js
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if (reduce) { document.body.classList.add('no-anim'); return; }
```

---

## Out of scope

- No hover-reveal list below the pinned stage (that was a separate plan)
- No video support in Card (all current projects use `imageUrl`)
- No route-change cleanup needed (Projects is always mounted, not behind a router route)

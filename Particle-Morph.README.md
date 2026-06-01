# Particle Morph — implementation notes (HTML → React/JSX)

A minimalist studio "process" section. A **fixed canvas particle cloud** sits in the
free left area and **morphs between glyphs** (one → trio → ring → refresh → stack) as
you scroll through four content sections on the right. Smooth scroll + parallax via
**GSAP ScrollSmoother**.

Source of truth: `Particle Morph.html`.

> ⚠️ **The particles are ALWAYS in motion.** This is not a static dot image — every
> particle continuously shimmers (a per-particle sine/cosine offset) *and* eases
> toward its target with a lerp, so the cloud is alive even when you're not scrolling.
> If it ever looks frozen, the idle-motion amplitude is too small — see "Idle motion".

---

## Suggested component

```tsx
<ParticleMorph sections={Section[]} brand="New Studio" />
```

```ts
type Section = {
  shape: 'creation' | 'growth' | 'modernization' | 'techstack';
  index: string;        // "01 — Creation"
  title: string;
  desc:  string;
  unlock: string[];     // "Used to unlock" column
  build:  string[];     // "We build" column
};
```

---

## Layout (3 fixed overlays + 1 scrolling column)

Fixed elements (nav, canvas, caption) live **OUTSIDE** the ScrollSmoother wrapper so
they stay truly fixed — ScrollSmoother transforms `#smooth-content`, which would
break `position: fixed` on anything inside it.

```
<nav class="nav">            … corner brand + menu (fixed)
<canvas id="stage">          … full-viewport, position:fixed, z-1, pointer-events:none
<div class="shape-cap">      … tiny label under the cloud (fixed)

<div id="smooth-wrapper">    … overflow:hidden
  <div id="smooth-content">
    <main class="content">   … margin-left:50vw (desktop) so the left half is free
      <section class="sect" data-shape="creation">
        <div class="sect-inner" data-speed="0.92"> … parallax drift
```

- **Tokens:** `--bg:#f2f2f0` (mist), `--ink:#15161a`, `--muted:#9b9b97`,
  `--side:clamp(24px,4vw,56px)`, font Inter.
- Each `.sect` is `min-height:128vh` so there's scroll length for the morph to play.

---

## Scroll system (GSAP)

```js
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.4,
  effects: true,            // enables data-speed parallax on .sect-inner (the "drift")
  normalizeScroll: true
});
```

- Guard for `prefers-reduced-motion` and for the plugin failing to load (the morph
  reads section `getBoundingClientRect()` directly, so it still works on native scroll
  if ScrollSmoother is absent — only the parallax drift is lost).
- ScrollSmoother is a **Club GSAP** plugin → needs a license for production.

---

## Particle engine (canvas)

Runs in one `requestAnimationFrame` loop. Steps:

### 1. Define glyphs as inline SVG, sample to points
`SVGS = { one, creation, growth, modernization, techstack }` — each a tiny mono SVG.
For each: render the SVG to a 200×200 offscreen canvas, read `getImageData`, and push
every pixel with alpha > 110 (sampling every 2px) into a point pool. Then `shuffle`
the pool and `toN()` resamples it to exactly `N` points (so all shapes share particle
identity and can morph 1:1).

```js
N = clamp(600, 1300, floor(innerW * innerH / 1300));  // density by viewport
```

### 2. Per-frame render loop
```js
function frame() {
  t += 0.016;
  updateDrift();                 // cloud parallax (below)
  if (ready) {
    computeTargets();            // fills TX[], TY[] for the active shape
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#15161a';
    ctx.globalAlpha = 0.82;
    for (let i = 0; i < N; i++) {
      // ── Idle motion: the cloud must ALWAYS move ──
      const jx = Math.cos(t * 0.8  + seed[i])        * 2.4;
      const jy = Math.sin(t * 1.05 + seed[i] * 1.3)  * 2.4;
      px[i] += (TX[i] + jx - px[i]) * 0.09;   // ease toward target + shimmer
      py[i] += (TY[i] + jy - py[i]) * 0.09;
      ctx.fillRect(px[i] - 0.75, py[i] - 0.75, 1.5, 1.5);
    }
  }
  requestAnimationFrame(frame);
}
```

**Idle motion (don't lose this):** `seed[i]` is a random phase per particle; the
`* 2.4` is the shimmer amplitude in px. Drop it to ~0.5 and the cloud looks frozen —
keep it ~2–3px so the cloud is visibly alive at rest. The `0.09` lerp is what makes
particles *flow* into a new shape rather than snap.

Use `DPR = min(2, devicePixelRatio)` and scale the canvas backing store; particles are
1.5px squares (`fillRect`) — cheap and crisp.

### 3. Which shape, and how morphed (`computeTargets`)
Find the `.sect` whose box straddles the vertical middle of the viewport
(`midY = H/2`); its `data-shape` is `active`, and local progress
`lp = (midY - rect.top) / rect.height` (0→1) drives the morph within that section:

| active | behaviour |
|---|---|
| `creation` | blends `one → creation` (single blob splits into a trio) by `lp` |
| `growth` | scales the ring from 0.5 → 1.45 |
| `modernization` | rotates the refresh glyph −0.5 → +0.5 rad, slight scale |
| `techstack` | the stacked-layers glyph, gentle scale |

All points are placed through `project(rx, ry, scale, rot, cx, cy, D, out)` which
maps glyph-space (0–200) into screen space around the cloud anchor.

### 4. Cloud anchor (where the cloud lives)
```js
function anchor() {
  const wide = W > 820;
  return {
    cx: wide ? W*0.26 : W*0.5,                     // left region / centred on mobile
    cy: wide ? H*0.5  : H*0.23,
    D:  wide ? Math.min(W*0.40, H*0.60)            // display size
            : Math.min(W*0.66, H*0.34)
  };
}
```

---

## Cloud parallax drift (the "trôi trôi" feel)

The canvas is fixed, but the cloud's vertical anchor **trails the scroll velocity and
eases back to centre** — so it drifts like the content instead of being rigidly pinned.

```js
let prevScroll = null, cloudOffsetY = 0, cloudVel = 0;
const curScroll = () =>
  (window.ScrollSmoother && ScrollSmoother.get()) ? ScrollSmoother.get().scrollTop()
                                                  : (window.pageYOffset || 0);
function updateDrift() {
  const s = curScroll();
  if (prevScroll === null) prevScroll = s;
  const dv = s - prevScroll; prevScroll = s;
  cloudVel = cloudVel * 0.84 + dv * 0.5;            // smoothed scroll velocity
  cloudVel = Math.max(-80, Math.min(80, cloudVel)); // clamp max drift (px)
  cloudOffsetY += (cloudVel - cloudOffsetY) * 0.10; // lerp toward it / back to 0
}
// in computeTargets:  cy = anchor().cy + cloudOffsetY;  (caption follows too)
```

Tune: clamp `±80` = how far it drifts; lerp `0.10` = how laggy/heavy (lower = floatier).

---

## Responsive

| Width | Layout |
|---|---|
| **> 1100px** | cloud left 26%, content right half (`margin-left:50vw`) |
| **821–1100px** | tighter gutter, `content margin-left:46vw`, smaller title |
| **≤ 820px** | stacked: cloud fixed top-centre (smaller, higher); content becomes **mist-bg "sheets"** (`.sect-inner { background:var(--bg) }`) that rise over the cloud as you read — so text never collides with particles. Nav hides Work/Studio, keeps Contact. |
| **≤ 520px** | the two list columns collapse to one (`grid-template-columns:1fr`) |

The `anchor()` `wide` switch (`W > 820`) must match the CSS 820px breakpoint.

---

## React conversion

Move the whole IIFE into one `useEffect` with refs and **clean up**:

```tsx
const canvasRef = useRef(null);
const capRef    = useRef(null);
const sectRefs  = useRef([]);   // push each <section> in the map

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const smoother = ScrollSmoother.create({ /* …as above… */ });

  let raf, ready = false;
  // …sample shapes (async) → set ready=true; build px/py/seed/TX/TY arrays…
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  const loop = () => { /* frame() body */ raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);

  return () => {                       // ← essential
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    ScrollTrigger.getAll().forEach(t => t.kill());
    smoother && smoother.kill();
  };
}, [sections.length]);
```

Notes:
- Keep the canvas, nav and caption as **siblings of** the ScrollSmoother wrapper, not inside it.
- The particle arrays (`px,py,seed,TX,TY`) are plain `Float32Array`s held in the effect
  closure (or a `useRef`), not React state — never call `setState` per frame.
- Section detection uses live `getBoundingClientRect()`; it works the same whether
  ScrollSmoother is active or not.

---

## Tuning knobs (quick reference)

| Knob | What it does |
|---|---|
| idle amplitude `* 2.4` | how much the cloud shimmers at rest (keep ≥ ~2px) |
| target lerp `0.09` | how fluidly particles flow into a new shape |
| `globalAlpha 0.82`, dot `1.5px` | particle weight / density feel |
| `N` formula | particle count vs. viewport size |
| `smooth: 1.4` | ScrollSmoother heaviness |
| `data-speed="0.92"` | content parallax drift (lower = lags more) |
| drift clamp `±80`, lerp `0.10` | cloud parallax range / heaviness |
| `.sect { min-height:128vh }` | scroll length each morph gets |

---

## Dependencies

```
gsap                  3.12.5
gsap/ScrollTrigger
gsap/ScrollSmoother   // Club GSAP — license required for production
Inter (Google Fonts)
```
No other libraries — the particle system is hand-rolled Canvas 2D.

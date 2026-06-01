# ProjectsParallax — conversion notes (HTML → React/JSX + Tailwind)

Source: `Projects (Parallax).html`. A pinned-headline portfolio section. As you
scroll, the headline **mists in** and stays centered while project cards rise up
**behind** it one at a time (each next card starts only after the previous one
has passed the text), with a soft **lerp lag** for a drifty feel.

Built with: GSAP **ScrollTrigger** + **ScrollSmoother** (trial CDN). Styling is
Tailwind utilities (arbitrary values for the bespoke bits).

---

## Suggested component

```tsx
<ProjectsParallax projects={Project[]} headline="Unforgettable experiences" />
```

```ts
type Project = {
  name: string;
  tag:  string;
  img:  string;   // image URL or import
};
```

---

## Tailwind tokens

Mirror these in `tailwind.config.js → theme.extend` (they're set via the Play CDN
config in the HTML):

```js
theme: {
  extend: {
    colors: {
      mist: "#f2f2f0",   // page bg == mist color, so card edges dissolve into it
      ink:  "#15161a",
    },
    borderRadius: { card: "30px" },
    spacing:      { side: "clamp(24px, 6vw, 96px)" }, // responsive gutters
    fontFamily:   { sans: ["Inter", "system-ui", "-apple-system", "sans-serif"] },
  },
}
```

Used as: `rounded-card`, `right-side` / `left-side`, `text-ink`, `bg-mist`.

---

## Markup

### Stage

```jsx
<div id="smooth-wrapper">          {/* overflow-hidden; ScrollSmoother requires this */}
<div id="smooth-content">
  {/* intro spacer */}
  <div className="h-[64vh] grid place-items-center text-neutral-400 text-xs tracking-[0.22em] uppercase">Scroll down ↓</div>

  {/* min-h drives the pin duration / sequence length */}
  <section ref={rootRef} className="relative min-h-[680vh]">
    {/* pin target */}
    <div ref={stageRef} className="relative h-screen overflow-hidden">
      <p className="absolute top-9 inset-x-0 text-center z-[5] text-[11px] font-medium tracking-[0.24em] uppercase text-neutral-400">Selected Work</p>

      {/* pinned, centered statement — z-[4], IN FRONT of the cards */}
      <div className="absolute inset-0 grid place-items-center z-[4] pointer-events-none">
        <h2 ref={statementRef} className="m-0 whitespace-nowrap font-semibold leading-none tracking-[-0.035em] text-ink text-[clamp(30px,5.4vw,62px)] [will-change:filter,opacity,transform]">{headline}</h2>
      </div>

      {projects.map((p, i) => <Card key={i} p={p} i={i} ref={el => (cardRefs.current[i] = el)} />)}
    </div>
  </section>

  {/* outro spacer */}
  <div className="h-[64vh] grid place-items-center text-neutral-400 text-xs tracking-[0.22em] uppercase">↑ End of selected work</div>
</div>
</div>
```

### Card (odd → right gutter, even → left)

```jsx
<figure
  className={`absolute top-1/2 z-[2] rounded-card w-[clamp(280px,34vw,512px)] aspect-[512/570]
    ${i % 2 === 0 ? "right-side" : "left-side"}
    [will-change:transform,opacity,filter]
    after:content-[''] after:absolute after:-inset-px after:z-[3] after:rounded-card after:pointer-events-none
    after:[box-shadow:inset_0_0_4rem_8rem_theme(colors.mist)]`}>
  <div className="absolute inset-0 rounded-card overflow-hidden">
    <img src={p.img} alt={`${p.name} — ${p.tag}`} className="w-full h-full object-cover" />
  </div>
  <figcaption className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] whitespace-nowrap
    inline-flex items-baseline gap-[0.55em] px-[0.95em] py-[0.56em] rounded-full text-white
    bg-[rgba(120,120,120,0.28)] [backdrop-filter:blur(7px)_saturate(1.3)]
    [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_20px_-10px_rgba(0,0,0,0.4)]">
    <b className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</b>
    <span className="text-[14px] font-normal opacity-80">{p.tag}</span>
  </figcaption>
</figure>
```

- The **mist vignette** is the `after:[box-shadow:inset...]` (edges dissolve into `mist`).
- The **caption** is a frosted glass pill, centered.

---

## Animation (one `useEffect`)

```tsx
const rootRef      = useRef(null); // <section>  → ScrollTrigger trigger
const stageRef     = useRef(null); // pin target
const statementRef = useRef(null);
const cardRefs     = useRef([]);

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const cards = cardRefs.current.filter(Boolean);
  const N = cards.length;
  const clamp = gsap.utils.clamp;
  const lerp = (a, b, t) => a + (b - a) * t;

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper", content: "#smooth-content",
    smooth: 1.4, normalizeScroll: true,
  });

  // ── sequence timing (global scroll-progress 0..1) ──
  const MIST_END = 0.10;  // text fully revealed by here
  const FIRST    = 0.14;  // project 1 enters after the text is set
  const OVERLAP  = 0.66;  // next starts at ~66% of prev's run (just past the text)
  const WIN    = (1 - FIRST) / ((N - 1) * OVERLAP + 1);
  const STRIDE = OVERLAP * WIN;

  function render(p) {
    const vh = window.innerHeight;
    const startY =  0.62 * vh;   // begins below the headline
    const endY   = -0.62 * vh;   // exits above

    // statement mist (blur + opacity + tiny scale)
    const mp = clamp(0, 1, p / MIST_END);
    const fadeOut = clamp(0, 1, (p - 0.95) / 0.05);
    gsap.set(statementRef.current, {
      opacity: mp * (1 - fadeOut),
      filter: `blur(${((1 - mp) * 24 + fadeOut * 18).toFixed(2)}px)`,
      scale: 1 + (1 - mp) * 0.04 - fadeOut * 0.02,
    });

    for (let i = 0; i < N; i++) {
      const sp = (p - (FIRST + i * STRIDE)) / WIN;
      let y, vis;
      if (sp <= 0)      { y = startY; vis = 0; }
      else if (sp >= 1) { y = endY;   vis = 0; }
      else {
        y = lerp(startY, endY, sp);
        const fin  = clamp(0, 1, sp / 0.14);
        const fout = clamp(0, 1, (1 - sp) / 0.14);
        vis = Math.min(fin, fout);
      }
      gsap.set(cards[i], { yPercent: -50, y, autoAlpha: vis });
    }
  }

  // lerp float: cards chase progress with a soft lag (the "trôi trôi" feel)
  let targetP = 0, curP = 0, raf;
  const loop = () => {
    curP += (targetP - curP) * 0.08;          // ease factor — lower = floatier
    if (Math.abs(targetP - curP) < 0.00015) curP = targetP;
    render(curP);
    raf = requestAnimationFrame(loop);
  };

  const st = ScrollTrigger.create({
    trigger: rootRef.current, start: "top top", end: "bottom bottom",
    pin: stageRef.current, anticipatePin: 1,
    onUpdate: (self) => { targetP = self.progress; },
    onRefresh: (self) => { targetP = self.progress || 0; },
  });

  render(0); loop();
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);

  return () => {                              // cleanup on unmount
    cancelAnimationFrame(raf);
    window.removeEventListener("load", onLoad);
    st.kill();
    smoother && smoother.kill();
  };
}, [projects.length]);
```

### Tweak the feel here

| Knob | Effect |
|---|---|
| `MIST_END` | how soon the headline finishes appearing |
| `FIRST` | when project 1 starts entering |
| `OVERLAP` | gap between consecutive projects (lower = more separated) |
| lerp `0.08` | drift amount — **lower = floatier / laggier** |
| `smooth: 1.4` | ScrollSmoother weight (higher = heavier glide) |
| `startY / endY` (`±0.62 * vh`) | how far each card travels |

---

## Fallback

If GSAP is missing or `prefers-reduced-motion: reduce`, the HTML adds `.no-anim`
to `<body>` and the cards render as a plain static stack. That small CSS block is
the **only** non-Tailwind CSS — copy it into your global stylesheet:

```css
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

(In React you'd more likely gate the GSAP effect on a `prefersReducedMotion` check
and render the static layout conditionally, rather than toggling a body class.)

---

## Dependencies

```
gsap                          3.12.5
gsap/ScrollTrigger
gsap/ScrollSmoother           // Club GSAP plugin — needs a license for production
```

Tailwind: the HTML uses the Play CDN (dev only). In a real app install Tailwind
via PostCSS/CLI and port the `theme.extend` block above.

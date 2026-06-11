# Loading → Hero morph transition + Nav Title fix

Date: 2026-06-11
Status: Approved (revised same day — see Revision below)

## Revision 2 (2026-06-11, user-directed — supersedes the choreography below)

- **Loader drops its logo mark entirely.** No 4-square mark; just name +
  counter + bar. At 100% the loader "mists out": content fades up & out, the
  dark panel's background dissolves to transparent.
- **Single droplet at screen centre.** After the mist-out, one small ink
  droplet falls from above the viewport onto the exact screen centre
  (`power2.in` gravity), submerges on impact, and `signalHeroReveal()` fires.
- **Splash + reveal recentred.** The shader's `uSplash` ring and the radial
  reveal disc now originate from `vec2(0.5)` (screen centre) instead of
  `uLogo`; `spread = rev * 1.6`. The logo-point bridge
  (`setHeroLogoPoint`/`getHeroLogoPoint`) was removed as unused.
- The hero reveal still plays on every mount without the loader (F5 same
  session, back from case study) — splash from centre; reduced motion stays
  instant.

## Revision (2026-06-11, user-directed)

1. **Play once per tab session.** The intro replays on every F5, which is
   annoying. Persist the played flag in `sessionStorage` (`intro-played`):
   `intro.ts` seeds `revealed` from storage at module load and
   `signalHeroReveal()` writes it. When skipped (or reduced motion),
   `useHeroCanvas` renders the hero instantly revealed — no 1.9s materialize,
   no splash.
2. **"Stone into a lake" choreography** (replaces the straight fly-to-logo):
   after the morph-to-circles on white, the cluster *floats up* and drifts
   until it hangs ~230px above the hero logo (`power2.inOut`), then *plunges
   straight down* onto it (`power3.in`, gravity feel). On impact:
   - a one-shot **splash ring** (`uSplash` uniform, 1.4s) bursts from the logo
     point in the hero shader;
   - the reveal becomes a **radial wave from the impact point** (soft-edged
     disc, `spread = rev * 1.9`) instead of a global fade — the hero text
     surfaces behind the expanding ripple, starting 200ms after the splash;
   - the white curtain (dots included) dissolves into the surfacing hero.

## Goal

Two changes to the home page intro experience:

1. **Loading → Hero morph.** When the loader hits 100%, the 4-square logo mark
   morphs into circles and flies down onto the hero's logo position, where the
   hero's water-distortion reveal bursts out from that point — one continuous
   transition from loader into hero, on a white background (no curtain lift).

2. **Title (role eyebrow) regression fix.** The shared Nav eyebrow no longer
   reveals on scroll-up. Restore the original behaviour (hidden at the top of
   the hero, slides in on scroll-up, hides on scroll-down).

## 1. Loading → Hero morph

### Markup (`LoadingScreen.tsx`)
- Replace the `.intro-mark` `<svg>` (4 `<rect>`) with **4 individually
  positioned dot elements** in a 2×2 grid: 3 filled, 1 outlined — visually the
  same mark, but each is a DOM node that can fly/morph independently.
- Keep `intro-meta` (name + counter) and `intro-line` (progress bar) unchanged.

### Sequence (`useIntroSequence.ts`)
On the exit (real gate = fonts ready + min on-screen time, with failsafe):
1. Counter eases to 100; `intro-meta` / `intro-line` fade up & out (as today).
2. **Curtain fades to white in place** — `.intro` background `#0d0d0d → #fff`;
   the 4 dots recolor `#f4f6fb → #15161a` so they read on white. No `yPercent`
   lift of the curtain.
3. **Morph** — each dot `border-radius 0 → 50%` (`power2.out`).
4. **Fly to hero logo** — the 2×2 cluster translates to the hero logo's
   on-screen point and scales down toward the hero-logo footprint, in formation
   (`power3.inOut`).
5. **Splash handoff** — on arrival, call `signalHeroReveal()`; the shader's
   existing per-frame logo ripple bursts from that point. Dots fade as the
   WebGL logo + text materialize from the white mist. `.intro` → `display:none`.

### Logo-point bridge (`intro.ts` + `useHeroCanvas.ts`)
- `intro.ts` gains `setHeroLogoPoint(x, y)` / `getHeroLogoPoint()` (screen px).
- `useHeroCanvas` publishes the logo screen point after `drawText`
  (`logoU * W`, `(1 - logoV) * H`) on resize.
- The intro reads it when starting the fly; falls back to `(0.62W, 0.54H)` if
  not yet measured.

### Reduced motion
Skip straight to white + `signalHeroReveal()` immediately, no fly, then hide.

## 2. Title (role eyebrow) fix (`useNavReveal.ts`)

**Root cause:** `useNavReveal` runs in `RootLayout` and creates its triggerless
`ScrollTrigger` *before* `HomePage` creates the `ScrollSmoother`, so it never
binds to the smoothed scroller and `onUpdate` never fires → the eyebrow stays
at `opacity:0`.

**Fix:** defer `ScrollTrigger.create(...)` until `ScrollSmoother.get()` exists
(rAF poll), so it binds to the active smoother. Behaviour identical: hidden at
top (`opacity:0, y:-14, pointerEvents:none`), slides in on scroll-up, hides on
scroll-down. Clean up the poll + trigger on unmount.

**Test:** Vitest test mocking `ScrollTrigger`/`ScrollSmoother` asserting the
trigger is created once the smoother is available and `onUpdate` toggles the
eyebrow.

## Files
- `src/pages/home/LoadingScreen.tsx` — 4-dot markup
- `src/pages/home/useIntroSequence.ts` — morph + fly sequence
- `src/pages/home/intro.ts` — logo-point bridge
- `src/pages/home/sections/Hero/useHeroCanvas.ts` — publish logo point
- `src/styles.css` — dot styles, white-fade
- `src/pages/home/sections/Nav/useNavReveal.ts` — deferred trigger
- `src/pages/home/sections/Nav/useNavReveal.test.tsx` (new) — wiring test

## Out of scope
- No commits.
- No changes to the hero shader math or the Nav dropdown.

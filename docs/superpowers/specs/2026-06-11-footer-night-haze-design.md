# Footer "Night Haze" — WebGL grain-gradient footer

Date: 2026-06-11
Status: Approved

## Revision (2026-06-11, user-directed — supersedes the texture below)

- **Dither, not haze.** The texture is now a reactbits-style "Dither"
  background: slow domain-warped fbm waves quantized to 5 brightness steps
  through a compact recursive 8×8 Bayer threshold matrix on a 2px pixel grid
  (DPR fixed at 1 so the grid stays coarse). Ramp: near black at the top →
  **Apple blue `#0071e3`** (`--color-accent`) at the bottom.
- **No cursor glow.** `uMouse` and all pointer tracking removed — the waves
  drift on their own (time-driven only).
- **Brand top-left.** Big "Dat Phan" (Saira semibold, display scale) fills the
  previously empty upper-left, balancing the link columns on the right.
- CSS fallback gradient retuned to the blue palette. Everything else
  (IntersectionObserver gating, reduced-motion single frame, reveal, meta row)
  unchanged.

## Revision 2 (2026-06-11, user-directed — Contact/Footer blend)

- **No seam.** The shader's base colour is exactly `#0d0d0d` (was slightly
  darker, which read as a border line at the Contact/Footer boundary).
- **The dither surfaces up into Contact.** The canvas extends 50vh above the
  footer (`top:-50vh; height:calc(100%+50vh)` — explicit height is required:
  an absolutely-positioned replaced element with `height:auto` collapses to
  its intrinsic 150px). It paints above Contact's `.contact-bg` (later in
  DOM) but below Contact's `z-[1]` content; `pointer-events-none`. Ramp
  `v = g*0.92 − 0.08 ± wave` quantizes to pure base at the top, so sparse
  dots creep through the boundary — the two sections morph.
- IntersectionObserver watches the **canvas** (not the footer) so the overlap
  animates as soon as it scrolls into view.
- **Unified accent.** Contact's accent text (`together` em, email hover
  underline) now uses `--color-accent #0071e3` — the dither blue is the
  shared accent of the Contact+Footer pair (the red `#ff3700` error borders
  remain semantic).

## Revision 3 (2026-06-11, user-directed — separate again, tighter)

- **Overlap removed.** The canvas is back to `inset-0` inside the footer —
  the dither no longer paints over Contact. The boundary stays seamless
  anyway because the shader's base colour is exactly `#0d0d0d`.
- **Footer shortened** to `75vh` (`min-h 620px`; auto height + gap on
  mobile), top padding `12vh` — closes the oversized gap between the link
  columns and the meta row.

## Revision 4 (2026-06-11, user-directed — hairline fix + gentle blend)

- **Hairline root cause:** ScrollSmoother translates `#smooth-content` by
  fractional pixels; on DPR-2 screens the Contact/footer boundary rounds to a
  half-pixel gap exposing the white `body` — a faint light line (invisible at
  DPR 1, which is why earlier checks missed it). Fixed with `-mt-px` on the
  footer (both sides are `#0d0d0d`).
- **Gentle blend restored:** the canvas laps **20vh** (not 50vh) up into
  Contact — only its empty bottom padding, never the form. A `breathe`
  term (`sin(t·0.35)·0.05` on the ramp threshold) makes the dither edge wash
  up and down across the boundary, blending the two sections back and forth.
- Verified at DPR 2 with a fractional scroll offset (worst case): no seam;
  edge height differs between frames 4s apart (breathing confirmed).

## Goal

Replace the one-line dark footer with a full-screen (~100vh) footer whose
background is a **WebGL-generated texture**: black at the top (seamless with
the dark Contact section), dissolving down through night blue
(`--color-night #0b0d14` family) into a hazy steel blue at the bottom —
"4am sky". Living film grain over the whole thing, slow fbm haze drift, and a
soft cool glow that lazily follows the cursor.

## Files (section folder + hook/UI convention)

- `src/pages/home/sections/Footer/Footer.tsx` — markup only
- `src/pages/home/sections/Footer/footerShader.ts` — VERT/FRAG sources
  (fbm mirrored from `transition/mistGL.ts`; adds per-frame grain hash and a
  `uMouse` glow). Uniforms: `uRes`, `uTime`, `uMouse`.
- `src/pages/home/sections/Footer/useFooterGlow.ts` — owns everything:
  GL init (null-guarded — jsdom stub returns `null`), quad + program, resize
  (DPR cap 1.5), pointer lerp (~0.06/frame), IntersectionObserver so the rAF
  loop runs **only while the footer is on screen**, content reveal
  (one-shot fade-up via ScrollTrigger), full cleanup.
- `src/pages/home/HomePage.tsx` — swap the inline `<footer>` for `<Footer />`.

## Shader

- Vertical gradient stops (top→bottom): `#0d0d0d` → `#0b0d14` → `#16243f` →
  `≈#4f6b99`, blend heights broken up by low-frequency fbm so there are no
  clean bands.
- Drifting haze: second fbm layer, scrolling very slowly, added mostly in the
  lower half.
- Cursor glow: smoothed `uMouse` (uv, y-up), cool-blue `exp` falloff.
- Film grain: high-frequency hash seeded by `gl_FragCoord` + time, ±~0.05.

## Content (no headline — Contact above is the CTA)

- Upper-right link columns: **Menu** (nav anchors from `navLinks`) and
  **Connect** (real `profile.email` mailto + Instagram/LinkedIn `#`
  placeholders, same as Nav's dropdown).
- Bottom meta row (4 groups, 2-col on mobile): `© <year> Dat Phan` ·
  `Based in <profile.location>` · `Your device` (OS + viewport size read from
  `navigator`/`window`) · `Fonts used` (Saira, Caveat).
- Labels use the site's uppercase tracked micro-label style; values
  white/levels of opacity.

## Behaviour / fallbacks

- A CSS `linear-gradient` layer with the same stops sits **under** the canvas
  — if WebGL is unavailable the footer still looks right (no grain).
- `prefers-reduced-motion`: render exactly one static frame, no loop, no
  pointer tracking.
- Nav stays legible: the existing `body.is-dark` trigger already holds to
  `end: "max"`.
- No scroll-scrubbed work; the shader's rAF is independent of scroll and
  killed when the footer leaves the viewport.

## Out of scope

- No changes to hero/mist shaders or Contact.
- No commits.

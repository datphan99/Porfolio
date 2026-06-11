# Contact section (light / minimalist) — design

Date: 2026-06-11
Status: Approved

## Revision 2 (2026-06-11, user-directed)

- **Dark theme.** The section is now dark (`#0d0d0d`): white text, white/15
  hairlines, selected pill = white fill / ink text, white submit button. The
  footer below goes dark too (dark outro). A `ScrollTrigger` flips
  `body.is-dark` from the section top (`start: "top top"`) to page bottom
  (`end: "max"`) so the fixed Nav stays legible.
- **Staggered 3-line headline** (uppercase, leading 0.9): `LET'S START` /
  `CREATING` (indented 26%) / `TOGETHER` (indented 10%, accent red).
- **Career → Contact morph.** The dark background is a separate
  `.contact-bg` layer that enters as an inset rounded card
  (`scaleX 0.92`, `borderRadius 40`) and expands to full-bleed
  (`scaleX 1`, `radius 0`), scrubbed from `top 85%` to `top 20%` — the
  black reads as an intentional panel instead of a hard cut. Rounded bottom
  corners are never visible while rounded (scrub completes long before the
  section bottom meets the viewport). Reduced motion: panel starts
  full-bleed.

## Goal

A minimalist **white** Contact section (the reference mock is dark; we invert
it). Text on the left, form on the right. Sits between Career and the footer,
takes over the `#contact` anchor the nav already points to.

## Layout

Desktop: two columns (`md:grid-cols-2`); mobile: stacked. White background,
ink text `#15161a`, hairline borders `border-black/[0.08]`, single accent
`#ff3700`.

- **Left:** uppercase micro-label `( CONTACT )` (matches Hello/Career eyebrow)
  → big headline **"LET'S START CREATING TOGETHER"** (Saira, `font-semibold`,
  `tracking-[-0.04em]`, tight leading; the word `TOGETHER` in accent red) →
  `mailto:` email below. **No social row** (email is the only contact point).
- **Right:** form card (white, hairline, radius `--radius:22px`):
  - "Your Data" → **Name** + **Email** inputs (2-up)
  - "You are interested in" → single-select pills: UX/UI Design · Web-design ·
    Web-development · Website creation · Animation · Other
  - "Budget in USD" → single-select pills: $1k-3k · $3k-5k · $5k-10k
  - "Project details" → textarea
  - **Submit Message** — full-width, black fill / white text

Selected pill = black fill, white text. Unselected = hairline border. Input
focus = darker/accent border.

## Behaviour

**Submit is visual-only** (static site, no backend). `onSubmit` →
`preventDefault` → if Name + Email are non-empty, set `status: "sent"`; the
button swaps to **"Message sent ✓"** and disables, auto-reverting after ~4s.
Nothing is sent anywhere. Missing Name/Email → fields flash an error border,
no submit.

**Magnetic pills.** On hover, each interest/budget pill is pulled toward the
cursor (translate ≈ 0.35× the cursor offset from its centre, via
`gsap.quickTo`), springing back to origin on `mouseleave`. Enabled only where
`(hover: hover) and (pointer: fine)`; skipped under
`prefers-reduced-motion`. The magnetic transform (`x`/`y`) composes with the
selection styling (`bg`/`border`) with no conflict.

## Components (folder + hooks convention)

- `sections/Contact/Contact.tsx` — render + local form state (`useState`)
- `sections/Contact/useContactReveal.ts` — scroll reveal, mirrors
  `useCareerReveal` (stagger `power3.out`, `start: "top 80%"`, runs once);
  cleanup kills only its own triggers (not `getAll()`)
- `sections/Contact/useMagneticPills.ts` — magnetic hover (quickTo per pill,
  hover/pointer + reduced-motion guards, removes listeners on cleanup)
- `data/portfolio.ts` — add `contactInterests` + `contactBudgets`
  (content-only, per the "only file to edit for content" convention)

## Wiring

`HomePage` renders `<Contact />` between `<Career />` and `<footer>`. Move
`id="contact"` from the footer to the Contact section; the footer stays as the
closing bar (keeps its mailto link).

## Out of scope

- No backend / real email send.
- No shader / scroll-engine changes; no edits to other sections.
- No commits.

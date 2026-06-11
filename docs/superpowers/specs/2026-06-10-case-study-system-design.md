# Case Study System — Design

**Date:** 2026-06-10
**Status:** Approved (pending spec review)

## Goal

Render JSON-driven case-study pages in the portfolio app. Each case study lives
in its own self-contained folder under `public/`, is reached at a numbered route
(`/case-study/:id`), and is linked from the relevant Projects card. The first
case study is the **Fund Portal** (Northcrest Capital), sourced from the existing
standalone material in `case-study/`.

## Decisions (locked)

1. **Visual treatment:** keep the original light / editorial look — reuse
   `case.css` verbatim. Do **not** restyle to the dark home theme.
2. **Sections:** faithfully reproduce **every** section of the source page
   (nav, hero, meta strip, overview + expandable "under the hood" tech grid,
   statement, four motion reels, outcome stats, CTA, footer).
3. **Content model:** one self-contained folder per case under
   `public/case-studies/case-study-{n}/`, with a `case.json` fetched at runtime.
   Adding a case = drop a folder + set one link field on a project. No rebuild.
4. **Reels' dependencies** (`tokens.css`, `anim-base.css`, `anim-runtime.js`) are
   **copied into each case folder** (fully self-contained), not shared — there is
   one case now; revisit only if duplication becomes a real cost.
5. **Entry:** clicking the **whole** Atlas Finance card navigates to its case
   study (not a separate "View case study" button). The magnetic caption pill is
   preserved.

## Approach

A React renderer fetches the per-case `case.json` and renders section components,
reusing `case.css` **verbatim** for styling. The four motion reels remain
**iframes** pointing at the self-contained `anim-*.html` screens (the same
embedding pattern already used for the dashboard card). This keeps the carefully
tuned reel animations byte-for-byte intact and isolates their light CSS from the
dark app.

Rejected alternatives:
- **Iframe the whole standalone HTML** per folder — simplest, but not
  data-driven; fails the "rendered from JSON" requirement.
- **MDX / content collections** — overkill for a fixed-section template.

## File & folder layout

```
public/case-studies/
  case.css                       # original page CSS, loaded ONLY on this route
  case-study-1/
    case.json                    # all content for this case
    anim-orders.html
    anim-funds.html
    anim-transactions.html
    anim-assets.html
    tokens.css
    anim-base.css
    anim-runtime.js
    dashboard.png
    logo-northcrest.svg

src/pages/case-study/
  CaseStudyPage.tsx       # route component: reads :id, fetches case.json,
                          # injects case.css, renders sections, handles
                          # loading / not-found
  caseStudy.types.ts      # CaseStudy schema + RichText type
  useCaseStudyChrome.ts   # sticky-nav scroll state + .reveal IntersectionObserver
  RichText.tsx            # renders (string | { it: string })[]
  icons.tsx               # inline-SVG map (nav mark, chevron, arrow, lock,
                          # 6 tech-grid icons)
  sections/
    CaseNav.tsx
    CaseHero.tsx
    CaseMeta.tsx
    CaseOverview.tsx       # includes the expandable "under the hood" tech grid
    CaseStatement.tsx
    CaseReels.tsx          # reel list + browser chrome + iframe
    CaseOutcome.tsx
    CaseCTA.tsx
    CaseFooter.tsx
```

## Routing & data flow

- `App.tsx` adds `{ path: "/case-study/:id", element: <CaseStudyPage /> }` to the
  existing `createBrowserRouter`. The home route (`/`) is unchanged.
- `CaseStudyPage` reads `:id` from `useParams`, then fetches
  `/case-studies/case-study-{id}/case.json`.
- Reel `src` values and image paths in the JSON are **relative filenames**
  (e.g. `anim-orders.html`, `dashboard.png`); the page resolves them against
  `/case-studies/case-study-{id}/` so the JSON has no absolute paths baked in.
- **States:**
  - *Loading:* render nothing (or a minimal blank) while the fetch is in flight.
  - *Not found / fetch error:* render a minimal "Case study not found" message
    with a link back to `/`.
  - *Loaded:* render all sections from the data.

## CSS isolation

`case.css` is light/editorial and defines generic `:root` vars (`--ink`, `--bg`,
`--line`, …) plus a Google Fonts `@import`. To keep it from leaking into the dark
home:

- `CaseStudyPage` injects `<link id="case-study-css" href="/case-studies/case.css">`
  into `<head>` on mount and removes it on unmount.
- The inject is guarded by the element `id` so React StrictMode's double-invoke
  in dev does not add two links.
- Section markup uses the original class names (`.nav`, `.hero`, `.wrap`,
  `.reveal`, …). Those classes only have styling while this route is mounted, so
  the home (Tailwind-utility markup) is unaffected.

## Behaviors (ported from the inline `<script>`)

`useCaseStudyChrome` replaces the original page script:

- **Sticky nav:** toggles `.scrolled` on `#nav` when `window.scrollY > 20`
  (passive scroll listener; set once on mount, cleaned up on unmount).
- **Scroll reveal:** an `IntersectionObserver` (threshold `0.12`, rootMargin
  `0px 0px -8% 0px`) adds `.in` to `.reveal` elements and unobserves them.
- **Expand information:** the "under the hood" tech panel is React state
  (`open`/`setOpen`) living in `CaseOverview`; it animates the panel height the
  same way (measure inner height → set height/opacity) and rotates the chevron
  via the existing `[aria-expanded]` CSS. `aria-expanded` / `aria-controls`
  preserved for accessibility.

This page is its **own** scroll context using native smooth scroll (as `case.css`
already sets). It does **not** use the home's ScrollSmoother / GSAP.

## JSON schema

`RichText = (string | { it: string })[]` — plain strings render as text;
`{ it }` renders as `<span class="it">…</span>` (the Newsreader italic accent).

```ts
interface CaseStudy {
  title: string;                       // document <title>
  nav: { brand: string; links: { href: string; label: string }[] };
  hero: {
    kicker: string;
    mark: { line1: string; line2: string };   // line2 is the italic serif line
    headline: RichText;
    body: string[];                            // paragraphs
  };
  meta: { label: string; value: string }[];    // meta strip cells
  overview: {
    title: RichText;
    blocks: { label: string; text: string }[]; // Challenge / Solution / Results
    tech: {
      heading: RichText;
      cells: { icon: string; label: string; text: string }[]; // icon = key in icons.tsx
    };
  };
  statement: RichText;
  work: {
    label: string;
    heading: RichText;
    reels: {
      idx: string;     // "01"
      name: string;    // "Orders"
      desc: string;
      tag: string;     // "Approval flow"
      url: string;     // shown in browser chrome, e.g. "portal.northcrest.capital/orders"
      src: string;     // iframe filename within the case folder, e.g. "anim-orders.html"
    }[];
  };
  outcome: {
    label: string;
    cells: { num: string; suffix?: string; desc: string }[];
  };
  cta: { heading: RichText; linkLabel: string; href: string };
  footer: { left: string; right: string };
}
```

- **Icons** (`icons.tsx`): a key → inline-SVG map for the nav mark, chevron,
  arrow, URL lock, and the six tech-grid glyphs (architecture, design-system,
  maker-checker, data-viz, access-control, import-export). The JSON references
  icons by key; raw SVG is never stored in JSON. A missing key falls back to a
  default glyph.
- The nav `brand` mark links to `/` (return home).

## Linking from Projects

- Add optional `caseStudyId?: number` to the `Project` interface in
  `src/types.ts`.
- Set `caseStudyId: 1` on Atlas Finance (`id: 2`) in `src/data/portfolio.ts`.
- `ProjectCard`: when `caseStudyId` is present, the figure is clickable —
  `useNavigate()` → `/case-study/{caseStudyId}` on click — with
  `cursor: pointer` and an accessible affordance (`role="link"` + keyboard
  Enter/Space handler, or an overlaid anchor). The existing magnetic caption
  pill, dashboard iframe, and mist vignette are unchanged.
- Cards without a `caseStudyId` behave exactly as today.

## Testing

- Keep the existing home test untouched.
- Add a case-study test: render `<App>` (or `CaseStudyPage`) at `/case-study/1`
  inside `MemoryRouter` with global `fetch` mocked to return a small sample
  `CaseStudy` JSON; assert the hero headline / a section renders. Assert the
  not-found branch when fetch rejects / returns non-OK.
- Add a minimal `IntersectionObserver` stub to `src/test/setup.ts` (jsdom lacks
  it) so `useCaseStudyChrome` does not throw under test.

## Out of scope

- Restyling the case page to the dark theme.
- A shared/deduplicated reel-dependency bundle across multiple cases.
- A CMS or authoring UI — cases are authored by hand-editing `case.json` and
  dropping assets in the folder.
- Animated route transition between home and case page (standard navigation).

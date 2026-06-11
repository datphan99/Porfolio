# Case Study System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render JSON-driven case-study pages at `/case-study/:id` from self-contained `public/case-studies/` folders, reusing the original `case.css` look, with reels as iframes and an entry link from the Atlas Finance project card.

**Architecture:** A React route component fetches a per-case `case.json` and renders faithful section components styled by the original `case.css` (injected into `<head>` only while the route is mounted). The four motion reels stay as iframes pointing at the self-contained `anim-*.html` screens in the case folder. The home route is untouched.

**Tech Stack:** React 19 + TypeScript + Vite 6, react-router-dom (existing `createBrowserRouter`), Vitest + @testing-library/react (jsdom).

> **⚠️ Commit policy:** The user's standing rule is **do NOT run `git commit`**. Every place a normal plan would commit, this plan uses a **Verify** checkpoint (`npm run build` / `npm run test`) instead. Do not run git commit at any step.

---

## File Structure

**Content (served statically from `public/`):**
- `public/case-studies/case.css` — original page CSS (copied verbatim), loaded only on this route.
- `public/case-studies/case-study-1/case.json` — all content for the Fund Portal case.
- `public/case-studies/case-study-1/anim-{orders,funds,transactions,assets}.html` — reel screens (copied verbatim).
- `public/case-studies/case-study-1/{tokens.css,anim-base.css,anim-runtime.js,scaler.js}` — reel deps (copied verbatim).
- `public/case-studies/case-study-1/{dashboard.png,logo-northcrest.svg}` — reel images (copied verbatim).

**App (`src/pages/case-study/`):**
- `caseStudy.types.ts` — `CaseStudy` schema + `RichText`.
- `RichText.tsx` — renders `(string | {it})[]`.
- `icons.tsx` — inline-SVG map (`Icon` component).
- `useCaseStudyChrome.ts` — sticky-nav + `.reveal` IntersectionObserver.
- `sections/CaseNav.tsx`, `CaseHero.tsx`, `CaseMeta.tsx`, `CaseOverview.tsx`, `CaseStatement.tsx`, `CaseReels.tsx`, `CaseOutcome.tsx`, `CaseCTA.tsx`, `CaseFooter.tsx`.
- `CaseStudyPage.tsx` — route component (fetch + inject CSS + compose + loading/not-found).
- `CaseStudyPage.test.tsx` — integration test.

**App edits:**
- `src/App.tsx` — add the route.
- `src/types.ts` — add `caseStudyId?: number` to `Project`.
- `src/data/portfolio.ts` — set `caseStudyId: 1` on Atlas Finance.
- `src/pages/home/sections/Projects/Projects.tsx` + `ProjectCard.tsx` — make the card navigate.
- `src/test/setup.ts` — add `IntersectionObserver` stub.

---

## Task 1: Scaffold the case-study content folder

**Files:**
- Create dir: `public/case-studies/case-study-1/`
- Copy: `case-study/*` → public locations (see below)

- [ ] **Step 1: Create folders and copy assets verbatim**

Run:
```bash
cd "/Users/tuyendat09/Downloads/My Portfolio"
mkdir -p public/case-studies/case-study-1
cp "case-study/case.css" public/case-studies/case.css
cp "case-study/anim-orders.html" "case-study/anim-funds.html" \
   "case-study/anim-transactions.html" "case-study/anim-assets.html" \
   "case-study/tokens.css" "case-study/anim-base.css" \
   "case-study/anim-runtime.js" "case-study/scaler.js" \
   "case-study/dashboard.png" "case-study/logo-northcrest.svg" \
   public/case-studies/case-study-1/
```

- [ ] **Step 2: Verify the files landed**

Run: `ls public/case-studies && echo "---" && ls public/case-studies/case-study-1`
Expected: `case.css` and `case-study-1` in the first listing; the 10 copied files (4 anim html, tokens.css, anim-base.css, anim-runtime.js, scaler.js, dashboard.png, logo-northcrest.svg) in the second.

- [ ] **Step 3: Sanity-check a reel loads standalone (optional but recommended)**

Run:
```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,750 \
  --virtual-time-budget=1500 --screenshot="/tmp/reel_orders.png" \
  "file:///Users/tuyendat09/Downloads/My Portfolio/public/case-studies/case-study-1/anim-orders.html" 2>/dev/null
echo done
```
Then Read `/tmp/reel_orders.png`. Expected: the Orders product screen renders (relative `tokens.css`/`anim-base.css`/`anim-runtime.js` resolve inside the folder). A mostly-blank frame is acceptable (GSAP-free `Reel` runtime may sit at t=0 under virtual time); the point is no 404s / broken layout.

---

## Task 2: Author `case.json`

**Files:**
- Create: `public/case-studies/case-study-1/case.json`

- [ ] **Step 1: Write the content file**

Create `public/case-studies/case-study-1/case.json`:
```json
{
  "title": "Fund Portal — Case Study",
  "nav": {
    "brand": "Studio",
    "links": [
      { "href": "#overview", "label": "Overview" },
      { "href": "#work", "label": "Motion" },
      { "href": "#outcome", "label": "Outcome" },
      { "href": "#contact", "label": "Contact" }
    ]
  },
  "hero": {
    "kicker": "Case study — Fintech platform",
    "mark": { "line1": "Fund", "line2": "Portal" },
    "headline": ["Designing ", { "it": "trust" }, " into everyday fund operations."],
    "body": [
      "Fund administration still runs on spreadsheets, email approvals and systems that assume you already know how they work. For an asset manager moving billions across multiple open-ended funds, that friction is risk.",
      "Northcrest Capital needed an operations portal where every subscription, redemption and NAV update could be reviewed, approved and audited — without operators having to become experts in the software first.",
      "Our studio partnered from the ground up: information architecture, a calm Apple-grade design system, and a maker–checker workflow that makes the right action the obvious one."
    ]
  },
  "meta": [
    { "label": "Role", "value": "Product design · Design system · Front-end" },
    { "label": "Year", "value": "2026" },
    { "label": "Platform", "value": "Responsive web app" },
    { "label": "Scope", "value": "9 operational surfaces" }
  ],
  "overview": {
    "title": ["Project", { "it": "overview" }],
    "blocks": [
      { "label": "Challenge", "text": "Translate a dense, compliance-heavy back office into an interface that feels effortless — fast to scan, impossible to misread, and safe to act in." },
      { "label": "Solution", "text": "A single-accent, photography-quiet system built on a strict type and spacing scale. Maker–checker is wired into every state, so approvals stay deliberate and fully logged." },
      { "label": "Results", "text": "A cohesive portal spanning orders, funds, transactions, assets and access control — shipping with one design language that scales as the book grows." }
    ],
    "tech": {
      "heading": ["Under the hood — what we built."],
      "cells": [
        { "icon": "architecture", "label": "Architecture", "text": "A React component library with token-driven theming and modular, per-surface screens — one shell, many routes, zero duplicated UI." },
        { "icon": "designSystem", "label": "Design system", "text": "88 design tokens governing color, a 300/400/600/700 type ladder, spacing, radius and a single elevation. No ad-hoc values anywhere." },
        { "icon": "makerChecker", "label": "Maker–checker", "text": "Every mutation flows pending → approved / rejected. Each decision is stamped with the operator's ID and surfaced in an audit-ready trail." },
        { "icon": "dataViz", "label": "Data visualisation", "text": "NAV index, allocation donut and subscription-flow charts all render from a single charting primitive, so every graph shares the same visual grammar." },
        { "icon": "accessControl", "label": "Access control", "text": "Role-based permissions throughout; read-only states degrade gracefully for non-checkers instead of hiding context." },
        { "icon": "importExport", "label": "Import / export", "text": "VSD import reconciliation and an admin export history give operations a paper trail for every file that enters or leaves the portal." }
      ]
    }
  },
  "statement": ["Operations move faster when the interface ", { "it": "gets out of the way." }],
  "work": {
    "label": "Motion & interaction",
    "heading": ["Four flows, captured as they ", { "it": "behave" }, " in product."],
    "reels": [
      { "idx": "01", "name": "Orders", "desc": "Maker–checker approvals — review a pending order and clear it in a single motion, with every decision logged.", "tag": "Approval flow", "url": "portal.northcrest.capital/orders", "src": "anim-orders.html" },
      { "idx": "02", "name": "Funds", "desc": "Funds at a glance — live NAV, AUM and status across every open-ended fund under management.", "tag": "Overview", "url": "portal.northcrest.capital/funds", "src": "anim-funds.html" },
      { "idx": "03", "name": "Transactions", "desc": "Rule configuration — subscription, redemption and fee-tier rules with a read-only fund summary alongside.", "tag": "Configuration", "url": "portal.northcrest.capital/transactions", "src": "anim-transactions.html" },
      { "idx": "04", "name": "Assets", "desc": "Portfolio analytics — aggregate NAV, top holdings and sector allocation, composed from one chart primitive.", "tag": "Analytics", "url": "portal.northcrest.capital/assets", "src": "anim-assets.html" }
    ]
  },
  "outcome": {
    "label": "Outcome",
    "cells": [
      { "num": "9", "desc": "operational surfaces designed & built on one system" },
      { "num": "1", "desc": "unified design language — 88 tokens, zero ad-hoc values" },
      { "num": "100", "suffix": "%", "desc": "of actions captured under maker–checker audit" }
    ]
  },
  "cta": {
    "heading": ["Have a platform that deserves ", { "it": "the same care?" }],
    "linkLabel": "Start a conversation",
    "href": "mailto:hello@studio.com"
  },
  "footer": {
    "left": "Fund Portal — case study · Northcrest Capital",
    "right": "Mock data, NDA-safe · © 2026"
  }
}
```

- [ ] **Step 2: Verify it is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/case-studies/case-study-1/case.json','utf8')); console.log('valid')"`
Expected: `valid`

---

## Task 3: Types

**Files:**
- Create: `src/pages/case-study/caseStudy.types.ts`
- Modify: `src/types.ts` (add `caseStudyId` to `Project`)

- [ ] **Step 1: Create the case-study schema**

Create `src/pages/case-study/caseStudy.types.ts`:
```ts
/** Inline rich text: plain strings render as text; { it } renders the italic
 *  Newsreader accent (<span class="it">). */
export type RichText = (string | { it: string })[];

export interface CaseStudyNav {
  brand: string;
  links: { href: string; label: string }[];
}

export interface CaseStudyHero {
  kicker: string;
  mark: { line1: string; line2: string };
  headline: RichText;
  body: string[];
}

export interface CaseStudyMetaCell {
  label: string;
  value: string;
}

export interface CaseStudyTechCell {
  icon: string;
  label: string;
  text: string;
}

export interface CaseStudyOverview {
  title: RichText;
  blocks: { label: string; text: string }[];
  tech: { heading: RichText; cells: CaseStudyTechCell[] };
}

export interface CaseStudyReel {
  idx: string;
  name: string;
  desc: string;
  tag: string;
  url: string;
  src: string;
}

export interface CaseStudyWork {
  label: string;
  heading: RichText;
  reels: CaseStudyReel[];
}

export interface CaseStudyOutcome {
  label: string;
  cells: { num: string; suffix?: string; desc: string }[];
}

export interface CaseStudy {
  title: string;
  nav: CaseStudyNav;
  hero: CaseStudyHero;
  meta: CaseStudyMetaCell[];
  overview: CaseStudyOverview;
  statement: RichText;
  work: CaseStudyWork;
  outcome: CaseStudyOutcome;
  cta: { heading: RichText; linkLabel: string; href: string };
  footer: { left: string; right: string };
}
```

- [ ] **Step 2: Add `caseStudyId` to the Project type**

In `src/types.ts`, modify the `Project` interface (currently ends with `year: string;`) to add an optional field:
```ts
export interface Project {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  videoUrl: string | null;
  detailUrl: string;
  tags: string;
  year: string;
  /** When set, the project card links to /case-study/{caseStudyId}. */
  caseStudyId?: number;
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 4: Icon map

**Files:**
- Create: `src/pages/case-study/icons.tsx`

- [ ] **Step 1: Create the inline-SVG icon component**

Create `src/pages/case-study/icons.tsx`:
```tsx
import type { ReactNode } from "react";

// Inner SVG markup per icon key, copied from the source case-study HTML.
// White-stroked glyphs (navMark, chevron) sit on the dark ink button/mark;
// the rest inherit currentColor.
const GLYPHS: Record<string, ReactNode> = {
  navMark: (
    <path d="M4 16l5-7 4 4 7-9" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevron: (
    <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrow: (
    <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2} stroke="currentColor" strokeWidth={2} />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth={2} />
    </>
  ),
  architecture: (
    <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  ),
  designSystem: (
    <>
      <circle cx={12} cy={12} r={8} stroke="currentColor" strokeWidth={2} />
      <path d="M12 4v16" stroke="currentColor" strokeWidth={2} />
    </>
  ),
  makerChecker: (
    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  dataViz: (
    <path d="M4 18V6m0 12l5-5 4 3 7-8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  accessControl: (
    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
  ),
  importExport: (
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {GLYPHS[name] ?? GLYPHS.architecture}
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 5: RichText renderer

**Files:**
- Create: `src/pages/case-study/RichText.tsx`

- [ ] **Step 1: Create the component**

Create `src/pages/case-study/RichText.tsx`:
```tsx
import { Fragment } from "react";
import type { RichText as RichTextData } from "./caseStudy.types";

export default function RichText({ value }: { value: RichTextData }) {
  return (
    <>
      {value.map((seg, i) =>
        typeof seg === "string" ? (
          <Fragment key={i}>{seg}</Fragment>
        ) : (
          <span key={i} className="it">
            {seg.it}
          </span>
        ),
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 6: Page-chrome hook (sticky nav + reveal)

**Files:**
- Create: `src/pages/case-study/useCaseStudyChrome.ts`

- [ ] **Step 1: Create the hook**

Create `src/pages/case-study/useCaseStudyChrome.ts`:
```ts
import { useEffect } from "react";

/** Ports the original case-study inline <script>: toggles the sticky-nav
 *  `.scrolled` state and runs the `.reveal` IntersectionObserver. Pass
 *  `active = true` only once the content has rendered so the `.reveal`
 *  elements exist in the DOM. */
export function useCaseStudyChrome(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const nav = document.getElementById("nav");
    const onScroll = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [active]);
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 7: Sections — Nav, Hero, Meta

**Files:**
- Create: `src/pages/case-study/sections/CaseNav.tsx`
- Create: `src/pages/case-study/sections/CaseHero.tsx`
- Create: `src/pages/case-study/sections/CaseMeta.tsx`

- [ ] **Step 1: CaseNav**

Create `src/pages/case-study/sections/CaseNav.tsx`:
```tsx
import { Link } from "react-router-dom";
import { Icon } from "../icons";
import type { CaseStudyNav } from "../caseStudy.types";

export default function CaseNav({ nav }: { nav: CaseStudyNav }) {
  return (
    <nav className="nav" id="nav">
      <Link to="/" className="brand">
        <span className="mk">
          <Icon name="navMark" />
        </span>
        {nav.brand}
      </Link>
      <div className="nav-links">
        {nav.links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: CaseHero**

Create `src/pages/case-study/sections/CaseHero.tsx`:
```tsx
import RichText from "../RichText";
import type { CaseStudyHero } from "../caseStudy.types";

export default function CaseHero({ hero }: { hero: CaseStudyHero }) {
  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="reveal">
            <div className="kicker" style={{ marginBottom: 26 }}>
              {hero.kicker}
            </div>
            <h1 className="hero-mark">
              {hero.mark.line1}
              <span className="l2">{hero.mark.line2}</span>
            </h1>
          </div>
          <div className="reveal">
            <h2 className="hero-head">
              <RichText value={hero.headline} />
            </h2>
            <div className="hero-body">
              {hero.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: CaseMeta**

Create `src/pages/case-study/sections/CaseMeta.tsx`:
```tsx
import type { CaseStudyMetaCell } from "../caseStudy.types";

export default function CaseMeta({ meta }: { meta: CaseStudyMetaCell[] }) {
  return (
    <div className="wrap reveal">
      <div className="meta">
        {meta.map((c, i) => (
          <div className="cell" key={i}>
            <div className="mlabel">{c.label}</div>
            <div className="mval">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify they compile**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 8: Section — Overview (with expandable tech grid)

**Files:**
- Create: `src/pages/case-study/sections/CaseOverview.tsx`

- [ ] **Step 1: Create the component (with expand state)**

Create `src/pages/case-study/sections/CaseOverview.tsx`:
```tsx
import { useEffect, useRef, useState } from "react";
import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudyOverview } from "../caseStudy.types";

export default function CaseOverview({
  overview,
}: {
  overview: CaseStudyOverview;
}) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  const toggle = () =>
    setOpen((prev) => {
      const next = !prev;
      setHeight(next ? (innerRef.current?.offsetHeight ?? 0) : 0);
      return next;
    });

  // keep the panel sized to its content while open (matches original resize handler)
  useEffect(() => {
    if (!open) return;
    const onResize = () => setHeight(innerRef.current?.offsetHeight ?? 0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <section id="overview" className="section-pad-b">
      <div className="wrap">
        <div className="ov-grid">
          <h2 className="ov-title reveal">
            <RichText value={overview.title} />
          </h2>
          <div>
            <div className="ov-blocks reveal">
              {overview.blocks.map((b, i) => (
                <div className="ov-block" key={i}>
                  <div className="label">{b.label}</div>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>

            <div className="expand-wrap reveal">
              <button
                className="expand-btn"
                aria-expanded={open}
                aria-controls="tech"
                onClick={toggle}
              >
                <span>{open ? "Collapse information" : "Expand information"}</span>
                <Icon name="chevron" className="chev" />
              </button>

              <div
                className="tech"
                id="tech"
                style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
              >
                <div className="tech-inner" ref={innerRef}>
                  <div className="tech-h">
                    <RichText value={overview.tech.heading} />
                  </div>
                  <div className="tech-grid">
                    {overview.tech.cells.map((c, i) => (
                      <div className="tech-cell" key={i}>
                        <div className="tlabel">
                          <Icon name={c.icon} />
                          {c.label}
                        </div>
                        <p>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 9: Sections — Statement, Reels

**Files:**
- Create: `src/pages/case-study/sections/CaseStatement.tsx`
- Create: `src/pages/case-study/sections/CaseReels.tsx`

- [ ] **Step 1: CaseStatement**

Create `src/pages/case-study/sections/CaseStatement.tsx`:
```tsx
import RichText from "../RichText";
import type { RichText as RichTextData } from "../caseStudy.types";

export default function CaseStatement({
  statement,
}: {
  statement: RichTextData;
}) {
  return (
    <section className="statement section-pad-b">
      <div className="wrap reveal">
        <p>
          <RichText value={statement} />
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: CaseReels**

Create `src/pages/case-study/sections/CaseReels.tsx`:
```tsx
import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudyWork } from "../caseStudy.types";

export default function CaseReels({
  work,
  basePath,
}: {
  work: CaseStudyWork;
  basePath: string;
}) {
  return (
    <section id="work">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: "clamp(48px,7vh,90px)" }}>
          <div className="label" style={{ marginBottom: 18 }}>
            {work.label}
          </div>
          <h2 className="hero-head" style={{ maxWidth: "18ch" }}>
            <RichText value={work.heading} />
          </h2>
        </div>

        <div className="reels">
          {work.reels.map((r) => (
            <div className="reel-item reveal" key={r.idx}>
              <div className="reel-cap">
                <div className="reel-idx">{r.idx}</div>
                <div className="reel-name">{r.name}</div>
                <p className="reel-desc">{r.desc}</p>
                <div className="reel-tag">{r.tag}</div>
              </div>
              <div className="browser">
                <div className="browser-bar">
                  <div className="dots">
                    <i className="r" />
                    <i className="y" />
                    <i className="g" />
                  </div>
                  <div className="url">
                    <Icon name="lock" />
                    {r.url}
                  </div>
                </div>
                <div className="screen">
                  <iframe src={`${basePath}/${r.src}`} loading="lazy" title={r.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify they compile**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 10: Sections — Outcome, CTA, Footer

**Files:**
- Create: `src/pages/case-study/sections/CaseOutcome.tsx`
- Create: `src/pages/case-study/sections/CaseCTA.tsx`
- Create: `src/pages/case-study/sections/CaseFooter.tsx`

- [ ] **Step 1: CaseOutcome**

Create `src/pages/case-study/sections/CaseOutcome.tsx`:
```tsx
import type { CaseStudyOutcome } from "../caseStudy.types";

export default function CaseOutcome({
  outcome,
}: {
  outcome: CaseStudyOutcome;
}) {
  return (
    <section id="outcome" className="section-pad-b">
      <div className="wrap">
        <div className="label reveal" style={{ marginBottom: 40 }}>
          {outcome.label}
        </div>
        <div className="outcome reveal">
          {outcome.cells.map((c, i) => (
            <div className="out-cell" key={i}>
              <div className="out-num">
                {c.num}
                {c.suffix && <span style={{ fontSize: "0.5em" }}>{c.suffix}</span>}
              </div>
              <div className="out-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: CaseCTA**

Create `src/pages/case-study/sections/CaseCTA.tsx`:
```tsx
import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudy } from "../caseStudy.types";

export default function CaseCTA({ cta }: { cta: CaseStudy["cta"] }) {
  return (
    <section id="contact" className="cta">
      <div className="wrap reveal">
        <h2>
          <RichText value={cta.heading} />
        </h2>
        <a className="cta-link" href={cta.href}>
          {cta.linkLabel}
          <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: CaseFooter**

Create `src/pages/case-study/sections/CaseFooter.tsx`:
```tsx
import type { CaseStudy } from "../caseStudy.types";

export default function CaseFooter({ footer }: { footer: CaseStudy["footer"] }) {
  return (
    <footer className="foot">
      <div className="fl">{footer.left}</div>
      <div className="fr">{footer.right}</div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify they compile**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 11: CaseStudyPage (route component)

**Files:**
- Create: `src/pages/case-study/CaseStudyPage.tsx`

- [ ] **Step 1: Create the page**

Create `src/pages/case-study/CaseStudyPage.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CaseStudy } from "./caseStudy.types";
import { useCaseStudyChrome } from "./useCaseStudyChrome";
import CaseNav from "./sections/CaseNav";
import CaseHero from "./sections/CaseHero";
import CaseMeta from "./sections/CaseMeta";
import CaseOverview from "./sections/CaseOverview";
import CaseStatement from "./sections/CaseStatement";
import CaseReels from "./sections/CaseReels";
import CaseOutcome from "./sections/CaseOutcome";
import CaseCTA from "./sections/CaseCTA";
import CaseFooter from "./sections/CaseFooter";

const CSS_HREF = "/case-studies/case.css";
const CSS_ID = "case-study-css";

type Status = "loading" | "ready" | "error";

export default function CaseStudyPage() {
  const { id } = useParams<{ id: string }>();
  const basePath = `/case-studies/case-study-${id}`;
  const [data, setData] = useState<CaseStudy | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Inject the page CSS only while this route is mounted (keeps the light
  // theme + its :root vars off the dark home). Guarded by id for StrictMode.
  useEffect(() => {
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement("link");
      link.id = CSS_ID;
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }
    return () => {
      document.getElementById(CSS_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetch(`${basePath}/case.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((j: CaseStudy) => {
        if (alive) {
          setData(j);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [basePath]);

  useEffect(() => {
    if (data?.title) document.title = data.title;
  }, [data]);

  useCaseStudyChrome(status === "ready");

  if (status === "loading") return null;

  if (status === "error" || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Case study not found.</p>
        <Link to="/">← Back home</Link>
      </div>
    );
  }

  return (
    <>
      <CaseNav nav={data.nav} />
      <CaseHero hero={data.hero} />
      <CaseMeta meta={data.meta} />
      <CaseOverview overview={data.overview} />
      <CaseStatement statement={data.statement} />
      <CaseReels work={data.work} basePath={basePath} />
      <CaseOutcome outcome={data.outcome} />
      <CaseCTA cta={data.cta} />
      <CaseFooter footer={data.footer} />
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 12: Wire the route

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the route**

Replace the contents of `src/App.tsx` with:
```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import CaseStudyPage from "./pages/case-study/CaseStudyPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/case-study/:id", element: <CaseStudyPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 13: Test setup stub + integration test

**Files:**
- Modify: `src/test/setup.ts` (add IntersectionObserver stub)
- Create: `src/pages/case-study/CaseStudyPage.test.tsx`

- [ ] **Step 1: Add an IntersectionObserver stub to the test setup**

In `src/test/setup.ts`, after the `ResizeObserverMock` block (the line
`window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;`), add:
```ts
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [] as IntersectionObserverEntry[];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
}

window.IntersectionObserver =
  window.IntersectionObserver ||
  (IntersectionObserverMock as unknown as typeof IntersectionObserver);
globalThis.IntersectionObserver = window.IntersectionObserver;
```

- [ ] **Step 2: Write the failing integration test**

Create `src/pages/case-study/CaseStudyPage.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import CaseStudyPage from "./CaseStudyPage";
import type { CaseStudy } from "./caseStudy.types";

const SAMPLE: CaseStudy = {
  title: "Fund Portal — Case Study",
  nav: { brand: "Studio", links: [{ href: "#overview", label: "Overview" }] },
  hero: {
    kicker: "Case study — Fintech platform",
    mark: { line1: "Fund", line2: "Portal" },
    headline: ["Designing ", { it: "trust" }, " into everyday fund operations."],
    body: ["First paragraph.", "Second paragraph."],
  },
  meta: [{ label: "Role", value: "Product design" }],
  overview: {
    title: ["Project", { it: "overview" }],
    blocks: [{ label: "Challenge", text: "Make it effortless." }],
    tech: {
      heading: ["Under the hood."],
      cells: [{ icon: "architecture", label: "Architecture", text: "React lib." }],
    },
  },
  statement: ["Operations move faster when the interface ", { it: "gets out of the way." }],
  work: {
    label: "Motion & interaction",
    heading: ["Four flows, captured as they ", { it: "behave" }, " in product."],
    reels: [
      {
        idx: "01",
        name: "Orders",
        desc: "Maker–checker approvals.",
        tag: "Approval flow",
        url: "portal.northcrest.capital/orders",
        src: "anim-orders.html",
      },
    ],
  },
  outcome: {
    label: "Outcome",
    cells: [{ num: "9", desc: "operational surfaces" }],
  },
  cta: {
    heading: ["Have a platform that deserves ", { it: "the same care?" }],
    linkLabel: "Start a conversation",
    href: "mailto:hello@studio.com",
  },
  footer: { left: "Fund Portal — case study", right: "© 2026" },
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/case-study/:id" element={<CaseStudyPage />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  document.getElementById("case-study-css")?.remove();
});

test("renders a case study from fetched JSON", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => SAMPLE,
  } as Response);

  renderAt("/case-study/1");

  // hero headline (RichText: plain + italic accent)
  expect(await screen.findByText(/Designing/)).toBeInTheDocument();
  expect(screen.getByText("trust")).toHaveClass("it");
  // a reel name + its iframe pointing into the case folder
  expect(screen.getByText("Orders")).toBeInTheDocument();
  expect(screen.getByTitle("Orders")).toHaveAttribute(
    "src",
    "/case-studies/case-study-1/anim-orders.html",
  );
  // page CSS link injected
  expect(document.getElementById("case-study-css")).not.toBeNull();
});

test("shows a not-found state when the case JSON is missing", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);

  renderAt("/case-study/999");

  expect(await screen.findByText("Case study not found.")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the new tests**

Run: `npx vitest run src/pages/case-study/CaseStudyPage.test.tsx`
Expected: 2 passed. (If the italic `.it` assertion or iframe `src` differs, fix the component, not the test.)

- [ ] **Step 4: Run the full suite to confirm no regression**

Run: `npm run test`
Expected: all tests pass (the 2 existing home tests + 2 new).

---

## Task 14: Link the Atlas Finance card to its case study

**Files:**
- Modify: `src/data/portfolio.ts` (Atlas Finance entry)
- Modify: `src/pages/home/sections/Projects/Projects.tsx` (pass `caseStudyId`)
- Modify: `src/pages/home/sections/Projects/ProjectCard.tsx` (navigate on click)

- [ ] **Step 1: Set the case-study id on Atlas Finance**

In `src/data/portfolio.ts`, the Atlas Finance project (`id: 2`) currently ends with `year: "2025",`. Add the link field to that object:
```ts
  {
    id: 2,
    name: "Atlas Finance",
    role: "Product Design",
    imageUrl: "https://placehold.co/1200x800/c9c5bc/15161a?text=Atlas",
    videoUrl: null,
    detailUrl: "#",
    tags: "Product Design",
    year: "2025",
    caseStudyId: 1,
  },
```

- [ ] **Step 2: Pass `caseStudyId` through the Projects mapping**

In `src/pages/home/sections/Projects/Projects.tsx`, the `mapped` array currently produces `{ name, tag, img, dashboard }`. Add `caseStudyId`:
```tsx
  const mapped: ProjectCardData[] = projects.map((p) => ({
    name: p.name,
    tag: p.role,
    img: p.imageUrl,
    // Atlas Finance shows the live 3D dashboard case-study visual.
    dashboard: p.id === 2,
    caseStudyId: p.caseStudyId,
  }));
```

- [ ] **Step 3: Extend `ProjectCardData` and make the card navigate**

In `src/pages/home/sections/Projects/ProjectCard.tsx`:

(a) Add `useNavigate` to the react-router import and extend the data interface. Change the top imports — add the router import below the existing gsap import:
```tsx
import { useNavigate } from "react-router-dom";
```
and extend the interface (currently `name; tag; img; dashboard?`):
```tsx
export interface ProjectCardData {
  name: string;
  tag: string;
  img: string;
  /** Render the live 3D dashboard case-study visual instead of an image. */
  dashboard?: boolean;
  /** When set, clicking the card opens /case-study/{caseStudyId}. */
  caseStudyId?: number;
}
```

(b) Inside `ProjectCard`, after the existing `const sideClass = …` line, add the navigation handlers:
```tsx
  const navigate = useNavigate();
  const linkable = p.caseStudyId != null;
  const openCase = () => {
    if (linkable) navigate(`/case-study/${p.caseStudyId}`);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (linkable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openCase();
    }
  };
```

(c) On the `<figure>`, add the click/keyboard/accessibility props and a pointer cursor when linkable. The figure currently has `onPointerMove={onMove} onPointerLeave={onLeave}`. Add alongside them:
```tsx
      onClick={openCase}
      onKeyDown={onKeyDown}
      role={linkable ? "link" : undefined}
      tabIndex={linkable ? 0 : undefined}
```
and append a conditional class to the existing `className={ … }` string (add `+ (linkable ? "cursor-pointer " : "")` to the concatenation).

- [ ] **Step 4: Verify compile + tests**

Run: `npx tsc --noEmit && npm run test`
Expected: no type errors; all tests pass.

---

## Task 15: Full build + visual verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds; `dist/case-studies/case.css` and `dist/case-studies/case-study-1/case.json` exist (Vite copies `public/`). The pre-existing "Some chunks are larger than 500 kB" advisory is not an error.

- [ ] **Step 2: Confirm assets copied to dist**

Run: `ls dist/case-studies && ls dist/case-studies/case-study-1`
Expected: `case.css` + `case-study-1/`, and inside it `case.json`, the 4 `anim-*.html`, `tokens.css`, `anim-base.css`, `anim-runtime.js`, `dashboard.png`, `logo-northcrest.svg`.

- [ ] **Step 3: Serve the build and screenshot the route**

Run (background the preview, then screenshot):
```bash
cd "/Users/tuyendat09/Downloads/My Portfolio"
npm run preview -- --port 4173 >/tmp/cs_preview.log 2>&1 &
sleep 2
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1440,2400 --virtual-time-budget=3000 \
  --screenshot="/tmp/case_study_1.png" "http://localhost:4173/case-study/1" 2>/dev/null
echo done
```
Then Read `/tmp/case_study_1.png`. Expected: the light editorial case-study page — fixed nav, "Fund / Portal" hero with the italic "trust" headline, meta strip, overview with the "Expand information" button, statement, the four reel browser frames, outcome stats, CTA, footer. Reels may render as light frames (the `Reel` runtime advances under a real browser; headless virtual-time may leave them mid-state — layout/chrome is what matters here).

- [ ] **Step 4: Stop the preview server**

Run: `pkill -f "vite preview" || true`
Expected: server stopped.

- [ ] **Step 5: Final confirmation**

Confirm: home (`/`) still renders unchanged, the Atlas Finance card shows the dashboard and is now clickable, and `/case-study/1` renders the full page. Report results with the screenshot.

---

## Self-Review

**Spec coverage:**
- Light/editorial verbatim look → Task 1 (copy `case.css`) + Task 11 (inject it). ✓
- All sections faithfully → Tasks 7–10 cover nav, hero, meta, overview+tech, statement, reels, outcome, CTA, footer. ✓
- `public/` self-contained folders + runtime JSON fetch → Tasks 1, 2, 11. ✓
- Reels' deps copied per folder → Task 1. ✓
- Whole Atlas card navigates, pill preserved → Task 14. ✓
- Route `/case-study/:id` → Task 12. ✓
- CSS isolation (inject/remove, StrictMode guard) → Task 11. ✓
- Behaviors ported (sticky nav, reveal IO, expand state) → Tasks 6, 8, 11. ✓
- RichText italics + icon map → Tasks 4, 5. ✓
- Loading / not-found states → Task 11. ✓
- Testing: integration + not-found + IO stub → Task 13. ✓

**Placeholder scan:** No TBD/TODO; every code step has full code. ✓

**Type consistency:** `CaseStudy`/sub-interfaces defined in Task 3 are imported with matching names and shapes in Tasks 5–11 (`CaseStudyNav`, `CaseStudyHero`, `CaseStudyMetaCell[]`, `CaseStudyOverview`, `RichText`, `CaseStudyWork`, `CaseStudyOutcome`, `CaseStudy["cta"]`, `CaseStudy["footer"]`). `Icon({name,className})` defined in Task 4 is called with those props throughout. `basePath` prop on `CaseReels` matches Task 11's usage. `ProjectCardData.caseStudyId` (Task 14) matches the `Project.caseStudyId` added in Task 3. ✓

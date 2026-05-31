# Projects Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Projects section with a pinned scroll stage that crossfades project images/videos (with radial vignette blur edges) and a center pill label, plus a hover-reveal list below.

**Architecture:** A sticky-pinned full-viewport stage holds stacked media layers (image or video); GSAP ScrollTrigger scrubs a timeline that crossfades each layer + pill in/out. Below the pin, a hover-reveal project list uses `gsap.quickTo` to drive a floating thumbnail that follows the cursor. Data comes from `portfolio.js` `projects` array.

**Tech Stack:** React, GSAP + ScrollTrigger, `useGSAP`, CSS custom properties, Lenis smooth scroll

---

## Files

| File | Action |
|------|--------|
| `src/data/portfolio.js` | Modify — replace empty `projects = []` with 4 placeholder entries |
| `src/sections/Projects.jsx` | Create — full section component |
| `src/styles.css` | Modify — add Projects CSS block before the Career block (line 959) |
| `src/App.jsx` | Modify — import `<Projects />`, mount between `<Skills />` and `<Career />` |

---

### Task 1: Add project data to portfolio.js

**Files:**
- Modify: `src/data/portfolio.js` lines 107

- [ ] **Step 1: Replace the empty `projects` export with placeholder entries**

```js
export const projects = [
  {
    id: 1,
    name: 'San Miguel',
    role: "America's Cup",
    imageUrl: 'https://placehold.co/1200x800/2b3b34/ffffff?text=San+Miguel',
    videoUrl: null,
    detailUrl: '#',
    tags: 'Brand · Web · Motion',
    year: '2025',
  },
  {
    id: 2,
    name: 'Atlas Finance',
    role: 'Product Design',
    imageUrl: 'https://placehold.co/1200x800/c9c5bc/15161a?text=Atlas',
    videoUrl: null,
    detailUrl: '#',
    tags: 'Product Design',
    year: '2025',
  },
  {
    id: 3,
    name: 'Helios Studio',
    role: 'Brand System',
    imageUrl: 'https://placehold.co/1200x800/1b1b1d/ffffff?text=Helios',
    videoUrl: null,
    detailUrl: '#',
    tags: 'Brand · Web',
    year: '2024',
  },
  {
    id: 4,
    name: 'Field Notes',
    role: 'Editorial',
    imageUrl: 'https://placehold.co/1200x800/8e8b83/ffffff?text=Field+Notes',
    videoUrl: null,
    detailUrl: '#',
    tags: 'Editorial · Motion',
    year: '2024',
  },
];
```

- [ ] **Step 2: Verify dev server still compiles** — run `npm run dev`, confirm no import errors.

---

### Task 2: Create Projects.jsx

**Files:**
- Create: `src/sections/Projects.jsx`

- [ ] **Step 1: Create the file with this content**

```jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/portfolio.js';

export default function Projects() {
  const sectionRef = useRef(null);
  const stageRef   = useRef(null);
  const layerRefs  = useRef([]);
  const pillRefs   = useRef([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage   = stageRef.current;
      const n = projects.length;

      // ── Crossfade timeline ───────────────────────────────
      // Each project gets equal scroll real-estate.
      // Timeline duration = (n-1) * 2 units: 1 for crossfade, 1 hold per step.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${(n - 1) * window.innerHeight}`,
          pin: stage,
          scrub: 0.6,
        },
      });

      projects.forEach((_, i) => {
        if (i === 0) return;
        const prevLayer = layerRefs.current[i - 1];
        const prevPill  = pillRefs.current[i - 1];
        const curLayer  = layerRefs.current[i];
        const curPill   = pillRefs.current[i];

        // crossfade out prev, in current — simultaneously
        tl.to(prevLayer, { opacity: 0, duration: 1 }, '+=0.4');
        tl.to(prevPill,  { opacity: 0, duration: 1 }, '<');
        tl.to(curLayer,  { opacity: 1, duration: 1 }, '<');
        tl.to(curPill,   { opacity: 1, duration: 1 }, '<');
        // hold
        tl.to({}, { duration: 0.8 });
      });

      // ── Hover-reveal list ────────────────────────────────
      const rows = gsap.utils.toArray('.project-row', section);
      rows.forEach((row) => {
        const thumb = row.querySelector('.project-row-thumb');
        if (!thumb) return;

        const xTo = gsap.quickTo(thumb, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(thumb, 'y', { duration: 0.5, ease: 'power3.out' });

        const enter = () => gsap.to(thumb, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
        const leave = () => gsap.to(thumb, { opacity: 0, scale: 0.92, duration: 0.2 });
        const move  = (e) => {
          const rect = row.getBoundingClientRect();
          xTo(e.clientX - rect.left);
          yTo(e.clientY - rect.top - thumb.offsetHeight / 2);
        };

        row.addEventListener('mouseenter', enter);
        row.addEventListener('mouseleave', leave);
        row.addEventListener('mousemove', move);
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef },
  );

  return (
    <section className="projects-section" ref={sectionRef}>

      {/* ── Pinned stage ─────────────────────────────────── */}
      <div className="projects-stage" ref={stageRef}>
        <p className="projects-eyebrow">Selected Work</p>

        {/* Stacked media layers */}
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="projects-layer"
            style={{ opacity: i === 0 ? 1 : 0 }}
            ref={(el) => { layerRefs.current[i] = el; }}
          >
            {p.videoUrl ? (
              <video
                className="projects-media"
                src={p.videoUrl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img className="projects-media" src={p.imageUrl} alt={p.name} />
            )}
            <div className="projects-vignette" />
          </div>
        ))}

        {/* Pills — one per project, stacked */}
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="projects-pill"
            style={{ opacity: i === 0 ? 1 : 0 }}
            ref={(el) => { pillRefs.current[i] = el; }}
          >
            <span className="projects-pill-name">{p.name}</span>
            <span className="projects-pill-role">{p.role}</span>
          </div>
        ))}
      </div>

      {/* ── Hover-reveal list ─────────────────────────────── */}
      <div className="projects-list-wrap">
        <div className="projects-list-head">
          <h2 className="projects-list-title">All projects</h2>
          <span className="projects-list-count">{String(projects.length).padStart(3, '0')} — 2026</span>
        </div>

        <div className="projects-list">
          {projects.map((p) => (
            <a
              key={p.id}
              className="project-row"
              href={p.detailUrl}
            >
              <span className="project-row-name">{p.name}</span>
              <span className="project-row-tags">{p.tags}</span>
              <span className="project-row-year">{p.year}</span>

              {/* floating thumb */}
              <div className="project-row-thumb">
                {p.videoUrl ? (
                  <video src={p.videoUrl} autoPlay muted loop playsInline />
                ) : (
                  <img src={p.imageUrl} alt={p.name} />
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}
```

---

### Task 3: Add Projects CSS to styles.css

**Files:**
- Modify: `src/styles.css` — insert block before `/* ─── Career ──` comment (line 959)

- [ ] **Step 1: Insert this CSS block before the Career section comment**

```css
/* ─── Projects ──────────────────────────────────────── */
.projects-section {
  background: var(--bg);
}

/* stage: sticky container that gets pinned by ScrollTrigger */
.projects-stage {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.projects-eyebrow {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

/* stacked media layers */
.projects-layer {
  position: absolute;
  inset: 0;
  will-change: opacity;
}

.projects-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* radial vignette: edges fade to the section background color */
.projects-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 30%,
    var(--bg) 74%
  );
  pointer-events: none;
}

/* center pill — all pills stack in the same spot */
.projects-pill {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(15, 15, 15, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  white-space: nowrap;
  will-change: opacity;
}

.projects-pill-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}

.projects-pill-role {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.01em;
}

/* hover-reveal list */
.projects-list-wrap {
  padding: clamp(80px, 10vh, 140px) 80px;
  background: var(--bg);
}

.projects-list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 0;
}

.projects-list-title {
  font-size: clamp(24px, 3vw, 40px);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.projects-list-count {
  font-size: 14px;
  color: var(--ink-soft);
}

.projects-list {
  display: flex;
  flex-direction: column;
}

.project-row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 24px;
  padding: 30px 4px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: padding-left 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.project-row:hover {
  padding-left: 18px;
}

.project-row:hover .project-row-name {
  color: var(--ink);
}

.project-row-name {
  font-size: clamp(26px, 4vw, 56px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink-soft);
  transition: color 0.3s ease;
}

.project-row-tags {
  font-size: 13px;
  color: var(--ink-soft);
  letter-spacing: 0.02em;
}

.project-row-year {
  font-size: 14px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

/* floating thumb — positioned by GSAP quickTo */
.project-row-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 240px;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  scale: 0.92;
  box-shadow: 0 24px 56px -20px rgba(0, 0, 0, 0.38);
  z-index: 20;
}

.project-row-thumb img,
.project-row-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 720px) {
  .projects-list-wrap { padding: 60px 22px; }
  .project-row { grid-template-columns: 1fr auto; }
  .project-row-tags { display: none; }
}
```

---

### Task 4: Wire Projects into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import at line 14 (after the Skills import)**

```js
import Projects from './sections/Projects.jsx';
```

- [ ] **Step 2: Add `<Projects />` between `<Skills />` and `<Career />` in the JSX**

```jsx
<Skills />
<Projects />
<Career />
```

- [ ] **Step 3: Verify in browser** — `npm run dev`, scroll to Projects section, confirm:
  - Stage pins correctly
  - Images crossfade as you scroll through the pinned section
  - Radial vignette is visible (edges fade to cream)
  - Pill label updates with each project
  - List rows indent on hover
  - Floating thumbnail appears and follows the cursor

---

### Task 5: Build check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: `✓ built in <Xs>` with no errors or warnings.

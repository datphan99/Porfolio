import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import sectionsData from "../data/particleSections.json";
import type { ParticleSection } from "../types";

const sections = sectionsData as ParticleSection[];

// ── SVG glyphs ────────────────────────────────────────────────────────────────
const SVGS: Record<string, string> = {
  one: '<circle cx="100" cy="100" r="60" fill="#000"/>',
  creation:
    '<circle cx="100" cy="70" r="34" fill="#000"/>' +
    '<circle cx="72" cy="129" r="34" fill="#000"/>' +
    '<circle cx="128" cy="129" r="34" fill="#000"/>',
  growth:
    '<circle cx="100" cy="100" r="60" fill="none" stroke="#000" stroke-width="24"/>',
  modernization:
    '<g fill="none" stroke="#000" stroke-width="17" stroke-linecap="round">' +
    '<path d="M40 100 A 60 60 0 0 1 160 100"/>' +
    '<path d="M160 100 A 60 60 0 0 1 40 100"/></g>' +
    '<g fill="#000"><path d="M160 124 L146 98 L174 98 Z"/>' +
    '<path d="M40 76 L54 102 L26 102 Z"/></g>',
  techstack:
    '<g fill="none" stroke="#000" stroke-width="12" stroke-linejoin="round">' +
    '<path d="M100 50 L156 78 L100 106 L44 78 Z"/>' +
    '<path d="M100 100 L156 128 L100 156 L44 128 Z"/>' +
    '<path d="M100 150 L156 178 L100 206 L44 178 Z"/></g>',
};

const LABELS: Record<string, string> = {
  creation: "Idea → Forms",
  growth: "Reach",
  modernization: "Renewal",
  techstack: "Foundation",
};
const SHAPE_KEYS = ["one", "creation", "growth", "modernization", "techstack"];

// ── Shared helpers ────────────────────────────────────────────────────────────
function sample(frag: string): Promise<number[]> {
  return new Promise((resolve) => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
      frag +
      "</svg>";
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
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
      const d = c.getImageData(0, 0, S, S).data,
        pool = [];
      for (let y = 0; y < S; y += 2)
        for (let x = 0; x < S; x += 2)
          if (d[(y * S + x) * 4 + 3] > 110) pool.push(x, y);
      URL.revokeObjectURL(url);
      resolve(pool);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
    img.src = url;
  });
}

function shuffle(pool: number[]): number[] {
  const n = pool.length / 2;
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const ax = pool[i * 2],
      ay = pool[i * 2 + 1];
    pool[i * 2] = pool[j * 2];
    pool[i * 2 + 1] = pool[j * 2 + 1];
    pool[j * 2] = ax;
    pool[j * 2 + 1] = ay;
  }
  return pool;
}

function toN(pool: number[], N: number): { x: Float32Array; y: Float32Array } {
  const X = new Float32Array(N),
    Y = new Float32Array(N);
  const n = pool.length / 2 || 1;
  for (let i = 0; i < N; i++) {
    const k = i % n;
    X[i] = (pool[k * 2] || 100) + (Math.random() - 0.5) * 2;
    Y[i] = (pool[k * 2 + 1] || 100) + (Math.random() - 0.5) * 2;
  }
  return { x: X, y: Y };
}

// ── Mobile: inline canvas per section ────────────────────────────────────────
// Each MobileSection runs its own small RAF loop — static target shape + idle shimmer.
function MobileSection({ s }: { s: ParticleSection }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Alias narrowed non-null values so closures can reference them safely
    const cv = canvas;
    const context = ctx;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const size = cv.offsetWidth || 280;

    cv.width = size * DPR;
    cv.height = size * DPR;
    cv.style.width = size + "px";
    cv.style.height = size + "px";
    context.setTransform(DPR, 0, 0, DPR, 0, 0);

    const N = 420;
    const cx = size / 2,
      cy = size / 2;
    const D = size * 0.72;

    const px = new Float32Array(N),
      py = new Float32Array(N),
      seed = new Float32Array(N);
    const TX = new Float32Array(N),
      TY = new Float32Array(N);
    let t = 0,
      raf: number;

    function project(rx: number, ry: number): [number, number] {
      const k = D / 200;
      return [cx + (rx - 100) * k, cy + (ry - 100) * k];
    }

    sample(SVGS[s.shape]).then((pool) => {
      const { x, y } = toN(shuffle(pool), N);
      for (let i = 0; i < N; i++) {
        const [tx, ty] = project(x[i], y[i]);
        TX[i] = tx;
        TY[i] = ty;
        // start scattered, converge into shape
        px[i] = tx + (Math.random() - 0.5) * D * 0.5;
        py[i] = ty + (Math.random() - 0.5) * D * 0.5;
        seed[i] = Math.random() * 6.283;
      }

      function frame() {
        t += 0.022;
        context.clearRect(0, 0, size, size);
        context.fillStyle = "#15161a";
        context.globalAlpha = 0.82;
        for (let i = 0; i < N; i++) {
          // Lively idle shimmer — higher amplitude than desktop
          const jx = Math.cos(t * 0.9 + seed[i]) * 4.5;
          const jy = Math.sin(t * 1.15 + seed[i] * 1.4) * 4.5;
          px[i] += (TX[i] + jx - px[i]) * 0.09;
          py[i] += (TY[i] + jy - py[i]) * 0.09;
          context.fillRect(px[i] - 0.75, py[i] - 0.75, 1.5, 1.5);
        }
        raf = requestAnimationFrame(frame);
      }
      frame();
    });

    return () => cancelAnimationFrame(raf);
  }, [s.shape]);

  return (
    <div className="px-6 py-14 border-b border-black/[0.07] last:border-0">
      {/* Inline shape canvas */}
      <canvas
        ref={canvasRef}
        className="w-[280px] h-[280px] mx-auto mb-10 block"
      />
      <p className="sect-index">{s.index}</p>
      <h2 className="sect-title !text-[clamp(36px,9vw,52px)]">{s.title}</h2>
      <p className="sect-desc">{s.desc}</p>
      <div className="sect-lists">
        <div className="list-col">
          <p className="list-label">Used to unlock</p>
          <ul>
            {s.unlock.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="list-col">
          <p className="list-label">We build</p>
          <ul>
            {s.build.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Desktop: fixed canvas morph ───────────────────────────────────────────────
interface SkillsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
}

export default function Skills({ canvasRef, capRef }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const capEl = capRef.current;
    if (!canvas || !capEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Alias narrowed non-null values so closures (resize, frame, computeTargets)
    // can reference them without TypeScript complaining they might be null.
    const cv = canvas;
    const cap = capEl;
    const context = ctx;

    const skyEl = document.querySelector<HTMLElement>("[data-sky]");
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0,
      H = 0;

    const N = Math.min(
      1300,
      Math.max(
        600,
        Math.floor((window.innerWidth * window.innerHeight) / 1300),
      ),
    );

    const px = new Float32Array(N),
      py = new Float32Array(N);
    const seed = new Float32Array(N);
    const TX = new Float32Array(N),
      TY = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      px[i] = Math.random() * window.innerWidth;
      py[i] = Math.random() * window.innerHeight;
      seed[i] = Math.random() * 6.283;
    }

    // ── Starfield targets (Projects) ──
    // Particles scatter from the techstack shape into a full-viewport star
    // field. SX/SY (set in resize) are absolute viewport positions; the rest
    // are per-star constants giving varied size + an independent twinkle.
    const SX = new Float32Array(N),
      SY = new Float32Array(N);
    const sSize = new Float32Array(N),
      sTw = new Float32Array(N),
      sTwSpd = new Float32Array(N),
      sBright = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      sSize[i] = 0.6 + Math.random() * Math.random() * 1.7; // mostly small, a few large
      sTw[i] = Math.random() * 6.283;
      sTwSpd[i] = 0.5 + Math.random() * 1.6;
      sBright[i] = 0.32 + Math.random() * 0.68;
    }

    const SH: Record<string, { x: Float32Array; y: Float32Array }> = {};
    let ready = false,
      t = 0,
      raf: number;
    let prevScroll: number | null = null,
      cloudOffsetY = 0,
      cloudVel = 0;
    let enterP = 0, // 0→1 burst-in as Projects scrolls into view
      spanP = 0, // 0→1 across the pinned Projects span
      darkOn = false; // tracks the body.is-dark toggle

    // ── Bridge state: Hello text → particles → techstack ──
    let introProgress = 0; // 0 = Hello text intact, 1 = fully gathered into techstack
    let introPts: { x: Float32Array; y: Float32Array } | null = null; // {x,y} screen-space points sampled from the Hello headline
    let charEls: NodeListOf<HTMLElement> | null = null; // cached .hello-char elements
    let dirtied = false; // whether headline styles have been mutated (needs restore)
    const INTRO_START = 0.5; // remap: Hello pin progress 0.5→1 maps to introProgress 0→1

    // Cached Hello DOM — faded out as the text dissolves into particles
    const titleEl = document.querySelector<HTMLElement>(".hello-title");
    const eyebrowEl = document.querySelector<HTMLElement>(".hello-eyebrow");
    const fadeEls = gsap.utils.toArray<Element>(".hello-pill");
    if (eyebrowEl) fadeEls.push(eyebrowEl);

    function curScroll() {
      const sm =
        window.ScrollSmoother && ScrollSmoother.get && ScrollSmoother.get();
      return sm ? sm.scrollTop() : window.pageYOffset || 0;
    }

    function updateDrift() {
      const s = curScroll();
      if (prevScroll === null) prevScroll = s;
      const dv = s - prevScroll;
      prevScroll = s;
      cloudVel = cloudVel * 0.84 + dv * 0.5;
      cloudVel = Math.max(-80, Math.min(80, cloudVel));
      cloudOffsetY += (cloudVel - cloudOffsetY) * 0.1;
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      context.setTransform(DPR, 0, 0, DPR, 0, 0);
      introPts = null; // text position/size changed — re-sample on next bridge frame
      for (let i = 0; i < N; i++) {
        SX[i] = Math.random() * W;
        SY[i] = Math.random() * H;
      }
    }

    function anchor() {
      const wide = W > 820;
      return {
        cx: wide ? W * 0.26 : W * 0.5,
        cy: wide ? H * 0.5 : H * 0.23,
        D: wide ? Math.min(W * 0.44, H * 0.74) : Math.min(W * 0.66, H * 0.34),
      };
    }

    const tmp = [0, 0];
    const clamp = (a: number, b: number, v: number) => (v < a ? a : v > b ? b : v);

    // Sample N points filling each character's box — the headline reads as solid
    // ink blocks that then shatter apart into the particle cloud.
    function sampleTextPoints() {
      const chars = document.querySelectorAll(".hello-char");
      if (!chars.length) return null;

      const rects: DOMRect[] = [];
      let totalArea = 0;
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          rects.push(r);
          totalArea += r.width * r.height;
        }
      });
      if (!rects.length || totalArea <= 0) return null;

      const X = new Float32Array(N),
        Y = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        // pick a char box weighted by area, then a random point inside it
        let pick = Math.random() * totalArea;
        let r = rects[0];
        for (let j = 0; j < rects.length; j++) {
          pick -= rects[j].width * rects[j].height;
          if (pick <= 0) {
            r = rects[j];
            break;
          }
        }
        X[i] = r.left + Math.random() * r.width;
        Y[i] = r.top + Math.random() * r.height;
      }
      return { x: X, y: Y };
    }

    function ensureChars() {
      if (!charEls) charEls = document.querySelectorAll<HTMLElement>(".hello-char");
      return charEls;
    }

    // Grow a solid ink fill behind each character (alpha 0→1) and match the text
    // colour so the glyphs disappear into solid blocks; opacity fades the lot out.
    function setBlocks(alpha: number, opacity: number) {
      ensureChars().forEach((c) => {
        c.style.backgroundColor = `rgba(21,22,26,${alpha})`;
        c.style.color = "#15161a";
      });
      if (titleEl) gsap.set(titleEl, { opacity });
      dirtied = true;
    }

    function clearBlocks() {
      ensureChars().forEach((c) => {
        c.style.backgroundColor = "";
        c.style.color = "";
      });
      if (titleEl) gsap.set(titleEl, { clearProps: "opacity" });
      dirtied = false;
    }

    function project(rx: number, ry: number, scale: number, rot: number, cx: number, cy: number, D: number, out: number[]) {
      const k = D / 200;
      const dx = (rx - 100) * scale,
        dy = (ry - 100) * scale;
      const cos = Math.cos(rot),
        sin = Math.sin(rot);
      out[0] = cx + (dx * cos - dy * sin) * k;
      out[1] = cy + (dx * sin + dy * cos) * k;
    }

    function computeTargets() {
      const a = anchor();
      const cx = a.cx,
        cy = a.cy + cloudOffsetY,
        D = a.D;
      const midY = H / 2;
      const sects = sectRefs.current.filter((el): el is HTMLDivElement => el !== null);
      let active: string | null = null,
        lp = 0;

      for (let s = 0; s < sects.length; s++) {
        const r = sects[s].getBoundingClientRect();
        if (r.top <= midY && r.bottom >= midY) {
          active = sects[s].dataset.shape ?? null;
          lp = clamp(0, 1, (midY - r.top) / r.height);
          break;
        }
      }
      if (!active) {
        const firstR = sects[0]?.getBoundingClientRect();
        active =
          !firstR || firstR.top > midY
            ? sections[0].shape
            : sections[sections.length - 1].shape;
      }

      if (active === "techstack") {
        const ts = SH.techstack,
          sc = 0.9 + lp * 0.12;
        for (let i = 0; i < N; i++) {
          project(ts.x[i], ts.y[i], sc, 0, cx, cy, D, tmp);
          TX[i] = tmp[0];
          TY[i] = tmp[1];
        }
      } else if (active === "creation") {
        const one = SH.one,
          three = SH.creation,
          b = clamp(0, 1, lp);
        for (let i = 0; i < N; i++) {
          const rx = one.x[i] + (three.x[i] - one.x[i]) * b;
          const ry = one.y[i] + (three.y[i] - one.y[i]) * b;
          project(rx, ry, 1, 0, cx, cy, D, tmp);
          TX[i] = tmp[0];
          TY[i] = tmp[1];
        }
      } else if (active === "growth") {
        const g = SH.growth,
          sc = 0.5 + lp * 0.95;
        for (let i = 0; i < N; i++) {
          project(g.x[i], g.y[i], sc, 0, cx, cy, D, tmp);
          TX[i] = tmp[0];
          TY[i] = tmp[1];
        }
      } else if (active === "modernization") {
        const m = SH.modernization,
          rot = -0.5 + lp * 1.0,
          sc = 0.85 + lp * 0.15;
        for (let i = 0; i < N; i++) {
          project(m.x[i], m.y[i], sc, rot, cx, cy, D, tmp);
          TX[i] = tmp[0];
          TY[i] = tmp[1];
        }
      }

      cap.style.left = cx + "px";
      cap.style.top = cy + D * 0.58 + "px";
      cap.textContent = (active && LABELS[active]) || "";
    }

    function frame() {
      t += 0.022;
      updateDrift();

      // ── Phase mix: techstack shape (Skills) → starfield (Projects) ──
      const entered = spanP > 0.0001;
      const exitRamp = clamp(0, 1, (spanP - 0.88) / 0.12); // night lifts near the end
      const base = entered ? 1 : enterP;
      const sc = base * base * (3 - 2 * base); // smoothstep — punchy burst
      const dark = base * (1 - exitRamp); // night-sky opacity
      const bridgeIn = clamp(0, 1, (introProgress - 0.4) / 0.22);
      const canvasOpacity = bridgeIn * (1 - exitRamp);

      // Drive the fixed night-sky layer + adaptive nav colour
      if (skyEl) skyEl.style.opacity = dark.toFixed(3);
      const wantDark = dark > 0.5;
      if (wantDark !== darkOn) {
        darkOn = wantDark;
        document.body.classList.toggle("is-dark", wantDark);
      }

      if (ready) {
        computeTargets(); // fills TX/TY with techstack (fallback) during the bridge

        // ── Bridge: dissolve the Hello headline into particles, then gather ──
        if (introProgress > 0 && introProgress < 1) {
          if (!introPts) introPts = sampleTextPoints();

          // Phase 1 (0→0.35): ink fill grows behind the chars → solid blocks
          // Phase 2 (0.35→0.5): the solid blocks fade out completely
          // Phase 3 (0.55→1): particles burst from the block positions and gather
          const bgAlpha = clamp(0, 1, introProgress / 0.35);
          const textOpacity = 1 - clamp(0, 1, (introProgress - 0.35) / 0.15);
          setBlocks(bgAlpha, textOpacity);
          if (fadeEls.length) gsap.set(fadeEls, { opacity: textOpacity });

          if (introPts) {
            const blend = clamp(0, 1, (introProgress - 0.55) / 0.45);
            for (let i = 0; i < N; i++) {
              TX[i] = introPts.x[i] + (TX[i] - introPts.x[i]) * blend;
              TY[i] = introPts.y[i] + (TY[i] - introPts.y[i]) * blend;
            }
          }
        } else if (introProgress <= 0 && dirtied) {
          clearBlocks(); // scrolled back above the bridge — restore the text
          introPts = null;
        }

        // Particle colour blends ink → cool star-light as the cloud scatters
        const cr = (21 + (232 - 21) * sc) | 0;
        const cg = (22 + (236 - 22) * sc) | 0;
        const cb = (26 + (245 - 26) * sc) | 0;
        context.clearRect(0, 0, W, H);
        context.fillStyle = `rgb(${cr},${cg},${cb})`;
        cv.style.opacity = canvasOpacity.toFixed(3);

        for (let i = 0; i < N; i++) {
          // shape target (TX/TY) → scattered star target (SX/SY)
          const tx = TX[i] + (SX[i] - TX[i]) * sc;
          const ty = TY[i] + (SY[i] - TY[i]) * sc;
          // shape shimmer fades out; a gentle star drift fades in
          const jx = Math.cos(t * 0.9 + seed[i]) * 4.5 * (1 - sc);
          const jy = Math.sin(t * 1.15 + seed[i] * 1.4) * 4.5 * (1 - sc);
          const dx = Math.cos(t * 0.25 + sTw[i]) * 7 * sc;
          const dy = Math.sin(t * 0.21 + sTw[i] * 1.3) * 7 * sc;
          px[i] += (tx + jx + dx - px[i]) * 0.09;
          py[i] += (ty + jy + dy - py[i]) * 0.09;

          // flat ink alpha in the shape; per-star twinkle once scattered
          const tw = sBright[i] * (0.55 + 0.45 * Math.sin(t * sTwSpd[i] + sTw[i]));
          context.globalAlpha = 0.82 + (tw - 0.82) * sc;
          const rad = 0.75 + (sSize[i] - 0.75) * sc;
          context.fillRect(px[i] - rad, py[i] - rad, rad * 2, rad * 2);
        }
        context.globalAlpha = 1;

        // Shape caption fades out as the cloud bursts into stars
        cap.style.opacity = (canvasOpacity * (1 - sc)).toFixed(3);
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    // Bridge driver — the Hello (#about) pin tail converts text → particles → techstack
    const introTrigger = ScrollTrigger.create({
      trigger: "#about",
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        introProgress = clamp(
          0,
          1,
          (self.progress - INTRO_START) / (1 - INTRO_START),
        );
        if (introProgress > 0.001 && !introPts) introPts = sampleTextPoints();
      },
    });

    // Burst — as the Projects section scrolls in, particles scatter from the
    // techstack shape into a full-viewport starfield (enterP 0→1).
    const burstTrigger = ScrollTrigger.create({
      trigger: "#work",
      start: "top 75%",
      end: "top top",
      onUpdate(self) {
        enterP = self.progress;
      },
    });

    // Hold/exit — track progress across the pinned Projects span so the night
    // sky stays dark, then lifts back to white near the end (exitRamp).
    const spanTrigger = ScrollTrigger.create({
      trigger: "#work",
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        spanP = self.progress;
      },
      onRefresh(self) {
        spanP = self.progress || 0;
      },
    });

    Promise.all(
      SHAPE_KEYS.map((k) =>
        sample(SVGS[k]).then((pool) => ({ k, data: toN(shuffle(pool), N) })),
      ),
    ).then((results) => {
      results.forEach(({ k, data }) => {
        SH[k] = data;
      });
      ready = true;
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      introTrigger.kill();
      burstTrigger.kill();
      spanTrigger.kill();
      clearBlocks();
      if (fadeEls.length) gsap.set(fadeEls, { clearProps: "opacity" });
      if (skyEl) skyEl.style.opacity = "";
      document.body.classList.remove("is-dark");
    };
  }, [canvasRef, capRef]);

  return (
    <section id="skills" ref={sectionRef}>
      {/* ── Desktop: fixed canvas + right-column content (md and up) ── */}
      <div className="hidden md:block particle-content">
        {sections.map((s, i) => (
          <div
            key={s.shape}
            className="sect"
            data-shape={s.shape}
            ref={(el: HTMLDivElement | null) => {
              sectRefs.current[i] = el;
            }}
          >
            <div className="sect-inner" data-speed="0.92">
              <p className="sect-index">{s.index}</p>
              <h2 className="sect-title">{s.title}</h2>
              <p className="sect-desc">{s.desc}</p>
              <div className="sect-lists">
                <div className="list-col">
                  <p className="list-label">Used to unlock</p>
                  <ul>
                    {s.unlock.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="list-col">
                  <p className="list-label">We build</p>
                  <ul>
                    {s.build.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile: inline canvas per section (below md) ── */}
      <div className="md:hidden">
        {sections.map((s) => (
          <MobileSection key={s.shape} s={s} />
        ))}
      </div>
    </section>
  );
}

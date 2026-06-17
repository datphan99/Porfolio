import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { particleSections as sections } from "../../../../data/portfolio";
import { LABELS, SHAPE_KEYS, SVGS, sample, shuffle, toN } from "./particles";

export function useParticleField(refs: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
  skyRef: RefObject<HTMLDivElement | null>;
  sectRefs: RefObject<(HTMLDivElement | null)[]>;
}): void {
  const { canvasRef, capRef, skyRef, sectRefs } = refs;
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

    const skyEl = skyRef.current;
    // Pinned Projects stage — clipped to the same doorway as the sky/stars on
    // exit so its cards + statement (z3, above the canvas) can't spill outside
    // the closing gate. Cross-section DOM query, consistent with the Hello
    // bridge below.
    const stageEl = document.querySelector<HTMLElement>(".projects-stage");
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

    // ── Cursor repel ──
    // Pointer position (client px == canvas px, the canvas is fixed full-screen).
    // mActive stays false until the first move so the field rests on load.
    let mx = -9999,
      my = -9999,
      mActive = false;
    const repelR = 130, // influence radius (px)
      repelF = 48; // max push (px)

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

      const shp = SH[active];
      if (shp) {
        // Gentle scroll-linked scale + tilt so each shape feels alive as it
        // crosses the viewport mid-line.
        let scl = 1,
          rot = 0;
        if (active === "interface") {
          scl = 0.9 + lp * 0.12;
          rot = (lp - 0.5) * 0.1;
        } else if (active === "frontend") {
          scl = 0.86 + lp * 0.16;
          rot = (lp - 0.5) * -0.16;
        } else if (active === "backend") {
          scl = 0.92 + lp * 0.1;
          rot = (lp - 0.5) * 0.08;
        }
        for (let i = 0; i < N; i++) {
          project(shp.x[i], shp.y[i], scl, rot, cx, cy, D, tmp);
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
      const exitRamp = clamp(0, 1, (spanP - 0.88) / 0.12); // gate closes near the end
      const base = entered ? 1 : enterP;
      const sc = base * base * (3 - 2 * base); // smoothstep — punchy burst
      // Sky + stars stay fully opaque through the exit; the gate clip-path
      // (below) is what makes them recede, so they are NOT faded with exitRamp.
      const dark = base; // night-sky opacity
      const bridgeIn = clamp(0, 1, (introProgress - 0.4) / 0.22);
      const canvasOpacity = bridgeIn;

      // ── Gate close: clip the night sky + stars into a shrinking portrait
      // doorway, then down to a point, as Projects ends — "stepping out of the
      // gate". clip-path:none during the full-dark hold so the screen corners
      // stay square (no stray rounded-white artifact).
      let gateClip = "none";
      if (exitRamp > 0.0001) {
        const e = exitRamp;
        // Stage A (0→0.7): full screen → centered portrait doorway, sized off
        // viewport height so it reads tall+narrow on any aspect.
        // Stage B (0.7→1): doorway collapses to a point at center.
        const a = clamp(0, 1, e / 0.7);
        const ea = a * a * (3 - 2 * a);
        const b = clamp(0, 1, (e - 0.7) / 0.3);
        const Hd = 0.62 * H,
          Wd = 0.52 * Hd;
        const curW = (W + (Wd - W) * ea) * (1 - b);
        const curH = (H + (Hd - H) * ea) * (1 - b);
        const insL = Math.max(0, ((W - curW) / 2 / W) * 100);
        const insT = Math.max(0, ((H - curH) / 2 / H) * 100);
        const r = 20 * clamp(0, 1, e / 0.12); // round in as the exit begins
        gateClip = `inset(${insT.toFixed(2)}% ${insL.toFixed(2)}% round ${r.toFixed(1)}px)`;
      }

      // Drive the fixed night-sky layer + star canvas (opacity + gate clip)
      if (skyEl) {
        skyEl.style.opacity = dark.toFixed(3);
        skyEl.style.clipPath = gateClip;
      }
      cv.style.clipPath = gateClip;
      // Keep the Projects cards/statement contained inside the closing gate.
      if (stageEl) stageEl.style.clipPath = gateClip;

      // Nav lives in the corners, which clear to white first as the gate closes,
      // so flip is-dark off early in the exit to keep the nav text legible.
      const wantDark = base > 0.5 && exitRamp < 0.12;
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

        const repelR2 = repelR * repelR;
        for (let i = 0; i < N; i++) {
          // shape target (TX/TY) → scattered star target (SX/SY)
          const tx = TX[i] + (SX[i] - TX[i]) * sc;
          const ty = TY[i] + (SY[i] - TY[i]) * sc;
          const live = 1 - sc; // shape-state weight (0 once scattered)
          // Layered organic churn in the shape state — two frequencies read as
          // a living, breathing silhouette rather than a static one.
          const jx =
            (Math.cos(t * 0.9 + seed[i]) * 5.5 +
              Math.sin(t * 1.7 + seed[i] * 2.3) * 3.2) *
            live;
          const jy =
            (Math.sin(t * 1.15 + seed[i] * 1.4) * 5.5 +
              Math.cos(t * 2.1 + seed[i] * 1.9) * 3.2) *
            live;
          // gentle star drift fades in once scattered
          const dx = Math.cos(t * 0.25 + sTw[i]) * 7 * sc;
          const dy = Math.sin(t * 0.21 + sTw[i] * 1.3) * 7 * sc;
          // cursor repel — push the target out of the pointer's way; the lerp
          // below eases particles aside and lets them close back behind it
          let rx = 0,
            ry = 0;
          if (mActive) {
            const ddx = px[i] - mx,
              ddy = py[i] - my;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < repelR2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = 1 - d / repelR;
              const push = f * f * repelF;
              rx = (ddx / d) * push;
              ry = (ddy / d) * push;
            }
          }
          px[i] += (tx + jx + dx + rx - px[i]) * 0.11;
          py[i] += (ty + jy + dy + ry - py[i]) * 0.11;

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

    function onPointerMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      mActive = true;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
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
      window.removeEventListener("pointermove", onPointerMove);
      introTrigger.kill();
      burstTrigger.kill();
      spanTrigger.kill();
      clearBlocks();
      if (fadeEls.length) gsap.set(fadeEls, { clearProps: "opacity" });
      if (skyEl) {
        skyEl.style.opacity = "";
        skyEl.style.clipPath = "";
      }
      cv.style.clipPath = "";
      if (stageEl) stageEl.style.clipPath = "";
      document.body.classList.remove("is-dark");
    };
  }, [canvasRef, capRef, skyRef, sectRefs]);
}

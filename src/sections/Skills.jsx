import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import sections from "../data/particleSections.json";

// ── SVG glyphs ────────────────────────────────────────────────────────────────
const SVGS = {
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

const LABELS = {
  creation: "Idea → Forms",
  growth: "Reach",
  modernization: "Renewal",
  techstack: "Foundation",
};
const SHAPE_KEYS = ["one", "creation", "growth", "modernization", "techstack"];

// ── Shared helpers ────────────────────────────────────────────────────────────
function sample(frag) {
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

function shuffle(pool) {
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

function toN(pool, N) {
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
function MobileSection({ s }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const size = canvas.offsetWidth || 280;

    canvas.width = size * DPR;
    canvas.height = size * DPR;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

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
      raf;

    function project(rx, ry) {
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
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#15161a";
        ctx.globalAlpha = 0.82;
        for (let i = 0; i < N; i++) {
          // Lively idle shimmer — higher amplitude than desktop
          const jx = Math.cos(t * 0.9 + seed[i]) * 4.5;
          const jy = Math.sin(t * 1.15 + seed[i] * 1.4) * 4.5;
          px[i] += (TX[i] + jx - px[i]) * 0.09;
          py[i] += (TY[i] + jy - py[i]) * 0.09;
          ctx.fillRect(px[i] - 0.75, py[i] - 0.75, 1.5, 1.5);
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
export default function Skills({ canvasRef, capRef }) {
  const sectionRef = useRef(null);
  const sectRefs = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const capEl = capRef.current;
    if (!canvas || !capEl) return;

    const ctx = canvas.getContext("2d");
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

    const SH = {};
    let ready = false,
      t = 0,
      raf;
    let prevScroll = null,
      cloudOffsetY = 0,
      cloudVel = 0;

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
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
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
    const clamp = (a, b, v) => (v < a ? a : v > b ? b : v);

    function project(rx, ry, scale, rot, cx, cy, D, out) {
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
      const sects = sectRefs.current.filter(Boolean);
      let active = null,
        lp = 0;

      for (let s = 0; s < sects.length; s++) {
        const r = sects[s].getBoundingClientRect();
        if (r.top <= midY && r.bottom >= midY) {
          active = sects[s].dataset.shape;
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

      capEl.style.left = cx + "px";
      capEl.style.top = cy + D * 0.58 + "px";
      capEl.textContent = LABELS[active] || "";
    }

    function frame() {
      t += 0.022;
      updateDrift();
      if (ready) {
        computeTargets();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#15161a";
        ctx.globalAlpha = 0.82;
        for (let i = 0; i < N; i++) {
          // More lively idle shimmer — higher amplitude and frequency
          const jx = Math.cos(t * 0.9 + seed[i]) * 4.5;
          const jy = Math.sin(t * 1.15 + seed[i] * 1.4) * 4.5;
          px[i] += (TX[i] + jx - px[i]) * 0.09;
          py[i] += (TY[i] + jy - py[i]) * 0.09;
          ctx.fillRect(px[i] - 0.75, py[i] - 0.75, 1.5, 1.5);
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    const show = () => gsap.to([canvas, capEl], { opacity: 1, duration: 0.8 });
    const hide = () => gsap.to([canvas, capEl], { opacity: 0, duration: 0.6 });
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      markers: true,
      start: "top 15%",
      end: "bottom bottom",
      onEnter: show,
      onEnterBack: show,
      onLeave: hide,
      onLeaveBack: hide,
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
      st.kill();
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
            ref={(el) => {
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

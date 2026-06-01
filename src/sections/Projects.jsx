import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data/portfolio.js";

function Card({ p, i, ref }) {
  const sideClass = i % 2 === 0 ? "is-right right-side" : "is-left left-side";
  return (
    <figure
      ref={ref}
      className={
        `project absolute top-1/2 z-[2] rounded-[30px] ` +
        `w-[clamp(280px,34vw,512px)] aspect-[512/570] ${sideClass} ` +
        `[will-change:transform,opacity,filter] ` +
        `after:content-[''] after:absolute after:-inset-px after:z-[3] ` +
        `after:rounded-[30px] after:pointer-events-none ` +
        `after:[box-shadow:inset_0_0_4rem_8rem_var(--color-mist)]`
      }
    >
      <div className="absolute inset-0 rounded-[30px] overflow-hidden">
        <img
          src={p.img}
          alt={`${p.name} — ${p.tag}`}
          className="w-full h-full object-cover"
        />
      </div>
      <figcaption
        className={
          `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] ` +
          `whitespace-nowrap inline-flex items-baseline gap-[0.55em] ` +
          `px-[0.95em] py-[0.56em] rounded-full text-white ` +
          `bg-[rgba(120,120,120,0.28)] [backdrop-filter:blur(7px)_saturate(1.3)] ` +
          `[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_20px_-10px_rgba(0,0,0,0.4)]`
        }
      >
        <b className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</b>
        <span className="text-[14px] font-normal opacity-80">{p.tag}</span>
      </figcaption>
    </figure>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const statementRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      document.body.classList.add("no-anim");
      return;
    }

    const cards = cardRefs.current.filter(Boolean);
    const N = cards.length;
    const clamp = gsap.utils.clamp;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const MIST_END = 0.1;
    const FIRST = 0.14;
    const OVERLAP = 0.66;
    const WIN = (1 - FIRST) / ((N - 1) * OVERLAP + 1);
    const STRIDE = OVERLAP * WIN;

    function render(p) {
      const vh = window.innerHeight;
      const startY = 0.62 * vh;
      const endY = -0.62 * vh;

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
        if (sp <= 0) {
          y = startY;
          vis = 0;
        } else if (sp >= 1) {
          y = endY;
          vis = 0;
        } else {
          y = lerp(startY, endY, sp);
          const fin = clamp(0, 1, sp / 0.14);
          const fout = clamp(0, 1, (1 - sp) / 0.14);
          vis = Math.min(fin, fout);
        }
        gsap.set(cards[i], { yPercent: -50, y, autoAlpha: vis });
      }
    }

    let targetP = 0,
      curP = 0,
      raf;
    function loop() {
      curP += (targetP - curP) * 0.08;
      if (Math.abs(targetP - curP) < 0.00015) curP = targetP;
      render(curP);
      raf = requestAnimationFrame(loop);
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: stageRef.current,
      anticipatePin: 1,
      onUpdate: (self) => {
        targetP = self.progress;
      },
      onRefresh: (self) => {
        targetP = self.progress || 0;
      },
    });

    render(0);
    loop();

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      st.kill();
    };
  }, []);

  const mapped = projects.map((p) => ({
    name: p.name,
    tag: p.role,
    img: p.imageUrl,
  }));

  return (
    <section
      id="work"
      ref={sectionRef}
      className="projects relative min-h-[680vh]"
    >
      <div
        ref={stageRef}
        className="projects-stage relative h-screen overflow-hidden"
      >
        <p className="absolute top-9 inset-x-0 text-center z-[5] text-[11px] font-medium tracking-[0.24em] uppercase text-neutral-400">
          Unforgettable experiences
        </p>

        <div className="statement-layer absolute inset-0 grid place-items-center z-[4] pointer-events-none">
          <h2
            ref={statementRef}
            className="statement m-0 whitespace-nowrap font-semibold leading-none tracking-[-0.035em] text-ink text-[clamp(30px,5.4vw,62px)] [will-change:filter,opacity,transform]"
          >
            Unforgettable experiences
          </h2>
        </div>

        {mapped.map((p, i) => (
          <Card
            key={i}
            p={p}
            i={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}

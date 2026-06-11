import {
  type Ref,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
} from "react";
import gsap from "gsap";
import {
  RETURN_SCROLL_KEY,
  useMistNavigate,
} from "../../../../transition/MistTransition";

export interface ProjectCardData {
  name: string;
  tag: string;
  img: string;
  /** Render the live 3D dashboard case-study visual instead of an image. */
  dashboard?: boolean;
  /** When set, clicking the card opens /case-study/{caseStudyId}. */
  caseStudyId?: number;
  /** Renders an "in progress" placeholder card instead of an image. */
  placeholder?: boolean;
}

interface CardProps {
  p: ProjectCardData;
  i: number;
  ref: Ref<HTMLElement>;
}

export default function ProjectCard({ p, i, ref }: CardProps) {
  const sideClass = i % 2 === 0 ? "is-right right-side" : "is-left left-side";

  // ── Case-study navigation ──
  // Cards with a caseStudyId open the matching /case-study/{id} route,
  // through the mist transition (falls back to a plain navigate in tests).
  const navigate = useMistNavigate();
  const linkable = p.caseStudyId != null;
  const openCase = () => {
    if (!linkable) return;
    // Remember where we left so the case study's Back button can mist-return
    // to this exact spot in the Projects scroll.
    sessionStorage.setItem(RETURN_SCROLL_KEY, String(Math.round(window.scrollY)));
    navigate(`/case-study/${p.caseStudyId}`);
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (linkable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openCase();
    }
  };

  // La Nube–style vignette, tuned to our dark stage: the edges dissolve into
  // the night-sky background colour so each card melts into the surrounding
  // mist instead of showing a hard border.
  const edge = `after:[box-shadow:inset_0_0_4rem_8rem_var(--color-night)]`;

  // ── Magnetic pill ──
  // The caption is pulled toward the cursor when it's near the card centre,
  // then springs back on leave. quickTo keeps it buttery across pointermoves.
  const pillRef = useRef<HTMLSpanElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    xTo.current = gsap.quickTo(pill, "x", { duration: 0.5, ease: "power3" });
    yTo.current = gsap.quickTo(pill, "y", { duration: 0.5, ease: "power3" });
    return () => {
      gsap.killTweensOf(pill);
    };
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!xTo.current || !yTo.current) return;
    // Measure from the (unmoving) card centre so there's no runaway feedback.
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    const R = 175; // proximity radius
    const k = Math.max(0, 1 - dist / R); // falloff: full at centre, 0 at edge
    xTo.current(dx * 0.6 * k);
    yTo.current(dy * 0.6 * k);
  };

  const onLeave = () => {
    const pill = pillRef.current;
    if (!pill) return;
    gsap.to(pill, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <figure
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={openCase}
      onKeyDown={onKeyDown}
      role={linkable ? "link" : undefined}
      tabIndex={linkable ? 0 : undefined}
      className={
        `project absolute top-1/2 z-[2] rounded-[30px] ` +
        `w-[clamp(280px,34vw,512px)] aspect-[512/570] ${sideClass} ` +
        `[will-change:transform,opacity,filter] ` +
        `after:content-[''] after:absolute after:-inset-px after:z-[3] ` +
        `after:rounded-[30px] after:pointer-events-none ` +
        (linkable ? "cursor-pointer " : "") +
        edge
      }
    >
      <div className="absolute inset-0 rounded-[30px] overflow-hidden">
        {p.placeholder ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#1c1d22] to-[#0b0d14] px-12 text-center">
            <p className="text-[12px] font-semibold tracking-[0.22em] uppercase text-white/40">
              ( Next chapter )
            </p>
            <p className="font-display max-w-[280px] text-[clamp(20px,2.2vw,28px)] font-semibold leading-snug tracking-[-0.02em] text-white/85">
              {p.name} — {p.tag}
            </p>
            <span
              className="project-placeholder-dots flex gap-2"
              aria-hidden="true"
            >
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-dot)]" />
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-dot)]" />
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-dot)]" />
            </span>
          </div>
        ) : p.dashboard ? (
          <iframe
            src="/dashboard_assemble.html"
            title="Fund Portal dashboard — assemble"
            loading="lazy"
            tabIndex={-1}
            scrolling="no"
            // Non-interactive showcase: let pointer events fall through to the
            // figure so the magnetic caption still tracks over the dashboard.
            className="absolute inset-0 block w-full h-full border-0 pointer-events-none [color-scheme:light]"
          />
        ) : (
          <img
            src={p.img}
            alt={`${p.name} — ${p.tag}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {!p.placeholder && (
        <figcaption className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4]">
          <span
            ref={pillRef}
            className={
              `whitespace-nowrap inline-flex items-baseline gap-[0.55em] ` +
              `px-[0.95em] py-[0.56em] rounded-full text-white [will-change:transform] ` +
              `bg-[rgba(120,120,120,0.28)] [backdrop-filter:blur(7px)_saturate(1.3)] ` +
              `[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_20px_-10px_rgba(0,0,0,0.4)]`
            }
          >
            <b className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</b>
            <span className="text-[14px] font-normal opacity-80">{p.tag}</span>
          </span>
        </figcaption>
      )}
    </figure>
  );
}

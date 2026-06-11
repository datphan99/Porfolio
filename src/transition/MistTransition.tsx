import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { createMistGL, type MistGL } from "./mistGL";

/* Mist page transition.
   Cover: WebGL smoke billows out from the centre while the page behind blurs
   away. The route swaps under full fog (only one page — and one ScrollSmoother
   — alive at a time), then the smoke dissolves and the new page blurs in.
   Falls back to a plain scrim + backdrop-blur when WebGL is unavailable, and
   to an instant navigate under prefers-reduced-motion. */

type MistNavigate = (to: string, opts?: { scrollY?: number }) => void;

const MistContext = createContext<{ navigateWithMist: MistNavigate } | null>(null);

/** sessionStorage key for the scroll position to return to after a case study. */
export const RETURN_SCROLL_KEY = "case-return-scroll";

/** Mist-wrapped navigate. `opts.scrollY` restores a scroll position on the new
 *  page (default top). Outside a MistProvider (e.g. unit tests) it falls back
 *  to a plain react-router navigate. */
export function useMistNavigate(): MistNavigate {
  const ctx = useContext(MistContext);
  const navigate = useNavigate();
  return ctx?.navigateWithMist ?? ((to) => navigate(to));
}

export function MistProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // undefined = not attempted yet, null = WebGL unavailable (CSS fallback)
  const glRef = useRef<MistGL | null | undefined>(undefined);
  const stateRef = useRef({ p: 0 });
  const rafRef = useRef(0);
  const busyRef = useRef(false);

  const apply = useCallback((p: number, t: number) => {
    glRef.current?.draw(p, t);
    const scrim = scrimRef.current;
    if (!scrim) return;
    // base fog colour guarantees full cover at the swap even without WebGL
    scrim.style.backgroundColor = `rgba(238,236,232,${Math.min(1, p * 1.2).toFixed(3)})`;
    const blur = p > 0.001 ? `blur(${(p * 14).toFixed(1)}px)` : "none";
    scrim.style.backdropFilter = blur;
    scrim.style.setProperty("-webkit-backdrop-filter", blur);
  }, []);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    const t0 = performance.now();
    const loop = (now: number) => {
      apply(stateRef.current.p, (now - t0) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [apply, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  const navigateWithMist = useCallback<MistNavigate>(
    (to, opts) => {
      const targetY = opts?.scrollY ?? 0;
      if (busyRef.current) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        navigate(to);
        window.scrollTo(0, targetY);
        return;
      }
      busyRef.current = true;
      const overlay = overlayRef.current;
      if (overlay) overlay.style.pointerEvents = "auto";
      if (glRef.current === undefined && canvasRef.current) {
        glRef.current = createMistGL(canvasRef.current);
      }
      glRef.current?.resize();
      startLoop();

      gsap.timeline({
        onComplete: () => {
          stopLoop();
          apply(0, 0);
          if (overlay) overlay.style.pointerEvents = "none";
          busyRef.current = false;
        },
      })
        // smoke billows out, page behind blurs away
        .to(stateRef.current, { p: 1, duration: 0.85, ease: "power2.in" })
        .add(() => navigate(to))
        // set the scroll once the new route has committed, under full fog
        .add(() => window.scrollTo(0, targetY), "+=0.1")
        // hold a beat, then the mist dissolves and the new page blurs in
        .to(stateRef.current, { p: 0, duration: 1.25, ease: "power2.inOut" }, "+=0.25");
    },
    [navigate, apply, startLoop, stopLoop],
  );

  return (
    <MistContext.Provider value={{ navigateWithMist }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[120] pointer-events-none"
      >
        <div ref={scrimRef} className="absolute inset-0" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </MistContext.Provider>
  );
}

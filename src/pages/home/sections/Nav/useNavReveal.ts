import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export function useNavReveal(eyebrowRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = eyebrowRef.current;
    if (!el) return;

    // hidden on initial load — hero section owns the eyebrow area.
    // pointerEvents follows visibility so the (clickable) eyebrow can't be
    // hit while it's faded out.
    gsap.set(el, { opacity: 0, y: -14, pointerEvents: "none" });

    let st: ScrollTrigger | undefined;
    let raf = 0;

    const build = () => {
      st = ScrollTrigger.create({
        start: 60,
        end: 99999,
        onUpdate(self) {
          if (self.direction === 1) {
            // scrolling down — slide up + fade out
            gsap.to(el, {
              y: -14,
              opacity: 0,
              pointerEvents: "none",
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else {
            // scrolling up — return to position
            gsap.to(el, {
              y: 0,
              opacity: 1,
              pointerEvents: "auto",
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        },
      });
    };

    // Nav mounts in RootLayout *before* the page creates its ScrollSmoother, so
    // a trigger created now can bind to the un-smoothed scroller and never fire.
    // Wait for the active smoother, then build — deterministic across machines.
    const waitForSmoother = () => {
      if (ScrollSmoother.get()) build();
      else raf = requestAnimationFrame(waitForSmoother);
    };
    waitForSmoother();

    return () => {
      cancelAnimationFrame(raf);
      st?.kill();
    };
  }, []);
}

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";

// Pull each pill toward the cursor on hover (≈0.35× the offset from its centre)
// and spring it back on leave. Only where a real pointer can hover; skipped
// under reduced-motion. The x/y transform composes with selection styling.
const STRENGTH = 0.35;

export function useMagneticPills(sectionRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const canHover = window.matchMedia?.(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!canHover || reduce) return;

      const pills =
        section.querySelectorAll<HTMLElement>("[data-magnetic]");
      const cleanups: Array<() => void> = [];

      pills.forEach((pill) => {
        const xTo = gsap.quickTo(pill, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(pill, "y", { duration: 0.5, ease: "power3.out" });

        const onMove = (e: PointerEvent) => {
          const r = pill.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * STRENGTH);
          yTo((e.clientY - (r.top + r.height / 2)) * STRENGTH);
        };
        const onLeave = () => {
          // elastic settle back to origin reads like a magnet releasing
          gsap.to(pill, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.45)",
          });
        };

        pill.addEventListener("pointermove", onMove);
        pill.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          pill.removeEventListener("pointermove", onMove);
          pill.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: sectionRef },
  );
}

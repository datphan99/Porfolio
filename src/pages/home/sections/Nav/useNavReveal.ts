import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useNavReveal(eyebrowRef: RefObject<HTMLParagraphElement | null>): void {
  useEffect(() => {
    const el = eyebrowRef.current;
    if (!el) return;

    // hidden on initial load — hero section owns the eyebrow area
    gsap.set(el, { opacity: 0, y: -14 });

    const st = ScrollTrigger.create({
      start: 60,
      end: 99999,
      onUpdate(self) {
        if (self.direction === 1) {
          // scrolling down — slide up + fade out
          gsap.to(el, {
            y: -14,
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else {
          // scrolling up — return to position
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      },
    });

    return () => st.kill();
  }, []);
}

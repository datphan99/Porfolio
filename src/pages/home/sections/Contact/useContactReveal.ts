import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

// Scroll reveal for the contact section + nav-theme handoff.
// - Left column blocks and form rows fade/rise in with a stagger on enter
//   (one-shot, transform/opacity only — no pin, no scrub, so no scroll jank).
// - This section (and the dark footer below it) are dark, so we flip the
//   global `body.is-dark` nav theme on exactly when the dark background reaches
//   the top bar (`start: "top top"`) and hold it to the page bottom
//   (`end: "max"`), keeping the fixed Nav legible. Reused from the Projects
//   night-sky mechanism; ranges don't overlap.
export function useContactReveal(sectionRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const darkST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "max",
        onToggle: (self) =>
          document.body.classList.toggle("is-dark", self.isActive),
      });

      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const targets = section.querySelectorAll<HTMLElement>("[data-reveal]");
      const bg = section.querySelector<HTMLElement>(".contact-bg");

      // Career → Contact morph: the dark panel enters as an inset rounded
      // card and expands to full-bleed, scrubbed so it tracks the scroll.
      // The card's bottom corners are never on screen while rounded (the
      // scrub completes long before the section bottom), so all-corner
      // rounding is safe against the dark footer.
      let panelTween: gsap.core.Tween | undefined;
      if (bg) {
        if (reduce) {
          gsap.set(bg, { scaleX: 1, borderRadius: 0 });
        } else {
          panelTween = gsap.fromTo(
            bg,
            { scaleX: 0.92, borderRadius: 40 },
            {
              scaleX: 1,
              borderRadius: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "top 20%",
                scrub: true,
              },
            },
          );
        }
      }

      let tween: gsap.core.Tween | undefined;
      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 });
      } else {
        tween = gsap.fromTo(
          targets,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: section, start: "top 80%" },
          },
        );
      }

      return () => {
        darkST.kill();
        document.body.classList.remove("is-dark");
        panelTween?.scrollTrigger?.kill();
        panelTween?.kill();
        tween?.scrollTrigger?.kill();
        tween?.kill();
      };
    },
    { scope: sectionRef },
  );
}

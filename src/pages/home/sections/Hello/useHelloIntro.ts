import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

export function useHelloIntro(
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
): void {
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const split = new SplitText(".hello-title", {
        type: "chars,words",
        charsClass: "hello-char inline-block overflow-hidden",
      });

      gsap.set(".hello-eyebrow", { opacity: 0, y: -3, filter: "blur(5px)" });
      gsap.set(split.chars, { opacity: 0, y: "20%", filter: "blur(4px)" });

      // Pin the stage, scroll space comes from section's min-h
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: stageRef.current,
          anticipatePin: 1,
          scrub: 1,
        },
      });

      tl.to(".hello-eyebrow", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.2,
        ease: "power2.out",
      })
        .to(
          split.chars,
          {
            opacity: 1,
            y: "0%",
            filter: "blur(0px)",
            stagger: 0.018,
            duration: 0.12,
            ease: "power3.out",
          },
          "-=0.05",
        )
        // Spacer — holds the revealed state through the first ~half of the pin so the
        // tail is free for the Skills bridge (text dissolves into particles there).
        .to({}, { duration: 1.7 });

      return () => {
        split.revert();
        // charsClass elements are removed on revert — no extra cleanup needed
      };
    },
    { scope: sectionRef },
  );
}

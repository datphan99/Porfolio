import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import type { RefObject } from "react";

const PILL_ROTATIONS: Record<string, number> = { a: -3, b: 2, c: -2, d: 3, e: -2, f: 2 };

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

      // Initial states — rotation baked in so Draggable can compose on top
      gsap.set(".hello-eyebrow", { opacity: 0, y: -3, filter: "blur(5px)" });
      gsap.set(split.chars, { opacity: 0, y: "20%", filter: "blur(4px)" });
      section.querySelectorAll(".hello-pill").forEach((el) => {
        const id = [...el.classList]
          .find((c) => c.startsWith("hello-pill--"))
          ?.replace("hello-pill--", "");
        gsap.set(el, { opacity: 0, y: 12, rotation: id ? PILL_ROTATIONS[id] ?? 0 : 0 });
      });

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
        .to(
          ".hello-pill",
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.1,
            ease: "power3.out",
          },
          "-=0.25",
        )
        // Spacer — holds the revealed state through the first ~half of the pin so the
        // tail is free for the Skills bridge (text dissolves into particles there).
        .to({}, { duration: 1.7 });

      // Draggable — spring back on release
      const draggables = Draggable.create(
        section.querySelectorAll(".hello-pill"),
        {
          type: "x,y",
          onDragStart(this: Draggable) {
            gsap.killTweensOf(this.target);
          },
          onDragEnd(this: Draggable) {
            gsap.to(this.target, {
              x: 0,
              y: 0,
              ease: "elastic.out(0.18, 0.5)",
              duration: 0.6,
            });
          },
        },
      );

      return () => {
        split.revert();
        // charsClass elements are removed on revert — no extra cleanup needed
        draggables.forEach((d) => d.kill());
      };
    },
    { scope: sectionRef },
  );
}

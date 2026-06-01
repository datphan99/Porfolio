import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { helloPills } from "../data/portfolio.js";

const PILL_ROTATIONS = { a: -3, b: 2, c: -2, d: 3, e: -2, f: 2 };

const PILL_POSITIONS = {
  a: "left-0 top-[18%]",
  b: "left-[40px] top-[42%]",
  c: "left-[14px] top-[66%]",
  d: "right-0 top-[18%]",
  e: "right-[34px] top-[42%]",
  f: "right-[14px] top-[66%]",
};

export default function Hello() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const split = new SplitText(".hello-title", {
        type: "chars,words",
        charsClass: "inline-block overflow-hidden",
      });

      // Initial states — rotation baked in so Draggable can compose on top
      gsap.set(".hello-eyebrow", { opacity: 0, y: -3, filter: "blur(5px)" });
      gsap.set(split.chars, { opacity: 0, y: "20%", filter: "blur(4px)" });
      section.querySelectorAll(".hello-pill").forEach((el) => {
        const id = [...el.classList]
          .find((c) => c.startsWith("hello-pill--"))
          ?.replace("hello-pill--", "");
        gsap.set(el, { opacity: 0, y: 12, rotation: PILL_ROTATIONS[id] ?? 0 });
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
        );

      // Draggable — spring back on release
      const draggables = Draggable.create(
        section.querySelectorAll(".hello-pill"),
        {
          type: "x,y",
          onDragStart() {
            gsap.killTweensOf(this.target);
          },
          onDragEnd() {
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

  return (
    // min-h-[250vh] tạo scroll space — stage (100vh) pins trong khi 150vh còn lại drive animation
    <section
      className="relative min-h-[250vh] overflow-hidden"
      id="about"
      ref={sectionRef}
    >
      <div
        className="h-screen flex flex-col items-center justify-center"
        ref={stageRef}
      >
        <div className="container">
          <p className="hello-eyebrow text-center mb-9">
            <span className="relative inline-flex items-center gap-[22px] font-script italic text-[28px] text-black/40">
              <span className="w-[90px] h-px bg-black/[0.18]" />
              Hello!
              <span className="w-[90px] h-px bg-black/[0.18]" />
            </span>
          </p>

          <div className="hello-stage relative min-h-[320px] flex items-center justify-center">
            {helloPills
              .filter((p) => p.side === "left")
              .map((pill) => (
                <span
                  key={pill.id}
                  className={`hello-pill hello-pill--${pill.id} ${PILL_POSITIONS[pill.id] ?? ""} absolute inline-flex items-center gap-2 bg-white border border-white rounded-[147px] py-[7px] pr-[14px] pl-[7px] text-[13px] font-medium text-[#111] shadow-[rgba(255,255,255,0.25)_0px_0px_0px_6px,rgba(0,0,0,0.1)_10px_12px_14px_0px] whitespace-nowrap select-none will-change-transform cursor-grab active:cursor-grabbing touch-none max-md:hidden`}
                  data-side="left"
                >
                  <span
                    className="hello-ico w-6 h-6 rounded-full grid place-items-center text-white text-[11px] leading-none"
                    style={{ background: pill.color }}
                  >
                    {pill.icon}
                  </span>
                  {pill.label}
                </span>
              ))}

            <h2 className="hello-title font-display [font-feature-settings:'salt'_on] text-[48px] font-normal tracking-[-0.04em] leading-[1.35em] text-center text-black max-w-[780px]">
              We help brands grow with standout design, clear branding, and
              content that drives results.
            </h2>

            {helloPills
              .filter((p) => p.side === "right")
              .map((pill) => (
                <span
                  key={pill.id}
                  className={`hello-pill hello-pill--${pill.id} ${PILL_POSITIONS[pill.id] ?? ""} absolute inline-flex items-center gap-2 bg-white border border-white rounded-[147px] py-[7px] pr-[14px] pl-[7px] text-[13px] font-medium text-[#111] shadow-[rgba(255,255,255,0.25)_0px_0px_0px_6px,rgba(0,0,0,0.1)_10px_12px_14px_0px] whitespace-nowrap select-none will-change-transform cursor-grab active:cursor-grabbing touch-none max-md:hidden`}
                  data-side="right"
                >
                  <span
                    className="hello-ico w-6 h-6 rounded-full grid place-items-center text-white text-[11px] leading-none"
                    style={{ background: pill.color }}
                  >
                    {pill.icon}
                  </span>
                  {pill.label}
                </span>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

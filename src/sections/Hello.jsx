import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { helloPills } from "../data/portfolio.js";

// Rotation per pill id — managed by GSAP so Draggable can compose transforms
const PILL_ROTATIONS = { a: -3, b: 2, c: -2, d: 3, e: -2, f: 2 };

export default function Hello() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Eyebrow fade-in
      gsap.fromTo(
        ".hello-eyebrow",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hello-eyebrow", start: "top 86%" },
        },
      );

      // SplitText word-fill: words start dim, fill to opaque as user scrolls through
      const split = new SplitText(".hello-title", { type: "words" });
      gsap.set(split.words, { opacity: 0.12 });

      gsap.to(split.words, {
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          trigger: ".hello-title",
          start: "top 75%",
          end: "bottom 30%",
          scrub: 1.5,
        },
      });

      // Left pills slide in from the left
      gsap.fromTo(
        '[data-side="left"]',
        { opacity: 0, x: -48 },
        {
          opacity: 1,
          x: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".hello-stage", start: "top 82%" },
        },
      );

      // Right pills slide in from the right
      gsap.fromTo(
        '[data-side="right"]',
        { opacity: 0, x: 48 },
        {
          opacity: 1,
          x: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".hello-stage", start: "top 82%" },
        },
      );

      // Set pill rotations via GSAP so Draggable can compose x/y on top
      const section = sectionRef.current;
      section.querySelectorAll(".hello-pill").forEach((el) => {
        const id = [...el.classList]
          .find((c) => c.startsWith("hello-pill--"))
          ?.replace("hello-pill--", "");
        if (id && PILL_ROTATIONS[id] !== undefined) {
          gsap.set(el, { rotation: PILL_ROTATIONS[id] });
        }
      });

      // Draggable — spring back to origin on release
      const pills = section.querySelectorAll(".hello-pill");
      const draggables = Draggable.create(pills, {
        type: "x,y",
        onDragStart: function () {
          gsap.killTweensOf(this.target);
        },
        onDragEnd: function () {
          gsap.to(this.target, {
            x: 0,
            y: 0,
            ease: "elastic.out(0.18, 0.5)",
            duration: 0.6,
          });
        },
      });

      return () => {
        split.revert();
        draggables.forEach((d) => d.kill());
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: sectionRef },
  );

  return (
    <section className="hello" id="about" ref={sectionRef}>
      <div className="container">
        <p className="hello-eyebrow">
          <span>Hello!</span>
        </p>

        <div className="hello-stage">
          {/* Left floating pills */}
          {helloPills
            .filter((p) => p.side === "left")
            .map((pill) => (
              <span
                key={pill.id}
                className={`hello-pill hello-pill--${pill.id}`}
                data-side="left"
              >
                <span className="hello-ico" style={{ background: pill.color }}>
                  {pill.icon}
                </span>
                {pill.label}
              </span>
            ))}

          <h2 className="hello-title">
            We help brands grow with standout design, clear branding, and
            content that drives results.
          </h2>

          {/* Right floating pills */}
          {helloPills
            .filter((p) => p.side === "right")
            .map((pill) => (
              <span
                key={pill.id}
                className={`hello-pill hello-pill--${pill.id}`}
                data-side="right"
              >
                <span className="hello-ico" style={{ background: pill.color }}>
                  {pill.icon}
                </span>
                {pill.label}
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}

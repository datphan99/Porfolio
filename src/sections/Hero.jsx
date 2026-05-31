import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import status from "../data/status.json";

export default function Hero() {
  const sectionRef = useRef(null);
  const statusClass = status.work ? "is-available" : "is-unavailable";

  useGSAP(
    () => {
      const section = sectionRef.current;
      const wordEls = Array.from(section.querySelectorAll(".hero-word"));

      // Split "Brands" separately — fires first
      const splitBrands = new SplitText(wordEls[0], { type: "chars" });
      // Remaining words: Grow, Fast, With us — fire after mockups
      const splitRest = new SplitText(wordEls.slice(1), { type: "chars" });

      // Title visible immediately; chars own their opacity
      gsap.set(".hero-title", { opacity: 1 });
      gsap.set([...splitBrands.chars, ...splitRest.chars], {
        opacity: 0,
        y: 18,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
      )
        .addLabel("brandsStart", "-=0.2")
        .to(splitBrands.chars, {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.55,
        })
        .addLabel("brandsEnd")
        // Mockups fire at brandsStart
        .fromTo(
          ".hero-mockup--site",
          { opacity: 0, x: -9, y: -43, rotation: -20 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: -2,
            duration: 1.2,
            ease: "power2.out",
          },
          "brandsStart",
        )
        .fromTo(
          ".hero-mockup--dark",
          { opacity: 0, x: 12, y: -18, rotation: 10 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 2,
            duration: 1.2,
            ease: "power2.out",
          },
          "brandsStart+=0.15",
        )
        // 0.2s after Brands finishes → remaining words
        .to(
          splitRest.chars,
          {
            opacity: 1,
            y: 0,
            stagger: { each: 0.035, from: "start" },
            duration: 0.5,
          },
          "brandsEnd+=0.06",
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.1",
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.1",
        );

      return () => {
        splitBrands.revert();
        splitRest.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section className="hero" ref={sectionRef}>
      {/* Decorative light-beam backdrop — animate each beam with GSAP if desired */}
      <div className="hero-bg" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`hero-beam hero-beam--${n}`} />
        ))}
      </div>

      <div className="hero-side-tag" aria-hidden="true">
        <strong>W.</strong>
        <span>Nominee</span>
      </div>

      <div className="container hero-inner">
        <span className="hero-badge">
          <span
            className={`hero-status-dot ${statusClass}`}
            aria-hidden="true"
          />
          Available to work
        </span>

        <h1 className="hero-title" aria-label="Brands Grow Fast With us">
          <span className="hero-title-row">
            <span className="hero-word hero-word--dark">Brands</span>
            <span className="hero-mockup hero-mockup--site" aria-hidden="true">
              <span className="mock-browser">
                <span />
                <span />
                <span />
              </span>
              <span className="mock-copy">
                <b>UI/UX</b>
                <small>Brand system</small>
              </span>
              <span className="mock-line" />
            </span>
            <span className="hero-word hero-word--muted">Grow</span>
          </span>
          <span className="hero-title-row">
            <span className="hero-word hero-word--muted">Fast</span>
            <span className="hero-mockup hero-mockup--dark" aria-hidden="true">
              <span>Webflow</span>
            </span>
            <span className="hero-word hero-word--dark">With us</span>
          </span>
        </h1>

        <p className="hero-sub">
          We don't just make brands pretty — we craft smart design that fuels
          real business growth.
        </p>

        <a href="#contact" className="hero-cta">
          <span className="hero-cta-icon" aria-hidden="true">
            ✦
          </span>
          Book a Meeting
          <span className="hero-cta-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}

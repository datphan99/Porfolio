import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import status from "../data/status.json";

export default function Hero() {
  const sectionRef = useRef(null);

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
    <section
      className="relative min-h-screen pt-[105px] pb-[118px] text-center bg-[#f2f2f0] overflow-hidden"
      ref={sectionRef}
    >
      {/* Background beams — mask gradients live in styles.css */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 10% 3%, rgba(255,255,255,0.94) 0 9%, transparent 23%), linear-gradient(225deg, #f9f9f9 0%, #d7d7d7 70%, #cfcfcf 100%)",
          WebkitMask:
            "radial-gradient(125% 100% at 0 0, #000 0%, rgba(0,0,0,0.22) 88%, transparent 100%)",
          mask: "radial-gradient(125% 100% at 0 0, #000 0%, rgba(0,0,0,0.22) 88%, transparent 100%)",
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`hero-beam hero-beam--${n}`} />
        ))}
      </div>

      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-286px)]">
        {/* Badge */}
        <span className="hero-badge inline-flex items-center gap-2 px-5 py-3 bg-white border border-black/[0.08] rounded-full text-[#191919] text-[clamp(14px,1.2vw,18px)] font-medium shadow-[0_18px_50px_rgba(0,0,0,0.06)] opacity-0">
          <span
            className={`hero-status-dot w-[7px] h-[7px] rounded-full ${
              status.work
                ? "bg-[#21c45d] shadow-[0_0_0_4px_rgba(33,196,93,0.16)]"
                : "bg-[#e53935] shadow-[0_0_0_4px_rgba(229,57,53,0.14)]"
            }`}
            aria-hidden="true"
          />
          Available to work
        </span>

        {/* Title */}
        <h1
          className="hero-title grid justify-items-center mt-[82px] mb-[58px] mx-auto max-w-[1160px] font-display [font-feature-settings:'salt'_on] text-[108px] font-bold leading-[0.88] tracking-[-0.055em] opacity-0"
          aria-label="Brands Grow Fast With us"
        >
          {/* Row 1 */}
          <span className="flex items-center justify-center gap-[clamp(18px,2.7vw,42px)] min-w-0">
            <span className="hero-word inline-block whitespace-nowrap text-[#020202]">
              Make
            </span>

            {/* Site mockup */}
            <span
              className="hero-mockup hero-mockup--site relative inline-grid flex-none place-items-center overflow-hidden border-[4px] border-[#050505] rounded-[34px] shadow-[0_24px_34px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.6)] w-[147px] h-[112px] p-[18px] bg-[#f9f9f7] -rotate-[1.5deg]"
              aria-hidden="true"
            >
              <span className="mock-browser absolute top-[14px] left-[17px] flex gap-1">
                <span className="w-1 h-1 rounded-full bg-[#b22a2a]" />
                <span className="w-1 h-1 rounded-full bg-[#b22a2a]" />
                <span className="w-1 h-1 rounded-full bg-[#b22a2a]" />
              </span>
              <span className="mock-copy absolute top-[32px] left-[18px] grid gap-1 w-[58px] text-left">
                <b className="text-[8px] leading-none">UI/UX</b>
                <small className="text-[#777] text-[6px] leading-[1.1]">
                  Brand system
                </small>
              </span>
              <span className="mock-line absolute right-[15px] bottom-[20px] w-[76px] h-[34px] border-[6px] border-[#7c3131] border-l-0 border-b-0 rounded-tr-[26px]" />
            </span>

            <span className="hero-word inline-block whitespace-nowrap text-[#777] font-medium">
              every pixel
            </span>
          </span>

          {/* Row 2 */}
          <span className="flex items-center justify-center gap-[clamp(18px,2.7vw,42px)] min-w-0 mt-[26px]">
            <span className="hero-word inline-block whitespace-nowrap text-[#777] font-medium">
              Pay
            </span>

            {/* Dark mockup */}
            <span
              className="hero-mockup hero-mockup--dark relative inline-grid flex-none place-items-center overflow-hidden border-[4px] border-[#050505] rounded-[34px] shadow-[0_24px_34px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.6)] w-[147px] h-[112px] rotate-[1.6deg] bg-[#242424] text-[#bfbfbf] text-[clamp(16px,1.9vw,27px)] font-bold tracking-[-0.04em]"
              aria-hidden="true"
            >
              <span>Webflow</span>
            </span>

            <span className="hero-word inline-block whitespace-nowrap text-[#020202]">
              for itself
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="hero-sub max-w-[550px] mx-auto mb-[72px] text-[#6f6f6f] text-[16px] leading-[1.55] font-medium opacity-0">
          We don&apos;t just make brands pretty — we craft smart design that
          fuels real business growth.
        </p>

        {/* CTA */}
        <a
          href="#contact"
          className="hero-cta inline-flex items-center gap-3.5 min-h-[72px] bg-[#030303] text-white px-[18px] py-2 pl-[10px] border-[9px] border-white/[0.72] rounded-full text-[clamp(16px,1.35vw,22px)] font-bold shadow-[0_24px_60px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.14)] opacity-0"
        >
          <span
            className="hero-cta-icon inline-grid w-[45px] h-[45px] place-items-center rounded-full bg-white text-[#111] text-[20px] flex-shrink-0"
            aria-hidden="true"
          >
            ✦
          </span>
          Book a Meeting
          <span
            className="hero-cta-arrow text-[24px] leading-none"
            aria-hidden="true"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}

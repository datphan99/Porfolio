import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

/**
 * Agency-grade scroll choreography for the case-study page.
 *
 * Owns the page's ScrollSmoother (created here so it exists before any
 * ScrollTrigger is built) plus the full reveal/scrub timeline. Everything is
 * scoped to `rootRef` (#smooth-content) and wrapped in a matchMedia so
 * reduced-motion users just get the finished, static page.
 *
 * Pass `ready = true` only once the case JSON has rendered, so the DOM the
 * triggers measure actually exists.
 */
export function useCaseStudyMotion(
  ready: boolean,
  rootRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    // ScrollSmoother first — ScrollTriggers register against it.
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
      normalizeScroll: true,
    });

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Reduced motion: show the finished page, no animation ──────────
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll(".reveal"), { opacity: 1, y: 0 });
      });

      // ── Full motion ───────────────────────────────────────────────────
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const splits: SplitText[] = [];

        /* ---------- HERO — masked reveal on load ---------- */
        const heroSection = root.querySelector("header.hero");
        const heroReveals = root.querySelectorAll("header.hero .reveal");
        const kicker = root.querySelector("header.hero .kicker");
        const markEl = root.querySelector<HTMLElement>("header.hero .hero-mark");
        const headEl = root.querySelector<HTMLElement>("header.hero .hero-head");
        const bodyEls = root.querySelectorAll("header.hero .hero-body p");

        gsap.set(heroReveals, { opacity: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        if (kicker) tl.from(kicker, { y: 18, opacity: 0, duration: 0.7 }, 0);

        if (markEl) {
          gsap.set(markEl, { overflow: "hidden" });
          const s = new SplitText(markEl, { type: "lines" });
          splits.push(s);
          tl.from(
            s.lines,
            { yPercent: 120, opacity: 0, duration: 1.15, stagger: 0.12 },
            0.05,
          );
        }
        if (headEl) {
          gsap.set(headEl, { overflow: "hidden" });
          const s = new SplitText(headEl, { type: "lines" });
          splits.push(s);
          tl.from(
            s.lines,
            { yPercent: 110, opacity: 0, duration: 1, stagger: 0.1 },
            0.32,
          );
        }
        if (bodyEls.length)
          tl.from(bodyEls, { y: 22, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.6);

        // hero mark drifts slower than the page — parallax depth
        if (markEl && heroSection)
          gsap.to(markEl, {
            yPercent: 16,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });

        /* ---------- GENERIC scroll reveals (everything below the hero) ---------- */
        const generic = gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".reveal"))
          .filter((el) => !el.closest("header.hero"));

        gsap.set(generic, { opacity: 0, y: 30 });
        ScrollTrigger.batch(generic, {
          start: "top 86%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.1,
              overwrite: true,
            }),
        });

        /* ---------- STATEMENT — word-by-word brighten on scrub ---------- */
        const stmt = root.querySelector<HTMLElement>(".statement p");
        if (stmt) {
          const s = new SplitText(stmt, { type: "words" });
          splits.push(s);
          gsap.set(s.words, { opacity: 0.14 });
          gsap.to(s.words, {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: stmt,
              start: "top 78%",
              end: "bottom 58%",
              scrub: true,
            },
          });
        }

        /* ---------- REELS — browser frames rise + settle from scale ---------- */
        root.querySelectorAll<HTMLElement>(".reels .reel-item").forEach((item) => {
          const browser = item.querySelector(".browser");
          if (!browser) return;
          gsap.from(browser, {
            yPercent: 8,
            scale: 0.94,
            opacity: 0,
            duration: 1.05,
            ease: "power3.out",
            transformOrigin: "50% 50%",
            scrollTrigger: { trigger: item, start: "top 82%" },
          });
        });

        /* ---------- OUTCOME — count up the big numbers ---------- */
        root.querySelectorAll<HTMLElement>(".out-num .out-n").forEach((el) => {
          const target = parseFloat(el.textContent || "0");
          if (Number.isNaN(target)) return;
          const counter = { v: 0 };
          el.textContent = "0";
          gsap.to(counter, {
            v: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(counter.v));
            },
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        /* ---------- CTA — gentle, inviting arrow bob ---------- */
        const arrow = root.querySelector(".cta-link svg");
        if (arrow)
          gsap.to(arrow, {
            x: 8,
            duration: 0.9,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });

        return () => splits.forEach((s) => s.revert());
      });
    }, root);

    // re-measure once webfonts settle (SplitText line breaks depend on them)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      smoother.kill();
    };
  }, [ready, rootRef]);
}

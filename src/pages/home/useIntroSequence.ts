import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { signalHeroReveal } from "./intro";

/**
 * Drives the AWWWARDS-style loading screen and its hand-off into the hero.
 * A counter eases up while fonts load; at 100% the dark curtain "mists out"
 * (content + panel fade away), then a single ink droplet falls from above the
 * viewport onto the screen centre. On impact, signalHeroReveal() fires: a
 * splash ring bursts from the centre and the reveal wave ripples outward,
 * surfacing the hero text behind it — like a drop landing on a still lake.
 */
export function useIntroSequence(refs: {
  rootRef: RefObject<HTMLDivElement | null>;
  numRef: RefObject<HTMLSpanElement | null>;
  barRef: RefObject<HTMLSpanElement | null>;
}): void {
  const { rootRef, numRef, barRef } = refs;
  useEffect(() => {
    const root = rootRef.current;
    const numEl = numRef.current;
    const barEl = barRef.current;
    if (!root || !numEl || !barEl) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const drop = root.querySelector<HTMLElement>(".intro-drop");

    const prog = { v: 0 };
    const render = () => {
      numEl.textContent = String(Math.round(prog.v * 100));
      barEl.style.transform = `scaleX(${prog.v})`;
    };
    render();

    // Reduced motion: skip the show, reveal the hero immediately.
    if (reduce) {
      prog.v = 1;
      render();
      signalHeroReveal();
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          root.style.display = "none";
        },
      });
      return;
    }

    const content = root.querySelectorAll<HTMLElement>("[data-intro-fade]");

    const ctx = gsap.context(() => {
      // Loader content settles in
      gsap.from(content, {
        autoAlpha: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });

      // Counter eases toward 90% while we wait for fonts
      gsap.to(prog, {
        v: 0.9,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: render,
      });
    }, root);

    let exitTl: gsap.core.Timeline | undefined;

    // Mist out, then the droplet falls to the centre of the lake.
    const runHandoff = () => {
      // Fall from just above the viewport to the screen centre.
      const fallFrom = -(window.innerHeight / 2 + 40);

      exitTl = gsap.timeline({
        onComplete: () => {
          root.style.display = "none";
        },
      });
      exitTl
        // name / counter / bar mist away…
        .to(content, { autoAlpha: 0, y: -16, duration: 0.5, ease: "power2.in" }, 0)
        // …and the dark panel dissolves to nothing, exposing the white hero.
        // (Background only — the root stays mounted so the droplet is visible.)
        .to(root, { backgroundColor: "rgba(13,13,13,0)", duration: 0.7, ease: "power2.inOut" }, 0.1)
        // the droplet falls, accelerating like gravity
        .fromTo(
          drop,
          { y: fallFrom, autoAlpha: 1 },
          { y: 0, duration: 0.6, ease: "power2.in" },
          0.7,
        )
        // impact: splash ring + reveal wave ripple out from the centre
        .add(signalHeroReveal, 1.3)
        // the droplet submerges into its own splash
        .to(drop, { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 1.3);
    };

    let exited = false;
    const playExit = () => {
      if (exited) return;
      exited = true;
      // Complete the counter, then run the hand-off.
      gsap.to(prog, {
        v: 1,
        duration: 0.45,
        ease: "power2.inOut",
        onUpdate: render,
        onComplete: runHandoff,
      });
    };

    // Real gate: fonts ready AND a minimum on-screen time so it never flashes.
    let settled = false;
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 1300)),
    ]).then(() => {
      settled = true;
      playExit();
    });

    // Safety: never trap the user behind the loader if fonts hang.
    const failsafe = window.setTimeout(() => {
      if (!settled) playExit();
    }, 6000);

    return () => {
      ctx.revert();
      exitTl?.kill();
      clearTimeout(failsafe);
    };
  }, [rootRef, numRef, barRef]);
}

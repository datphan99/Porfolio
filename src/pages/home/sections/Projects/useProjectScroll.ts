import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useProjectScroll(refs: {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  statementRef: RefObject<HTMLHeadingElement | null>;
  cardRefs: RefObject<(HTMLElement | null)[]>;
}): void {
  const { sectionRef, stageRef, statementRef, cardRefs } = refs;
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      document.body.classList.add("no-anim");
      return;
    }

    const cards = cardRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    const N = cards.length;
    const clamp = gsap.utils.clamp;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    const MIST_END = 0.1;
    const FIRST = 0.14;
    const OVERLAP = 0.66;
    const WIN = (1 - FIRST) / ((N - 1) * OVERLAP + 1);
    const STRIDE = OVERLAP * WIN;

    function render(p: number) {
      const vh = window.innerHeight;
      const startY = 0.62 * vh;
      const endY = -0.62 * vh;

      const mp = clamp(0, 1, p / MIST_END);
      const fadeOut = clamp(0, 1, (p - 0.95) / 0.05);
      gsap.set(statementRef.current, {
        opacity: mp * (1 - fadeOut),
        filter: `blur(${((1 - mp) * 24 + fadeOut * 18).toFixed(2)}px)`,
        scale: 1 + (1 - mp) * 0.04 - fadeOut * 0.02,
      });

      for (let i = 0; i < N; i++) {
        const sp = (p - (FIRST + i * STRIDE)) / WIN;
        let y, vis;
        if (sp <= 0) {
          y = startY;
          vis = 0;
        } else if (sp >= 1) {
          y = endY;
          vis = 0;
        } else {
          y = lerp(startY, endY, sp);
          const fin = clamp(0, 1, sp / 0.14);
          const fout = clamp(0, 1, (1 - sp) / 0.14);
          vis = Math.min(fin, fout);
        }
        gsap.set(cards[i], { yPercent: -50, y, autoAlpha: vis });
      }
    }

    let targetP = 0,
      curP = 0,
      raf: number;
    function loop() {
      curP += (targetP - curP) * 0.08;
      if (Math.abs(targetP - curP) < 0.00015) curP = targetP;
      render(curP);
      raf = requestAnimationFrame(loop);
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: stageRef.current,
      anticipatePin: 1,
      onUpdate: (self) => {
        targetP = self.progress;
      },
      onRefresh: (self) => {
        targetP = self.progress || 0;
      },
    });

    render(0);
    loop();

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      st.kill();
    };
  }, []);
}

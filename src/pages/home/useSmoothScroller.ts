import { useEffect } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export function useSmoothScroller(): void {
  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
      normalizeScroll: true,
    });
    return () => smoother.kill();
  }, []);
}

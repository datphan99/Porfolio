import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

export function useCareerReveal(sectionRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      // Header block
      gsap.fromTo(
        '.career-headings',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.career-header', start: 'top 83%' },
        },
      );

      // CV button beside the heading
      gsap.fromTo(
        '.career-cv',
        { opacity: 0, x: 20 },
        {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.career-header', start: 'top 83%' },
        },
      );

      // Career rows draw in with stagger and a subtle clip-from-bottom feel
      gsap.fromTo(
        '.career-row',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.75, ease: 'power3.out',
          stagger: 0.13,
          scrollTrigger: { trigger: '.career-list', start: 'top 85%' },
        },
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef },
  );
}

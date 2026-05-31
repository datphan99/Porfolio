import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

import Nav     from './components/Nav.jsx';
import Hero    from './sections/Hero.jsx';
import Hello   from './sections/Hello.jsx';
import Skills    from './sections/Skills.jsx';
import Projects  from './sections/Projects.jsx';
import Career    from './sections/Career.jsx';
import { profile } from './data/portfolio.js';

// Must live at module scope — never inside a component or hook
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, useGSAP);

function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    // Lenis drives the RAF loop; ScrollTrigger.update() keeps scroll-based
    // animations in sync with Lenis's virtual scroll position.
    function raf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      window.requestAnimationFrame(raf);
    }

    const frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}

export default function App() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      <Nav />
      <Hero />
      <Hello />
      <Skills />
      <Projects />
      <Career />
      <footer
        className="flex justify-between items-center px-8 py-7 border-t border-black/[0.08] text-sm text-black/50"
        id="contact"
      >
        <span>{profile.name}</span>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1 text-[#111] font-medium transition-opacity duration-200 hover:opacity-[0.65]"
        >
          Start a project ↗
        </a>
      </footer>
    </div>
  );
}

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

import Nav     from './components/Nav.jsx';
import Hero    from './sections/Hero.jsx';
import Showcase from './sections/Showcase.jsx';
import Hello   from './sections/Hello.jsx';
import Skills  from './sections/Skills.jsx';
import Career  from './sections/Career.jsx';
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
    <div className="app-shell">
      <Nav />
      <Hero />
      <Showcase />
      <Hello />
      <Skills />
      <Career />
      <footer className="site-footer" id="contact">
        <span>{profile.name}</span>
        <a href={`mailto:${profile.email}`}>Start a project ↗</a>
      </footer>
    </div>
  );
}

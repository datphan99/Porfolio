import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';

import Nav     from './components/Nav';
import Hero    from './sections/HeroStatement';
import Hello   from './sections/Hello';
import Skills    from './sections/Skills';
import Projects  from './sections/Projects';
import Career    from './sections/Career';
import { profile } from './data/portfolio';

// Must live at module scope — never inside a component or hook
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, useGSAP);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.4,
      effects: true,        // enables data-speed parallax on sect-inner
      normalizeScroll: true,
    });
    return () => smoother.kill();
  }, []);

  return (
    <>
      <Nav />
      {/* HeroStatement custom cursor — fixed, outside smooth-wrapper so CSS transform doesn't break it */}
      <div data-hs-cursor className="hs-cursor" aria-hidden="true" />
      {/* Night sky — fixed dark layer behind the canvas; opacity scroll-driven from Skills.jsx */}
      <div data-sky className="night-sky" aria-hidden="true" />
      {/* Canvas + caption live OUTSIDE smooth-wrapper so position:fixed works correctly */}
      <canvas ref={canvasRef} className="particle-stage" />
      <div ref={capRef} className="shape-cap" />
      <div id="smooth-wrapper">
      <div id="smooth-content" className="min-h-screen">
        <Hero />
        <Hello />
        <Skills canvasRef={canvasRef} capRef={capRef} />
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
      </div>
    </>
  );
}

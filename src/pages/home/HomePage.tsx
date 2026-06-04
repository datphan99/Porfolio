import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

import { HomeStageContext } from "./HomeStageContext";
import { useSmoothScroller } from "./useSmoothScroller";

import Nav from "./sections/Nav/Nav";
import Hero from "./sections/Hero/Hero";
import Hello from "./sections/Hello/Hello";
import Skills from "../../sections/Skills";
import Projects from "./sections/Projects/Projects";
import Career from "./sections/Career/Career";
import { profile } from "../../data/portfolio";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, useGSAP);

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useSmoothScroller();

  return (
    <HomeStageContext.Provider value={{ canvasRef, capRef, skyRef, cursorRef }}>
      <Nav />
      {/* HeroStatement custom cursor — fixed, outside smooth-wrapper so CSS transform doesn't break it */}
      <div ref={cursorRef} className="hs-cursor" aria-hidden="true" />
      {/* Night sky — fixed dark layer behind the canvas; opacity scroll-driven from Skills.jsx */}
      <div ref={skyRef} data-sky className="night-sky" aria-hidden="true" />
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
    </HomeStageContext.Provider>
  );
}

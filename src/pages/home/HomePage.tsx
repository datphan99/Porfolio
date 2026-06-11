import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

import { HomeStageContext } from "./HomeStageContext";
import { useSmoothScroller } from "./useSmoothScroller";
import LoadingScreen from "./LoadingScreen";

import Hero from "./sections/Hero/Hero";
import Hello from "./sections/Hello/Hello";
import Skills from "./sections/Skills/Skills";
import Projects from "./sections/Projects/Projects";
import Career from "./sections/Career/Career";
import Contact from "./sections/Contact/Contact";
import Footer from "./sections/Footer/Footer";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable, useGSAP);

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useSmoothScroller();

  return (
    <HomeStageContext.Provider value={{ canvasRef, capRef, skyRef, cursorRef }}>
      {/* AWWWARDS-style loading curtain — lifts to hand off into the hero reveal */}
      <LoadingScreen />
      {/* Nav is rendered by RootLayout so it persists across routes */}
      {/* HeroStatement custom cursor — fixed, outside smooth-wrapper so CSS transform doesn't break it */}
      <div ref={cursorRef} className="hs-cursor" aria-hidden="true" />
      {/* Night sky — fixed dark layer behind the canvas; opacity scroll-driven from Skills.jsx */}
      <div ref={skyRef} className="night-sky" aria-hidden="true" />
      {/* Canvas + caption live OUTSIDE smooth-wrapper so position:fixed works correctly */}
      <canvas ref={canvasRef} className="particle-stage" />
      <div ref={capRef} className="shape-cap" />
      <div id="smooth-wrapper">
      <div id="smooth-content" className="min-h-screen">
        <Hero />
        <Hello />
        <Skills />
        <Projects />
        <Career />
        <Contact />
        {/* Night-haze WebGL footer — full-screen closing panel */}
        <Footer />
      </div>
      </div>
    </HomeStageContext.Provider>
  );
}

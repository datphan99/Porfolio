import { useRef } from "react";
import { useHomeStage } from "../../HomeStageContext";
import { useHeroCanvas } from "./useHeroCanvas";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursorRef } = useHomeStage();

  useHeroCanvas(sectionRef, canvasRef, cursorRef);

  return (
    <section
      ref={sectionRef}
      className="hs-hero relative w-screen h-screen overflow-hidden bg-white"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1] block w-full h-full"
      />

      <h1 className="sr-only">Make Every Pixel Pay For Itself</h1>

      {/* TR — menu, appears on mouse movement */}

      {/* BR — scroll cue, fades in after entrance */}
      <div className="hs-corner hs-br hs-quiet pointer-events-none">
        <div className="flex items-center gap-[9px] text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9a9a97]">
          Scroll
          <span className="hs-ln" />
        </div>
      </div>
    </section>
  );
}

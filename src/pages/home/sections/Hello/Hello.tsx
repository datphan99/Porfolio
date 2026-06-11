import { useRef } from "react";
import { useHelloIntro } from "./useHelloIntro";

export default function Hello() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useHelloIntro(sectionRef, stageRef);

  return (
    // min-h-[330vh] tạo scroll space — stage (100vh) pins trong khi phần còn lại drive animation
    <section
      className="relative min-h-[330vh] overflow-hidden"
      id="about"
      ref={sectionRef}
    >
      <div
        className="h-screen flex flex-col items-center justify-center"
        ref={stageRef}
      >
        <div className="container">
          {/* Eyebrow — uppercase micro-label, đồng bộ với sect-index / Hero "Scroll" */}
          <p className="hello-eyebrow text-center mb-10">
            <span className="text-[12px] font-semibold tracking-[0.22em] uppercase text-muted">
              ( Introduction )
            </span>
          </p>

          <div className="hello-stage relative flex items-center justify-center">
            <h2 className="hello-title font-display [font-feature-settings:'salt'_on] text-[clamp(38px,5vw,64px)] font-semibold tracking-[-0.04em] leading-[1.06] text-center text-black max-w-[840px]">
              I craft fast, polished web experiences where clean interfaces,
              smooth interactions, and scalable code come together with purpose.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

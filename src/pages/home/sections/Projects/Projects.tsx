import { useRef } from "react";
import { projects } from "../../../../data/portfolio";
import ProjectCard, { type ProjectCardData } from "./ProjectCard";
import { useProjectScroll } from "./useProjectScroll";

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useProjectScroll({ sectionRef, stageRef, statementRef, cardRefs });

  const mapped: ProjectCardData[] = projects.map((p) => ({
    name: p.name,
    tag: p.role,
    img: p.imageUrl,
    dashboard: p.dashboard,
    caseStudyId: p.caseStudyId,
    placeholder: p.placeholder,
  }));

  return (
    <section
      id="work"
      ref={sectionRef}
      className="projects relative min-h-[380vh]"
    >
      <div
        ref={stageRef}
        className="projects-stage relative h-screen overflow-hidden"
      >
        <p className="absolute top-9 inset-x-0 text-center z-[5] text-[11px] font-medium tracking-[0.24em] uppercase text-white/40">
          Unforgettable experiences
        </p>

        <div className="statement-layer absolute inset-0 grid place-items-center z-[4] pointer-events-none">
          <h2
            ref={statementRef}
            className="statement m-0 whitespace-nowrap font-semibold leading-none tracking-[-0.035em] text-[#eef1f7] text-[clamp(30px,5.4vw,62px)] [will-change:filter,opacity,transform]"
          >
            Unforgettable experiences
          </h2>
        </div>

        {mapped.map((p, i) => (
          <ProjectCard
            key={i}
            p={p}
            i={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}

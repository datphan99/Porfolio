import { useRef } from "react";
import sectionsData from "../../../../data/particleSections.json";
import type { ParticleSection } from "../../../../types";
import { useHomeStage } from "../../HomeStageContext";
import { useParticleField } from "./useParticleField";
import MobileSection from "./MobileSection";

const sections = sectionsData as ParticleSection[];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { canvasRef, capRef, skyRef } = useHomeStage();

  useParticleField({ canvasRef, capRef, skyRef, sectRefs });

  return (
    <section id="skills" ref={sectionRef}>
      {/* ── Desktop: fixed canvas + right-column content (md and up) ── */}
      <div className="hidden md:block particle-content">
        {sections.map((s, i) => (
          <div
            key={s.shape}
            className="sect"
            data-shape={s.shape}
            ref={(el: HTMLDivElement | null) => {
              sectRefs.current[i] = el;
            }}
          >
            <div className="sect-inner" data-speed="0.92">
              <p className="sect-index">{s.index}</p>
              <h2 className="sect-title">{s.title}</h2>
              <p className="sect-desc">{s.desc}</p>
              <div className="sect-lists">
                <div className="list-col">
                  <p className="list-label">Used to unlock</p>
                  <ul>
                    {s.unlock.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="list-col">
                  <p className="list-label">We build</p>
                  <ul>
                    {s.build.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile: inline canvas per section (below md) ── */}
      <div className="md:hidden">
        {sections.map((s) => (
          <MobileSection key={s.shape} s={s} />
        ))}
      </div>
    </section>
  );
}

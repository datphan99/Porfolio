import { useRef } from "react";
import type { ParticleSection } from "../../../../types";
import { useMobileParticles } from "./useMobileParticles";

export default function MobileSection({ s }: { s: ParticleSection }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMobileParticles(canvasRef, s.shape);

  return (
    <div className="px-6 py-14 border-b border-black/[0.07] last:border-0">
      {/* Inline shape canvas */}
      <canvas
        ref={canvasRef}
        className="w-[280px] h-[280px] mx-auto mb-10 block"
      />
      <p className="sect-index">{s.index}</p>
      <h2 className="sect-title !text-[clamp(36px,9vw,52px)]">{s.title}</h2>
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
  );
}

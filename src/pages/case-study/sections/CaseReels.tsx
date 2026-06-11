import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudyWork } from "../caseStudy.types";

export default function CaseReels({
  work,
  basePath,
}: {
  work: CaseStudyWork;
  basePath: string;
}) {
  return (
    <section id="work">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: "clamp(48px,7vh,90px)" }}>
          <div className="label" style={{ marginBottom: 18 }}>
            {work.label}
          </div>
          <h2 className="hero-head" style={{ maxWidth: "18ch" }}>
            <RichText value={work.heading} />
          </h2>
        </div>

        <div className="reels">
          {work.reels.map((r) => (
            <div className="reel-item reveal" key={r.idx}>
              <div className="reel-cap">
                <div className="reel-idx">{r.idx}</div>
                <div className="reel-name">{r.name}</div>
                <p className="reel-desc">{r.desc}</p>
                <div className="reel-tag">{r.tag}</div>
              </div>
              <div className="browser">
                <div className="browser-bar">
                  <div className="dots">
                    <i className="r" />
                    <i className="y" />
                    <i className="g" />
                  </div>
                  <div className="url">
                    <Icon name="lock" />
                    {r.url}
                  </div>
                </div>
                <div className="screen">
                  <iframe src={`${basePath}/${r.src}`} loading="lazy" title={r.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

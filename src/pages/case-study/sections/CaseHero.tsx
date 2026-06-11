import RichText from "../RichText";
import type { CaseStudyHero } from "../caseStudy.types";

export default function CaseHero({ hero }: { hero: CaseStudyHero }) {
  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="reveal">
            <div className="kicker" style={{ marginBottom: 26 }}>
              {hero.kicker}
            </div>
            <h1 className="hero-mark">
              {hero.mark.line1}
              <span className="l2">{hero.mark.line2}</span>
            </h1>
          </div>
          <div className="reveal">
            <h2 className="hero-head">
              <RichText value={hero.headline} />
            </h2>
            <div className="hero-body">
              {hero.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

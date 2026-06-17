import RichText from "../RichText";
import type { CaseStudyProblems } from "../caseStudy.types";

export default function CaseProblems({
  problems,
}: {
  problems: CaseStudyProblems;
}) {
  return (
    <section className="section-pad-b">
      <div className="wrap">
        <div className="prb-header reveal">
          <span className="label">{problems.label}</span>
          <h2 className="prb-title">
            <RichText value={problems.title} />
          </h2>
        </div>
        <div className="prb-grid reveal">
          {problems.items.map((item, i) => (
            <div className="prb-card" key={i}>
              <div className="prb-num">{item.num}</div>
              <div className="label prb-clabel">{item.label}</div>
              <p className="prb-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

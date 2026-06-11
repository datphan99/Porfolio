import type { CaseStudyOutcome } from "../caseStudy.types";

export default function CaseOutcome({
  outcome,
}: {
  outcome: CaseStudyOutcome;
}) {
  return (
    <section id="outcome" className="section-pad-b">
      <div className="wrap">
        <div className="label reveal" style={{ marginBottom: 40 }}>
          {outcome.label}
        </div>
        <div className="outcome reveal">
          {outcome.cells.map((c, i) => (
            <div className="out-cell" key={i}>
              <div className="out-num">
                <span className="out-n">{c.num}</span>
                {c.suffix && <span style={{ fontSize: "0.5em" }}>{c.suffix}</span>}
              </div>
              <div className="out-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

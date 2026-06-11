import type { CaseStudyMetaCell } from "../caseStudy.types";

export default function CaseMeta({ meta }: { meta: CaseStudyMetaCell[] }) {
  return (
    <div className="wrap reveal">
      <div className="meta">
        {meta.map((c, i) => (
          <div className="cell" key={i}>
            <div className="mlabel">{c.label}</div>
            <div className="mval">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

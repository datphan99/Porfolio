import RichText from "../RichText";
import type { RichText as RichTextData } from "../caseStudy.types";

export default function CaseStatement({
  statement,
}: {
  statement: RichTextData;
}) {
  return (
    <section className="statement section-pad-b">
      <div className="wrap reveal">
        <p>
          <RichText value={statement} />
        </p>
      </div>
    </section>
  );
}

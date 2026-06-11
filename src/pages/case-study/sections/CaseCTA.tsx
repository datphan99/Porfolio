import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudy } from "../caseStudy.types";

export default function CaseCTA({ cta }: { cta: CaseStudy["cta"] }) {
  return (
    <section id="contact" className="cta">
      <div className="wrap reveal">
        <h2>
          <RichText value={cta.heading} />
        </h2>
        <a className="cta-link" href={cta.href}>
          {cta.linkLabel}
          <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}

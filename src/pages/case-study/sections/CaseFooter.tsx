import type { CaseStudy } from "../caseStudy.types";

export default function CaseFooter({ footer }: { footer: CaseStudy["footer"] }) {
  return (
    <footer className="foot">
      <div className="fl">{footer.left}</div>
      <div className="fr">{footer.right}</div>
    </footer>
  );
}

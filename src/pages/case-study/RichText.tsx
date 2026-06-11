import { Fragment } from "react";
import type { RichText as RichTextData } from "./caseStudy.types";

export default function RichText({ value }: { value: RichTextData }) {
  return (
    <>
      {value.map((seg, i) =>
        typeof seg === "string" ? (
          <Fragment key={i}>{seg}</Fragment>
        ) : (
          <span key={i} className="it">
            {seg.it}
          </span>
        ),
      )}
    </>
  );
}

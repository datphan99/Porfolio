import { useEffect, useRef, useState } from "react";
import RichText from "../RichText";
import { Icon } from "../icons";
import type { CaseStudyOverview } from "../caseStudy.types";

export default function CaseOverview({
  overview,
}: {
  overview: CaseStudyOverview;
}) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  const toggle = () =>
    setOpen((prev) => {
      const next = !prev;
      setHeight(next ? (innerRef.current?.offsetHeight ?? 0) : 0);
      return next;
    });

  // keep the panel sized to its content while open (matches original resize handler)
  useEffect(() => {
    if (!open) return;
    const onResize = () => setHeight(innerRef.current?.offsetHeight ?? 0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <section id="overview" className="section-pad-b">
      <div className="wrap">
        <div className="ov-grid">
          <h2 className="ov-title reveal">
            <RichText value={overview.title} />
          </h2>
          <div>
            <div className="ov-blocks reveal">
              {overview.blocks.map((b, i) => (
                <div className="ov-block" key={i}>
                  <div className="label">{b.label}</div>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>

            <div className="expand-wrap reveal">
              <button
                className="expand-btn"
                aria-expanded={open}
                aria-controls="tech"
                onClick={toggle}
              >
                <span>{open ? "Collapse information" : "Expand information"}</span>
                <Icon name="chevron" className="chev" />
              </button>

              <div
                className="tech"
                id="tech"
                style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
              >
                <div className="tech-inner" ref={innerRef}>
                  <div className="tech-h">
                    <RichText value={overview.tech.heading} />
                  </div>
                  <div className="tech-grid">
                    {overview.tech.cells.map((c, i) => (
                      <div className="tech-cell" key={i}>
                        <div className="tlabel">
                          <Icon name={c.icon} />
                          {c.label}
                        </div>
                        <p>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

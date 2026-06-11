import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import type { CaseStudy } from "./caseStudy.types";
import {
  RETURN_SCROLL_KEY,
  useMistNavigate,
} from "../../transition/MistTransition";
import { useCaseStudyMotion } from "./useCaseStudyMotion";
import CaseHero from "./sections/CaseHero";
import CaseMeta from "./sections/CaseMeta";
import CaseOverview from "./sections/CaseOverview";
import CaseStatement from "./sections/CaseStatement";
import CaseReels from "./sections/CaseReels";
import CaseOutcome from "./sections/CaseOutcome";
import CaseCTA from "./sections/CaseCTA";
import CaseFooter from "./sections/CaseFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const CSS_HREF = "/case-studies/case.css";
const CSS_ID = "case-study-css";

type Status = "loading" | "ready" | "error";

export default function CaseStudyPage() {
  const { id } = useParams<{ id: string }>();
  const basePath = `/case-studies/case-study-${id}`;
  const [data, setData] = useState<CaseStudy | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useMistNavigate();

  // Mist back to the exact Projects scroll position the visitor came from.
  const goBack = () => {
    const y = Number(sessionStorage.getItem(RETURN_SCROLL_KEY) ?? "0");
    navigate("/", { scrollY: Number.isFinite(y) ? y : 0 });
  };

  // Inject the page CSS only while this route is mounted (keeps the light
  // theme + its :root vars off the dark home). Guarded by id for StrictMode.
  useEffect(() => {
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement("link");
      link.id = CSS_ID;
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }
    return () => {
      document.getElementById(CSS_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetch(`${basePath}/case.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((j: CaseStudy) => {
        if (alive) {
          setData(j);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [basePath]);

  useEffect(() => {
    if (data?.title) document.title = data.title;
  }, [data]);

  // ScrollSmoother + all scroll choreography, scoped to #smooth-content.
  useCaseStudyMotion(status === "ready", contentRef);

  if (status === "loading") return null;

  if (status === "error" || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Case study not found.</p>
        <Link to="/">← Back home</Link>
      </div>
    );
  }

  return (
    <>
      {/* The shared site header is rendered by RootLayout (fixed, outside the
          smooth-wrapper) so it persists across routes. */}
      <button
        onClick={goBack}
        aria-label="Back to projects"
        className={
          `fixed left-6 bottom-6 z-[80] inline-flex items-center gap-2 ` +
          `rounded-full bg-[#15161a] text-white text-[14px] font-semibold ` +
          `tracking-[-0.01em] px-5 py-3 [font-family:var(--font-sans)] ` +
          `cursor-pointer shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ` +
          `transition-transform duration-200 hover:scale-[1.04]`
        }
      >
        ← Back
      </button>
      <div id="smooth-wrapper">
        <div id="smooth-content" ref={contentRef}>
          <CaseHero hero={data.hero} />
          <CaseMeta meta={data.meta} />
          <CaseOverview overview={data.overview} />
          <CaseStatement statement={data.statement} />
          <CaseReels work={data.work} basePath={basePath} />
          <CaseOutcome outcome={data.outcome} />
          <CaseCTA cta={data.cta} />
          <CaseFooter footer={data.footer} />
        </div>
      </div>
    </>
  );
}

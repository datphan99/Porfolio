import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import CaseStudyPage from "./CaseStudyPage";
import type { CaseStudy } from "./caseStudy.types";

const SAMPLE: CaseStudy = {
  title: "Fund Portal — Case Study",
  nav: { brand: "Studio", links: [{ href: "#overview", label: "Overview" }] },
  hero: {
    kicker: "Case study — Fintech platform",
    mark: { line1: "Fund", line2: "Portal" },
    headline: ["Designing ", { it: "trust" }, " into everyday fund operations."],
    body: ["First paragraph.", "Second paragraph."],
  },
  meta: [{ label: "Role", value: "Product design" }],
  overview: {
    title: ["Project", { it: "overview" }],
    blocks: [{ label: "Challenge", text: "Make it effortless." }],
    tech: {
      heading: ["Under the hood."],
      cells: [{ icon: "architecture", label: "Architecture", text: "React lib." }],
    },
  },
  statement: ["Operations move faster when the interface ", { it: "gets out of the way." }],
  work: {
    label: "Motion & interaction",
    heading: ["Four flows, captured as they ", { it: "behave" }, " in product."],
    reels: [
      {
        idx: "01",
        name: "Orders",
        desc: "Maker–checker approvals.",
        tag: "Approval flow",
        url: "portal.northcrest.capital/orders",
        src: "anim-orders.html",
      },
    ],
  },
  outcome: {
    label: "Outcome",
    cells: [{ num: "9", desc: "operational surfaces" }],
  },
  cta: {
    heading: ["Have a platform that deserves ", { it: "the same care?" }],
    linkLabel: "Start a conversation",
    href: "mailto:hello@studio.com",
  },
  footer: { left: "Fund Portal — case study", right: "© 2026" },
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/case-study/:id" element={<CaseStudyPage />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  document.getElementById("case-study-css")?.remove();
});

test("renders a case study from fetched JSON", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => SAMPLE,
  } as Response);

  renderAt("/case-study/1");

  // hero headline (RichText: plain + italic accent)
  expect(await screen.findByText(/Designing/)).toBeInTheDocument();
  expect(screen.getByText("trust")).toHaveClass("it");
  // a reel name + its iframe pointing into the case folder
  expect(screen.getByText("Orders")).toBeInTheDocument();
  expect(screen.getByTitle("Orders")).toHaveAttribute(
    "src",
    "/case-studies/case-study-1/anim-orders.html",
  );
  // page CSS link injected
  expect(document.getElementById("case-study-css")).not.toBeNull();
});

test("shows a not-found state when the case JSON is missing", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);

  renderAt("/case-study/999");

  expect(await screen.findByText("Case study not found.")).toBeInTheDocument();
});

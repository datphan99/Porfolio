/** Inline rich text: plain strings render as text; { it } renders the italic
 *  Newsreader accent (<span class="it">). */
export type RichText = (string | { it: string })[];

export interface CaseStudyNav {
  brand: string;
  links: { href: string; label: string }[];
}

export interface CaseStudyHero {
  kicker: string;
  mark: { line1: string; line2: string };
  headline: RichText;
  body: string[];
}

export interface CaseStudyMetaCell {
  label: string;
  value: string;
}

export interface CaseStudyTechCell {
  icon: string;
  label: string;
  text: string;
}

export interface CaseStudyOverview {
  title: RichText;
  blocks: { label: string; text: string }[];
  tech: { heading: RichText; cells: CaseStudyTechCell[] };
}

export interface CaseStudyReel {
  idx: string;
  name: string;
  desc: string;
  tag: string;
  url: string;
  src: string;
}

export interface CaseStudyWork {
  label: string;
  heading: RichText;
  reels: CaseStudyReel[];
}

export interface CaseStudyOutcome {
  label: string;
  cells: { num: string; suffix?: string; desc: string }[];
}

export interface CaseStudyProblem {
  num: string;
  label: string;
  text: string;
}

export interface CaseStudyProblems {
  label: string;
  title: RichText;
  items: CaseStudyProblem[];
}

export interface CaseStudy {
  title: string;
  nav: CaseStudyNav;
  hero: CaseStudyHero;
  meta: CaseStudyMetaCell[];
  overview: CaseStudyOverview;
  problems?: CaseStudyProblems;
  statement: RichText;
  work: CaseStudyWork;
  outcome: CaseStudyOutcome;
  cta: { heading: RichText; linkLabel: string; href: string };
  footer: { left: string; right: string };
}

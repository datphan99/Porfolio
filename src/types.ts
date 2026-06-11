export interface Profile {
  name: string;
  role: string;
  location: string;
  summary: string;
  email: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface ShowcaseItem {
  id: number;
  alt: string;
  tag: string | null;
}

export interface HelloPill {
  id: string;
  label: string;
  icon: string;
  color: string;
  side: "left" | "right";
}

export interface Skill {
  id: number;
  tag: string;
  name: string;
  description: string;
  items: string[];
}

export interface CareerEntry {
  role: string;
  company: string;
  period: string;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  videoUrl: string | null;
  detailUrl: string;
  tags: string;
  year: string;
  /** When set, the project card links to /case-study/{caseStudyId}. */
  caseStudyId?: number;
  /** Renders the live 3D dashboard case-study visual instead of an image. */
  dashboard?: boolean;
  /** Renders an "in progress" placeholder card instead of an image. */
  placeholder?: boolean;
}

export interface ParticleSection {
  shape: string;
  index: string;
  title: string;
  desc: string;
  unlock: string[];
  build: string[];
}

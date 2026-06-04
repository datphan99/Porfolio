import type {
  Profile,
  NavLink,
  ShowcaseItem,
  HelloPill,
  Skill,
  CareerEntry,
  Project,
} from "../types";

export const profile: Profile = {
  name: "Dat Phan",
  role: "Dat Phan / Frontend Developer",
  location: "Ho Chi Minh City, Vietnam",
  summary:
    "I build polished web experiences with React, motion systems, and clean interaction details.",
  email: "hello@example.com",
};

export const navLinks: NavLink[] = [
  { href: "#about", label: "Process" },
  { href: "#work", label: "Portfolio" },
  { href: "#skills", label: "Skills" },
  { href: "#career", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export const showcaseItems: ShowcaseItem[] = [
  { id: 1, alt: "Project 1", tag: null },
  { id: 2, alt: "Project 2", tag: "Freelance" },
  { id: 3, alt: "Project 3", tag: null },
  { id: 4, alt: "Project 4", tag: null },
];

export const helloPills: HelloPill[] = [
  {
    id: "a",
    label: "Design systems",
    icon: "▦",
    color: "#ff6a2b",
    side: "left",
  },
  { id: "b", label: "UX Design", icon: "▢", color: "#1c1c1c", side: "left" },
  { id: "c", label: "Research", icon: "◎", color: "#2b8bff", side: "left" },
  { id: "d", label: "Animation", icon: "∿", color: "#27d07a", side: "right" },
  { id: "e", label: "Branding", icon: "▤", color: "#ff2bb5", side: "right" },
  { id: "f", label: "Strategy", icon: "⋈", color: "#ffcf26", side: "right" },
];

export const skills: Skill[] = [
  {
    id: 1,
    tag: "Top performing",
    name: "01. Web Design",
    description:
      "I design no-code websites that are responsive, mobile-friendly, and SEO-ready. Every site is built for usability, speed, and modern design.",
    items: [
      "Figma",
      "Framer",
      "Webflow",
      "Vercel",
      "WordPress",
      "Elementor",
      "Avada",
      "Experienced with AI builders",
    ],
  },
  {
    id: 2,
    tag: "MVP & go-to-market",
    name: "02. Product Design",
    description:
      "From first sketch to shipped product — I design SaaS dashboards and mobile apps that feel obvious to use and easy to grow.",
    items: ["SaaS dashboards", "Mobile apps", "Prototyping", "Design QA"],
  },
  {
    id: 3,
    tag: "Foundations",
    name: "03. UI / UX Systems",
    description:
      "Design tokens, component libraries, and documentation that keep fast-moving teams consistent and accessible by default.",
    items: [
      "Design tokens",
      "Component libraries",
      "Documentation",
      "Accessibility audits",
    ],
  },
  {
    id: 4,
    tag: "Print & identity",
    name: "04. Graphic Design",
    description:
      "Posters, packaging, editorial layouts, merch — graphic work that carries a brand voice off-screen into the real world.",
    items: ["Print & editorial", "Posters", "Packaging", "Merchandise"],
  },
  {
    id: 5,
    tag: "Brand identity",
    name: "05. Visual Design",
    description:
      "Logos, type systems, and art direction that give a brand a clear point of view — recognisable across every touchpoint.",
    items: ["Brand identity", "Logo systems", "Typography", "Art direction"],
  },
  {
    id: 6,
    tag: "Motion & story",
    name: "06. Video Editing",
    description:
      "Short-form content, brand films, and motion graphics — edited with pacing, color, and sound design that hold attention.",
    items: [
      "Short-form content",
      "Brand films",
      "Motion graphics",
      "Color & sound",
    ],
  },
  {
    id: 7,
    tag: "Growth",
    name: "07. Digital Marketing",
    description:
      "Campaign strategy, ad creative, and analytics — turning design into measurable outcomes for the business.",
    items: [
      "Campaign strategy",
      "Ad creative",
      "Email design",
      "Analytics & reporting",
    ],
  },
  {
    id: 8,
    tag: "Always on",
    name: "08. Social Media Marketing",
    description:
      "Content calendars, reels, and paid social — building an audience that recognises the brand and keeps coming back.",
    items: [
      "Content calendars",
      "Reels & shorts",
      "Community management",
      "Paid social",
    ],
  },
];

export const careerEntries: CareerEntry[] = [
  {
    role: "Creative Designer",
    company: "TryHackMe LLC",
    period: "2025 – Current",
  },
  {
    role: "Founder / Creative Director",
    company: "DirectlyNik™",
    period: "2023 – Current",
  },
  { role: "Head of Design", company: "Involve", period: "2024 – 2025" },
];

export const projects: Project[] = [
  {
    id: 1,
    name: "San Miguel",
    role: "America's Cup",
    imageUrl: "https://placehold.co/1200x800/2b3b34/ffffff?text=San+Miguel",
    videoUrl: null,
    detailUrl: "#",
    tags: "Brand · Web · Motion",
    year: "2025",
  },
  {
    id: 2,
    name: "Atlas Finance",
    role: "Product Design",
    imageUrl: "https://placehold.co/1200x800/c9c5bc/15161a?text=Atlas",
    videoUrl: null,
    detailUrl: "#",
    tags: "Product Design",
    year: "2025",
  },
  {
    id: 3,
    name: "Helios Studio",
    role: "Brand System",
    imageUrl: "https://placehold.co/1200x800/1b1b1d/ffffff?text=Helios",
    videoUrl: null,
    detailUrl: "#",
    tags: "Brand · Web",
    year: "2024",
  },
  {
    id: 4,
    name: "Field Notes",
    role: "Editorial",
    imageUrl: "https://placehold.co/1200x800/8e8b83/ffffff?text=Field+Notes",
    videoUrl: null,
    detailUrl: "#",
    tags: "Editorial · Motion",
    year: "2024",
  },
];

export const services: unknown[] = [];

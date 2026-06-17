/**
 * Content barrel — the single import surface for all site content.
 *
 * Each section's data lives in its own JSON file in this folder (edit those to
 * change copy; no TypeScript needed). This module imports each JSON and
 * re-exports it with the proper type from `../types`, so consumers keep full
 * type-safety while content stays in plain, scalable JSON.
 *
 *   To add a project        → edit projects.json
 *   To add a career entry   → edit career.json
 *   To add a skill section  → edit skills.json
 *   To add a whole new data set → add <name>.json + one typed line below
 */
import type {
  Profile,
  NavLink,
  CareerEntry,
  Project,
  ParticleSection,
} from "../types";

import profileData from "./profile.json";
import navData from "./nav.json";
import projectsData from "./projects.json";
import careerData from "./career.json";
import contactData from "./contact.json";
import skillsData from "./skills.json";

export const profile: Profile = profileData;
export const navLinks: NavLink[] = navData;
export const projects: Project[] = projectsData as Project[];
export const careerEntries: CareerEntry[] = careerData;
export const particleSections: ParticleSection[] = skillsData as ParticleSection[];
export const contactOpportunityTypes: string[] = contactData.opportunityTypes;

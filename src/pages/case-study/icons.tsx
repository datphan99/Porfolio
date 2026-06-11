import type { ReactNode } from "react";

// Inner SVG markup per icon key, copied from the source case-study HTML.
// White-stroked glyphs (navMark, chevron) sit on the dark ink button/mark;
// the rest inherit currentColor.
const GLYPHS: Record<string, ReactNode> = {
  navMark: (
    <path d="M4 16l5-7 4 4 7-9" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevron: (
    <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrow: (
    <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2} stroke="currentColor" strokeWidth={2} />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth={2} />
    </>
  ),
  architecture: (
    <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  ),
  designSystem: (
    <>
      <circle cx={12} cy={12} r={8} stroke="currentColor" strokeWidth={2} />
      <path d="M12 4v16" stroke="currentColor" strokeWidth={2} />
    </>
  ),
  makerChecker: (
    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  dataViz: (
    <path d="M4 18V6m0 12l5-5 4 3 7-8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
  accessControl: (
    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
  ),
  importExport: (
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      {GLYPHS[name] ?? GLYPHS.architecture}
    </svg>
  );
}

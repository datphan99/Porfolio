interface About {
  id: string;
  workPlace: string;
  position: string;
  date: string;
  description: string;
}

export const about: About[] = [
  {
    id: "PHS",
    workPlace: "Phu Hung Securities",
    position: "Frontend Developer ",
    date: "Sep 2025 - Jan 2026",
    description:
      "Modernized a legacy internal dashboard using Nuxt.js by improving UI/UX, optimizing first-page rendering with SSR data hydration, and refactoring reusable components to enhance performance and maintainability",
  },
  {
    id: "ADVN",
    workPlace: "ADVN Sofware",
    position: "Frontend Developer",
    date: "Nov 2024 - Dec 2024",
    description:
      "Supported daily operations, optimized website performance with efficient coding practices, and developed interactive features using Next.js to improve user engagement and overall user experience.",
  },
];

/// <reference types="vite/client" />

// GSAP's ScrollSmoother attaches itself to window; the code feature-detects it.
declare global {
  interface Window {
    ScrollSmoother?: typeof import("gsap/ScrollSmoother").ScrollSmoother;
  }
}

export {};

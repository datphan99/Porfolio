import '@testing-library/jest-dom/vitest';

window.matchMedia =
  window.matchMedia ||
  function matchMedia() {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  };

window.requestAnimationFrame =
  window.requestAnimationFrame ||
  function requestAnimationFrame(callback: FrameRequestCallback) {
    return window.setTimeout(() => callback(Date.now()), 16);
  };
globalThis.requestAnimationFrame = window.requestAnimationFrame;

window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  function cancelAnimationFrame(frame: number) {
    window.clearTimeout(frame);
  };
globalThis.cancelAnimationFrame = window.cancelAnimationFrame;

window.scrollTo = function scrollTo() {};

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [] as IntersectionObserverEntry[];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
}

window.IntersectionObserver =
  window.IntersectionObserver ||
  (IntersectionObserverMock as unknown as typeof IntersectionObserver);
globalThis.IntersectionObserver = window.IntersectionObserver;

// jsdom has no canvas rendering context; every getContext caller in the app
// early-returns on null, so a null stub lets the tree mount without throwing.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;

// jsdom's FontFaceSet stub is incomplete (missing addEventListener/removeEventListener).
// GSAP SplitText calls fonts.removeEventListener on cleanup, so we replace document.fonts
// with a minimal stub that satisfies all callers.  The never-resolving `ready` promise
// keeps the hero's font-await branch synchronous so no async canvas draw fires.
Object.defineProperty(document, "fonts", {
  configurable: true,
  writable: true,
  value: {
    ready: new Promise<void>(() => {}),
    addEventListener: () => {},
    removeEventListener: () => {},
    check: () => true,
    load: () => Promise.resolve([]),
  },
});

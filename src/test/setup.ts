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

// jsdom has no canvas rendering context; every getContext caller in the app
// early-returns on null, so a null stub lets the tree mount without throwing.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;

// jsdom may not implement FontFaceSet; the hero fallback awaits document.fonts.ready.
// A never-resolving promise keeps the test synchronous (no async canvas draw).
if (!("fonts" in document)) {
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: new Promise<void>(() => {}) },
  });
}

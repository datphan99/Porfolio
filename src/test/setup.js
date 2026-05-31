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
  function requestAnimationFrame(callback) {
    return window.setTimeout(() => callback(Date.now()), 16);
  };

window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  function cancelAnimationFrame(frame) {
    window.clearTimeout(frame);
  };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

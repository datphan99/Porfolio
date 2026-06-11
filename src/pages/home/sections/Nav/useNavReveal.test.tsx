import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Capture what the hook asks GSAP / ScrollTrigger to do, without running real
// tweens or a real scroller.
const toSpy = vi.fn();
const setSpy = vi.fn();
vi.mock("gsap", () => ({
  default: {
    set: (...a: unknown[]) => setSpy(...a),
    to: (...a: unknown[]) => toSpy(...a),
  },
}));

let captured: { onUpdate: (s: { direction: number }) => void } | null = null;
const killSpy = vi.fn();
vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    create: (cfg: typeof captured) => {
      captured = cfg;
      return { kill: killSpy };
    },
  },
}));

// Toggle whether a smoother is "live" — the hook must wait for it.
let smoother: object | null = {};
vi.mock("gsap/ScrollSmoother", () => ({
  ScrollSmoother: { get: () => smoother },
}));

import { useNavReveal } from "./useNavReveal";

describe("useNavReveal", () => {
  beforeEach(() => {
    captured = null;
    toSpy.mockClear();
    setSpy.mockClear();
    smoother = {};
  });

  it("hides the eyebrow on mount and builds the trigger once the smoother is live", () => {
    const el = document.createElement("button");
    const ref = { current: el as HTMLElement };
    renderHook(() => useNavReveal(ref));
    expect(setSpy).toHaveBeenCalledWith(
      el,
      expect.objectContaining({ opacity: 0, pointerEvents: "none" }),
    );
    expect(captured).toBeTruthy();
  });

  it("reveals on scroll up and hides on scroll down", () => {
    const el = document.createElement("button");
    const ref = { current: el as HTMLElement };
    renderHook(() => useNavReveal(ref));

    captured!.onUpdate({ direction: -1 });
    expect(toSpy).toHaveBeenLastCalledWith(
      el,
      expect.objectContaining({ opacity: 1, pointerEvents: "auto" }),
    );

    captured!.onUpdate({ direction: 1 });
    expect(toSpy).toHaveBeenLastCalledWith(
      el,
      expect.objectContaining({ opacity: 0, pointerEvents: "none" }),
    );
  });
});

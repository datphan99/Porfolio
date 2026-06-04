import { useEffect, type RefObject } from "react";
import { SVGS, sample, shuffle, toN } from "./particles";

export function useMobileParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  shape: string,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Alias narrowed non-null values so closures can reference them safely
    const cv = canvas;
    const context = ctx;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const size = cv.offsetWidth || 280;

    cv.width = size * DPR;
    cv.height = size * DPR;
    cv.style.width = size + "px";
    cv.style.height = size + "px";
    context.setTransform(DPR, 0, 0, DPR, 0, 0);

    const N = 420;
    const cx = size / 2,
      cy = size / 2;
    const D = size * 0.72;

    const px = new Float32Array(N),
      py = new Float32Array(N),
      seed = new Float32Array(N);
    const TX = new Float32Array(N),
      TY = new Float32Array(N);
    let t = 0,
      raf: number;

    function project(rx: number, ry: number): [number, number] {
      const k = D / 200;
      return [cx + (rx - 100) * k, cy + (ry - 100) * k];
    }

    sample(SVGS[shape]).then((pool) => {
      const { x, y } = toN(shuffle(pool), N);
      for (let i = 0; i < N; i++) {
        const [tx, ty] = project(x[i], y[i]);
        TX[i] = tx;
        TY[i] = ty;
        // start scattered, converge into shape
        px[i] = tx + (Math.random() - 0.5) * D * 0.5;
        py[i] = ty + (Math.random() - 0.5) * D * 0.5;
        seed[i] = Math.random() * 6.283;
      }

      function frame() {
        t += 0.022;
        context.clearRect(0, 0, size, size);
        context.fillStyle = "#15161a";
        context.globalAlpha = 0.82;
        for (let i = 0; i < N; i++) {
          // Lively idle shimmer — higher amplitude than desktop
          const jx = Math.cos(t * 0.9 + seed[i]) * 4.5;
          const jy = Math.sin(t * 1.15 + seed[i] * 1.4) * 4.5;
          px[i] += (TX[i] + jx - px[i]) * 0.09;
          py[i] += (TY[i] + jy - py[i]) * 0.09;
          context.fillRect(px[i] - 0.75, py[i] - 0.75, 1.5, 1.5);
        }
        raf = requestAnimationFrame(frame);
      }
      frame();
    });

    return () => cancelAnimationFrame(raf);
  }, [shape]);
}

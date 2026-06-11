import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";
import { FOOTER_FRAG, FOOTER_VERT } from "./footerShader";

/**
 * Owns the footer's dithered-waves texture and content reveal.
 * - GL init is null-guarded (jsdom stubs getContext → null; the CSS gradient
 *   layer under the canvas is the fallback).
 * - The rAF loop runs only while the footer is on screen (IntersectionObserver)
 *   so an idle page costs nothing.
 * - The waves drift on their own (time-driven) — no pointer input.
 * - DPR is fixed at 1: the ordered dither wants a coarse, visible pixel grid.
 * - Reduced motion: draw exactly one static frame, no loop.
 */
export function useFooterGlow(
  footerRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  useGSAP(
    () => {
      const footer = footerRef.current;
      const canvas = canvasRef.current;
      if (!footer || !canvas) return;

      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Content reveal — one-shot fade-up as the footer scrolls in
      const targets = footer.querySelectorAll<HTMLElement>("[data-reveal]");
      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 });
      } else {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: footer, start: "top 75%" },
          },
        );
      }

      // ── WebGL texture ────────────────────────────────
      const gl = canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
      }) as WebGLRenderingContext | null;
      if (!gl) return; // CSS gradient fallback stays visible

      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type);
        if (!sh) return null;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
        return sh;
      };
      const vs = compile(gl.VERTEX_SHADER, FOOTER_VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FOOTER_FRAG);
      const prog = gl.createProgram();
      if (!vs || !fs || !prog) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      // one fullscreen triangle
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, "uRes");
      const uTime = gl.getUniformLocation(prog, "uTime");

      const resize = () => {
        // DPR 1 on purpose — the dither's pixel grid should stay coarse
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resize();
      window.addEventListener("resize", resize);

      const t0 = performance.now();
      const draw = () => {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      if (reduce) {
        draw(); // one static frame
        return () => window.removeEventListener("resize", resize);
      }

      // rAF only while the footer is on screen
      let raf = 0;
      let running = false;
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
      io.observe(canvas);

      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      };
    },
    { scope: footerRef },
  );
}

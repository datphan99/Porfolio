import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const LINES = ["Make Every Pixel", "Pay for itself"];

const VERT = [
  "attribute vec2 aPos;",
  "varying vec2 vUv;",
  "void main(){ vUv=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }",
].join("\n");

const FRAG = [
  "precision highp float;",
  "varying vec2 vUv;",
  "uniform sampler2D uTex;",
  "uniform vec2  uMouse;",
  "uniform float uTime;",
  "uniform float uStrength;",
  "uniform float uAspect;",
  "void main(){",
  "  vec2 uv=vUv;",
  "  vec2 d=uv-uMouse; d.x*=uAspect;",
  "  float dist=length(d);",
  "  float falloff=exp(-dist*5.0);",
  "  float ripple=sin(dist*26.0-uTime*4.5)*0.014*falloff*uStrength;",
  "  vec2 dir=normalize(uv-uMouse+1e-6);",
  "  vec2 off=dir*ripple;",
  "  float ca=length(off)*0.9;",
  "  vec2 base=uv+off;",
  "  float r=texture2D(uTex,base+dir*ca).r;",
  "  float g=texture2D(uTex,base).g;",
  "  float b=texture2D(uTex,base-dir*ca).b;",
  "  gl_FragColor=vec4(r,g,b,1.0);",
  "}",
].join("\n");

export default function HeroTagline() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);

  // Entrance animation — frame itself is NOT animated so WebGL is always visible
  useGSAP(
    () => {
      gsap.fromTo(
        ".ht-hint",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.5 },
      );
    },
    { scope: sectionRef },
  );

  // WebGL water-distortion effect
  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Offscreen 2D canvas — text is drawn here and used as GL texture
    const tex2d = document.createElement("canvas");
    const t2 = tex2d.getContext("2d");

    function drawText(w, h) {
      if (!w || !h) return;
      tex2d.width = Math.round(w * DPR);
      tex2d.height = Math.round(h * DPR);
      t2.setTransform(DPR, 0, 0, DPR, 0, 0);
      t2.fillStyle = "#f2f2f0";
      t2.fillRect(0, 0, w, h);
      t2.fillStyle = "#15161a";
      t2.textAlign = "center";
      t2.textBaseline = "middle";
      if ("letterSpacing" in t2) t2.letterSpacing = "0px";

      // Fit widest line to 94% of frame width
      t2.font = "600 100px Inter, sans-serif";
      let widest = 0;
      for (const line of LINES)
        widest = Math.max(widest, t2.measureText(line).width);
      let fs = (100 * (w * 0.94)) / widest;
      fs = Math.min(fs, h * 0.38);
      t2.font = `600 ${fs}px Inter, sans-serif`;
      const lh = fs * 1.06;
      const startY = h / 2 - (lh * (LINES.length - 1)) / 2;
      LINES.forEach((line, i) => t2.fillText(line, w / 2, startY + i * lh));
    }

    // ── Fallback: reduced motion or no WebGL → crisp 2D text only ────────────
    const gl = !reduce
      ? canvas.getContext("webgl", {
          premultipliedAlpha: false,
          antialias: true,
        })
      : null;

    if (!gl) {
      const ctx2 = canvas.getContext("2d");
      function renderFallback() {
        const w = frame.clientWidth,
          h = frame.clientHeight;
        if (!w || !h) return;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        drawText(w, h);
        ctx2.drawImage(tex2d, 0, 0, canvas.width, canvas.height);
      }
      const ro = new ResizeObserver(() => {
        document.fonts.ready.then(renderFallback);
      });
      ro.observe(frame);
      document.fonts.ready.then(renderFallback);
      return () => ro.disconnect();
    }

    // ── Compile shader helper ─────────────────────────────────────────────────
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error("[HeroTagline] shader error:", gl.getShaderInfoLog(s));
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error("[HeroTagline] link error:", gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uStrength = gl.getUniformLocation(prog, "uStrength");
    const uAspect = gl.getUniformLocation(prog, "uAspect");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let W = 0,
      H = 0;
    function resize() {
      W = frame.clientWidth;
      H = frame.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAspect, W / H);
      drawText(W, H);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        tex2d,
      );
    }

    // ResizeObserver: reliably fires when the frame gets a real layout size
    const ro = new ResizeObserver(() => {
      document.fonts.ready.then(resize);
    });
    ro.observe(frame);

    // Pointer tracking
    const mouse = { x: 0.5, y: 0.5 };
    let target = 0,
      strength = 0,
      t = 0,
      raf;

    function setMouse(e) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height; // GL: bottom-left origin
    }
    frame.addEventListener("pointerenter", (e) => {
      target = 1;
      setMouse(e);
    });
    frame.addEventListener("pointermove", setMouse);
    frame.addEventListener("pointerleave", () => {
      target = 0;
    });

    // RAF loop
    function loop() {
      if (!W || !H) resize(); // self-heal
      t += 0.016;
      strength += (target - strength) * 0.08;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uStrength, strength);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    }

    // Kick off — also try immediately and after fonts
    resize();
    document.fonts.ready.then(resize);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      // Note: don't call loseContext() — causes issues with React Strict Mode
      // double-invocation. The context is released when canvas is GC'd.
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f2f2f0] pt-20"
    >
      {/* Light beams from Hero */}

      <div className="relative z-10 flex flex-col items-center gap-5 w-full px-4">
        {/* WebGL tagline frame — always visible, no opacity animation */}
        <div
          ref={frameRef}
          className="tagline-frame w-[min(86vw,900px)] aspect-[3/2] bg-[#f2f2f0] overflow-hidden relative"
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        <p className="ht-hint text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#9b9b97]">
          Scroll down ↓
        </p>
      </div>
    </section>
  );
}

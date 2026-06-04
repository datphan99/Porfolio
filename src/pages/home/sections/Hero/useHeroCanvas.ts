import { useEffect, type RefObject } from "react";
import { LINE1, LINE2, TN, TRACK_EM, VERT, FRAG } from "./heroShaders";

export function useHeroCanvas(
  sectionRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  cursorRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const curEl = cursorRef.current;
    if (!section || !canvas) return;

    // section and canvas are non-null from here on
    const sec = section;
    const cvs = canvas;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const INK = "#15161a";

    const tex2d = document.createElement("canvas");
    const t2 = tex2d.getContext("2d")!;
    let logoU = 0.62,
      logoV = 0.46;

    function drawLogo(cx: number, cy: number, s: number) {
      const cell = s * 0.42,
        gap = s * 0.16;
      const x0 = cx - (cell * 2 + gap) / 2;
      const y0 = cy - (cell * 2 + gap) / 2;
      t2.fillStyle = INK;
      t2.fillRect(x0, y0, cell, cell);
      t2.fillRect(x0 + cell + gap, y0, cell, cell);
      t2.fillRect(x0, y0 + cell + gap, cell, cell);
      const lw = Math.max(2, s * 0.085);
      t2.lineWidth = lw;
      t2.strokeStyle = INK;
      t2.strokeRect(
        x0 + cell + gap + lw / 2,
        y0 + cell + gap + lw / 2,
        cell - lw,
        cell - lw,
      );
    }

    function drawText() {
      const w = sec.clientWidth,
        h = sec.clientHeight;
      if (!w || !h) return;
      tex2d.width = Math.round(w * DPR);
      tex2d.height = Math.round(h * DPR);
      t2.setTransform(DPR, 0, 0, DPR, 0, 0);
      t2.fillStyle = "#ffffff";
      t2.fillRect(0, 0, w, h);
      t2.textAlign = "left";
      t2.textBaseline = "alphabetic";

      function setFont(px: number) {
        t2.font = `600 ${px}px "Saira", sans-serif`;
        if ("letterSpacing" in t2) (t2 as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px * TRACK_EM}px`;
      }

      setFont(100);
      let mw1 = t2.measureText(LINE1).width;
      let mw2 = t2.measureText(LINE2).width;
      let fs = (100 * (w * 0.42)) / Math.max(mw1, mw2);
      fs = Math.min(fs, h * 0.118);
      setFont(fs);
      const track = fs * TRACK_EM;
      mw1 = t2.measureText(LINE1).width;
      mw2 = t2.measureText(LINE2).width;

      const lineGap = fs * 1.32;
      const logoSize = fs * 0.76;
      const logoGap = fs * 0.42;
      const top = (h - lineGap * 2) / 2;
      const base1 = top + fs * 0.8;
      const base2 = base1 + lineGap;

      t2.fillStyle = INK;
      // subtract trailing track from width so centering is glyph-accurate
      t2.fillText(LINE1, (w - (mw1 - track)) / 2, base1);

      const unitW = mw2 - track + logoGap + logoSize;
      const startX2 = (w - unitW) / 2;
      t2.fillText(LINE2, startX2, base2);

      const lcx = startX2 + (mw2 - track) + logoGap + logoSize / 2;
      const lcy = base2 - fs * 0.34;
      drawLogo(lcx, lcy, logoSize);

      logoU = lcx / w;
      logoV = 1 - lcy / h;
    }

    // ── WebGL init ────────────────────────────────────────
    const gl = cvs.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) {
      cvs.replaceWith(tex2d);
      Object.assign(tex2d.style, {
        position: "absolute",
        inset: "0",
        zIndex: "1",
        width: "100%",
        height: "100%",
        display: "block",
      });
      const ro = new ResizeObserver(() => document.fonts.ready.then(drawText));
      ro.observe(sec);
      document.fonts.ready.then(drawText);
      return () => ro.disconnect();
    }

    // gl is non-null from here on (guard above returned if null)
    const GL = gl;

    function compile(type: number, src: string) {
      const s = GL.createShader(type)!;
      GL.shaderSource(s, src);
      GL.compileShader(s);
      if (!GL.getShaderParameter(s, GL.COMPILE_STATUS))
        console.error("[HeroStatement] shader:", GL.getShaderInfoLog(s));
      return s;
    }

    const prog = GL.createProgram()!;
    GL.attachShader(prog, compile(GL.VERTEX_SHADER, VERT));
    GL.attachShader(prog, compile(GL.FRAGMENT_SHADER, FRAG));
    GL.linkProgram(prog);
    if (!GL.getProgramParameter(prog, GL.LINK_STATUS))
      console.error("[HeroStatement] link:", GL.getProgramInfoLog(prog));
    GL.useProgram(prog);

    const vbuf = GL.createBuffer()!;
    GL.bindBuffer(GL.ARRAY_BUFFER, vbuf);
    GL.bufferData(
      GL.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      GL.STATIC_DRAW,
    );
    const aPos = GL.getAttribLocation(prog, "aPos");
    GL.enableVertexAttribArray(aPos);
    GL.vertexAttribPointer(aPos, 2, GL.FLOAT, false, 0, 0);

    const uTime = GL.getUniformLocation(prog, "uTime");
    const uAsp = GL.getUniformLocation(prog, "uAspect");
    const uLogoL = GL.getUniformLocation(prog, "uLogo");
    const uTrl = GL.getUniformLocation(prog, "uTrail");
    const uRevealL = GL.getUniformLocation(prog, "uReveal");
    const uBreathL = GL.getUniformLocation(prog, "uBreath");

    const tex = GL.createTexture()!;
    GL.bindTexture(GL.TEXTURE_2D, tex);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);

    function upload() {
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        tex2d,
      );
    }

    // ── Trail ring buffer ─────────────────────────────────
    const trailBuf = new Float32Array(TN * 3);
    function pushPoint(x: number, y: number) {
      for (let i = TN - 1; i > 0; i--) {
        trailBuf[i * 3] = trailBuf[(i - 1) * 3];
        trailBuf[i * 3 + 1] = trailBuf[(i - 1) * 3 + 1];
        trailBuf[i * 3 + 2] = trailBuf[(i - 1) * 3 + 2];
      }
      trailBuf[0] = x;
      trailBuf[1] = y;
      trailBuf[2] = 1.0;
    }
    function decay() {
      for (let i = 0; i < TN; i++) trailBuf[i * 3 + 2] *= 0.95;
    }

    let W = 0,
      H = 0;
    function resize() {
      W = sec.clientWidth;
      H = sec.clientHeight;
      if (!W || !H) return;
      cvs.width = Math.round(W * DPR);
      cvs.height = Math.round(H * DPR);
      GL.viewport(0, 0, cvs.width, cvs.height);
      GL.uniform1f(uAsp, W / H);
      drawText();
      upload();
      GL.uniform2f(uLogoL, logoU, logoV);
    }

    // ── Interaction state ─────────────────────────────────
    let revealStart = 0;
    let lastMove = performance.now();
    let lastBreath = performance.now();
    let breathActive = false,
      breathStart = 0;
    let entered = false;
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let cxPos = mx,
      cyPos = my;
    let awakeTimer: ReturnType<typeof setTimeout> | undefined;
    let lastX = 0,
      lastY = 0;

    function wake() {
      sec.classList.add("awake");
      clearTimeout(awakeTimer);
      awakeTimer = setTimeout(() => sec.classList.remove("awake"), 2600);
    }

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      const r = cvs.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const dx = x - lastX,
        dy = y - lastY;
      if (dx * dx + dy * dy > 0.00004) {
        pushPoint(x, y);
        lastX = x;
        lastY = y;
      }
      lastMove = performance.now();
      breathActive = false;
      wake();
    }
    function onOver(e: PointerEvent) {
      if ((e.target as Element).closest("a") && curEl) curEl.classList.add("lg");
    }
    function onOut(e: PointerEvent) {
      if ((e.target as Element).closest("a") && curEl) curEl.classList.remove("lg");
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    let t = 0,
      raf = 0;
    function loop() {
      if (!W || !H) resize();
      const now = performance.now();
      if (!revealStart) revealStart = now;
      t += 0.016;
      decay();

      // entrance easeOutCubic over 1900ms
      const rp = Math.min(1, (now - revealStart) / 1900);
      const rev = 1 - Math.pow(1 - rp, 3);
      GL.uniform1f(uRevealL, rev);
      if (!entered && rp > 0.5) {
        entered = true;
        sec.classList.add("entered");
        if (curEl) curEl.classList.add("visible");
      }

      // idle breath: ring expands from center when mouse rests 3.8s
      const idle = now - lastMove;
      if (
        idle > 3800 &&
        !breathActive &&
        now - lastBreath > 5200 &&
        rev > 0.99
      ) {
        breathActive = true;
        breathStart = now;
      }
      let bp = 0;
      if (breathActive) {
        bp = (now - breathStart) / 2400;
        if (bp >= 1) {
          breathActive = false;
          lastBreath = now;
          bp = 0;
        }
      }
      GL.uniform1f(uBreathL, bp);

      GL.uniform1f(uTime, t);
      GL.uniform2f(uLogoL, logoU, logoV);
      GL.uniform3fv(uTrl, trailBuf);
      GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);

      // lerped custom cursor
      cxPos += (mx - cxPos) * 0.22;
      cyPos += (my - cyPos) * 0.22;
      if (curEl) {
        curEl.style.transform = `translate(${cxPos}px,${cyPos}px) translate(-50%,-50%)`;
      }

      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => document.fonts.ready.then(resize));
    ro.observe(sec);
    document.fonts.ready.then(() => {
      resize();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(awakeTimer);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      sec.classList.remove("awake", "entered");
      if (curEl) curEl.classList.remove("visible", "lg");
    };
  }, []);
}

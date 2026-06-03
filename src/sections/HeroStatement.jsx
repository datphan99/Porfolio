import { useEffect, useRef } from "react";

const LINE1 = "MAKE EVERY PIXEL";
const LINE2 = "PAY FOR ITSELF";
const TN = 20;

const VERT = `attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}`;

const FRAG = [
  "precision highp float;",
  "varying vec2 vUv;",
  "uniform sampler2D uTex;",
  "uniform float uTime;",
  "uniform float uAspect;",
  "uniform vec2  uLogo;",
  "uniform vec3  uTrail[20];",
  "void main(){",
  "  vec2 uv=vUv;",
  "  vec2 off=vec2(0.0); float hgt=0.0;",
  "  // perpetual logo distortion — always on, no hover needed",
  "  vec2 dl=uv-uLogo; dl.x*=uAspect;",
  "  float distL=length(dl);",
  "  float fl=exp(-distL*15.0);",
  "  float phL=distL*55.0-uTime*3.0;",
  "  vec2 dirL=normalize(uv-uLogo+1e-6);",
  "  off+=dirL*sin(phL)*0.010*fl;",
  "  hgt+=cos(phL)*0.010*fl;",
  "  // cursor water trail — ring buffer of 20 recent positions",
  "  for(int i=0;i<20;i++){",
  "    vec3 p=uTrail[i];",
  "    vec2 dd=uv-p.xy; dd.x*=uAspect;",
  "    float dist=length(dd);",
  "    float fo=exp(-dist*38.0);",
  "    float ph=dist*22.0-uTime*5.0;",
  "    vec2 dir=normalize(uv-p.xy+1e-6);",
  "    off+=dir*sin(ph)*0.018*fo*p.z;",
  "    hgt+=cos(ph)*0.018*fo*p.z;",
  "    float fr=exp(-dist*14.0);",
  "    float phr=dist*70.0-uTime*7.0;",
  "    off+=dir*sin(phr)*0.004*fr*p.z;",
  "    hgt+=cos(phr)*0.004*fr*p.z;",
  "  }",
  "  vec2 uv2=uv+off;",
  "  float ca=length(off)*0.9;",
  "  vec2 cdir=normalize(off+1e-6);",
  "  float r=texture2D(uTex,uv2+cdir*ca).r;",
  "  float g=texture2D(uTex,uv2).g;",
  "  float b=texture2D(uTex,uv2-cdir*ca).b;",
  "  vec3 col=vec3(r,g,b);",
  "  col+=hgt*3.3;",
  "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
  "}",
].join("\n");

export default function HeroStatement() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const INK = "#15161a";

    const tex2d = document.createElement("canvas");
    const t2 = tex2d.getContext("2d");
    let logoU = 0.62,
      logoV = 0.46;

    function drawLogo(cx, cy, s) {
      const cell = s * 0.42,
        gap = s * 0.16;
      const x0 = cx - (cell * 2 + gap) / 2;
      const y0 = cy - (cell * 2 + gap) / 2;
      t2.fillStyle = INK;
      t2.fillRect(x0, y0, cell, cell); // top-left
      t2.fillRect(x0 + cell + gap, y0, cell, cell); // top-right
      t2.fillRect(x0, y0 + cell + gap, cell, cell); // bottom-left
      const lw = Math.max(2, s * 0.085); // bottom-right = outline
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
      const w = section.clientWidth,
        h = section.clientHeight;
      if (!w || !h) return;
      tex2d.width = Math.round(w * DPR);
      tex2d.height = Math.round(h * DPR);
      t2.setTransform(DPR, 0, 0, DPR, 0, 0);
      t2.fillStyle = "#ffffff";
      t2.fillRect(0, 0, w, h);
      t2.textAlign = "left";
      t2.textBaseline = "alphabetic";

      t2.font = '600 100px "Saira Extra Condensed", sans-serif';
      let mw1 = t2.measureText(LINE1).width;
      let mw2 = t2.measureText(LINE2).width;
      let fs = (100 * (w * 0.4)) / Math.max(mw1, mw2);
      fs = Math.min(fs, h * 0.17);
      t2.font = `600 ${fs}px "Saira Extra Condensed", sans-serif`;
      mw1 = t2.measureText(LINE1).width;
      mw2 = t2.measureText(LINE2).width;

      const lineGap = fs * 1.06;
      const logoSize = fs * 0.86;
      const logoGap = fs * 0.3;
      const top = (h - lineGap * 2) / 2;
      const base1 = top + fs * 0.8;
      const base2 = base1 + lineGap;

      t2.fillStyle = INK;
      t2.fillText(LINE1, (w - mw1) / 2, base1);

      const unitW = mw2 + logoGap + logoSize;
      const startX2 = (w - unitW) / 2;
      t2.fillText(LINE2, startX2, base2);

      const lcx = startX2 + mw2 + logoGap + logoSize / 2;
      const lcy = base2 - fs * 0.3;
      drawLogo(lcx, lcy, logoSize);

      logoU = lcx / w;
      logoV = 1 - lcy / h; // GL: bottom-left origin
    }

    // ── WebGL init ──────────────────────────────────────────
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) {
      canvas.replaceWith(tex2d);
      Object.assign(tex2d.style, {
        position: "absolute",
        inset: "0",
        zIndex: "1",
        width: "100%",
        height: "100%",
        display: "block",
      });
      const ro = new ResizeObserver(() => document.fonts.ready.then(drawText));
      ro.observe(section);
      document.fonts.ready.then(drawText);
      return () => ro.disconnect();
    }

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error("[HeroStatement] shader:", gl.getShaderInfoLog(s));
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error("[HeroStatement] link:", gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uAsp = gl.getUniformLocation(prog, "uAspect");
    const uLogoL = gl.getUniformLocation(prog, "uLogo");
    const uTrl = gl.getUniformLocation(prog, "uTrail");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    function upload() {
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

    // ── Cursor trail: ring buffer, fade by 0.95 each frame ──
    const trailBuf = new Float32Array(TN * 3);
    function pushPoint(x, y) {
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
      W = section.clientWidth;
      H = section.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAsp, W / H);
      drawText();
      upload();
      gl.uniform2f(uLogoL, logoU, logoV);
    }

    let lastX = 0,
      lastY = 0;
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const dx = x - lastX,
        dy = y - lastY;
      if (dx * dx + dy * dy > 0.00004) {
        pushPoint(x, y);
        lastX = x;
        lastY = y;
      }
    }
    window.addEventListener("pointermove", onMove);

    let t = 0,
      raf;
    function loop() {
      if (!W || !H) resize();
      t += 0.016;
      decay();
      gl.uniform1f(uTime, t);
      gl.uniform2f(uLogoL, logoU, logoV);
      gl.uniform3fv(uTrl, trailBuf);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => document.fonts.ready.then(resize));
    ro.observe(section);
    document.fonts.ready.then(() => {
      resize();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-screen h-screen overflow-hidden bg-white cursor-crosshair"
    >
      {/* Full-bleed WebGL plane */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1] block w-full h-full"
      />

      {/* Off-screen accessible headline */}
      <h1 className="sr-only">Make Every Pixel Pay For Itself</h1>

      {/* BL — availability status */}
      <div className="hs-corner hs-bl pointer-events-none">
        <div className="flex items-center gap-2 font-semibold text-[13px] uppercase tracking-[0.04em] text-[#15161a]">
          <span className="hs-dot inline-block w-2 h-2 rounded-full bg-[#2fb863]" />
          Available for work — 2026
        </div>
      </div>

      {/* BR — scroll cue */}
      <div className="hs-corner hs-br pointer-events-none">
        <div className="flex items-center gap-[9px] text-[11px] font-semibold tracking-[0.18em] uppercase text-[#a7a7a3]">
          Scroll
          <span className="hs-ln" />
        </div>
      </div>
    </section>
  );
}

/* Fullscreen WebGL fog for the page transition.
   A single fbm-noise pass: a radial "billow front" grows from the centre with
   a noise-broken edge (smoke spreading), while the field drifts up slightly.
   `draw(progress, time)` is the whole API — progress 0 = clear, 1 = covered. */

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  // smoke body + finer curl, both drifting and rising slightly
  float n  = fbm(p * 2.2 + vec2(t * 0.10, -t * 0.06));
  float n2 = fbm(p * 4.8 + vec2(-t * 0.07, -t * 0.11) + n * 1.4);

  // billow front: radial growth from centre, edge broken up by the noise
  vec2 c = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  float d = length(c) / 1.15;
  float front = d - uProgress * 1.9 + (n - 0.5) * 0.62 + (n2 - 0.5) * 0.22 + 0.42;
  float alpha = 1.0 - smoothstep(-0.16, 0.10, front);
  alpha *= smoothstep(0.0, 0.06, uProgress); // fully clear at rest

  // cloud shading: pale mist with soft internal structure
  vec3 col = mix(vec3(0.835, 0.835, 0.820), vec3(0.975, 0.975, 0.965), n);
  col -= (n2 - 0.5) * 0.06;

  gl_FragColor = vec4(col, alpha);
}
`;

export interface MistGL {
  draw(progress: number, timeSec: number): void;
  resize(): void;
}

export function createMistGL(canvas: HTMLCanvasElement): MistGL | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    depth: false,
    stencil: false,
    antialias: false,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // one fullscreen triangle
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uProgress = gl.getUniformLocation(prog, "uProgress");

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  return {
    resize,
    draw(progress, timeSec) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeSec);
      gl.uniform1f(uProgress, progress);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

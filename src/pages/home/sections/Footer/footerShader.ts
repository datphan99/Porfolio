/* Dithered night waves — reactbits-style "Dither" background:
   slow domain-warped fbm waves, quantized to a few brightness steps through an
   8×8 Bayer ordered-dither matrix on a chunky pixel grid, ramping from near
   black at the top (seamless with the dark Contact section) into Apple blue
   (--color-accent #0071e3) toward the bottom. Animates on its own — no cursor
   input. */

export const FOOTER_VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FOOTER_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

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

/* compact recursive Bayer threshold matrix (0..1) */
float Bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float Bayer4(vec2 a){ return Bayer2(0.5 * a) * 0.25 + Bayer2(a); }
float Bayer8(vec2 a){ return Bayer4(0.5 * a) * 0.25 + Bayer2(a); }

void main(){
  // chunky pixel grid — the dither cell
  float PX = 2.0;
  vec2 cell = floor(gl_FragCoord.xy / PX);
  vec2 uv = (cell * PX) / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;

  // slow domain-warped waves drifting on their own
  vec2 p = vec2(uv.x * aspect, uv.y) * 2.6;
  float w1 = fbm(p + vec2(t * 0.060, t * 0.045));
  float w  = fbm(p + w1 * 1.6 + vec2(-t * 0.040, t * 0.025));

  // brightness ramp — the canvas overlaps 20vh up into the Contact section,
  // so the top must quantize to pure base (invisible against Contact's
  // #0d0d0d). "breathe" slowly raises and lowers the dither edge so the
  // dots wash back and forth across the section boundary; waves go full
  // blue at the bottom.
  float g = 1.0 - uv.y;
  float breathe = sin(t * 0.35) * 0.05;
  float v = clamp(g * 0.92 - 0.10 + breathe + (w - 0.5) * 0.55, 0.0, 1.0);

  // ordered dithering: quantize v to a few steps, threshold per Bayer cell
  float STEPS = 5.0;
  float d = Bayer8(cell) - 0.5;
  float q = floor(v * (STEPS - 1.0) + d + 0.5) / (STEPS - 1.0);
  q = clamp(q, 0.0, 1.0);

  // #0d0d0d (exactly Contact's panel colour — no seam) → Apple blue #0071e3
  vec3 col = mix(vec3(0.051, 0.051, 0.051), vec3(0.0, 0.443, 0.890), q);

  gl_FragColor = vec4(col, 1.0);
}
`;

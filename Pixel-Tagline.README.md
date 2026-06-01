# Pixel Tagline — Water Distortion (implementation notes)

A framed typographic hero panel: the tagline **"Make Every Pixel / Pay for itself"**
sits crisp inside a thin rectangle, and on **hover a water ripple follows the cursor**,
warping the letters (with a faint chromatic refraction). Idle = perfectly sharp text.

**Tech: hand-rolled WebGL — NO library** (no Three.js / no Pixi). The text is drawn to
an offscreen Canvas 2D and used as a GL texture; one fullscreen quad + one fragment
shader does the displacement. `requestAnimationFrame` + a lerp for ease-in/out.

> Don't pull in Three.js for this — it's a single quad and one shader. Raw WebGL keeps
> it ~a few KB and matches the minimalist intent. (If you later need many stacked
> effects, OGL is a lighter middle-ground than Three.)

Source of truth: `Pixel Tagline (Water Distortion).html`.

---

## Suggested component

```tsx
<PixelTagline
  lines={['Make Every Pixel', 'Pay for itself']}
  eyebrow="Frontend Developer / Fullstack Developer"
  menuLabel="Menu"
  hint="Scroll down"
/>
```

---

## Layout & tokens

```
.eyebrow   fixed, top-centre, tiny tracked uppercase label
.menu      fixed, right edge, vertically centred (top:50%; translateY(-50%)); hover underline
.wrap      column, centred: [ .frame ] + [ .hint ]
.frame     the rectangle (border + corner ticks); holds <canvas>
.hint      tiny tracked uppercase label under the frame ("Scroll down")
```

Tokens (CSS vars):
```
--bg:#f2f2f0  --ink:#15161a  --muted:#9b9b97  --line:rgba(0,0,0,.16)
font: Inter (400–700)
```

Frame geometry:
```css
.frame{
  width: clamp(360px, 44vw, 620px);
  aspect-ratio: 3 / 2;              /* landscape rectangle */
  border: 1px solid var(--line);
  overflow: hidden;                 /* clips the ripple at the edge */
}
.frame canvas{ width:100%; height:100%; display:block; }
```
Corner ticks are two `::before`/`::after` 9px L-shapes (top-left + bottom-right),
`opacity:.55` — quiet Swiss detailing.

---

## 1) Text → texture (Canvas 2D)

Render the lines into an offscreen canvas sized `frameW*DPR × frameH*DPR`
(`DPR = min(2, devicePixelRatio)`), filled with `--bg`, text in `--ink`, centred:

```js
function drawText(){
  const w = frame.clientWidth, h = frame.clientHeight;
  tex2d.width = round(w*DPR); tex2d.height = round(h*DPR);
  t2.setTransform(DPR,0,0,DPR,0,0);
  t2.fillStyle = '#f2f2f0'; t2.fillRect(0,0,w,h);
  t2.fillStyle = '#15161a';
  t2.textAlign = 'center'; t2.textBaseline = 'middle';

  // fit the widest line to ~85% of the frame width (leaves side breathing room)
  t2.font = '600 100px Inter, sans-serif';
  const widest = Math.max(...LINES.map(l => t2.measureText(l).width));
  let fs = 100 * (w * 0.85) / widest;
  fs = Math.min(fs, h * 0.26);               // also cap by height
  t2.font = `600 ${fs}px Inter, sans-serif`;
  const lh = fs * 1.06;
  const startY = h/2 - lh*(LINES.length-1)/2;
  LINES.forEach((ln,i) => t2.fillText(ln, w/2, startY + i*lh));
}
```

Knobs: `0.85` = side padding (lower → more margin, smaller text); `h*0.26` = max line
height; `lh` factor = line spacing.

Wait for `document.fonts.ready` before the first `drawText()` so Inter metrics are correct.

---

## 2) WebGL quad + displacement shader

Fullscreen quad, `vUv = aPos*0.5+0.5`. Texture uploaded from `tex2d` with
`UNPACK_FLIP_Y_WEBGL = true`, `CLAMP_TO_EDGE`, `LINEAR` (NPOT-safe in WebGL1).

**Fragment shader** (the whole effect):
```glsl
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2  uMouse;     // 0..1, bottom-left origin
uniform float uTime;
uniform float uStrength;  // 0..1 hover ease
uniform float uAspect;    // frameW / frameH
void main(){
  vec2 uv = vUv;
  vec2 d = uv - uMouse; d.x *= uAspect;     // aspect-correct distance
  float dist = length(d);
  float falloff = exp(-dist * 5.0);                              // tight to the cursor
  float ripple  = sin(dist*26.0 - uTime*4.5) * 0.014 * falloff * uStrength;
  vec2  dir = normalize(uv - uMouse + 1e-6);
  vec2  off = dir * ripple;
  float ca  = length(off) * 0.9;            // chromatic refraction amount
  vec2  base = uv + off;
  float r = texture2D(uTex, base + dir*ca).r;
  float g = texture2D(uTex, base).g;
  float b = texture2D(uTex, base - dir*ca).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
```

Why it reads as "water": `sin(dist*freq - time*speed)` = rings expanding from the
cursor; `exp(-dist*5)` keeps them local; `ca` splits RGB along the displacement for a
glassy edge. At `uStrength = 0` everything collapses to `uv` → pixel-crisp text.

---

## 3) Interaction loop

```js
let mouse = {x:.5, y:.5}, target = 0, strength = 0, t = 0;

function setMouse(e){
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) / r.width;
  mouse.y = 1 - (e.clientY - r.top) / r.height;   // flip to GL bottom-left origin
}
frame.addEventListener('pointerenter', e => { target = 1; setMouse(e); });
frame.addEventListener('pointermove', setMouse);
frame.addEventListener('pointerleave', () => { target = 0; });

function loop(){
  t += 0.016;
  strength += (target - strength) * 0.08;          // ease the warp in / out
  gl.uniform1f(uTime, t);
  gl.uniform1f(uStrength, strength);
  gl.uniform2f(uMouse, mouse.x, mouse.y);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}
```

`resize()` re-reads `frame.clientWidth/Height`, resizes the GL canvas to `*DPR`, sets
`uAspect`, then `drawText()` + re-upload. Call it on `resize`, on `load`, and after
`document.fonts.ready`. Guard against a 0-size first paint (skip if `!W||!H`, and
self-heal at the top of `loop`).

---

## React conversion

```tsx
const frameRef = useRef(null), canvasRef = useRef(null);
useEffect(() => {
  const gl = canvasRef.current.getContext('webgl', { premultipliedAlpha:false, antialias:true });
  if (!gl) { /* fallback: drop the 2D text canvas in place */ return; }
  // …compile program, create texture, build tex2d, drawText, loop…
  let raf = requestAnimationFrame(loop);
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  document.fonts.ready.then(resize);
  return () => {                       // cleanup
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}, [lines.join('|')]);
```

- Keep `mouse/target/strength/t` as refs or closure vars — **never** React state per frame.
- Pointer handlers go on the `.frame` element (not the canvas) so the corner ticks /
  padding still trigger it.
- The texture (`tex2d`) is a plain offscreen `<canvas>`; rebuild + re-upload on resize
  and whenever `lines` change.

---

## Fallback

If `getContext('webgl')` is null, swap the GL canvas for the 2D text canvas
(`canvas.replaceWith(tex2d)`) so the tagline still shows crisp, just without the ripple.
Also sensible to skip the effect under `prefers-reduced-motion`.

---

## Tuning knobs

| Knob | Effect |
|---|---|
| `0.85` (width fit) | side padding vs. text size — lower = more margin, smaller |
| `h * 0.26` | max line height cap |
| `* 0.014` (shader) | ripple amplitude (how much it warps) |
| `exp(-dist*5.0)` | how tightly the ripple hugs the cursor (higher = tighter) |
| `dist*26.0` | ripple wavelength (higher = more rings) |
| `uTime*4.5` | wave speed |
| `ca = length(off)*0.9` | chromatic-refraction strength |
| `strength` lerp `0.08` | how fast the warp fades in/out on enter/leave |

---

## Dependencies

```
Inter (Google Fonts), weights 400–700
```
No JS libraries — Canvas 2D + raw WebGL 1 only.
```
```
> Note for the renderer: WebGL canvases don't show up in DOM-snapshot screenshot tools
> (they appear blank) — verify by reading pixels with `gl.readPixels`, not screenshots.

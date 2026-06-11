// ── SVG glyphs ────────────────────────────────────────────────────────────────
// Each fragment lives in a 200×200 viewBox, roughly centred on (100,100), and is
// rasterised into a particle point-cloud. Filled areas read as dense bands;
// strokes read as thin lines — keep stroke widths chunky so the cloud has body.
export const SVGS: Record<string, string> = {
  // Interface Design — an app/artboard window: framed canvas, title bar with
  // dots, and a couple of layout blocks.
  interface:
    '<g fill="none" stroke="#000" stroke-width="9" stroke-linejoin="round">' +
    '<rect x="40" y="46" width="120" height="108" rx="13"/></g>' +
    '<path d="M40 76 H160" stroke="#000" stroke-width="7"/>' +
    '<g fill="#000">' +
    '<circle cx="55" cy="61" r="4.5"/><circle cx="71" cy="61" r="4.5"/><circle cx="87" cy="61" r="4.5"/>' +
    '<rect x="54" y="92" width="38" height="22" rx="4"/>' +
    '<rect x="102" y="92" width="44" height="22" rx="4"/>' +
    '<rect x="54" y="124" width="38" height="18" rx="4"/>' +
    '<rect x="102" y="124" width="30" height="18" rx="4"/></g>',
  // Frontend — the </> code-tag glyph.
  frontend:
    '<g fill="none" stroke="#000" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M76 62 L40 100 L76 138"/>' +
    '<path d="M124 62 L160 100 L124 138"/>' +
    '<path d="M114 54 L86 146"/></g>',
  // Backend — a stacked database cylinder.
  backend:
    '<g fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">' +
    '<ellipse cx="100" cy="54" rx="46" ry="16"/>' +
    '<path d="M54 54 V138"/><path d="M146 54 V138"/>' +
    '<path d="M54 84 Q 100 116 146 84"/>' +
    '<path d="M54 111 Q 100 143 146 111"/>' +
    '<path d="M54 138 Q 100 170 146 138"/></g>',
};

export const LABELS: Record<string, string> = {
  interface: "Look & Feel",
  frontend: "In the Browser",
  backend: "Behind the Scenes",
};
export const SHAPE_KEYS = ["interface", "frontend", "backend"];

// ── Shared helpers ────────────────────────────────────────────────────────────
export function sample(frag: string): Promise<number[]> {
  return new Promise((resolve) => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
      frag +
      "</svg>";
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const S = 200,
        cv = document.createElement("canvas");
      cv.width = S;
      cv.height = S;
      const c = cv.getContext("2d");
      if (!c) {
        URL.revokeObjectURL(url);
        resolve([]);
        return;
      }
      c.drawImage(img, 0, 0, S, S);
      const d = c.getImageData(0, 0, S, S).data,
        pool = [];
      for (let y = 0; y < S; y += 2)
        for (let x = 0; x < S; x += 2)
          if (d[(y * S + x) * 4 + 3] > 110) pool.push(x, y);
      URL.revokeObjectURL(url);
      resolve(pool);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
    img.src = url;
  });
}

export function shuffle(pool: number[]): number[] {
  const n = pool.length / 2;
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const ax = pool[i * 2],
      ay = pool[i * 2 + 1];
    pool[i * 2] = pool[j * 2];
    pool[i * 2 + 1] = pool[j * 2 + 1];
    pool[j * 2] = ax;
    pool[j * 2 + 1] = ay;
  }
  return pool;
}

export function toN(pool: number[], N: number): { x: Float32Array; y: Float32Array } {
  const X = new Float32Array(N),
    Y = new Float32Array(N);
  const n = pool.length / 2 || 1;
  for (let i = 0; i < N; i++) {
    const k = i % n;
    X[i] = (pool[k * 2] || 100) + (Math.random() - 0.5) * 2;
    Y[i] = (pool[k * 2 + 1] || 100) + (Math.random() - 0.5) * 2;
  }
  return { x: X, y: Y };
}

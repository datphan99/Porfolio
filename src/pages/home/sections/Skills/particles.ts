// ── SVG glyphs ────────────────────────────────────────────────────────────────
export const SVGS: Record<string, string> = {
  one: '<circle cx="100" cy="100" r="60" fill="#000"/>',
  creation:
    '<circle cx="100" cy="70" r="34" fill="#000"/>' +
    '<circle cx="72" cy="129" r="34" fill="#000"/>' +
    '<circle cx="128" cy="129" r="34" fill="#000"/>',
  growth:
    '<circle cx="100" cy="100" r="60" fill="none" stroke="#000" stroke-width="24"/>',
  modernization:
    '<g fill="none" stroke="#000" stroke-width="17" stroke-linecap="round">' +
    '<path d="M40 100 A 60 60 0 0 1 160 100"/>' +
    '<path d="M160 100 A 60 60 0 0 1 40 100"/></g>' +
    '<g fill="#000"><path d="M160 124 L146 98 L174 98 Z"/>' +
    '<path d="M40 76 L54 102 L26 102 Z"/></g>',
  techstack:
    '<g fill="none" stroke="#000" stroke-width="12" stroke-linejoin="round">' +
    '<path d="M100 50 L156 78 L100 106 L44 78 Z"/>' +
    '<path d="M100 100 L156 128 L100 156 L44 128 Z"/>' +
    '<path d="M100 150 L156 178 L100 206 L44 178 Z"/></g>',
};

export const LABELS: Record<string, string> = {
  creation: "Idea → Forms",
  growth: "Reach",
  modernization: "Renewal",
  techstack: "Foundation",
};
export const SHAPE_KEYS = ["one", "creation", "growth", "modernization", "techstack"];

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

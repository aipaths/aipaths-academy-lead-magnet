// Ruido determinista (sin Math.random): mismo terreno y mismas partículas en cada carga.
export function azar(semilla = 1) {
  let s = semilla >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(i, j) {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const suave = (t) => t * t * t * (t * (t * 6 - 15) + 10);
// Ruido de gradiente (Perlin): no deja las rayas alineadas a la grilla que deja el ruido de valores.
function grad(i, j, x, y) { const a = hash(i, j) * 6.2831853; return Math.cos(a) * x + Math.sin(a) * y; }
export function ruido2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, fx = suave(u), fy = suave(v);
  const a = grad(i, j, u, v), b = grad(i + 1, j, u - 1, v), c = grad(i, j + 1, u, v - 1), d = grad(i + 1, j + 1, u - 1, v - 1);
  return 0.5 + 0.7 * (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy);
}
export function fbm(x, y, octavas = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let o = 0; o < octavas; o++) {
    v += amp * ruido2(x * f + o * 17.3, y * f - o * 9.1); amp *= 0.5; f *= 2.03;
    const t = x * 0.8 - y * 0.6; y = x * 0.6 + y * 0.8; x = t;   // gira cada octava
  }
  return v;
}
export const escalon = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

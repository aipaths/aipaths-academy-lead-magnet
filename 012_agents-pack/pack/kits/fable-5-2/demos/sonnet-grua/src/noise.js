// Ruido de valores 2D determinista (sin dependencias) para relieve y variación de color.
function hash(i, j, s) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const suave = (t) => t * t * (3 - 2 * t);

export function valor(x, y, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = suave(x - i), fy = suave(y - j);
  const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

export function fbm(x, y, s = 0, octavas = 4) {
  let suma = 0, amp = 0.5, f = 1;
  for (let o = 0; o < octavas; o++) { suma += valor(x * f, y * f, s + o) * amp; amp *= 0.5; f *= 2; }
  return suma;
}

export function aleatorio(semilla) {   // mulberry32
  let a = semilla >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

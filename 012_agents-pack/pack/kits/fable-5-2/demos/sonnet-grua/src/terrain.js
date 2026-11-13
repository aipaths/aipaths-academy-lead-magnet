// Suelo = mapa de alturas deformable. Cavar resta, soltar suma, y una relajación por ángulo de reposo desmorona.
import * as THREE from 'three';
import { fbm } from './noise.js';
import { LAYOUT } from './config.js';

export const SIZE = 64, N = 256, CELL = SIZE / N, W = N + 1, HALF = SIZE / 2;
const REPOSE = Math.tan(35 * Math.PI / 180);   // ángulo natural de la tierra suelta
const PISO = -7;                                // no se cava más hondo

export class Terrain {
  constructor() {
    this.H = new Float32Array(W * W);
    this.wet = new Float32Array(W * W);          // 0 = suelo original, 1 = tierra removida (más oscura)
    this.delta = new Float32Array(W * W);
    this.box = null;                             // zona activa de la relajación
    this.dirty = true;
    this.formaInicial();
    this.mesh = this.crearMalla(); this.sucio = null;
  }

  formaInicial() {
    const { pile } = LAYOUT;
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const x = i * CELL - HALF, z = j * CELL - HALF;
      let h = (fbm(x * 0.08, z * 0.08, 3) - 0.5) * 0.5 + (fbm(x * 0.4, z * 0.4, 9) - 0.5) * 0.08;
      const d = Math.hypot(x - pile.x, (z - pile.z) * 1.1);
      const cono = Math.max(0, pile.h - Math.max(0, d - 1.2) * 0.52);
      h += cono * (0.88 + 0.24 * fbm(x * 0.25, z * 0.25, 5));
      const d2 = Math.hypot(x - (pile.x + 5), z - (pile.z + 5.5));        // un montículo menor al lado
      h += Math.max(0, 1.5 - d2 * 0.42) * (0.9 + 0.2 * fbm(x * 0.3, z * 0.3, 7));
      const dc = Math.hypot(x, z), f = Math.min(1, Math.max(0, (dc - 6.5) / 4)); // plataforma plana donde apoya la grúa
      const dv = Math.abs(z - LAYOUT.truckSpot.z), fc = Math.min(1, Math.max(0, (dv - 3.2) / 3));   // franja plana del camino
      this.H[j * W + i] = h * f * f * (3 - 2 * f) * fc * fc * (3 - 2 * fc);
    }
    this.alisarBorde();
    this.box = { i0: 0, i1: N, j0: 0, j1: N };
    for (let k = 0; k < 40; k++) this.relax();
    this.wet.fill(0);
  }

  alisarBorde() {                                // el borde del mapa baja a 0 para empalmar con el plano exterior
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const e = Math.min(i, j, N - i, N - j) * CELL, f = Math.min(1, e / 4);
      this.H[j * W + i] *= f * f * (3 - 2 * f);
    }
  }

  crearMalla() {
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(W * W * 3); this.nor = new Float32Array(W * W * 3); this.col = new Float32Array(W * W * 3);
    const uv = new Float32Array(W * W * 2), idx = new Uint32Array(N * N * 6);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const v = j * W + i;
      this.pos[v * 3] = i * CELL - HALF; this.pos[v * 3 + 2] = j * CELL - HALF;
      uv[v * 2] = (i * CELL) / 3; uv[v * 2 + 1] = (j * CELL) / 3;
    }
    let k = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SIZE);
    this.actualizarMalla(0, N, 0, N);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true }));
    m.receiveShadow = true; m.castShadow = true; m.frustumCulled = false;
    return m;
  }

  actualizarMalla(i0, i1, j0, j1) {
    i0 = Math.max(0, i0); j0 = Math.max(0, j0); i1 = Math.min(N, i1); j1 = Math.min(N, j1);
    const H = this.H;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const v = j * W + i, l = H[j * W + Math.max(0, i - 1)], r = H[j * W + Math.min(N, i + 1)];
      const u = H[Math.max(0, j - 1) * W + i], d = H[Math.min(N, j + 1) * W + i];
      let nx = l - r, nz = u - d; const ny = 2 * CELL, inv = 1 / Math.hypot(nx, ny, nz);
      this.pos[v * 3 + 1] = H[v];
      this.nor[v * 3] = nx * inv; this.nor[v * 3 + 1] = ny * inv; this.nor[v * 3 + 2] = nz * inv;
      const x = i * CELL - HALF, z = j * CELL - HALF;
      const macro = 0.52 + 0.2 * fbm(x * 0.12, z * 0.12, 21), w = this.wet[v];
      const k = macro * (1 - 0.38 * w), alt = Math.min(1, Math.max(0, H[v] / 5));
      this.col[v * 3] = k * (1 + 0.06 * alt); this.col[v * 3 + 1] = k * (1 + 0.02 * alt); this.col[v * 3 + 2] = k * (1 - 0.1 * alt);
    }
    const g = this.mesh?.geometry;
    if (g) for (const n of ['position', 'normal', 'color']) g.attributes[n].needsUpdate = true;
  }

  alturaEn(x, z) {                               // altura bilineal en metros del mundo
    const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL;
    if (fx < 0 || fz < 0 || fx >= N || fz >= N) return 0;
    const i = Math.floor(fx), j = Math.floor(fz), a = fx - i, b = fz - j, H = this.H, o = j * W + i;
    return (H[o] * (1 - a) + H[o + 1] * a) * (1 - b) + (H[o + W] * (1 - a) + H[o + W + 1] * a) * b;
  }

  ensuciar(i0, i1, j0, j1) {                     // zona cuya malla hay que reescribir
    const v = this.sucio;
    this.sucio = v ? { i0: Math.min(v.i0, i0), i1: Math.max(v.i1, i1), j0: Math.min(v.j0, j0), j1: Math.max(v.j1, j1) } : { i0, i1, j0, j1 };
  }

  tocar(i0, i1, j0, j1) {                        // marca una zona como modificada
    this.ensuciar(i0, i1, j0, j1);
    const b = this.box;
    this.box = b ? { i0: Math.min(b.i0, i0), i1: Math.max(b.i1, i1), j0: Math.min(b.j0, j0), j1: Math.max(b.j1, j1) } : { i0, i1, j0, j1 };
    this.dirty = true;
  }

  sumar(x, z, volumen) {                         // suelta tierra en un punto (una partícula que aterriza)
    const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL;
    if (fx < 1 || fz < 1 || fx > N - 1 || fz > N - 1) return;
    const i = Math.floor(fx), j = Math.floor(fz), a = fx - i, b = fz - j, dh = volumen / (CELL * CELL), o = j * W + i;
    this.H[o] += dh * (1 - a) * (1 - b); this.H[o + 1] += dh * a * (1 - b);
    this.H[o + W] += dh * (1 - a) * b; this.H[o + W + 1] += dh * a * b;
    this.tocar(i - 2, i + 3, j - 2, j + 3);
  }

  cavar(x, z, rx, rz, ang, volumen) {            // muerde un óvalo del suelo; devuelve el volumen realmente sacado
    const R = Math.max(rx, rz) * 1.2, i0 = Math.floor((x - R + HALF) / CELL), i1 = Math.ceil((x + R + HALF) / CELL);
    const j0 = Math.floor((z - R + HALF) / CELL), j1 = Math.ceil((z + R + HALF) / CELL), cs = Math.cos(ang), sn = Math.sin(ang);
    const celdas = []; let suma = 0;
    for (let j = Math.max(1, j0); j <= Math.min(N - 1, j1); j++) for (let i = Math.max(1, i0); i <= Math.min(N - 1, i1); i++) {
      const dx = i * CELL - HALF - x, dz = j * CELL - HALF - z;
      const u = (dx * cs + dz * sn) / rx, v = (-dx * sn + dz * cs) / rz, r2 = u * u + v * v;
      if (r2 >= 1.44) continue;
      const w = Math.exp(-r2 * 1.6); celdas.push(j * W + i, w); suma += w;
    }
    if (!suma) return 0;
    let sacado = 0; const k = volumen / (suma * CELL * CELL);
    for (let n = 0; n < celdas.length; n += 2) {
      const v = celdas[n], q = Math.min(k * celdas[n + 1], Math.max(0, this.H[v] - PISO));
      this.H[v] -= q; sacado += q * CELL * CELL; this.wet[v] = Math.min(1, this.wet[v] + 0.6);
    }
    this.tocar(i0 - 2, i1 + 2, j0 - 2, j1 + 2);
    return sacado;
  }

  relax() {                                      // desmorona hacia el ángulo de reposo; true si algo se movió
    const b = this.box; if (!b) return false;
    const i0 = Math.max(1, b.i0 - 1), i1 = Math.min(N - 1, b.i1 + 1), j0 = Math.max(1, b.j0 - 1), j1 = Math.min(N - 1, b.j1 + 1);
    const H = this.H, D = this.delta, lim = REPOSE * CELL, limD = lim * 1.4142, k = 0.11; let mov = 0, a0 = N, a1 = 0, c0 = N, c1 = 0;
    const vec = [[1, 0, lim], [-1, 0, lim], [0, 1, lim], [0, -1, lim], [1, 1, limD], [-1, 1, limD], [1, -1, limD], [-1, -1, limD]];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const c = j * W + i, h = H[c];
      for (const [di, dj, l] of vec) {
        const n = c + dj * W + di, ex = h - H[n] - l;
        if (ex > 0.002) { const f = ex * k; D[c] -= f; D[n] += f; mov += f; if (i < a0) a0 = i; if (i > a1) a1 = i; if (j < c0) c0 = j; if (j > c1) c1 = j; }
      }
    }
    for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) { const c = j * W + i; if (D[c]) { H[c] += D[c]; D[c] = 0; } }
    this.box = mov > 0.002 ? { i0: a0 - 2, i1: a1 + 2, j0: c0 - 2, j1: c1 + 2 } : null;
    if (mov > 0) this.ensuciar(a0 - 2, a1 + 2, c0 - 2, c1 + 2);
    return mov > 0;
  }

  paso() {                                       // se llama una vez por cuadro
    if (!this.box && !this.dirty && !this.sucio) return;
    const area = this.box ? (this.box.i1 - this.box.i0) * (this.box.j1 - this.box.j0) : 0;
    const iter = area > 30000 ? 2 : 4;
    for (let k = 0; k < iter && this.box; k++) this.relax();
    const v = this.sucio; this.sucio = null; this.dirty = false;
    if (v) this.actualizarMalla(v.i0 - 2, v.i1 + 2, v.j0 - 2, v.j1 + 2);
  }
}

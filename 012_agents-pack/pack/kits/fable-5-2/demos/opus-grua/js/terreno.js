// Suelo de la obra: mapa de alturas deformable (cavar resta, soltar suma) con relajación por ángulo de reposo.
import * as THREE from 'three';
import { TERRENO, SITIO } from './config.js';
import { materialSuelo } from './suelo-material.js';

const N = TERRENO.celdas, L = TERRENO.tam, D = L / N, M = N + 1;
const X0 = TERRENO.centroX - L / 2, Z0 = TERRENO.centroZ - L / 2;
const PEND = Math.tan(TERRENO.reposo) * D;          // máxima diferencia entre vecinos

const VEC = [1, M, M + 1, M - 1], LIM = [1, 1, Math.SQRT2, Math.SQRT2];
const UMBRAL = Float32Array.from({ length: 256 }, () => 0.95 + Math.random() * 0.25);   // irregularidad del suelo
const ruido = (x, z) => Math.sin(x * 1.7 + z * 0.3) * Math.sin(z * 1.3 - x * 0.4) * 0.5 + Math.sin(x * 0.37 + 2.1) * Math.sin(z * 0.29 + 0.7);

export class Terreno {
  constructor() {
    this.h = new Float32Array(M * M);
    this.fresco = new Float32Array(M * M);
    this.camino = new Float32Array(M * M);
    this.sucio = null;                              // rectángulo [i0,j0,i1,j1] por actualizar
    this.activo = null;                             // rectángulo por relajar
    this.inicial();
    this.activo = [0, 0, N, N]; this.relajar(120);      // la montaña inicial ya asentada
    this.mesh = this.crearMalla();
  }
  idx(i, j) { return j * M + i; }
  aGrilla(x, z) { return [(x - X0) / D, (z - Z0) / D]; }
  aMundo(i, j) { return [X0 + i * D, Z0 + j * D]; }
  get celda() { return D; }

  inicial() {
    const p = SITIO.pila, cz = SITIO.camion.z;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const [x, z] = this.aMundo(i, j), k = this.idx(i, j);
      let y = ruido(x, z) * 0.06;
      const d = Math.hypot((x - p.x) * 0.8, (z - p.z) * 1.1) + ruido(x * 0.6, z * 0.6) * 0.6;
      if (d < p.r) { const c = p.h * Math.tanh((p.r - d) * 0.6 / p.h); y += c + ruido(x * 2, z * 2) * 0.12 * (c / p.h); this.fresco[k] = 0.85; }
      const dc = Math.abs(z - cz);                   // camino de ripio compactado
      if (dc < 3.2) { this.camino[k] = THREE.MathUtils.smoothstep(3.2 - dc, 0, 1.2); y = y * (1 - this.camino[k]) - 0.04 * this.camino[k]; }
      this.h[k] = y;
    }
  }

  crearMalla() {
    const g = new THREE.PlaneGeometry(L, L, N, N);
    g.rotateX(-Math.PI / 2);
    g.translate(TERRENO.centroX, 0, TERRENO.centroZ);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let v = 0; v < pos.count; v++) uv.setXY(v, pos.getX(v) / 5, pos.getZ(v) / 5);
    g.setAttribute('suelo', new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2));
    const mesh = new THREE.Mesh(g, materialSuelo());
    mesh.receiveShadow = true; mesh.castShadow = true;
    this.geo = g;
    this.sucio = [0, 0, N, N];
    this.actualizarMalla();
    return mesh;
  }

  // PlaneGeometry rotada: el vértice (i, j) es el índice j*M+i con z creciente hacia +j.
  actualizarMalla() {
    if (!this.sucio) return;
    const [i0, j0, i1, j1] = this.sucio; this.sucio = null;
    const pos = this.geo.attributes.position.array, nor = this.geo.attributes.normal.array, su = this.geo.attributes.suelo.array, h = this.h;
    for (let j = Math.max(0, j0 - 1); j <= Math.min(N, j1 + 1); j++) for (let i = Math.max(0, i0 - 1); i <= Math.min(N, i1 + 1); i++) {
      const k = j * M + i;
      pos[k * 3 + 1] = h[k];
      const hl = h[j * M + Math.max(0, i - 1)], hr = h[j * M + Math.min(N, i + 1)];
      const hd = h[Math.max(0, j - 1) * M + i], hu = h[Math.min(N, j + 1) * M + i];
      let nx = hl - hr, ny = 2 * D, nz = hd - hu; const inv = 1 / Math.hypot(nx, ny, nz);
      nor[k * 3] = nx * inv; nor[k * 3 + 1] = ny * inv; nor[k * 3 + 2] = nz * inv;
      su[k * 2] = this.fresco[k]; su[k * 2 + 1] = this.camino[k];
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.normal.needsUpdate = true;
    this.geo.attributes.suelo.needsUpdate = true;
    this.geo.computeBoundingSphere();
  }

  marcar(i0, j0, i1, j1) {
    const r = [Math.max(0, i0), Math.max(0, j0), Math.min(N, i1), Math.min(N, j1)];
    const une = (a) => (a ? [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])] : r.slice());
    this.sucio = une(this.sucio); this.activo = une(this.activo);
  }

  altura(x, z) {
    let [gi, gj] = this.aGrilla(x, z);
    if (gi < 0 || gj < 0 || gi >= N || gj >= N) return 0;
    const i = Math.floor(gi), j = Math.floor(gj), fx = gi - i, fz = gj - j, h = this.h;
    const a = h[j * M + i], b = h[j * M + i + 1], c = h[(j + 1) * M + i], d = h[(j + 1) * M + i + 1];
    return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
  }

  // Suma un volumen (m³) repartido en un círculo de radio r (m) con forma de campana.
  agregar(x, z, vol, r = 0.6) {
    const [gi, gj] = this.aGrilla(x, z), R = r / D;
    const i0 = Math.floor(gi - R), i1 = Math.ceil(gi + R), j0 = Math.floor(gj - R), j1 = Math.ceil(gj + R);
    let suma = 0; const pesos = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (i < 1 || j < 1 || i >= N || j >= N) continue;
      const w = Math.max(0, 1 - Math.hypot(i - gi, j - gj) / (R + 0.5)); if (w > 0) { pesos.push(j * M + i, w); suma += w; }
    }
    if (!suma) return;
    const esc = vol / (D * D) / suma;
    for (let n = 0; n < pesos.length; n += 2) { const k = pesos[n]; this.h[k] += pesos[n + 1] * esc; this.fresco[k] = Math.min(1, this.fresco[k] + 0.4); }
    this.marcar(i0, j0, i1, j1);
  }

  // Relajación por ángulo de reposo (conserva la masa). Corre sólo en la zona activa.
  relajar(pasadas = 3) {
    if (!this.activo) return;
    const h = this.h;
    for (let p = 0; p < pasadas && this.activo; p++) {
      const [a0, b0, a1, b1] = this.activo; this.activo = null;
      let ci0 = 1e9, cj0 = 1e9, ci1 = -1, cj1 = -1;
      for (let j = Math.max(1, b0 - 1); j <= Math.min(N - 2, b1 + 1); j++) for (let i = Math.max(1, a0 - 1); i <= Math.min(N - 2, a1 + 1); i++) {
        const k = j * M + i;
        for (let v = 0; v < 4; v++) {                // 8 vecinos (4 pares por celda): sin diagonales sale una pirámide
          const k2 = k + VEC[v], dif = h[k] - h[k2], alto = dif > 0 ? k : k2;
          // tierra suelta: ángulo de reposo; suelo sin tocar (compactado): aguanta paredes más paradas
          const exc = Math.abs(dif) - PEND * LIM[v] * UMBRAL[k & 255] * (this.fresco[alto] < 0.45 ? 2.6 : 1);
          if (exc <= 0.002) continue;
          const t = exc * (v < 2 ? 0.2 : 0.12) * Math.sign(dif);
          h[k] -= t; h[k2] += t;
          const bajo = dif > 0 ? k2 : k;
          this.fresco[bajo] = Math.max(this.fresco[bajo], this.fresco[alto] * 0.9, 0.5);
          if (i < ci0) ci0 = i; if (i > ci1) ci1 = i; if (j < cj0) cj0 = j; if (j > cj1) cj1 = j;
        }
      }
      if (ci1 >= 0) this.marcar(ci0 - 1, cj0 - 1, ci1 + 2, cj1 + 2);
    }
  }
}

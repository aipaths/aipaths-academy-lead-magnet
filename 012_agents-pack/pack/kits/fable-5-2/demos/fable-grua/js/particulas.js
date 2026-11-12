import * as THREE from 'three';
import { azar } from './ruido.js';
import { depositar } from './tierra.js';

const MAX = 3600, G = 9.81;
// La tierra en el aire: terrones que caen, y al tocar el suelo (o la caja del camión) se suman al montón.
export class Particulas {
  constructor(terreno) {
    this.t = terreno; this.n = 0; this.rnd = azar(7);
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3); this.vol = new Float32Array(MAX); this.tam = new Float32Array(MAX);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    this.malla = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat, MAX);
    this.malla.castShadow = true; this.malla.frustumCulled = false; this.malla.count = 0;
    const c = new THREE.Color();
    for (let i = 0; i < MAX; i++) { const g = 0.5 + this.rnd() * 0.5; this.malla.setColorAt(i, c.setRGB(0.20 * g, 0.135 * g, 0.085 * g)); }
    this.receptores = [];      // quien quiera atajar tierra antes del suelo (el camión)
    this.alCaer = null;        // aviso para el sonido y el polvo
    this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.s = new THREE.Vector3(); this.o = new THREE.Vector3();
  }
  soltar(x, y, z, vx, vy, vz, vol) {
    if (this.n >= MAX) { depositar(this.t, x, z, vol); return; }
    const k = this.n++ * 3, r = this.rnd;
    this.p[k] = x; this.p[k + 1] = y; this.p[k + 2] = z; this.v[k] = vx; this.v[k + 1] = vy; this.v[k + 2] = vz;
    this.vol[k / 3] = vol; this.tam[k / 3] = 0.05 + r() * r() * 0.11;
  }
  paso(dt) {
    const { p, v, vol, tam, t } = this; let cayeron = 0, cx = 0, cy = 0, cz = 0; this.caidas = 0; this.enCaja = 0;
    for (let i = 0; i < this.n; i++) {
      const k = i * 3;
      v[k + 1] -= G * dt; const roce = 1 - 0.25 * dt; v[k] *= roce; v[k + 2] *= roce;
      p[k] += v[k] * dt; p[k + 1] += v[k + 1] * dt; p[k + 2] += v[k + 2] * dt;
      let fin = false;
      for (const rec of this.receptores) if (rec(p[k], p[k + 1], p[k + 2], vol[i])) { fin = true; this.enCaja++; break; }
      if (!fin && p[k + 1] <= t.alturaEn(p[k], p[k + 2])) { depositar(t, p[k], p[k + 2], vol[i]); fin = true; this.caidas++; }
      if (fin) {
        cayeron++; cx = p[k]; cy = p[k + 1]; cz = p[k + 2];
        const u = --this.n, ku = u * 3;            // la última ocupa su lugar
        p[k] = p[ku]; p[k + 1] = p[ku + 1]; p[k + 2] = p[ku + 2]; v[k] = v[ku]; v[k + 1] = v[ku + 1]; v[k + 2] = v[ku + 2]; vol[i] = vol[u]; tam[i] = tam[u]; i--;
      }
    }
    if (cayeron && this.alCaer) this.alCaer(cayeron, cx, cy, cz);
  }
  dibujar() {
    const { p, tam, m, q, s, o } = this;
    for (let i = 0; i < this.n; i++) { const k = i * 3; m.compose(o.set(p[k], p[k + 1], p[k + 2]), q.set(Math.sin(i), Math.cos(i * 1.3), Math.sin(i * 2.1), 1).normalize(), s.set(tam[i], tam[i] * 0.8, tam[i])); this.malla.setMatrixAt(i, m); }
    this.malla.count = this.n; this.malla.instanceMatrix.needsUpdate = true;
  }
}

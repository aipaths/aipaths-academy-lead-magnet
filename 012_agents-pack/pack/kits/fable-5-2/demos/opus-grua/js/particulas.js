// Tierra en el aire: unos pocos miles de terrones (InstancedMesh). Al tocar el suelo o la caja
// del camión se convierten en volumen del mapa de alturas.
import * as THREE from 'three';
import { tex } from './texturas.js';

const MAX = 7000;
export class Particulas {
  constructor(escena, terreno) {
    this.terreno = terreno; this.receptores = [];
    const g = new THREE.IcosahedronGeometry(1, 0);
    const m = new THREE.MeshStandardMaterial({ map: tex('brown_mud_02_diff_1k.jpg', { color: true }), roughness: 1, color: 0xffffff });
    g.scale(1, 0.75, 1);
    this.malla = new THREE.InstancedMesh(g, m, MAX);
    this.malla.castShadow = false; this.malla.count = 0;   // sin sombra: miles de terrones en la pasada de sombras costaban fps this.malla.frustumCulled = false;
    this.malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    escena.add(this.malla);
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3);
    this.vol = new Float32Array(MAX); this.tam = new Float32Array(MAX); this.rot = new Float32Array(MAX);
    this.col = new THREE.Color(); this.malla.setColorAt(0, this.col.set(0x6b5640));
    this.n = 0; this.caidoUltimo = 0;              // m³ que tocaron el piso en el último cuadro (para el sonido)
    this.m4 = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); this.s = new THREE.Vector3(); this.t = new THREE.Vector3();
  }
  get activas() { return this.n; }

  emitir(x, y, z, vx, vy, vz, vol) {
    if (this.n >= MAX) { this.terreno.agregar(x, z, vol); return; }
    const i = this.n++, k = i * 3;
    this.p[k] = x; this.p[k + 1] = y; this.p[k + 2] = z; this.v[k] = vx; this.v[k + 1] = vy; this.v[k + 2] = vz;
    const r = Math.random(); this.vol[i] = vol; this.tam[i] = 0.035 + r * r * r * 0.14; this.rot[i] = Math.random() * 6;   // muchos chicos, pocos terrones grandes
    this.malla.setColorAt(i, this.col.setHSL(0.07 + Math.random() * 0.03, 0.32, 0.2 + Math.random() * 0.16));
  }

  actualizar(dt) {
    const p = this.p, v = this.v; let caido = 0;
    for (let i = 0; i < this.n; i++) {
      const k = i * 3;
      v[k + 1] -= 9.81 * dt;
      const arrastre = 1 - 0.25 * dt; v[k] *= arrastre; v[k + 2] *= arrastre;
      p[k] += v[k] * dt; p[k + 1] += v[k + 1] * dt; p[k + 2] += v[k + 2] * dt;
      let toco = false;
      for (const r of this.receptores) if (r.recibir(p[k], p[k + 1], p[k + 2], this.vol[i])) { toco = true; break; }
      if (!toco && p[k + 1] <= this.terreno.altura(p[k], p[k + 2])) { this.terreno.agregar(p[k], p[k + 2], this.vol[i], 0.55); toco = true; }
      if (toco) {                                   // se saca intercambiando con la última
        if (this.polvo && Math.random() < 0.05) this.polvo.soplar(p[k], p[k + 1], p[k + 2]);
        caido += this.vol[i]; const u = --this.n, ku = u * 3;
        p[k] = p[ku]; p[k + 1] = p[ku + 1]; p[k + 2] = p[ku + 2]; v[k] = v[ku]; v[k + 1] = v[ku + 1]; v[k + 2] = v[ku + 2];
        this.vol[i] = this.vol[u]; this.tam[i] = this.tam[u]; this.rot[i] = this.rot[u];
        this.malla.getColorAt(u, this.col); this.malla.setColorAt(i, this.col); i--;
      }
    }
    this.caidoUltimo = caido;
    for (let i = 0; i < this.n; i++) {
      const k = i * 3; this.rot[i] += dt * 4;
      this.e.set(this.rot[i], this.rot[i] * 0.7, 0); this.q.setFromEuler(this.e);
      this.s.setScalar(this.tam[i]); this.t.set(p[k], p[k + 1], p[k + 2]);
      this.malla.setMatrixAt(i, this.m4.compose(this.t, this.q, this.s));
    }
    this.malla.count = this.n;
    this.malla.instanceMatrix.needsUpdate = true;
    if (this.malla.instanceColor) this.malla.instanceColor.needsUpdate = true;
  }
}

// Tierra en tránsito: unos pocos miles de terrones (InstancedMesh). Al aterrizar se funden con el mapa de alturas o el volquete.
import * as THREE from 'three';
import { pbr } from './textures.js';
import { aleatorio } from './noise.js';

export const VOL_PARTICULA = 0.0012;           // m³ por terrón (≈ 1250 por cada 1,5 m³ de almeja)
const MAX = 4500, G = 9.8;

export class Particulas {
  constructor(scene, terreno) {
    this.terreno = terreno; this.n = 0; this.rnd = aleatorio(7); this.camion = null; this.polvo = null; this.aterrizajes = 0; this.eventos = [];
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3); this.s = new Float32Array(MAX);
    const m = pbr('brown_mud_dry', { rep: 1 });
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshStandardMaterial({ ...m, color: 0x8a6e52, roughness: 1, flatShading: true }), MAX);
    this.mesh.count = 0; this.mesh.frustumCulled = false; this.mesh.castShadow = true;
    const c = new THREE.Color();
    for (let i = 0; i < MAX; i++) this.mesh.setColorAt(i, c.setScalar(0.75 + this.rnd() * 0.5));
    scene.add(this.mesh);
    this.m4 = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); this.pos = new THREE.Vector3(); this.esc = new THREE.Vector3();
  }

  lanzar(x, y, z, vx, vy, vz) {
    if (this.n >= MAX) { this.terreno.sumar(x, z, VOL_PARTICULA); return false; }   // sin lugar: cae directo al suelo
    const i = this.n++, r = this.rnd;
    this.p.set([x, y, z], i * 3); this.v.set([vx, vy, vz], i * 3); this.s[i] = 0.1 + r() * 0.09;
    return true;
  }

  paso(dt) {
    const { p, v, s, terreno } = this;
    for (let i = 0; i < this.n; i++) {
      const o = i * 3, sp = Math.hypot(v[o], v[o + 1], v[o + 2]), arr = 0.05 * sp;
      v[o] -= v[o] * arr * dt; v[o + 2] -= v[o + 2] * arr * dt; v[o + 1] -= (G + v[o + 1] * arr) * dt;
      p[o] += v[o] * dt; p[o + 1] += v[o + 1] * dt; p[o + 2] += v[o + 2] * dt;
      const gy = terreno.alturaEn(p[o], p[o + 2]) + s[i] * 0.4;
      let fin = p[o + 1] <= gy;
      if (!fin && this.camion?.recibe(p[o], p[o + 1], p[o + 2])) { fin = true; this.camion.agregar(VOL_PARTICULA); this.eventos.push(p[o], p[o + 1], p[o + 2], 1); this.aterrizajes++; }
      else if (fin) { terreno.sumar(p[o], p[o + 2], VOL_PARTICULA); this.eventos.push(p[o], gy, p[o + 2], 0); this.aterrizajes++; }
      if (fin) { if (this.polvo && (this.aterrizajes & 3) === 0) this.polvo.emitir(p[o], p[o + 1] + 0.1, p[o + 2], { size: 1.1, grow: 3.4, life: 1.6, alpha: 0.34, up: 0.8, v: 1.4 }); this.quitar(i--); }
    }
    this.dibujar();
  }

  quitar(i) {
    const u = --this.n;
    if (i !== u) { this.p.copyWithin(i * 3, u * 3, u * 3 + 3); this.v.copyWithin(i * 3, u * 3, u * 3 + 3); this.s[i] = this.s[u]; }
  }

  dibujar() {
    const { m4, q, e, pos, esc } = this;
    for (let i = 0; i < this.n; i++) {
      const o = i * 3;
      q.setFromEuler(e.set(i * 1.7 + this.p[o] * 3, i * 0.9, this.p[o + 2] * 2));
      esc.set(this.s[i] * 1.0, this.s[i] * 0.8, this.s[i] * 1.1);
      this.mesh.setMatrixAt(i, m4.compose(pos.set(this.p[o], this.p[o + 1], this.p[o + 2]), q, esc));
    }
    this.mesh.count = this.n; this.mesh.instanceMatrix.needsUpdate = true;
  }
}

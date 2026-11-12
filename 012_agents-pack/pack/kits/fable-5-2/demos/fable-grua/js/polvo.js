import * as THREE from 'three';
import { azar } from './ruido.js';

const MAX = 420;
// Polvo de tierra y humo del escape: bocanadas que crecen, se frenan y se desvanecen.
export class Polvo {
  constructor() {
    this.n = 0; this.r = azar(23);
    this.p = new Float32Array(MAX * 3); this.v = new Float32Array(MAX * 3); this.vida = new Float32Array(MAX); this.dur = new Float32Array(MAX);
    this.tam = new Float32Array(MAX); this.alfa = new Float32Array(MAX); this.tono = new Float32Array(MAX); this.t0 = new Float32Array(MAX);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3)); g.setAttribute('tam', new THREE.BufferAttribute(this.tam, 1));
    g.setAttribute('alfa', new THREE.BufferAttribute(this.alfa, 1)); g.setAttribute('tono', new THREE.BufferAttribute(this.tono, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { escala: { value: 1000 } },
      vertexShader: `attribute float tam; attribute float alfa; attribute float tono; uniform float escala; varying float vA; varying float vT;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = tam * escala / -mv.z; vA = alfa; vT = tono; }`,
      fragmentShader: `varying float vA; varying float vT;
        void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); a = a * a * vA; if (a < 0.004) discard;
          gl_FragColor = vec4(mix(vec3(0.46, 0.36, 0.26), vec3(0.06, 0.06, 0.065), vT), a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.puntos = new THREE.Points(g, this.mat); this.puntos.frustumCulled = false; this.puntos.renderOrder = 5; g.setDrawRange(0, 0);
  }
  // humo = 0 para polvo de tierra, 1 para humo de escape
  soplar(x, y, z, cuantos, radio, sube, tam, humo = 0, fuerza = 0.5) {
    const r = this.r;
    for (let i = 0; i < cuantos && this.n < MAX; i++) {
      const k = this.n * 3, a = r() * 6.283, d = Math.sqrt(r()) * radio;
      this.p[k] = x + Math.cos(a) * d; this.p[k + 1] = y + r() * 0.3; this.p[k + 2] = z + Math.sin(a) * d;
      this.v[k] = Math.cos(a) * (0.4 + r()) * radio * 0.8; this.v[k + 1] = sube * (0.5 + r()); this.v[k + 2] = Math.sin(a) * (0.4 + r()) * radio * 0.8;
      this.vida[this.n] = 0; this.dur[this.n] = 1.6 + r() * 2.2; this.t0[this.n] = tam * (0.6 + r() * 0.8); this.tono[this.n] = humo; this.alfa[this.n] = fuerza; this.fz = fuerza; this.n++;
    }
  }
  paso(dt) {
    const { p, v } = this;
    for (let i = 0; i < this.n; i++) {
      const k = i * 3; this.vida[i] += dt;
      if (this.vida[i] >= this.dur[i]) {
        const u = --this.n, ku = u * 3; p[k] = p[ku]; p[k + 1] = p[ku + 1]; p[k + 2] = p[ku + 2]; v[k] = v[ku]; v[k + 1] = v[ku + 1]; v[k + 2] = v[ku + 2];
        this.vida[i] = this.vida[u]; this.dur[i] = this.dur[u]; this.t0[i] = this.t0[u]; this.tono[i] = this.tono[u]; i--; continue;
      }
      const f = 1 - 1.4 * dt; v[k] *= f; v[k + 1] *= f; v[k + 2] *= f;
      p[k] += (v[k] + 0.5) * dt; p[k + 1] += v[k + 1] * dt; p[k + 2] += (v[k + 2] + 0.25) * dt;       // un poco de viento
      const t = this.vida[i] / this.dur[i];
      this.tam[i] = this.t0[i] * (1 + t * 1.9); this.alfa[i] = (this.tono[i] ? 0.3 : 0.13) * Math.min(1, t * 8) * (1 - t) * (1 - t);
    }
  }
  dibujar(render, camara) {
    const g = this.puntos.geometry; for (const n of ['position', 'tam', 'alfa', 'tono']) g.attributes[n].needsUpdate = true;
    g.setDrawRange(0, this.n);
    this.mat.uniforms.escala.value = render.domElement.height / (2 * Math.tan((camara.fov * Math.PI) / 360));
  }
}

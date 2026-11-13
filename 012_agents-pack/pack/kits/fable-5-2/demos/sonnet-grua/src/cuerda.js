// Cable como tubo flexible: un anillo de vértices por punto de la polilínea, recalculado cada cuadro.
import * as THREE from 'three';

const A = new THREE.Vector3(), B = new THREE.Vector3(), T = new THREE.Vector3(), R = new THREE.Vector3();
const LADOS = 5;

export class Cuerda {
  constructor(puntos, radio, mat) {
    this.n = puntos; this.radio = radio;
    this.pos = new Float32Array(puntos * LADOS * 3); this.nor = new Float32Array(puntos * LADOS * 3);
    const idx = [];
    for (let i = 0; i < puntos - 1; i++) for (let k = 0; k < LADOS; k++) {
      const a = i * LADOS + k, b = i * LADOS + (k + 1) % LADOS, c = a + LADOS, d = b + LADOS;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    this.mesh = new THREE.Mesh(g, mat); this.mesh.castShadow = true; this.mesh.frustumCulled = false;
  }

  poner(pts) {                                    // pts: arreglo de Vector3 (mundo)
    const n = this.n;
    for (let i = 0; i < n; i++) {
      const p = pts[i], p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
      T.subVectors(p1, p0).normalize();
      R.set(0, 1, 0); if (Math.abs(T.y) > 0.9) R.set(1, 0, 0);
      A.crossVectors(T, R).normalize(); B.crossVectors(T, A);
      for (let k = 0; k < LADOS; k++) {
        const t = (k / LADOS) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), o = (i * LADOS + k) * 3;
        const nx = A.x * c + B.x * s, ny = A.y * c + B.y * s, nz = A.z * c + B.z * s;
        this.nor[o] = nx; this.nor[o + 1] = ny; this.nor[o + 2] = nz;
        this.pos[o] = p.x + nx * this.radio; this.pos[o + 1] = p.y + ny * this.radio; this.pos[o + 2] = p.z + nz * this.radio;
      }
    }
    const g = this.mesh.geometry; g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  }
}

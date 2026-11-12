// Suelo lejano: malla polar que se ensancha hasta 1,5 km, con lomas suaves y color variable para que no se vea el borde ni el mosaico.
import * as THREE from 'three';
import { fbm } from './noise.js';
import { pbr } from './textures.js';

export function crearHorizonte(scene) {
  const NA = 192, NR = 56, R0 = 28, R1 = 1700, pos = [], col = [], uv = [], idx = [];
  const c = new THREE.Color(), seco = new THREE.Color(0.6, 0.58, 0.55), verde = new THREE.Color(0.46, 0.5, 0.34), lomas = new THREE.Color(0.52, 0.5, 0.44);
  for (let j = 0; j <= NR; j++) for (let i = 0; i <= NA; i++) {
    const r = R0 * Math.pow(R1 / R0, j / NR), a = (i / NA) * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const m = Math.min(1, Math.max(0, (r - 130) / 420)), h = Math.pow(m, 1.3) * (fbm(x * 0.0035, z * 0.0035, 31) * 70 - 16) * (0.6 + 0.4 * fbm(x * 0.001, z * 0.001, 8));
    pos.push(x, Math.max(-0.06, h) - 0.04 * (1 - m), z); uv.push(x / 3, z / 3);
    const g = fbm(x * 0.006, z * 0.006, 12); c.copy(seco).lerp(verde, Math.min(1, Math.max(0, (g - 0.4) * 2.6)) * Math.min(1, r / 150)).lerp(lomas, m * 0.5);
    const v = 0.85 + 0.3 * fbm(x * 0.03, z * 0.03, 15); col.push(c.r * v, c.g * v, c.b * v);
  }
  for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + 1, d = a + NA + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = pbr('brown_mud_dry', { rep: 1 });
  const malla = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ ...m, vertexColors: true, roughness: 1 }));
  malla.receiveShadow = true; scene.add(malla); return malla;
}

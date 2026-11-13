// Fábrica de geometría: junta cajas, cilindros y barras por material en pocas mallas (pocos draw calls).
import * as THREE from 'three';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';

const V = new THREE.Vector3(), Q = new THREE.Quaternion(), M = new THREE.Matrix4(), E = new THREE.Euler(), UNO = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);

export class Fabrica {
  constructor() { this.grupos = new Map(); }

  meter(mat, geom, matriz) {
    geom.applyMatrix4(matriz);
    if (!this.grupos.has(mat)) this.grupos.set(mat, []);
    this.grupos.get(mat).push(geom);
  }

  caja(mat, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) {
    this.meter(mat, new THREE.BoxGeometry(sx, sy, sz), M.compose(V.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), UNO).clone());
  }

  cilindro(mat, r, largo, x, y, z, eje = 'y', seg = 16, r2 = r) {
    const g = new THREE.CylinderGeometry(r2, r, largo, seg);
    if (eje === 'x') g.rotateZ(Math.PI / 2); else if (eje === 'z') g.rotateX(Math.PI / 2);
    this.meter(mat, g, M.makeTranslation(x, y, z).clone());
  }

  barra(mat, a, b, r, seg = 6) {                 // cilindro entre dos puntos
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    if (L < 1e-5) return;
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d.normalize());
    const m = new THREE.Matrix4().compose(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), q, UNO);
    this.meter(mat, new THREE.CylinderGeometry(r, r, L, seg, 1), m);
  }

  crear() {
    const g = new THREE.Group();
    for (const [mat, lista] of this.grupos) {
      const m = new THREE.Mesh(mergeGeometries(lista, false), mat);
      m.castShadow = m.receiveShadow = true; g.add(m); lista.forEach((x) => x.dispose());
    }
    return g;
  }
}
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

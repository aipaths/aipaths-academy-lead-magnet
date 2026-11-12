// Pluma de celosía (No. 1311, sección 1,43 m) de 24 m: pie que se angosta, tramos, cabeza con poleas.
// También los tirantes del pórtico en A a la cabeza y los cables de los cabrestantes.
import * as THREE from 'three';
import { GRUA } from './config.js';
import { MAT, tubo, caja, fusionar } from './materiales.js';
import { CableRecto } from './cable-recto.js';
import { APEX } from './superestructura.js';

const L = GRUA.plumaLargo, W = GRUA.plumaAncho / 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const medio = (x) => (x < 5.5 ? 0.22 + (W - 0.22) * Math.sin(x / 5.5 * Math.PI / 2) : x > L - 4 ? W - (W - 0.42) * (x - (L - 4)) / 4 : W);
const ancho = (x) => (x > L - 4 ? W - (W - 0.5) * (x - (L - 4)) / 4 : x < 1.2 ? W + 0.12 * (1 - x / 1.2) : W);

function celosia() {
  const cordones = [], celos = [];
  const nodos = []; for (let x = 0.15; x <= L - 0.4 + 1e-6; x += (L - 0.55) / 20) nodos.push(x);
  for (let k = 0; k < nodos.length; k++) {
    const x = nodos[k], h = medio(x), w = ancho(x);
    const p = [V(x, h, w), V(x, h, -w), V(x, -h, -w), V(x, -h, w)];
    for (let c = 0; c < 4; c++) celos.push(tubo(p[c], p[(c + 1) % 4], 0.03, 5));          // marco del nodo
    if (k === 0) continue;
    const x0 = nodos[k - 1], h0 = medio(x0), w0 = ancho(x0);
    const q = [V(x0, h0, w0), V(x0, h0, -w0), V(x0, -h0, -w0), V(x0, -h0, w0)];
    for (let c = 0; c < 4; c++) {
      cordones.push(tubo(q[c], p[c], 0.075, 8));                                          // cordones
      const alt = k % 2 ? [q[c], p[(c + 1) % 4]] : [q[(c + 1) % 4], p[c]];
      celos.push(tubo(alt[0], alt[1], 0.03, 5));                                         // diagonales en zigzag
    }
  }
  return { cordones: fusionar(cordones), celos: fusionar(celos) };
}

function cabeza() {
  const partes = [caja(0.9, 1.0, 0.08, L - 0.15, 0, 0.5), caja(0.9, 1.0, 0.08, L - 0.15, 0, -0.5), caja(0.5, 0.12, 1.0, L - 0.4, 0.42, 0)];
  partes.push(tubo(V(L + 0.15, -0.1, -0.55), V(L + 0.15, -0.1, 0.55), 0.09, 10));
  const poleas = [];
  for (const z of [-0.3, 0, 0.3]) { const s = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 28); s.rotateX(Math.PI / 2); s.translate(L + 0.15, -0.1, z); poleas.push(s); }
  // pie: bulones de articulación
  partes.push(tubo(V(0, 0, -1.0), V(0, 0, 1.0), 0.12, 12));
  return { cabeza: fusionar(partes), poleas: fusionar(poleas) };
}

export function crearPluma(pivote, giro) {
  const c = celosia(), h = cabeza();
  for (const [g, m] of [[c.cordones, MAT.amarillo], [c.celos, MAT.amarillo], [h.cabeza, MAT.amarillo], [h.poleas, MAT.grisOscuro]]) {
    const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; pivote.add(me);
  }
  // Tirantes: cima del pórtico → aparejo (6 ramales) → 2 péndulos a la cabeza de la pluma.
  const ramales = [], pendulos = [], subida = [];
  for (let k = 0; k < 6; k++) { const r = new CableRecto(0.014); ramales.push(r); giro.add(r); }
  for (let k = 0; k < 2; k++) { const r = new CableRecto(0.03); pendulos.push(r); giro.add(r); }
  for (let k = 0; k < 2; k++) { const r = new CableRecto(0.017); subida.push(r); giro.add(r); }
  const aparejo = new THREE.Mesh(caja(0.5, 0.35, 1.1), MAT.grisClaro); aparejo.castShadow = true; giro.add(aparejo);
  const a = V(), b = V(), m = new THREE.Matrix4(), cab = V(), ap = V();
  return {
    actualizar(ang) {
      m.makeRotationZ(ang).setPosition(GRUA.pieX, GRUA.pieY, 0);
      cab.set(L - 0.4, 0.5, 0).applyMatrix4(m);
      ap.copy(APEX).lerp(cab, 0.2); aparejo.position.copy(ap); aparejo.lookAt(cab.x, cab.y, 0);
      for (let k = 0; k < 6; k++) { const z = -0.42 + k * 0.168; ramales[k].entre(a.set(APEX.x, APEX.y, z * 0.9), b.set(ap.x, ap.y, z)); }
      for (let k = 0; k < 2; k++) { const z = k ? 0.5 : -0.5; pendulos[k].entre(a.set(ap.x, ap.y, z), b.set(cab.x, cab.y, z)); }
      for (let k = 0; k < 2; k++) {                                                        // cables de los tambores a la cabeza
        const z = k ? 0.15 : -0.15; a.set(k ? -0.3 : -1.35, 1.37, z);
        b.set(L + 0.15, 0.45, z).applyMatrix4(m); subida[k].entre(a, b);
      }
    },
  };
}

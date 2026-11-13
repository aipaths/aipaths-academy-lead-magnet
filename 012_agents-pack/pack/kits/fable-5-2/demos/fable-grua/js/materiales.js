import * as THREE from 'three';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';
import { COLOR } from './medidas.js';
import { fbm, azar } from './ruido.js';

// Mugre y desgaste pintados por código: manchas, chorreaduras y polvo. Se multiplica sobre la pintura.
function lienzoMugre(tam, fuerza, semilla) {
  const c = document.createElement('canvas'); c.width = c.height = tam;
  const g = c.getContext('2d'), img = g.createImageData(tam, tam), r = azar(semilla);
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    const n = fbm(x / 70 + semilla, y / 70, 4), chorro = fbm(x / 9 + semilla * 3, y / 260, 2);
    let v = 1 - fuerza * (Math.max(0, n - 0.42) * 1.6 + Math.max(0, chorro - 0.55) * 0.9) - r() * 0.03;
    v = Math.max(0.35, Math.min(1, v)) * 255;
    const k = (y * tam + x) * 4; img.data[k] = v; img.data[k + 1] = v * 0.97; img.data[k + 2] = v * 0.93; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export const MAT = {};
export async function crearMateriales() {
  const mugre = lienzoMugre(512, 0.22, 3), mugreFuerte = lienzoMugre(512, 0.6, 11);
  const pintura = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, map: mugre, roughness: 0.48, metalness: 0.15, envMapIntensity: 0.9, ...extra });
  Object.assign(MAT, {
    amarillo: pintura(COLOR.amarillo),
    gris: pintura(COLOR.gris, { roughness: 0.6 }),
    grisClaro: pintura(COLOR.grisClaro, { roughness: 0.55 }),
    blanco: pintura(COLOR.blanco),
    negro: pintura(COLOR.negro, { roughness: 0.7 }),
    acero: new THREE.MeshStandardMaterial({ color: 0x9a938c, map: mugreFuerte, roughness: 0.42, metalness: 0.85 }),
    oruga: new THREE.MeshStandardMaterial({ color: 0x6a625b, map: mugreFuerte, roughness: 0.6, metalness: 0.6, envMapIntensity: 0.8 }),
    goma: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, map: mugreFuerte, roughness: 0.9, metalness: 0 }),
    vidrio: new THREE.MeshStandardMaterial({ color: 0x0b1216, roughness: 0.05, metalness: 0.35, transparent: true, opacity: 0.86, envMapIntensity: 1.6 }),
    almeja: new THREE.MeshStandardMaterial({ color: 0x5b5753, map: mugreFuerte, roughness: 0.55, metalness: 0.6, side: THREE.DoubleSide }),
    cable: new THREE.MeshStandardMaterial({ color: 0x33302c, roughness: 0.55, metalness: 0.8 }),
  });
  MAT.mugre = mugre;
  return MAT;
}

// Junta muchas piezas en pocas mallas (una por material): menos llamadas de dibujo.
export class Armador {
  constructor() { this.grupos = new Map(); }
  add(mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1)));
    for (const n of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(n)) g.deleteAttribute(n);
    if (!this.grupos.has(mat)) this.grupos.set(mat, []);
    this.grupos.get(mat).push(g);
    return this;
  }
  grupo(nombre = '') {
    const grupo = new THREE.Group(); grupo.name = nombre;
    for (const [mat, lista] of this.grupos) grupo.add(sombra(new THREE.Mesh(mergeGeometries(lista), mat)));
    return grupo;
  }
}
export function sombra(m) { m.castShadow = true; m.receiveShadow = true; return m; }
export const caja = (w, h, d) => new THREE.BoxGeometry(w, h, d);
// Cilindro con el eje a lo ancho de la máquina (Z), como una rueda.
export const rueda = (r, ancho, seg = 24) => new THREE.CylinderGeometry(r, r, ancho, seg).rotateX(Math.PI / 2);
export const tubo = (r, largo, seg = 8) => new THREE.CylinderGeometry(r, r, largo, seg);
// Barra entre dos puntos (para celosías, tirantes y brazos).
export function barra(a, b, r, seg = 6) {
  const d = new THREE.Vector3().subVectors(b, a), g = new THREE.CylinderGeometry(r, r, d.length(), seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

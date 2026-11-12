// Materiales compartidos de la máquina: amarillo Liebherr, grises, acero de orugas, vidrio y cable.
import * as THREE from 'three';
import { tex } from './texturas.js';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

const rugMetal = () => tex('metal_plate_rough_1k.jpg', { rep: 2 });
const norMetal = () => tex('metal_plate_nor_1k.jpg', { rep: 2 });

export const MAT = {};
export function crearMateriales() {
  const pintura = (color, extra = {}) => new THREE.MeshStandardMaterial({
    color, metalness: 0.25, roughness: 0.55, roughnessMap: rugMetal(), normalMap: norMetal(),
    normalScale: new THREE.Vector2(0.25, 0.25), ...extra,
  });
  MAT.amarillo = pintura(0xf0b400);
  MAT.grisOscuro = pintura(0x3d4044);
  MAT.grisClaro = pintura(0x8a8f94);
  MAT.blanco = pintura(0xe8e8e4);
  MAT.rojo = pintura(0xb3201b);
  MAT.negro = pintura(0x1d1e1f, { roughness: 0.7 });
  MAT.oruga = new THREE.MeshStandardMaterial({
    color: 0x6f6a64, metalness: 0.6, roughness: 0.85,
    map: tex('rusty_metal_02_diff_1k.jpg', { color: true, rep: 1 }), normalMap: tex('rusty_metal_02_nor_1k.jpg', { rep: 1 }),
    roughnessMap: tex('rusty_metal_02_rough_1k.jpg', { rep: 1 }),
  });
  MAT.oruga.color.multiplyScalar(0.32);
  MAT.acero = new THREE.MeshStandardMaterial({ color: 0x9a9da0, metalness: 0.85, roughness: 0.38, roughnessMap: rugMetal() });
  MAT.vidrio = new THREE.MeshStandardMaterial({ color: 0x141c22, metalness: 0.2, roughness: 0.06, transparent: true, opacity: 0.82, envMapIntensity: 1.8 });
  MAT.cable = new THREE.MeshStandardMaterial({ color: 0x2a2b2c, metalness: 0.7, roughness: 0.45 });
  return MAT;
}

// Cilindro entre dos puntos (para celosías, barandas y tirantes).
const Y = new THREE.Vector3(0, 1, 0), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3();
export function tubo(a, b, r, lados = 6) {
  const largo = tmpV.subVectors(b, a).length();
  const g = new THREE.CylinderGeometry(r, r, largo, lados, 1, true);
  tmpQ.setFromUnitVectors(Y, tmpV.normalize());
  g.applyQuaternion(tmpQ);
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}

export function caja(sx, sy, sz, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(x, y, z); return g;
}

// Une varias geometrías en una sola (un draw call). Acepta indexadas y no indexadas.
export function fusionar(lista) {
  const g = mergeGeometries(lista.map((x) => { const y = x.index ? x.toNonIndexed() : x; y.clearGroups(); for (const k of Object.keys(y.attributes)) if (!['position', 'normal', 'uv'].includes(k)) y.deleteAttribute(k); return y; }));
  lista.forEach((x) => x.dispose());
  return g;
}

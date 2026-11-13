// Registro de piezas: cada una sabe su nombre, su descripción y adónde va cuando se desarma.
import * as THREE from 'three';
import { mm } from './medidas.js';

export const piezas = [];
export const seleccionables = [];

// Crea un grupo-pieza. `sale` = desplazamiento al desarmar, en mm [x, y, z].
export function pieza(padre, nombre, descripcion, sale = [0, 0, 0], { retraso = 0 } = {}) {
  const g = new THREE.Group();
  g.name = nombre;
  g.userData = { pieza: true, nombre, descripcion, sale: new THREE.Vector3(...sale.map(mm)), retraso, base: null };
  padre.add(g);
  piezas.push(g);
  return g;
}

// Agrega una malla a una pieza, con sombras y lista para el puntero.
export function malla(pieza, geo, mat, { sombra = true, recibe = true, elegible = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = sombra;
  m.receiveShadow = recibe;
  pieza.add(m);
  if (elegible) seleccionables.push(m);
  return m;
}

// Guarda la posición armada de cada pieza (se llama una vez, con el modelo completo).
export function fijarBases() {
  for (const p of piezas) p.userData.base = p.position.clone();
}

// t de 0 (armado) a 1 (desarmado); cada pieza arranca un poco después según su retraso.
export function aplicarDesarme(t) {
  for (const p of piezas) {
    const d = p.userData;
    if (!d.base || d.manual) continue;
    const local = THREE.MathUtils.clamp((t - d.retraso * 0.25) / (1 - d.retraso * 0.25), 0, 1);
    const e = local < 0.5 ? 4 * local ** 3 : 1 - (-2 * local + 2) ** 3 / 2;
    p.position.copy(d.base).addScaledVector(d.sale, e);
  }
}

// Sube desde una malla hasta la pieza que la contiene.
export function piezaDe(obj) {
  let o = obj;
  while (o && !o.userData?.pieza) o = o.parent;
  return o;
}

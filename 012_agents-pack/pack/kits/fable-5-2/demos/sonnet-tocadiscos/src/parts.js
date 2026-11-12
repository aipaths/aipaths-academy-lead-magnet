// Registro de piezas: cada pieza tiene nombre, descripción y vector de desarme.
import * as THREE from 'three';

export const parts = [];

/** Registra `obj` como pieza. `explode` está en las unidades del padre (cm). */
export function part(obj, name, info, explode = [0, 0, 0]) {
  obj.userData.part = {
    name, info,
    explode: new THREE.Vector3(...explode),
    base: obj.position.clone(),
    id: parts.length,
  };
  parts.push(obj);
  return obj;
}

const ss = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

/** Aplica el desarme t (0 = armado, 1 = desarmado). Las piezas de arriba salen primero. */
export function applyExplode(t) {
  const maxY = Math.max(...parts.map((o) => o.userData.part.explode.y), 1);
  for (const o of parts) {
    const p = o.userData.part, delay = 0.38 * (1 - Math.max(0, p.explode.y) / maxY);
    o.position.copy(p.base).addScaledVector(p.explode, ss((t - delay) / (1 - delay)));
  }
}

/** Sube por la jerarquía hasta encontrar la pieza registrada. */
export function findPart(obj) {
  for (let o = obj; o; o = o.parent) if (o.userData.part) return o;
  return null;
}

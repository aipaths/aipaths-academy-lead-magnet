// Tapa antipolvo de acrílico ahumado, articulada en el borde trasero.
import * as THREE from 'three';
import { mesh, rbox } from './util.js';
import { part } from './parts.js';
import { D } from './dims.js';

export function buildLid(m, root) {
  const w = D.w + 0.6, d = D.dp + 0.8, h = 9.5, t = 0.3;
  const lid = new THREE.Group(), hinge = new THREE.Group();
  const panel = (sx, sy, sz, x, y, z) => {
    const p = mesh(rbox(sx, sy, sz, 0.08), m.glass, { cast: false });
    p.position.set(x, y, z); lid.add(p);
  };
  panel(w, t, d, 0, h, d / 2);                        // techo
  panel(w, h, t, 0, h / 2, d);                        // frente
  panel(w, h, t, 0, h / 2, 0);                        // fondo
  panel(t, h, d, -w / 2, h / 2, d / 2);               // lados
  panel(t, h, d, w / 2, h / 2, d / 2);
  for (const [sx, sz, x, z] of [[w + 0.2, 0.6, 0, 0], [w + 0.2, 0.6, 0, d], [0.6, d, -w / 2, d / 2], [0.6, d, w / 2, d / 2]]) {
    const bar = mesh(rbox(sx, 0.5, sz, 0.1), m.black, { cast: false });
    bar.position.set(x, 0.25, z); lid.add(bar);
  }
  lid.position.set(0, 0, 0);
  hinge.add(lid);
  hinge.position.set(D.cx, D.deckTop, D.z0 - 0.5);
  hinge.userData.open = 1.75;
  hinge.rotation.x = -1.75;
  root.add(part(hinge, 'Tapa antipolvo', 'Acrílico ahumado articulado atrás. Protege el disco y el brazo del polvo.', [0, 6, -34]));
  return hinge;
}

/** Abre o cierra la tapa con una animación corta; devuelve la función de actualización. */
export function lidAnimator(hinge) {
  let target = 1.75, cur = 1.75;
  return {
    toggle() { target = target > 0.5 ? 0.0 : 1.75; },
    get isOpen() { return target > 0.5; },
    update(dt) { cur += (target - cur) * Math.min(1, dt * 5); hinge.rotation.x = -cur; },
  };
}

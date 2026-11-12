// Utilidades compartidas. Unidad de la escena: 1 = 1 cm. Origen: eje del plato; y = 0 es el escritorio.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/RoundedBoxGeometry.js';

/** Textura generada en un canvas. `draw(ctx, w, h)` dibuja; `opts.linear` para mapas de datos. */
export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = opts.aniso ?? 8;
  if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Ruido determinista (mulberry32) para que cada arranque se vea igual. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Malla con sombras activadas. */
export function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}

/** Caja con bordes redondeados; r = radio del bisel. */
export const rbox = (w, h, d, r = 0.15, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);

/** Disco plano mirando hacia arriba (para serigrafías). UV: u → +x, v → −z (arriba de la foto = atrás). */
export function disc(radius, mat, y = 0, inner = 0, seg = 96) {
  const g = inner > 0 ? new THREE.RingGeometry(inner, radius, seg) : new THREE.CircleGeometry(radius, seg);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.y = y; m.receiveShadow = true;
  return m;
}

/** Cilindro hueco o macizo en un solo paso. */
export const cyl = (rt, rb, h, seg = 48, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);

/** Perfil de revolución a partir de pares [radio, y]. */
export function lathe(points, seg = 96) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg);
}

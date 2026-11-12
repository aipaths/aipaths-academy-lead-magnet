// Carga de texturas PBR de Poly Haven (CC0) con repetición y anisotropía.
import * as THREE from 'three';

const cargador = new THREE.TextureLoader();
const cache = new Map();
let anisotropia = 8;
export const setAnisotropia = (a) => { anisotropia = a; };

export function tex(nombre, { color = false, rep = 1 } = {}) {
  const clave = `${nombre}|${rep}`;
  if (cache.has(clave)) return cache.get(clave);
  const t = cargador.load(`assets/${nombre}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = anisotropia;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(clave, t);
  return t;
}

// Juego PBR completo: { map, normalMap, roughnessMap, aoMap }
export function pbr(base, rep = 1) {
  return {
    map: tex(`${base}_diff_1k.jpg`, { color: true, rep }),
    normalMap: tex(`${base}_nor_1k.jpg`, { rep }),
    roughnessMap: tex(`${base}_rough_1k.jpg`, { rep }),
  };
}

// Promesa que se cumple cuando terminaron de cargar todas las texturas pedidas.
export const texturasListas = () => new Promise((ok) => {
  const mirar = () => ([...cache.values()].every((t) => t.image && t.image.width) ? ok() : setTimeout(mirar, 60));
  mirar();
});

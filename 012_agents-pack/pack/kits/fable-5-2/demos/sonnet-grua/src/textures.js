// Carga de texturas PBR reales (Poly Haven, CC0) con repetición y espacio de color correctos.
import * as THREE from 'three';
const loader = new THREE.TextureLoader();

function cargar(url, srgb, rep, aniso) {
  const t = loader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) t.repeat.set(rep, rep);
  t.anisotropy = aniso;
  return t;
}

export function pbr(nombre, { rep = 1, aniso = 8 } = {}) {
  const b = `./assets/${nombre}`;
  return {
    map: cargar(`${b}_Diffuse.jpg`, true, rep, aniso),
    normalMap: cargar(`${b}_nor_gl.jpg`, false, rep, aniso),
    roughnessMap: cargar(`${b}_Rough.jpg`, false, rep, aniso),
  };
}

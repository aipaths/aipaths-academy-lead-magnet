// Materiales PBR compartidos. Un solo juego para todo el modelo (menos cambios de estado por cuadro).
import * as THREE from 'three';

const std = (o) => new THREE.MeshStandardMaterial(o);

export const MAT = {
  anodizado: std({ color: 0x1c1c1f, metalness: 0.55, roughness: 0.42 }),
  anodizadoBrillo: std({ color: 0x232327, metalness: 0.75, roughness: 0.28 }),
  resina: std({ color: 0x111113, metalness: 0.0, roughness: 0.55 }),
  goma: std({ color: 0x0d0d0e, metalness: 0.0, roughness: 0.92 }),
  cromo: std({ color: 0xd8d9dd, metalness: 1.0, roughness: 0.16 }),
  aluminio: std({ color: 0xb9bbc0, metalness: 1.0, roughness: 0.32 }),
  tuboNegro: std({ color: 0x1a1a1d, metalness: 0.85, roughness: 0.26 }),
  plato: std({ color: 0x1e1f22, metalness: 0.8, roughness: 0.34 }),
  hueco: std({ color: 0x050505, metalness: 0.0, roughness: 1.0 }),
  ledRojo: std({ color: 0x400000, emissive: 0xff2a10, emissiveIntensity: 2.2 }),
  ledApagado: std({ color: 0x2a0806, emissive: 0x000000, roughness: 0.4 }),
  luzTarget: std({ color: 0x2b2b2d, emissive: 0xfff2d6, emissiveIntensity: 0, roughness: 0.3 }),
  cobre: std({ color: 0xc27a4a, metalness: 1.0, roughness: 0.3 }),
  pcb: std({ color: 0x1f4a35, metalness: 0.1, roughness: 0.5 }),
  iman: std({ color: 0x5b5d63, metalness: 0.9, roughness: 0.45 }),
  laton: std({ color: 0xc9a45c, metalness: 1.0, roughness: 0.25 }),
  aguja: std({ color: 0xe9e9ee, metalness: 1.0, roughness: 0.1 }),
  capsula: std({ color: 0x141415, metalness: 0.3, roughness: 0.35 }),
  acrilico: new THREE.MeshPhysicalMaterial({
    color: 0x9aa0a6,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    side: THREE.DoubleSide,
  }),
};

// Material propio con mapa de color (rótulos, serigrafía); comparte los parámetros del base.
export function conMapa(base, map, extra = {}) {
  const m = base.clone();
  m.map = map;
  m.color.set(0xffffff);
  Object.assign(m, extra);
  return m;
}

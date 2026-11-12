// Materiales compartidos. Todo PBR (MeshStandard/Physical) para que responda al HDRI.
import * as THREE from 'three';
import { texturaGrano } from './texturas.js';

export function crearMateriales() {
  const grano = texturaGrano(7, 46);
  grano.repeat.set(6, 6);
  const granoFino = texturaGrano(9, 30);
  granoFino.repeat.set(3, 3);
  const std = (o) => new THREE.MeshStandardMaterial(o);

  return {
    // Chapa superior de aluminio fundido, pintura negra mate
    chapa: std({ color: 0x1b1b1e, roughness: 0.56, metalness: 0.4, roughnessMap: grano, bumpMap: grano, bumpScale: 0.25 }),
    // Gabinete inferior (compuesto pesado) y goma
    gabinete: std({ color: 0x0e0e10, roughness: 0.74, metalness: 0.05, roughnessMap: grano }),
    // El chaflán de abajo mira al escritorio: sin esto refleja el piso del HDRI y parece un listón de madera
    sombra: std({ color: 0x070708, roughness: 0.9, metalness: 0, envMapIntensity: 0.12 }),
    goma: std({ color: 0x0a0a0b, roughness: 0.92, metalness: 0, envMapIntensity: 0.3 }),
    // Botones y piezas de plástico satinado
    boton: std({ color: 0x0c0c0e, roughness: 0.38, metalness: 0.1 }),
    hueco: std({ color: 0x050506, roughness: 0.85, metalness: 0 }),
    // Metal negro brillante del brazo
    negroBrillo: std({ color: 0x08080a, roughness: 0.16, metalness: 0.95 }),
    negroSatinado: std({ color: 0x0b0b0d, roughness: 0.36, metalness: 0.8, roughnessMap: granoFino }),
    aluminio: std({ color: 0xcfd0d2, roughness: 0.28, metalness: 1 }),
    portacapsula: std({ color: 0x80838a, roughness: 0.36, metalness: 1 }),
    aluminioOscuro: std({ color: 0x3a3b3f, roughness: 0.34, metalness: 1 }),
    acero: std({ color: 0xe2e2e2, roughness: 0.14, metalness: 1 }),
    plato: std({ color: 0x1b1b1e, roughness: 0.42, metalness: 0.9, roughnessMap: granoFino }),
    iman: std({ color: 0x2b2c30, roughness: 0.55, metalness: 0.6 }),
    cobre: std({ color: 0xc27a3e, roughness: 0.38, metalness: 1 }),
    laton: std({ color: 0xb9a063, roughness: 0.3, metalness: 1 }),
    pcb: std({ color: 0x0f3b26, roughness: 0.5, metalness: 0.1 }),
    chip: std({ color: 0x111113, roughness: 0.45, metalness: 0.2 }),
    capacitor: std({ color: 0x1a2a55, roughness: 0.4, metalness: 0.3 }),
    hierro: std({ color: 0x4a4b50, roughness: 0.5, metalness: 0.9 }),
    vinilo: std({ color: 0x060607, roughness: 0.22, metalness: 0.05 }),
    acrilico: new THREE.MeshPhysicalMaterial({
      color: 0xbfc6cc, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.17,
      clearcoat: 1, clearcoatRoughness: 0.04, depthWrite: false, envMapIntensity: 1.4,
    }),
    ledRojo: std({ color: 0x300404, emissive: 0xff2414, emissiveIntensity: 2.4, roughness: 0.4 }),
    ledApagado: std({ color: 0x2a0b0b, roughness: 0.4 }),
    ledBlanco: std({ color: 0x888888, emissive: 0xdfe8ff, emissiveIntensity: 2.2, roughness: 0.4 }),
    rubi: std({ color: 0xb01020, roughness: 0.2, metalness: 0.3 }),
  };
}

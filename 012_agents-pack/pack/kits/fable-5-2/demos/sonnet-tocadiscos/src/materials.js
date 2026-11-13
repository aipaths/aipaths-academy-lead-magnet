// Materiales compartidos. Se crean una sola vez para cuidar el rendimiento.
import * as THREE from 'three';
import { plasticTex, deckTex } from './tex-deck.js';
import { slipmatTex, strobeTex, vinylRoughTex, vinylBumpTex, vinylAnisoTex, labelTex } from './tex-disc.js';

const std = (o) => new THREE.MeshStandardMaterial(o);

export function makeMaterials(wood) {
  const grain = plasticTex();
  const black = std({ color: 0x0a0a0c, roughness: 0.8, metalness: 0.0, envMapIntensity: 0.5, bumpMap: grain, bumpScale: 0.35, roughnessMap: grain });
  const m = {
    wood,
    black,
    blackGlossy: std({ color: 0x08080a, roughness: 0.28, metalness: 0.1 }),
    rubber: std({ color: 0x070707, roughness: 0.85, bumpMap: grain, bumpScale: 0.6 }),
    anodized: std({ color: 0x1b1c20, roughness: 0.38, metalness: 0.9 }),
    silver: std({ color: 0xc4c7ce, roughness: 0.22, metalness: 1.0 }),
    steel: std({ color: 0x8e9199, roughness: 0.4, metalness: 1.0 }),
    brass: std({ color: 0xc89a3e, roughness: 0.3, metalness: 1.0 }),
    copper: std({ color: 0xb8683a, roughness: 0.38, metalness: 0.95 }),
    pcb: std({ color: 0x0d5a35, roughness: 0.5, metalness: 0.2 }),
    magnet: std({ color: 0x2b2d33, roughness: 0.45, metalness: 0.85 }),
    deckDecal: new THREE.MeshStandardMaterial({
      map: deckTex(), transparent: true, roughness: 0.55, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false,
    }),
    slipmat: std({ map: slipmatTex(), roughness: 0.98, color: 0xffffff, bumpMap: grain, bumpScale: 0.5 }),
    strobe: std({ map: strobeTex(), roughness: 0.3, metalness: 0.75 }),
    platter: std({ color: 0x75787f, roughness: 0.32, metalness: 1.0 }),
    platterDark: std({ color: 0x1d1e22, roughness: 0.55, metalness: 0.7 }),
    vinyl: new THREE.MeshPhysicalMaterial({
      color: 0x0b0b0c, roughness: 1, roughnessMap: vinylRoughTex(), bumpMap: vinylBumpTex(), bumpScale: 0.25,
      anisotropy: 0.85, specularIntensity: 0.55, anisotropyMap: vinylAnisoTex(), clearcoat: 0.0,
    }),
    label: std({ map: labelTex(), roughness: 0.7 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x15161a, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.1,
      side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.4,
    }),
    ledRed: std({ color: 0x300000, emissive: 0xff2a14, emissiveIntensity: 2.2, roughness: 0.4 }),
    ledWhite: std({ color: 0x222222, emissive: 0xfff2d6, emissiveIntensity: 0.0, roughness: 0.3 }),
    ledBlue: std({ color: 0x001028, emissive: 0x2d8cff, emissiveIntensity: 1.6, roughness: 0.4 }),
    cartridge: std({ color: 0x111113, roughness: 0.4, metalness: 0.4 }),
    stylus: std({ color: 0xdfe6f0, roughness: 0.1, metalness: 0.6 }),
  };
  m.vinyl.envMapIntensity = 1.5;
  return m;
}

// Materiales de la grúa: pintura amarilla Liebherr con suciedad y rayones (canvas procedural) + metal y goma.
import * as THREE from 'three';
import { fbm, aleatorio } from './noise.js';
import { pbr } from './textures.js';

function lienzo(tam, pintar) {
  const c = document.createElement('canvas'); c.width = c.height = tam;
  const g = c.getContext('2d'); pintar(g, tam);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t;
}

function pintura(base, semilla, sucio) {            // textura de color: pintura con polvo, manchas y rayones
  const a = aleatorio(semilla), [r, gr, b] = base;
  return lienzo(512, (g, n) => {
    const d = g.createImageData(n, n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const k = 1 - sucio * (0.4 * fbm(x / 80, y / 80, semilla) + 0.28 * fbm(x / 9, y / 9, semilla + 4) - 0.14);
      const o = (y * n + x) * 4; d.data[o] = r * k; d.data[o + 1] = gr * k; d.data[o + 2] = b * k * 0.96; d.data[o + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    g.strokeStyle = 'rgba(40,36,30,0.28)'; g.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = a() * n, y = a() * n; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (a() - 0.5) * 60, y + (a() - 0.5) * 12); g.stroke(); }
  });
}

export function crearMateriales() {
  const sucia = (c, s, su = 1) => new THREE.MeshStandardMaterial({ map: pintura(c, s, su), roughness: 0.58, metalness: 0.25 });
  const metal = pbr('rust_coarse_01', { rep: 1 });
  const zapata = new THREE.MeshStandardMaterial({ normalMap: metal.normalMap, roughnessMap: metal.roughnessMap, color: 0x3c3d3f, metalness: 0.55, roughness: 1 });
  const cuadrilla = pbr('gravel_embedded_concrete', { rep: 1 });
  return {
    amarillo: sucia([236, 178, 22], 11, 0.45), amarilloLimpio: sucia([240, 184, 30], 12, 0.2),
    contrapeso: new THREE.MeshStandardMaterial({ color: 0x5d6064, roughness: 0.85, metalness: 0.2 }),
    gris: sucia([120, 122, 124], 13, 0.9), negro: new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.7, metalness: 0.6 }),
    acero: new THREE.MeshStandardMaterial({ color: 0x8a8d90, roughness: 0.4, metalness: 0.85 }),
    aceroOscuro: new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: 0.5, metalness: 0.75 }),
    zapata, cuadrilla, goma: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.95 }),
    vidrio: new THREE.MeshPhysicalMaterial({ color: 0x1a2a32, roughness: 0.05, metalness: 0.1, transmission: 0, envMapIntensity: 1.6 }),
    cable: new THREE.MeshStandardMaterial({ color: 0x2b2a28, roughness: 0.55, metalness: 0.7 }),
  };
}

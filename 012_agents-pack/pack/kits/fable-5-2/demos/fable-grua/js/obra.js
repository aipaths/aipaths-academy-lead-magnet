import * as THREE from 'three';
import { MAT, Armador, caja, V, barra } from './materiales.js';

function lienzo(w, h, pintar) { const c = document.createElement('canvas'); c.width = w; c.height = h; pintar(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

// Lo que hace que sea una obra y no un campo: vallado, obradores, caños, conos y tambores.
export function crearObra() {
  const a = new Armador();
  // vallado de obra: paños de malla de 3,5 × 2 m sobre pies de hormigón
  const malla = lienzo(256, 128, (g) => { g.strokeStyle = 'rgba(190,195,200,.9)'; g.lineWidth = 1.2; for (let x = 0; x <= 256; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); } for (let y = 0; y <= 128; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } });
  const matValla = new THREE.MeshStandardMaterial({ map: malla, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6 });
  const pano = (x, z, giro) => {
    a.add(matValla, new THREE.PlaneGeometry(3.4, 1.9), x, 1.15, z, 0, giro, 0);
    const dx = Math.cos(giro) * 1.72, dz = -Math.sin(giro) * 1.72;
    for (const s of [-1, 1]) { a.add(MAT.grisClaro, barra(V(x + s * dx, 0.15, z + s * dz), V(x + s * dx, 2.15, z + s * dz), 0.022)); a.add(MAT.grisClaro, caja(0.6, 0.14, 0.24), x + s * dx, 0.07, z + s * dz, 0, giro + 1.57, 0); }
  };
  for (let i = 0; i < 26; i++) pano(-44 + i * 3.5, 36, 0);
  for (let i = 0; i < 20; i++) pano(-45.8, 34.2 - i * 3.5, Math.PI / 2);
  // obradores: dos contenedores con chapa acanalada
  const chapa = (color) => { const t = lienzo(256, 64, (g) => { g.fillStyle = color; g.fillRect(0, 0, 256, 64); for (let x = 0; x < 256; x += 8) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, 0, 3, 64); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 4, 0, 2, 64); } }); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.3 }); };
  const azul = chapa('#2b5f8a'), crema = chapa('#d8d3c4');
  a.add(azul, caja(6.06, 2.59, 2.44), -30, 1.3, 27, 0, 0.12, 0); a.add(crema, caja(6.06, 2.59, 2.44), -30.3, 1.3, 23.6, 0, 0.1, 0);
  a.add(crema, caja(6.06, 2.59, 2.44), -30.1, 3.9, 27, 0, 0.12, 0);
  a.add(MAT.vidrio, caja(1.2, 0.9, 0.04), -29, 1.7, 22.36, 0, 0.1, 0); a.add(MAT.gris, caja(0.95, 2.0, 0.05), -31.6, 1.05, 22.2, 0, 0.1, 0);
  // caños de hormigón apilados, tambores y pallets
  const cano = new THREE.CylinderGeometry(0.6, 0.6, 2.4, 20, 1, true).rotateZ(Math.PI / 2), hormigon = MAT.grisClaro.clone(); hormigon.side = THREE.DoubleSide; hormigon.color.set(0xa9a59c);
  for (const [x, y, z] of [[-14, 0.6, 22], [-14, 0.6, 23.25], [-14, 0.6, 24.5], [-14, 1.66, 22.62], [-14, 1.66, 23.87]]) a.add(hormigon, cano, x, y, z, 0, 0.3, 0);
  const tambor = new THREE.CylinderGeometry(0.29, 0.29, 0.88, 16), matTambor = MAT.amarillo.clone(); matTambor.color.set(0x2d5d8c);
  for (const [x, z] of [[-22, 14], [-22.7, 14.2], [-22.3, 14.8], [-8, 26]]) a.add(matTambor, tambor, x, 0.44, z);
  for (const [x, z, g] of [[-19, 20, 0.2], [-17.6, 20.4, -0.1]]) for (let i = 0; i < 3; i++) a.add(MAT.grisClaro, caja(1.2, 0.14, 1.0), x, 0.07 + i * 0.16, z, 0, g + i * 0.05, 0);
  // conos marcando el carril del camión
  const cono = new THREE.CylinderGeometry(0.035, 0.15, 0.55, 12), naranja = new THREE.MeshStandardMaterial({ color: 0xe8591a, roughness: 0.6 }), banda = new THREE.CylinderGeometry(0.075, 0.105, 0.14, 12), blanco = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
  for (const [x, z] of [[-9, -8.2], [-3, -8.2], [9, -8.2], [14, -8.3], [-9, -12.9], [9, -12.9]]) { a.add(naranja, cono, x, 0.3, z); a.add(blanco, banda, x, 0.36, z); a.add(MAT.negro, caja(0.34, 0.04, 0.34), x, 0.02, z); }
  const g = a.grupo('obra'); g.children.forEach((m) => { m.castShadow = true; });
  return g;
}

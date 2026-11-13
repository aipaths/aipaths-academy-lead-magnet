// Camión volquete de 3 ejes (8,4 m): cabina, chasis, 10 ruedas y caja de 5,2 × 2,3 × 1,25 m.
// La tierra de la caja es un mapa de alturas chico (celda de 0,25 m) que se desmorona a su ángulo de reposo.
import * as THREE from 'three';
import { MAT, caja, tubo, fusionar } from './materiales.js';
import { tex } from './texturas.js';

export const CAJA = { largo: 5.2, ancho: 2.3, alto: 1.25, piso: 1.45, x: -0.6 };
const NX = 21, NZ = 10, DX = CAJA.largo / NX, DZ = CAJA.ancho / NZ, PEND = Math.tan(34 * Math.PI / 180) * DX;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const sombra = (m) => { m.castShadow = m.receiveShadow = true; return m; };

function rueda(r = 0.53, ancho = 0.4) {
  const g = new THREE.CylinderGeometry(r, r, ancho, 28); g.rotateX(Math.PI / 2);
  const llanta = new THREE.CylinderGeometry(r * 0.55, r * 0.55, ancho + 0.02, 18); llanta.rotateX(Math.PI / 2);
  return { goma: g, llanta };
}

export function crearCamion(color) {
  const grupo = new THREE.Group();
  const pintura = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5, roughnessMap: tex('metal_plate_rough_1k.jpg', { rep: 2 }) });
  const cajaMat = new THREE.MeshStandardMaterial({ color: 0x9a948c, metalness: 0.5, roughness: 0.8, map: tex('rusty_metal_02_diff_1k.jpg', { color: true }), normalMap: tex('rusty_metal_02_nor_1k.jpg') });
  const goma = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.9 });
  // Chasis, paragolpes, tanque
  sombra(grupo.add(new THREE.Mesh(fusionar([caja(8.0, 0.3, 0.9, 0.2, 0.95, 0), caja(0.25, 0.45, 2.45, 4.2, 0.75, 0), caja(1.0, 0.55, 0.55, 1.7, 0.95, -1.0)]), MAT.negro)));
  // Cabina (frente al +x): bloque con parabrisas, techo y guardabarros
  // Cabina con frente inclinado (perfil extruido), techo alto y deflector
  const perfil = new THREE.Shape([new THREE.Vector2(2.2, 1.12), new THREE.Vector2(4.3, 1.12), new THREE.Vector2(4.3, 1.9), new THREE.Vector2(4.15, 3.25),
    new THREE.Vector2(3.9, 3.45), new THREE.Vector2(2.25, 3.45), new THREE.Vector2(2.2, 3.3)]);
  const cuerpo = new THREE.ExtrudeGeometry(perfil, { depth: 2.45, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }); cuerpo.translate(0, 0, -1.225);
  const cab = sombra(new THREE.Mesh(fusionar([cuerpo, caja(1.2, 0.5, 2.4, 2.9, 3.68, 0)]), pintura));
  grupo.add(cab);
  // Parrilla, paragolpes, escalones, guardabarros traseros, visera, luces y baliza
  const parrilla = []; for (let k = 0; k < 7; k++) parrilla.push(caja(0.04, 0.05, 1.5, 4.38, 1.15 + k * 0.1, 0));
  parrilla.push(caja(0.3, 0.42, 2.5, 4.35, 0.72, 0), caja(1.9, 0.2, 2.2, 3.2, 1.0, 0), caja(0.25, 0.08, 0.6, 3.6, 0.55, 1.28), caja(0.25, 0.08, 0.6, 3.6, 0.55, -1.28), caja(0.6, 0.06, 2.5, 4.25, 3.3, 0));
  for (const z of [1.05, -1.05]) parrilla.push(caja(1.6, 0.06, 0.6, -1.9, 1.15, z * 1.12), caja(1.6, 0.4, 0.04, -1.9, 0.95, z * 1.42));
  grupo.add(sombra(new THREE.Mesh(fusionar(parrilla), MAT.negro)));
  const luzT = new THREE.Mesh(fusionar([caja(0.04, 0.12, 0.3, -3.35, 1.0, 1.0), caja(0.04, 0.12, 0.3, -3.35, 1.0, -1.0)]), new THREE.MeshStandardMaterial({ color: 0x8a1010, emissive: 0x300000, roughness: 0.3 }));
  grupo.add(luzT);
  const baliza = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 12), new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6a00, emissiveIntensity: 0.5 }));
  baliza.position.set(2.9, 4.02, 0); grupo.add(baliza);
  grupo.add(sombra(new THREE.Mesh(tubo(V(2.35, 1.0, 1.3), V(2.35, 3.9, 1.3), 0.07, 10), MAT.grisClaro)));   // escape vertical
  const vid = sombra(new THREE.Mesh(fusionar([caja(0.04, 1.15, 2.2, 4.27, 2.6, 0).rotateZ(0).translate(0, 0, 0), caja(1.3, 0.85, 0.04, 3.4, 2.75, 1.29), caja(1.3, 0.85, 0.04, 3.4, 2.75, -1.29)]), MAT.vidrio));
  grupo.add(vid);
  grupo.add(sombra(new THREE.Mesh(fusionar([caja(0.12, 0.25, 2.2, 4.27, 1.35, 0), tubo(V(4.3, 2.4, 1.3), V(4.3, 2.6, 1.55), 0.025), caja(0.06, 0.4, 0.2, 4.3, 2.4, 1.6), tubo(V(4.3, 2.4, -1.3), V(4.3, 2.6, -1.55), 0.025), caja(0.06, 0.4, 0.2, 4.3, 2.4, -1.6)]), MAT.negro)));
  const faros = new THREE.Mesh(fusionar([caja(0.05, 0.16, 0.35, 4.33, 1.35, 0.85), caja(0.05, 0.16, 0.35, 4.33, 1.35, -0.85)]), new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0x554f40, roughness: 0.2 }));
  grupo.add(faros);
  // Caja volcadora (paredes con refuerzos)
  const { largo: L, ancho: W, alto: H, piso: P, x: X } = CAJA;
  const paredes = [caja(L, 0.1, W + 0.1, X, P - 0.05, 0), caja(L, H, 0.06, X, P + H / 2, W / 2 + 0.03), caja(L, H, 0.06, X, P + H / 2, -W / 2 - 0.03),
    caja(0.08, H + 0.3, W + 0.12, X + L / 2 + 0.04, P + (H + 0.3) / 2, 0), caja(0.06, H, W + 0.12, X - L / 2 - 0.03, P + H / 2, 0), caja(0.6, 0.08, W + 0.12, X + L / 2 + 0.3, P + H + 0.25, 0)];
  for (let k = 0; k <= 5; k++) for (const s of [1, -1]) paredes.push(caja(0.1, H, 0.08, X - L / 2 + k * L / 5, P + H / 2, s * (W / 2 + 0.08)));
  for (const s of [1, -1]) paredes.push(caja(L, 0.1, 0.1, X, P + H, s * (W / 2 + 0.07)));
  grupo.add(sombra(new THREE.Mesh(fusionar(paredes), cajaMat)));
  // Ruedas: eje delantero simple, dos traseros con duales
  const r = rueda(), ruedas = [];
  const posRuedas = [[3.15, 1.12], [3.15, -1.12], [-1.2, 0.9], [-1.2, -0.9], [-2.6, 0.9], [-2.6, -0.9], [-1.2, 1.25], [-1.2, -1.25], [-2.6, 1.25], [-2.6, -1.25]];
  for (const [x, z] of posRuedas) {
    const g = new THREE.Group(); g.position.set(x, 0.53, z);
    g.add(sombra(new THREE.Mesh(r.goma, goma)), sombra(new THREE.Mesh(r.llanta, MAT.grisClaro)));
    grupo.add(g); ruedas.push(g);
  }
  grupo.add(sombra(new THREE.Mesh(fusionar([caja(1.3, 0.08, 2.5, 3.15, 1.2, 0), caja(3.2, 0.08, 2.75, -1.9, 1.2, 0)]), MAT.negro)));

  // Tierra en la caja
  const g = new THREE.PlaneGeometry(L - 0.04, W - 0.04, NX, NZ); g.rotateX(-Math.PI / 2); g.translate(X, P, 0);
  const uv = g.attributes.uv; for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * 1.2, uv.getY(v) * 0.55);
  const tierra = sombra(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex('brown_mud_02_diff_1k.jpg', { color: true }), normalMap: tex('brown_mud_02_nor_1k.jpg'), roughness: 0.95, color: 0xd8c8b4 })));
  tierra.visible = false; grupo.add(tierra);
  const h = new Float32Array((NX + 1) * (NZ + 1));
  return { grupo, ruedas, tierra, h, carga: 0 };
}

// Suma volumen a la caja en coordenadas locales; lo que no entra se devuelve (desborda).
export function cargarCaja(c, lx, lz, vol) {
  const i = Math.round((lx - CAJA.x + CAJA.largo / 2) / DX), j = Math.round((lz + CAJA.ancho / 2) / DZ);
  if (i < 0 || j < 0 || i > NX || j > NZ) return vol;
  c.h[j * (NX + 1) + i] += vol / (DX * DZ); c.carga += vol; c.sucia = true;
  return 0;
}

// Relaja la tierra de la caja: paredes como borde, sobre el borde se apila hasta 0,9 m más.
export function asentarCaja(c, pasadas = 2) {
  if (!c.sucia) return;
  const h = c.h, M = NX + 1; let movio = false;
  for (let p = 0; p < pasadas; p++) for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const k = j * M + i;
    for (const [di, dj, lim] of [[1, 0, 1], [0, 1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2]]) {
      const i2 = i + di, j2 = j + dj; if (i2 > NX || j2 < 0 || j2 > NZ) continue;
      const k2 = j2 * M + i2, d = h[k] - h[k2], e = Math.abs(d) - PEND * lim;
      if (e > 0.003) { const t = e * 0.2 * Math.sign(d); h[k] -= t; h[k2] += t; movio = true; }
    }
  }
  const pos = c.tierra.geometry.attributes.position;
  for (let k = 0; k < h.length; k++) pos.setY(k, CAJA.piso + Math.min(h[k], CAJA.alto + 0.9) + 0.02);
  pos.needsUpdate = true; c.tierra.geometry.computeVertexNormals();
  c.tierra.visible = c.carga > 0.05; c.sucia = movio;
}

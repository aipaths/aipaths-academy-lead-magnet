// Malla del camión volquete de 3 ejes (cabina blanca, caja azul-gris, chasis negro, 6 ruedas con gemelas).
import * as THREE from 'three';
import { Fabrica, v3 } from './geo.js';
import { pbr } from './textures.js';

export const CAJA = { x0: -4.15, x1: 0.55, ancho: 2.3, piso: 1.35, borde: 2.75 };   // interior de la caja (en coordenadas del camión)

export function materialesCamion() {
  const m = pbr('rust_coarse_01', { rep: 2 });
  return {
    cabina: new THREE.MeshStandardMaterial({ color: 0xe9ecee, roughness: 0.38, metalness: 0.3 }),
    caja: new THREE.MeshStandardMaterial({ color: 0x3f5f7e, roughness: 0.62, metalness: 0.45, normalMap: m.normalMap, normalScale: new THREE.Vector2(0.3, 0.3) }),
    cajaInt: new THREE.MeshStandardMaterial({ color: 0x555a60, roughness: 0.7, metalness: 0.5, side: THREE.DoubleSide, normalMap: m.normalMap }),
    chasis: new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.65, metalness: 0.5 }),
    goma: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.92 }),
    llanta: new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.4, metalness: 0.8 }),
    vidrio: new THREE.MeshPhysicalMaterial({ color: 0x14222a, roughness: 0.05, metalness: 0.1 }),
    luz: new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xfff2c4, emissiveIntensity: 0.4 }),
    franja: new THREE.MeshStandardMaterial({ color: 0xf2b705, roughness: 0.5 }),
  };
}

function rueda(mats, r, ancho) {
  const f = new Fabrica();
  f.cilindro(mats.goma, r, ancho, 0, 0, 0, 'z', 28);
  f.cilindro(mats.llanta, r * 0.62, ancho + 0.02, 0, 0, 0, 'z', 20);
  f.cilindro(mats.chasis, r * 0.25, ancho + 0.06, 0, 0, 0, 'z', 12);
  return f.crear();
}

export function crearCamionMalla() {
  const m = materialesCamion(), f = new Fabrica(), ruedas = [];
  for (const z of [-0.52, 0.52]) f.caja(m.chasis, 7.6, 0.22, 0.2, -0.4, 0.95, z);                       // largueros
  for (const x of [-3.6, -2.2, -0.6, 1.0, 2.2]) f.caja(m.chasis, 0.2, 0.18, 1.5, x, 0.97, 0);            // travesaños
  f.caja(m.chasis, 0.5, 0.6, 2.3, 3.55, 0.7, 0);                                                          // paragolpes
  // cabina
  f.caja(m.cabina, 1.9, 1.75, 2.45, 2.3, 2.0, 0);
  f.caja(m.cabina, 0.5, 1.0, 2.4, 3.35, 1.55, 0);                                                         // capó corto
  f.caja(m.cabina, 1.3, 0.5, 2.45, 2.05, 3.05, 0, 0, 0, 0);                                               // techo alto
  f.caja(m.chasis, 0.05, 0.62, 1.9, 3.62, 1.55, 0);                                                       // parrilla
  f.caja(m.vidrio, 0.04, 1.0, 2.1, 3.27, 2.4, 0, 0, 0, -0.18);                                            // parabrisas
  for (const z of [-1.23, 1.23]) { f.caja(m.vidrio, 1.1, 0.85, 0.04, 2.55, 2.45, z); f.caja(m.luz, 0.05, 0.2, 0.36, 3.62, 1.35, z * 0.75); f.barra(m.chasis, v3(3.2, 2.7, z * 1.1), v3(3.2, 2.2, z * 1.12), 0.03); f.caja(m.chasis, 0.1, 0.4, 0.2, 3.1, 2.4, z * 1.12); }
  f.caja(m.chasis, 1.7, 0.08, 2.5, 2.1, 1.1, 0);                                                          // peldaño
  // caja volcadora
  const { x0, x1, ancho, piso, borde } = CAJA, L = x1 - x0, cx = (x0 + x1) / 2;
  f.caja(m.caja, L + 0.2, 0.14, ancho + 0.2, cx, piso - 0.07, 0);                                         // piso
  for (const s of [-1, 1]) { f.caja(m.caja, L + 0.2, borde - piso, 0.1, cx, (borde + piso) / 2, s * (ancho / 2 + 0.05)); f.caja(m.franja, L, 0.1, 0.012, cx, piso + 0.5, s * (ancho / 2 + 0.115)); }
  f.caja(m.caja, 0.1, borde - piso + 0.5, ancho + 0.2, x1 + 0.1, (borde + piso + 0.5) / 2, 0);          // pared delantera
  f.caja(m.caja, 0.1, borde - piso - 0.2, ancho + 0.2, x0 - 0.1, (borde + piso - 0.2) / 2, 0);          // portón trasero
  f.caja(m.caja, 1.0, 0.1, ancho + 0.2, x1 + 0.45, borde + 0.4, 0, 0, 0, 0.45);                           // visera sobre la cabina
  for (let i = 0; i < 6; i++) f.caja(m.chasis, 0.12, 0.12, ancho + 0.2, x0 + 0.4 + i * 0.85, piso - 0.2, 0);   // costillas bajo el piso
  const g = f.crear();
  const ejes = [[2.5, 0.62, 0.42], [-1.55, 0.62, 0.46], [-2.9, 0.62, 0.46]];
  for (const [x, r, a] of ejes) for (const z of [-1.08, 1.08]) {
    for (const dz of x > 0 ? [0] : [-0.24, 0.24]) { const w = rueda(m, r, a); w.position.set(x, r, z + dz * Math.sign(z)); g.add(w); ruedas.push(w); }
  }
  const cajaGrupo = new THREE.Group(); g.add(cajaGrupo);
  // tierra cargada: malla de alturas dentro de la caja
  const nx = 22, nz = 10, geo = new THREE.PlaneGeometry(L - 0.1, ancho - 0.1, nx, nz); geo.rotateX(-Math.PI / 2);
  const carga = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ ...pbr('brown_mud_dry', { rep: 1 }), color: 0x8f7358, roughness: 1 }));
  carga.position.set(cx, piso, 0); carga.castShadow = carga.receiveShadow = true; carga.visible = false; g.add(carga);
  return { grupo: g, ruedas, carga, L, nx, nz };
}

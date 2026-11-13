// Estructura superior giratoria: cubierta, casa de máquinas, cabina, contrapeso, tambores y barandas (Liebherr HS 855 HD).
import * as THREE from 'three';
import { Fabrica, v3 } from './geo.js';

export const CAB = { pivoteX: 1.05, pivoteY: 1.55, mastilX: -3.4, mastilY: 4.35 };   // pie de pluma y punta del mástil trasero

function baranda(f, mat, x0, z0, x1, z1, y, h = 0.95) {   // baranda de tubo con montantes
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.1));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; f.barra(mat, v3(x, y, z), v3(x, y + h, z), 0.025); }
  for (const k of [0.5, 1]) f.barra(mat, v3(x0, y + h * k, z0), v3(x1, y + h * k, z1), 0.025);
}

function decal(texto, ancho, alto, x, y, z, ry) {             // rótulo pintado sobre la chapa (canvas)
  const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * alto / ancho); const g = c.getContext('2d');
  g.font = `800 ${c.height * 0.62}px -apple-system, Helvetica, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#15181c';
  g.fillText(texto.split('').join(String.fromCharCode(8202)), c.width / 2, c.height / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.88, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.position.set(x, y, z); m.rotation.y = ry; return m;
}

export function crearCabina(mats) {
  const f = new Fabrica(), A = mats.amarillo, N = mats.negro, G = mats.gris;
  f.caja(A, 6.1, 0.22, 3.5, -0.95, 0.11, 0);                                      // cubierta
  f.caja(N, 5.9, 0.16, 3.3, -0.95, -0.04, 0);                                     // faldón inferior
  f.caja(A, 3.7, 1.4, 3.0, -1.25, 0.92, -0.18);                                   // casa de máquinas
  f.caja(N, 3.7, 0.05, 0.02, -1.25, 1.32, 1.34); f.caja(N, 3.0, 0.45, 0.03, -1.0, 0.8, 1.335);   // persianas y rejilla
  for (let i = 0; i < 6; i++) f.caja(N, 0.04, 0.5, 0.025, -2.5 + i * 0.5, 0.75, 1.335);
  f.caja(N, 1.25, 0.1, 1.3, -1.9, 1.67, -0.25);                                   // rejilla del radiador (techo)
  f.cilindro(mats.aceroOscuro, 0.1, 1.6, -0.4, 2.1, -0.95, 'y', 12);              // escape
  f.cilindro(mats.negro, 0.14, 0.16, -0.4, 2.95, -0.95, 'y', 12);
  // cabina (adelante, del lado que mira a la cámara)
  f.caja(A, 1.55, 0.25, 1.75, 1.45, 0.34, 0.95);                                  // base
  f.caja(A, 1.5, 1.95, 0.1, 1.45, 1.3, 1.8); f.caja(A, 1.5, 1.95, 0.1, 1.45, 1.3, 0.1);       // laterales
  f.caja(A, 0.1, 1.95, 1.8, 2.15, 1.3, 0.95); f.caja(A, 0.1, 1.95, 1.8, 0.75, 1.3, 0.95);     // frente y fondo
  f.caja(A, 1.8, 0.14, 2.05, 1.45, 2.3, 0.95);                                    // techo
  f.caja(mats.vidrio, 1.3, 1.3, 0.02, 1.45, 1.35, 1.86); f.caja(mats.vidrio, 0.02, 1.4, 1.5, 2.21, 1.38, 0.95);   // vidrios lateral y frontal
  f.caja(mats.vidrio, 1.0, 0.7, 0.02, 1.45, 1.45, 0.04);
  f.barra(mats.negro, v3(2.22, 2.2, 0.35), v3(2.22, 0.55, 0.35), 0.015); f.barra(mats.negro, v3(2.22, 2.15, 0.95), v3(2.2, 0.6, 1.1), 0.012);  // limpiaparabrisas
  // contrapeso: bloques apilados al fondo, con faja de advertencia
  for (let i = 0; i < 4; i++) f.caja(mats.contrapeso, 1.3, 0.34, 3.3, -3.6, 0.4 + i * 0.35, 0);
  for (let i = 0; i < 4; i++) f.caja(N, 1.32, 0.02, 3.32, -3.6, 0.575 + i * 0.35, 0);
  for (let i = 0; i < 4; i++) f.caja(mats.amarilloLimpio, 0.02, 0.2, 0.2, -4.26, 0.4 + i * 0.35, 0.8);
    // tambores de los cabrestantes sobre la casa de máquinas
  f.caja(N, 1.6, 0.35, 2.4, -0.3, 1.78, -0.4);
  for (const z of [-1.0, 0.2]) { f.cilindro(mats.acero, 0.46, 0.75, -0.4, 2.2, z, 'z', 24); f.cilindro(mats.contrapeso, 0.62, 0.06, -0.4, 2.2, z - 0.4, 'z', 24); f.cilindro(mats.contrapeso, 0.62, 0.06, -0.4, 2.2, z + 0.4, 'z', 24); }
  // soportes del pie de pluma
  for (const z of [-0.55, 0.55]) f.caja(A, 0.35, 0.7, 0.14, CAB.pivoteX - 0.1, 1.75, z);
  f.cilindro(mats.acero, 0.07, 1.4, CAB.pivoteX, CAB.pivoteY + 0.1, 0, 'z', 10);
  // barandas
  const y0 = 0.22;
  baranda(f, N, -4.0, -1.74, 0.5, -1.74, y0); baranda(f, N, -4.0, 1.74, -0.1, 1.74, y0); baranda(f, N, -4.0, -1.74, -4.0, 1.74, y0);
  baranda(f, N, 2.5, -1.74, 2.5, -0.1, y0);
  // detalles de la cabina: barra de luces, visera, manija, escalón lateral y faros
  const luz = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.6 });
  f.caja(N, 0.12, 0.1, 1.5, 2.12, 2.45, 0.95); f.caja(luz, 0.04, 0.07, 0.3, 2.19, 2.45, 0.5); f.caja(luz, 0.04, 0.07, 0.3, 2.19, 2.45, 1.4);
  f.caja(A, 0.25, 0.05, 1.9, 2.2, 2.28, 0.95, 0, 0, -0.35);                                   // visera
  f.caja(N, 0.18, 0.04, 0.04, 1.2, 1.1, 1.82); f.caja(N, 0.9, 0.04, 0.5, 1.45, 0.42, 1.95);    // manija y escalón
  f.caja(N, 0.04, 0.9, 0.04, 0.75, 1.45, 1.82); f.caja(N, 0.04, 0.04, 1.5, 1.45, 2.05, 1.82);  // marco de la ventana
  for (const z of [0.4, 1.5]) f.caja(luz, 0.04, 0.12, 0.2, -4.23, 2.0, z * 0.9);                // luces traseras de trabajo
  const grupo = f.crear();
  grupo.add(decal('AIPATHS', 1.9, 0.5, -1.0, 1.2, 1.346, 0), decal('AIPATHS', 2.2, 0.55, -4.256, 1.05, 0, Math.PI / 2));
  return { grupo };
}

import * as THREE from 'three';
import { SUPER, COLOR } from './medidas.js';
import { MAT, Armador, sombra, caja, rueda, barra, V } from './materiales.js';

const P = SUPER.piso, T = SUPER.techo, W = SUPER.ancho / 2;
const perfil = (pts, ancho) => new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: ancho, bevelEnabled: false });

// Rótulo: «HS 8100» y el logo oficial de Liebherr (SVG de Wikimedia Commons), en negro sobre el amarillo.
async function rotulo() {
  const img = new Image(); img.src = 'assets/liebherr.svg'; await img.decode();
  const c = document.createElement('canvas'); c.width = 2048; c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#111';
  g.font = 'bold 170px "Arial Narrow", "Helvetica Neue", Arial'; g.textBaseline = 'middle';
  g.fillText('HS 8100', 20, 132); g.fillRect(640, 62, 150, 132);   // el bloque negro que precede al logo
  g.drawImage(img, 800, 62, 1064, 132);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
}

function cabina(a) {
  // Cabina a la izquierda (-Z), con el frente inclinado: perfil lateral medido sobre el plano.
  const z0 = -W + 0.03, an = 1.08, x0 = 1.02, x1 = SUPER.frenteCabina;
  const lateral = [[x0, P + 0.12], [x1 - 0.22, P + 0.12], [x1, P + 0.5], [x1 - 0.2, 3.08], [x0, 3.12]];
  a.add(MAT.blanco, perfil(lateral, an), 0, 0, z0);
  a.add(MAT.gris, caja(x1 - x0 - 0.1, 0.1, an + 0.1), (x0 + x1) / 2 - 0.08, 3.16, z0 + an / 2);                 // techo
  a.add(MAT.negro, caja(1.5, 0.05, an - 0.1), x0 + 0.85, 3.25, z0 + an / 2);                                   // reja de protección
  for (const dz of [0.2, an - 0.2]) a.add(MAT.acero, caja(0.12, 0.1, 0.16), x1 - 0.32, 3.24, z0 + dz);         // faros
  a.add(MAT.negro, caja(0.9, 0.5, 0.6), x0 + 0.55, P + 0.5, z0 + an / 2);                                     // butaca
  a.add(MAT.negro, caja(0.14, 0.75, 0.55), x0 + 0.2, P + 0.95, z0 + an / 2);
  const vidrios = new Armador();
  const ventana = [[x0 + 0.5, P + 0.55], [x1 - 0.32, P + 0.55], [x1 - 0.17, P + 0.72], [x1 - 0.3, 2.95], [x0 + 0.5, 2.98]];
  vidrios.add(MAT.vidrio, perfil(ventana, 0.02), 0, 0, z0 - 0.012);
  vidrios.add(MAT.vidrio, perfil(ventana, 0.02), 0, 0, z0 + an - 0.008);
  const inc = Math.atan2(0.2, 3.08 - P - 0.5);   // inclinación del parabrisas
  vidrios.add(MAT.vidrio, caja(0.02, 2.2, an - 0.16), x1 - 0.07, (P + 0.6 + 3.02) / 2, z0 + an / 2, 0, 0, inc);
  vidrios.add(MAT.vidrio, caja(0.02, 1.1, an - 0.3), x0 - 0.005, 2.45, z0 + an / 2);
  a.add(MAT.negro, caja(0.03, 1.0, 0.03), x1 - 0.05, 2.3, z0 + an * 0.45, 0, 0, inc);   // limpiaparabrisas
  a.add(MAT.negro, caja(0.05, 0.3, 0.16), x1 - 0.3, 2.75, z0 - 0.25);                   // espejo
  a.add(MAT.negro, barra(V(x1 - 0.4, 2.75, z0), V(x1 - 0.3, 2.75, z0 - 0.25), 0.015));
  return vidrios;
}

function contrapeso(a) {
  // Losas apiladas con la cola redondeada al radio de giro (4,7 m): 1 losa grande y 6 chicas, como la ficha.
  const pts = [[-3.42, W]];
  for (let i = 0; i <= 14; i++) { const t = -0.38 + (0.76 * i) / 14; pts.push([-Math.cos(t) * SUPER.cola, -Math.sin(t) * SUPER.cola]); }
  pts.push([-3.42, -W]);
  const losa = (h) => perfil(pts, h).rotateX(-Math.PI / 2);
  a.add(MAT.gris, losa(0.62), 0, P - 0.1, 0);
  for (let i = 0; i < 6; i++) a.add(MAT.gris, losa(0.2), 0, P + 0.55 + i * 0.225, 0);
}

function caballete(a) {
  // Caballete (A-frame): dos patas delanteras, dos tirantes traseros y las poleas arriba.
  const H = SUPER.caballete, ap = V(-3.25, H, 0);
  for (const s of [-1, 1]) {
    a.add(MAT.gris, barra(V(-1.35, T - 0.2, s * 0.95), V(ap.x, H, s * 0.45), 0.11, 10));
    a.add(MAT.gris, barra(V(-4.25, T - 0.15, s * 0.95), V(ap.x, H, s * 0.45), 0.07, 8));
    a.add(MAT.gris, caja(0.5, 0.3, 0.3), -1.35, T - 0.25, s * 0.95); a.add(MAT.gris, caja(0.4, 0.3, 0.3), -4.25, T - 0.25, s * 0.95);
  }
  a.add(MAT.gris, barra(V(ap.x, H, -0.6), V(ap.x, H, 0.6), 0.09, 10));
  a.add(MAT.gris, barra(V(-2.3, (T + H) / 2, -0.7), V(-2.3, (T + H) / 2, 0.7), 0.06, 8));
  for (const z of [-0.3, -0.1, 0.1, 0.3]) a.add(MAT.acero, rueda(0.3, 0.07, 24), ap.x, H, z);
  return ap;
}

export async function crearSuperestructura() {
  const grupo = new THREE.Group(); grupo.name = 'superestructura';
  const a = new Armador();
  // plataforma (bastidor de la superestructura)
  a.add(MAT.gris, caja(6.2, 0.26, 3.2), -0.65, P + 0.13, 0);
  a.add(MAT.gris, caja(1.6, 0.5, 1.5), 1.0, P + 0.28, 0);        // soporte del pie de pluma
  for (const s of [-1, 1]) a.add(MAT.gris, caja(0.5, 0.9, 0.14), SUPER.pie.x - 0.05, SUPER.pie.y - 0.2, s * 0.78);
  // casa de máquinas: dos cuerpos amarillos con los cabrestantes a la vista en el medio
  const x0 = -3.4, x1 = 0.95, largo = x1 - x0, cx = (x0 + x1) / 2;
  for (const s of [-1, 1]) {
    a.add(MAT.amarillo, caja(largo, T - P - 0.3, 1.12), cx, (T + P + 0.3) / 2 - 0.02, s * (W - 0.56));
    a.add(MAT.gris, caja(largo + 0.04, 0.08, 1.16), cx, T, s * (W - 0.56));                    // techo transitable
    a.add(MAT.gris, caja(largo, 0.1, 0.05), cx, P + 0.31, s * W);                               // zócalo
    for (let i = 1; i < 4; i++) a.add(MAT.negro, caja(0.025, T - P - 0.5, 0.02), x0 + (i * largo) / 4, (T + P) / 2 + 0.12, s * (W + 0.006));   // juntas de las puertas
    // barandas del techo
    const b = s * (W - 0.05), y = T + 0.04;
    for (let i = 0; i <= 4; i++) a.add(MAT.grisClaro, barra(V(x0 + 0.1 + (i * (largo - 0.2)) / 4, y, b), V(x0 + 0.1 + (i * (largo - 0.2)) / 4, y + 1.0, b), 0.02));
    for (const h of [0.5, 1.0]) a.add(MAT.grisClaro, barra(V(x0 + 0.1, y + h, b), V(x1 - 0.1, y + h, b), 0.02));
  }
  a.add(MAT.gris, caja(1.1, 0.9, 1.0), -2.75, P + 0.75, 0);                                     // motor diésel entre los cuerpos
  a.add(MAT.acero, new THREE.CylinderGeometry(0.09, 0.09, 1.3, 14), -3.0, T + 0.5, 0.9);        // escape
  for (const x of [-1.55, -0.35]) {                                                              // dos cabrestantes de 750 mm
    a.add(MAT.gris, rueda(0.375, 1.0, 28), x, P + 0.95, 0);
    for (const z of [-0.52, 0.52]) a.add(MAT.gris, rueda(0.56, 0.05, 28), x, P + 0.95, z);
    a.add(MAT.cable, rueda(0.43, 0.9, 28), x, P + 0.95, 0);                                      // cable arrollado
  }
  a.add(MAT.gris, caja(1.3, 1.0, 1.0), 1.75, P + 0.75, W - 0.55);                                // tanque y tablero, adelante a la derecha
  for (let i = 0; i < 4; i++) a.add(MAT.negro, caja(0.3, 0.03, 0.5), 1.45, P - 0.15 - i * 0.26, -W - 0.28);   // escalera a la cabina
  const vidrios = cabina(a);
  contrapeso(a);
  const apice = caballete(a);
  grupo.add(a.grupo('casa'), vidrios.grupo('vidrios'));
  // rótulos en los dos costados (HS 8100 + LIEBHERR) y LIEBHERR en la cola
  const mat = await rotulo();
  for (const s of [-1, 1]) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.45), mat);
    r.position.set(-1.25, 2.72, s * (W + 0.012)); r.rotation.y = s > 0 ? 0 : Math.PI; grupo.add(r);
  }
  // rombos de advertencia rojos y blancos en los costados del contrapeso, como en la foto real
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g2 = cv.getContext('2d');
  g2.translate(64, 64); g2.rotate(Math.PI / 4); g2.fillStyle = '#f4f4f0'; g2.fillRect(-44, -44, 88, 88); g2.fillStyle = '#c3221a'; g2.fillRect(-44, -44, 44, 44); g2.fillRect(0, 0, 44, 44);
  const tr = new THREE.CanvasTexture(cv); tr.colorSpace = THREE.SRGBColorSpace;
  const matRombo = new THREE.MeshStandardMaterial({ map: tr, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), matRombo);
    r.position.set(-3.72, P + 0.75 + i * 0.4, s * (W + 0.012)); r.rotation.y = s > 0 ? 0 : Math.PI; grupo.add(r);
  }
  return { grupo, apice };
}

// Lo que no se ve hasta desarmar: placa electrónica, fuente y la tapa de acrílico.
import * as THREE from 'three';
import { M } from './medidas.js';
import { pieza, malla, cilindro, caja } from './util.js';
import { azar } from './texturas.js';

function placa(mat) {
  const g = new THREE.Group();
  const r = azar(21);
  g.add(caja(250, 1.6, 150, mat.pcb, 0, 0, 0));
  for (let i = 0; i < 7; i++) g.add(cilindro(4 + r() * 3, 10 + r() * 8, mat.capacitor, -105 + i * 22 + r() * 8, 1.6, -52 + r() * 22, 20));
  for (let i = 0; i < 6; i++) g.add(caja(12 + r() * 14, 2.4, 9 + r() * 8, mat.chip, -90 + i * 34 + r() * 6, 1.6, 8 + r() * 44));
  // Disipador del control del motor
  for (let i = 0; i < 7; i++) g.add(caja(1.6, 18, 34, mat.aluminio, 78 + i * 5, 1.6, -40));
  g.add(caja(36, 3, 34, mat.aluminio, 93, 1.6, -40));
  // Salidas RCA y tierra
  for (const x of [-20, -4]) {
    const j = malla(new THREE.CylinderGeometry(4.2, 4.2, 14, 20), mat.laton, x, 8, -78);
    j.rotation.x = Math.PI / 2;
    g.add(j);
  }
  for (let i = 0; i < 26; i++) g.add(caja(3.2, 1.2, 1.6, mat.aluminio, -118 + r() * 236, 1.6, -70 + r() * 140));
  g.position.set(55, 33, 30);
  return pieza(g, 'Placa electrónica', 'Control digital del motor: mide la velocidad del plato y la corrige todo el tiempo', [0, 118, 0]);
}

function fuente(mat) {
  const g = new THREE.Group();
  g.add(caja(86, 1.6, 104, mat.pcb, 0, 0, 0));
  g.add(caja(46, 38, 40, mat.hierro, 0, 1.6, -24));
  const bobina = malla(new THREE.CylinderGeometry(17, 17, 52, 28), mat.cobre, 0, 21, -24);
  bobina.rotation.z = Math.PI / 2;
  g.add(bobina);
  for (const [x, z, rr, h] of [[-22, 22, 8, 26], [0, 24, 8, 26], [24, 20, 5, 16], [24, 38, 5, 16]]) g.add(cilindro(rr, h, mat.capacitor, x, 1.6, z, 24));
  g.position.set(-150, 33, -95);
  return pieza(g, 'Fuente de alimentación', 'Baja los 110–240 V del enchufe. El equipo entero consume 8 W', [0, 118, 0]);
}

// Tapa antipolvo con bisagras atrás. Se modela en el marco de la bisagra.
function tapa(mat) {
  const W = 445, D = 345, H = M.ALTO_TOTAL - M.TOP, e = 3;
  const g = new THREE.Group();
  const lamina = (w, h, d, x, y, z) => {
    const m = malla(new THREE.BoxGeometry(w, h, d), mat.acrilico, x, y, z);
    m.castShadow = false;
    m.receiveShadow = false;
    m.renderOrder = 5;
    return m;
  };
  g.add(lamina(W, e, D, 0, H - e / 2, D / 2));
  g.add(lamina(W, H - e, e, 0, (H - e) / 2, D - e / 2));
  g.add(lamina(W, H - e, e, 0, (H - e) / 2, e / 2));
  for (const sx of [-1, 1]) g.add(lamina(e, H - e, D - e * 2, sx * (W / 2 - e / 2), (H - e) / 2, D / 2));
  for (const sx of [-1, 1]) g.add(caja(30, 9, 9, mat.boton, sx * 120, 1, -3));
  g.position.set(0, M.TOP + 0.5, -D / 2);
  return pieza(g, 'Tapa antipolvo', 'Acrílico ahumado con bisagras: se abre o se saca entera', [0, 505, 0]);
}

export function crearInterior(mat) {
  return { placa: placa(mat), fuente: fuente(mat), tapa: tapa(mat) };
}

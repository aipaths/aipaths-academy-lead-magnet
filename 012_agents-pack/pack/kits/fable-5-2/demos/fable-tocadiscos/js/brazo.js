// Brazo en S, cápsula, aguja, contrapeso y su base. Forma copiada de la foto cenital.
import * as THREE from 'three';
import { M } from './medidas.js';
import { pieza, malla, cilindro, caja, torno } from './util.js';

// Eje del tubo visto desde arriba, en mm desde el pivote (x, z) [C]
const EJE = [[0, -6], [-1, 14], [-2.4, 38.8], [-3.4, 66.6], [0, 96.4], [6, 116.3], [9, 130.2], [6, 150], [-2, 166], [-15.9, 185.9]];
const GIRO_CAPSULA = THREE.MathUtils.degToRad(34); // [C] ángulo de la cápsula respecto del tubo
const PUNTA = { y: -18.5, z: 46 };                 // punta de la aguja en el marco de la cápsula
export const ALTURA_DISCO = M.PLATO.alto + 2 + 1.62; // cara del disco sobre la chapa

const horizontal = (m) => { m.rotation.x = Math.PI / 2; return m; };

function capsula(mat) {
  const g = new THREE.Group();
  g.add(horizontal(malla(new THREE.CylinderGeometry(5.6, 5.6, 9, 32), mat.portacapsula, 0, 0, 4)));
  g.add(caja(7, 3, 9, mat.portacapsula, 0, -1.5, 9));
  // Portacápsula: placa con ranuras y uñero
  g.add(caja(18, 1.6, 40, mat.portacapsula, 0, -0.4, 31));
  for (const x of [-4.5, 4.5]) g.add(caja(2.2, 0.3, 16, mat.hueco, x, 1.15, 30));
  const unia = caja(3, 1.2, 15, mat.portacapsula, 13, 0.6, 17);
  unia.rotation.y = 1.05;
  unia.rotation.z = 0.2;
  g.add(unia);
  // Cuerpo de la cápsula
  g.add(caja(13, 12.5, 19, mat.boton, 0, -13, 33));
  for (const x of [-3.2, 3.2]) g.add(cilindro(1.2, 1, mat.laton, x, 1.2, 28, 12));
  // Aguja: soporte rojo, cantilever y punta de diamante
  const aguja = new THREE.Group();
  aguja.add(caja(9.5, 6, 8, mat.rubi, 0, -15.5, 40.5));
  const cant = malla(new THREE.CylinderGeometry(0.35, 0.35, 8, 8), mat.aluminio, 0, -16.4, 44);
  cant.rotation.x = Math.PI / 2 + 0.45;
  const punta = malla(new THREE.ConeGeometry(0.5, 1.6, 8), mat.acero, 0, PUNTA.y + 0.8, PUNTA.z);
  punta.rotation.x = Math.PI;
  aguja.add(cant, punta);
  g.add(pieza(aguja, 'Aguja', 'Punta de diamante que lee el surco: sus vibraciones son la música', [0, -24, 0]));
  return g;
}

function contrapeso(mat) {
  const g = new THREE.Group();
  g.add(horizontal(malla(new THREE.CylinderGeometry(15.5, 15.5, 28, 48), mat.negroSatinado, 0, 0, -40)));
  g.add(horizontal(malla(new THREE.CylinderGeometry(13.5, 13.5, 5, 48), mat.aluminioOscuro, 0, 0, -23.5)));
  g.add(horizontal(malla(new THREE.CylinderGeometry(6, 6, 12, 24), mat.negroSatinado, 0, 0, -60)));
  return pieza(g, 'Contrapeso', 'Se gira para ajustar cuánto pesa la aguja sobre el disco (unos 2 a 4 gramos)', [0, 0, -48]);
}

function brazo(mat) {
  const pivote = new THREE.Group();
  pivote.rotation.order = 'YXZ';
  const curva = new THREE.CatmullRomCurve3(EJE.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5);
  pivote.add(malla(new THREE.TubeGeometry(curva, 90, 4.3, 20), mat.negroBrillo));
  pivote.add(horizontal(malla(new THREE.CylinderGeometry(4.2, 4.2, 26, 20), mat.negroSatinado, 0, 0, -16)));
  pivote.add(horizontal(malla(new THREE.CylinderGeometry(8.5, 8.5, 24, 32), mat.negroSatinado, 0, 0, 0)));
  pivote.add(cilindro(2.6, 1.2, mat.aluminio, 0, 8.3, 0, 16));
  pivote.add(contrapeso(mat));
  const [fx, fz] = EJE[EJE.length - 1];
  const cap = capsula(mat);
  cap.position.set(fx, 0, fz);
  cap.rotation.y = -GIRO_CAPSULA;
  const s = Math.sin(GIRO_CAPSULA), c = Math.cos(GIRO_CAPSULA);
  pieza(cap, 'Cápsula y portacápsula', 'Convierte el movimiento de la aguja en señal eléctrica. Se saca girando la rosca', [-s * 48, 0, c * 48]);
  pivote.add(cap);
  // Punta de la aguja en el marco del brazo: de acá sale toda la cinemática
  const punta = new THREE.Vector3(fx - s * PUNTA.z, PUNTA.y, fz + c * PUNTA.z);
  pivote.position.set(M.PIVOTE.x, M.TOP + ALTURA_DISCO - PUNTA.y, M.PIVOTE.z);
  pieza(pivote, 'Brazo en S', 'Tubo de aluminio de 230 mm de largo efectivo, balanceado sobre rulemanes', [0, 95, 0]);
  return { pivote, punta };
}

function base(mat, yPivote) {
  const g = new THREE.Group();
  const { BASE_BRAZO: B, PIVOTE: P, TOP } = M;
  const dx = P.x - B.x, dz = P.z - B.z, h = yPivote - TOP;
  // Anillo de regulación de altura y torre
  g.add(torno([[30, 15], [43, 15], [45, 13], [45, 1], [47, 0]], mat.negroBrillo, 96));
  g.add(torno([[24, h - 13], [29, h - 13], [30, 15]], mat.negroSatinado, 72));
  // Horquilla del cardán
  for (const sx of [-1, 1]) g.add(caja(3.6, 17, 9, mat.negroSatinado, dx + sx * 16.5, h - 14, dz));
  const aro = malla(new THREE.TorusGeometry(16.5, 2.8, 12, 48), mat.negroBrillo, dx, h, dz);
  g.add(aro);
  // Anti-skating
  const anti = new THREE.Group();
  anti.add(cilindro(11, 8, mat.negroSatinado, 0, 0, 0, 48));
  anti.add(torno([[0, 8.6], [9, 8.6], [10.6, 8]], mat.aluminioOscuro, 48));
  anti.position.set(dx + 37, 15, dz + 7);
  g.add(pieza(anti, 'Anti-skating', 'Compensa la fuerza que tira el brazo hacia el centro del disco', [22, 14, 0]));
  // Palanca y plataforma de elevación (cue)
  const cue = new THREE.Group();
  cue.add(cilindro(5, 9, mat.negroSatinado, 0, 0, 0, 24));
  const pal = caja(5, 3, 30, mat.negroSatinado, 0, 7, 15);
  pal.rotation.x = -0.28;
  cue.add(pal);
  cue.rotation.y = 0.32;
  cue.position.set(dx + 26, 4, dz + 44);
  g.add(pieza(cue, 'Palanca de elevación', 'Sube y baja el brazo despacio, con freno hidráulico', [26, 8, 10]));
  g.add(cilindro(3, h - 8, mat.negroSatinado, dx + 13, 0, dz + 44, 20));
  g.add(caja(28, 1.6, 5, mat.negroSatinado, dx + 4, h - 8.1, dz + 44));
  g.add(caja(28, 1.2, 5, mat.goma, dx + 4, h - 6.5, dz + 44));
  // Apoyo del brazo con su traba
  const ax = dx - 3.4, az = dz + 66.6;
  g.add(cilindro(3.2, h - 6, mat.negroSatinado, ax, 0, az, 20));
  g.add(caja(14, 2.5, 6, mat.negroSatinado, ax, h - 7.4, az));
  for (const sx of [-1, 1]) g.add(caja(2.2, 6, 6, mat.negroSatinado, ax + sx * 6, h - 5, az));
  g.position.set(B.x, TOP - 2.4, B.z);
  return pieza(g, 'Base del brazo', 'Cardán, regulación de altura, anti-skating y apoyo con traba', [0, 40, 0]);
}

export function crearBrazo(mat) {
  const { pivote, punta } = brazo(mat);
  return { pivote, punta, base: base(mat, pivote.position.y + 2.4) };
}

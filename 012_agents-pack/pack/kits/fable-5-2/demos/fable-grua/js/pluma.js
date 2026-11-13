import * as THREE from 'three';
import { PLUMA, SUPER } from './medidas.js';
import { MAT, Armador, sombra, caja, rueda, barra, V } from './materiales.js';
import { Tirante } from './cables.js';

const L = PLUMA.largo, HZ = PLUMA.ancho / 2, HY = PLUMA.alto / 2;
const PIE = 5.5, CABEZA = 5.5;   // oficial: largo del pie y de la cabeza de la pluma
// Media altura y medio ancho de la celosía a lo largo de la pluma: el pie se afina hacia la articulación
// y la cabeza hacia las poleas.
const mediaAltura = (x) => (x < PIE ? 0.13 + (HY - 0.13) * (x / PIE) : x > L - CABEZA ? HY - (HY - 0.3) * ((x - (L - CABEZA)) / CABEZA) : HY);
const medioAncho = (x) => (x > L - CABEZA ? HZ - (HZ - 0.42) * ((x - (L - CABEZA)) / CABEZA) : HZ);
const nudo = (x, sy, sz) => V(x, sy * mediaAltura(x), sz * medioAncho(x));

function celosia() {
  const a = new Armador(), m = MAT.amarillo;
  // estaciones: los empalmes de los tramos (5,5 · 8,5 · 14,5) y un nudo cada ~1,1 m
  const xs = [0.25]; for (const fin of [PIE, PIE + 3, L - CABEZA, L - 0.35]) { const ini = xs[xs.length - 1], n = Math.round((fin - ini) / 1.1); for (let i = 1; i <= n; i++) xs.push(ini + ((fin - ini) * i) / n); }
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < xs.length - 1; i++) a.add(m, barra(nudo(xs[i], sy, sz), nudo(xs[i + 1], sy, sz), 0.062, 8));   // 4 cordones
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1], p = i % 2 ? 1 : -1;
    for (const sz of [-1, 1]) a.add(m, barra(nudo(x0, p, sz), nudo(x1, -p, sz), 0.03));            // diagonales de los costados
    for (const sy of [-1, 1]) a.add(m, barra(nudo(x0, sy, p), nudo(x1, sy, -p), 0.026));           // diagonales de arriba y abajo
  }
  for (const x of [0.25, PIE, PIE + 3, L - CABEZA, L - 0.35]) {                                      // marcos de los empalmes
    for (const sz of [-1, 1]) a.add(m, barra(nudo(x, -1, sz), nudo(x, 1, sz), 0.045));
    for (const sy of [-1, 1]) a.add(m, barra(nudo(x, sy, -1), nudo(x, sy, 1), 0.045));
  }
  // articulación del pie y cabeza con las poleas
  for (const sz of [-1, 1]) a.add(m, caja(0.5, 0.3, 0.1), 0.1, 0, sz * HZ);
  a.add(MAT.acero, rueda(0.07, PLUMA.ancho + 0.3, 12), 0, 0, 0);
  for (const sz of [-1, 1]) a.add(m, caja(1.1, 0.75, 0.05), L - 0.1, 0.02, sz * 0.4);
  a.add(MAT.acero, rueda(0.05, 1.0, 12), L, -0.05, 0);
  for (const z of [-0.22, 0.22]) { a.add(MAT.gris, rueda(0.42, 0.07, 32), L, -0.05, z); a.add(MAT.gris, rueda(0.3, 0.06, 24), L - 0.5, 0.42, z); }
  return a.grupo('pluma');
}

export function crearPluma(apice) {
  const grupo = new THREE.Group(); grupo.name = 'pluma';
  grupo.position.set(SUPER.pie.x, SUPER.pie.y, 0);
  grupo.add(celosia());
  // Lo que cuelga entre el caballete y la cabeza: 4 ramales de cable hasta un balancín y 2 tirantes hasta la pluma.
  const fijos = new THREE.Group(); fijos.name = 'tirantes';
  const balancin = sombra(new THREE.Mesh(caja(0.5, 0.22, 1.3), MAT.gris)); fijos.add(balancin);
  const ramales = [-0.3, -0.1, 0.1, 0.3].map((z) => ({ z, t: new Tirante(0.014) }));
  const tirantes = [-0.55, 0.55].map((z) => ({ z, t: new Tirante(0.03, MAT.gris) }));
  const izaje = [{ z: -0.22, x: -1.55 }, { z: 0.22, x: -0.35 }].map((c) => ({ ...c, t: new Tirante(PLUMA.cable / 2 + 0.004) }));   // del cabrestante a la polea
  [...ramales, ...tirantes, ...izaje].forEach((r) => fijos.add(r.t.malla));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), cab = new THREE.Vector3(), pol = new THREE.Vector3();
  // Punto de la pluma (x a lo largo, y hacia arriba de la celosía) en coordenadas de la superestructura.
  const enSuper = (x, y, z, ang, out) => out.set(SUPER.pie.x + x * Math.cos(ang) - y * Math.sin(ang), SUPER.pie.y + x * Math.sin(ang) + y * Math.cos(ang), z);
  function poner(ang) {
    grupo.rotation.z = ang;
    enSuper(L - 0.5, 0.42, 0, ang, cab);
    const bx = apice.x + (cab.x - apice.x) * 0.3, by = apice.y + (cab.y - apice.y) * 0.3;
    balancin.position.set(bx, by, 0); balancin.rotation.z = Math.atan2(cab.y - apice.y, cab.x - apice.x) + Math.PI / 2;
    for (const r of ramales) r.t.poner(a.set(apice.x, apice.y, r.z), b.set(bx, by, r.z * 1.6));
    for (const r of tirantes) r.t.poner(a.set(bx, by, r.z), b.set(cab.x, cab.y, r.z * 0.45));
    enSuper(L, -0.05, 0, ang, pol);
    for (const c of izaje) c.t.poner(a.set(c.x, SUPER.piso + 1.38, c.z), b.set(pol.x - 0.42 * Math.sin(ang), pol.y + 0.42 * Math.cos(ang), c.z));
    return pol;   // centro de las poleas de la cabeza
  }
  return { grupo, fijos, poner, radioPolea: 0.42 };
}

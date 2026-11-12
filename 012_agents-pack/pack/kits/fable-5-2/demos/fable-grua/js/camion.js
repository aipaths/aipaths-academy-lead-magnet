import * as THREE from 'three';
import { OBRA } from './medidas.js';
import { MAT, Armador, sombra, caja, rueda } from './materiales.js';

// Volquete de 4 ejes (8x4) genérico. Medidas típicas: 8,6 m de largo, 2,5 de ancho, caja de 5,6 m.
export const CAJA = { x0: -4.15, x1: 1.45, medioAncho: 1.1, piso: 1.42, borde: 2.72, capacidad: 8 };
const EJES = [3.25, 1.85, -1.75, -3.1], RADIO = 0.54, NX = 16, NZ = 7;
const perfil = (pts, ancho) => new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: ancho, bevelEnabled: false }).translate(0, 0, -ancho / 2);

function carroceria(color) {
  const a = new Armador(), pintura = MAT.blanco.clone(); pintura.color.set(color);
  const acero = MAT.gris.clone(); acero.color.set(0x6e7175);
  for (const z of [-0.45, 0.45]) a.add(MAT.negro, caja(8.3, 0.28, 0.1), 0, 0.98, z);                     // largueros
  a.add(pintura, perfil([[2.05, 1.0], [4.28, 1.0], [4.32, 1.9], [4.27, 2.15], [4.14, 2.95], [4.04, 3.07], [3.88, 3.12], [2.05, 3.12]], 2.46));   // cabina
  a.add(pintura, perfil([[2.3, 3.12], [3.7, 3.12], [3.2, 3.5], [2.3, 3.55]], 2.2));                          // deflector del techo
  for (const s of [-1, 1]) {
    a.add(MAT.negro, perfil([[2.45, 0.95], [2.6, 1.42], [3.9, 1.42], [4.05, 0.95]], 0.3), 0, 0, s * 1.1);    // pasarruedas
    a.add(MAT.negro, caja(0.02, 1.9, 0.02), 2.9, 2.05, s * 1.236); a.add(MAT.negro, caja(0.9, 0.02, 0.02), 3.45, 1.5, s * 1.236);   // juntas de la puerta
    a.add(MAT.negro, caja(0.08, 0.5, 0.2), 4.2, 2.55, s * 1.42); a.add(MAT.negro, caja(0.3, 0.04, 0.04), 4.1, 2.6, s * 1.3);        // espejos
    a.add(MAT.negro, caja(0.5, 0.04, 0.3), 3.6, 0.7, s * 1.1); a.add(MAT.negro, caja(0.5, 0.04, 0.3), 3.75, 0.45, s * 1.1);         // estribos
    a.add(MAT.acero, caja(2.6, 0.12, 0.05), -0.3, 0.75, s * 1.2);                                              // defensa lateral
    a.add(new THREE.MeshStandardMaterial({ color: 0xb01c14, roughness: 0.4 }), caja(0.05, 0.14, 0.4), -4.2, 1.05, s * 0.9);    // luces de cola
  }
  for (let i = 0; i < 5; i++) a.add(MAT.acero, caja(0.03, 0.035, 1.4), 4.335, 1.28 + i * 0.11, 0);            // parrilla
  a.add(new THREE.MeshStandardMaterial({ color: 0xe8911a, roughness: 0.35 }), caja(0.5, 0.1, 0.16), 3.0, 3.6, 0);              // baliza
  a.add(MAT.negro, caja(0.16, 0.45, 2.5), 4.3, 0.75, 0);                                                    // paragolpes
  a.add(MAT.negro, caja(0.06, 0.66, 1.55), 4.31, 1.5, 0);                                                     // parrilla
  for (const z of [-0.95, 0.95]) a.add(MAT.acero, caja(0.05, 0.16, 0.36), 4.39, 0.78, z);                   // faros
  a.add(MAT.negro, caja(0.5, 0.5, 0.6), 1.2, 0.75, -0.95); a.add(MAT.acero, caja(0.9, 0.5, 0.55), 0.3, 0.72, 0.95);   // tanques
  a.add(MAT.acero, new THREE.CylinderGeometry(0.07, 0.07, 2.3, 10), 1.9, 2.1, 1.05);                        // escape
  // caja volcadora: piso, costados con costillas, frente con visera sobre la cabina y compuerta
  const { x0, x1, medioAncho: w, piso, borde } = CAJA, largo = x1 - x0, cx = (x0 + x1) / 2, alto = borde - piso;
  a.add(acero, caja(largo, 0.12, 2 * w + 0.12), cx, piso - 0.06, 0);
  for (const s of [-1, 1]) {
    a.add(acero, caja(largo, alto, 0.07), cx, piso + alto / 2, s * (w + 0.035));
    a.add(acero, caja(largo + 0.1, 0.12, 0.14), cx, borde, s * (w + 0.04));
    for (let i = 0; i < 6; i++) a.add(acero, caja(0.1, alto, 0.07), x0 + 0.4 + i * ((largo - 0.8) / 5), piso + alto / 2, s * (w + 0.1));
    for (const x of EJES.slice(2)) a.add(MAT.negro, caja(1.25, 0.05, 0.75), x, 1.2, s * 0.92);              // guardabarros
    a.add(MAT.negro, caja(0.03, 0.55, 0.7), -4.0, 0.72, s * 0.9);                                           // barreros
  }
  a.add(acero, caja(0.08, alto + 0.35, 2 * w + 0.14), x1 + 0.04, piso + (alto + 0.35) / 2, 0);
  a.add(acero, caja(1.3, 0.07, 2 * w + 0.14), x1 + 0.65, borde + 0.33, 0);
  a.add(acero, caja(0.07, alto, 2 * w + 0.1), x0 - 0.035, piso + alto / 2, 0);
  for (const z of [-0.6, 0.6]) a.add(MAT.negro, caja(largo, 0.3, 0.14), cx, piso - 0.27, z);
  const g = a.grupo('camión');
  const v = new Armador();
  v.add(MAT.vidrio, caja(0.02, 0.95, 2.2), 4.225, 2.5, 0, 0, 0, 0.178);
  for (const z of [-1.235, 1.235]) v.add(MAT.vidrio, caja(1.1, 0.8, 0.02), 3.45, 2.55, z);
  g.add(v.grupo('vidrios'));
  return g;
}

function ejes() {
  const a = new Armador();
  const llanta = (z) => { a.add(MAT.goma, rueda(RADIO, 0.34, 28), 0, 0, z); a.add(MAT.goma, rueda(RADIO - 0.035, 0.38, 28), 0, 0, z); a.add(MAT.grisClaro, rueda(0.31, 0.4, 18), 0, 0, z); a.add(MAT.gris, rueda(0.15, 0.44, 12), 0, 0, z); };
  for (const z of [-1.02, 1.02]) llanta(z);
  const simple = a.grupo().children;
  for (const z of [-0.66, 0.66]) a.add(MAT.goma, rueda(RADIO, 0.34, 28), 0, 0, z);
  const doble = a.grupo().children;
  return EJES.map((x, i) => { const g = new THREE.Group(); for (const m of i < 2 ? simple : doble) g.add(sombra(m.clone())); g.position.set(x, RADIO, 0); return g; });
}

class Camion {
  constructor(terreno, matTierra, color) {
    this.t = terreno; this.grupo = new THREE.Group(); this.cuerpo = carroceria(color);
    this.ejes = ejes(); this.grupo.add(this.cuerpo, ...this.ejes);
    // la carga: un mapa de alturas chico adentro de la caja, con su propio ángulo de reposo
    this.h = new Float32Array(NX * NZ); this.vol = 0;
    const geo = new THREE.PlaneGeometry(CAJA.x1 - CAJA.x0 - 0.04, 2 * CAJA.medioAncho - 0.02, NX - 1, NZ - 1).rotateX(-Math.PI / 2);
    geo.setAttribute('fresca', new THREE.BufferAttribute(new Float32Array(NX * NZ).fill(1), 1));
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.9, uv.getY(i) * 0.35);
    this.monton = sombra(new THREE.Mesh(geo, matTierra)); this.monton.position.set((CAJA.x0 + CAJA.x1) / 2, CAJA.piso + 0.01, 0);
    this.cuerpo.add(this.monton); this.x = -80; this.v = 0; this.estado = 'lejos'; this.espera = 0; this.dibujarCarga();
  }
  // ¿Cae adentro de la caja? Entonces se suma al montón.
  recibir(x, y, z, vol) {
    const lx = x - this.grupo.position.x, lz = z - OBRA.camion.z, ly = y - this.grupo.position.y;
    if (lx < CAJA.x0 || lx > CAJA.x1 || Math.abs(lz) > CAJA.medioAncho) return false;
    const fi = ((lx - CAJA.x0) / (CAJA.x1 - CAJA.x0)) * (NX - 1), fj = ((lz + CAJA.medioAncho) / (2 * CAJA.medioAncho)) * (NZ - 1);
    const k = Math.round(fj) * NX + Math.round(fi);
    if (ly > CAJA.piso + this.h[k] || ly < CAJA.piso - 0.5) return false;
    const area = ((CAJA.x1 - CAJA.x0) / (NX - 1)) * ((2 * CAJA.medioAncho) / (NZ - 1));
    this.h[k] += vol / area; this.vol += vol; this.sucio = true;
    return true;
  }
  asentar() {
    if (!this.sucio) return; const h = this.h, dx = (CAJA.x1 - CAJA.x0) / (NX - 1), tope = OBRA.reposo * dx; let movio = false;
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) for (const [di, dj] of [[1, 0], [0, 1]]) {
      if (i + di >= NX || j + dj >= NZ) continue;
      const a = j * NX + i, b = a + dj * NX + di, d = h[a] - h[b];
      if (Math.abs(d) > tope) { const m = (Math.abs(d) - tope) * 0.3 * Math.sign(d); h[a] -= m; h[b] += m; movio = true; }
    }
    this.sucio = movio; this.dibujarCarga();
  }
  dibujarCarga() {
    const p = this.monton.geometry.attributes.position; let max = 0;
    for (let k = 0; k < NX * NZ; k++) { p.setY(k, this.h[k]); max = Math.max(max, this.h[k]); }
    p.needsUpdate = true; this.monton.geometry.computeVertexNormals(); this.monton.visible = max > 0.02;
  }
  vaciar() { this.h.fill(0); this.vol = 0; this.dibujarCarga(); }
  // Altura de la chapa en un punto (para que la almeja no la atraviese).
  alturaEn(x, z) {
    const lx = x - this.grupo.position.x, lz = Math.abs(z - OBRA.camion.z);
    if (lz > 1.3) return -99;
    if (lx > 2.0 && lx < 4.4) return 3.1;
    if (lx < CAJA.x0 - 0.1 || lx > 2.0) return -99;
    return lz > CAJA.medioAncho - 0.05 || lx < CAJA.x0 + 0.1 || lx > CAJA.x1 - 0.1 ? CAJA.borde + 0.06 : CAJA.piso + this.h[Math.round(((lz * Math.sign(z - OBRA.camion.z) + CAJA.medioAncho) / (2 * CAJA.medioAncho)) * (NZ - 1)) * NX + Math.round(((lx - CAJA.x0) / (CAJA.x1 - CAJA.x0)) * (NX - 1))];
  }
  paso(dt, destino) {
    const antes = this.v;
    if (destino !== null) {
      const falta = destino - this.x, vmax = 6.5;
      const quiero = falta > 0.02 ? Math.min(vmax, Math.sqrt(2 * 1.1 * falta) + 0.05) : 0;
      this.v += THREE.MathUtils.clamp(quiero - this.v, -2.2 * dt, 1.0 * dt);
      this.x += this.v * dt; if (falta <= 0.02 && this.v < 0.05) { this.v = 0; this.x = destino; }
    }
    const y = (this.t.alturaEn(this.x + 2.5, OBRA.camion.z) + this.t.alturaEn(this.x - 2.4, OBRA.camion.z)) / 2;
    this.grupo.position.set(this.x, y, OBRA.camion.z);
    this.cuerpo.rotation.z += (-(this.v - antes) / Math.max(dt, 1e-3) * 0.006 - this.cuerpo.rotation.z) * Math.min(1, dt * 4);   // cabecea al frenar
    for (const e of this.ejes) e.rotation.z -= (this.v * dt) / RADIO;
    this.asentar();
  }
}

// Dos camiones que se turnan: cuando uno se llena, se va solo y entra el otro vacío.
export class Camiones {
  constructor(terreno, matTierra) {
    this.lista = [new Camion(terreno, matTierra, 0x8f2a22), new Camion(terreno, matTierra, 0x24507c)];
    this.grupo = new THREE.Group(); this.lista.forEach((c) => this.grupo.add(c.grupo));
    this.turno = 0; this.viajes = 0; this.alSalir = null;
    const c = this.lista[0]; c.x = OBRA.camion.x; c.estado = 'cargando'; c.paso(0, null);
    this.lista[1].paso(0, null);
  }
  get actual() { return this.lista[this.turno]; }
  get llenado() { return Math.min(1, this.actual.vol / CAJA.capacidad); }
  recibir = (x, y, z, vol) => { const c = this.actual; return c.estado === 'cargando' && c.recibir(x, y, z, vol); };
  alturaEn(x, z) { let m = -99; for (const c of this.lista) m = Math.max(m, c.alturaEn(x, z) + c.grupo.position.y); return m; }
  paso(dt) {
    const a = this.actual, otro = this.lista[1 - this.turno];
    if (a.estado === 'cargando' && a.vol >= CAJA.capacidad) { a.estado = 'lleno'; a.espera = 1.6; }
    if (a.estado === 'lleno' && (a.espera -= dt) <= 0) {                      // se va el lleno y arranca el vacío
      a.estado = 'saliendo'; otro.vaciar(); otro.x = -75; otro.v = 0; otro.estado = 'llegando';
      this.turno = 1 - this.turno; this.viajes++; if (this.alSalir) this.alSalir();
    }
    for (const c of this.lista) {
      if (c.estado === 'saliendo') { c.paso(dt, 140); if (c.x > 130) c.estado = 'lejos'; }
      else if (c.estado === 'llegando') { c.paso(dt, OBRA.camion.x); if (c.x === OBRA.camion.x) c.estado = 'cargando'; }
      else c.paso(dt, null);
      c.grupo.visible = c.estado !== 'lejos';
    }
  }
}

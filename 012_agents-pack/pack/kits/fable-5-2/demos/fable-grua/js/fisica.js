import * as THREE from 'three';
import { ALMEJA } from './medidas.js';
import { cavar } from './tierra.js';

const G = 9.81, ARRIBA = new THREE.Vector3(0, 1, 0);
// La almeja es un péndulo de verdad: una masa colgada de un cable que no se estira.
// Nadie la "anima": la mueve la punta de la pluma, y si la punta frena de golpe, la almeja sigue de largo.
export class Pendulo {
  constructor(grua, terreno, camiones, particulas) {
    Object.assign(this, { grua, terreno, camiones, particulas });
    this.p = grua.punta.clone(); this.p.y -= grua.e.cable;      // enganche del cable en el cabezal
    this.v = new THREE.Vector3(); this.ant = new THREE.Vector3(); this.n = new THREE.Vector3(0, 1, 0);
    this.rumbo = grua.e.rumbo + grua.e.giro; this.vRumbo = 0; this.contacto = null; this.sobra = 0; this.tension = 1;
    this.eventos = { mordida: 0, golpe: 0, suelta: 0 };          // para el sonido y el polvo
    this.q = new THREE.Quaternion(); this.qy = new THREE.Quaternion(); this.d = new THREE.Vector3(); this.tmp = new THREE.Vector3();
    this.apAnt = grua.e.apertura; this.puntaAnt = grua.punta.clone(); this.vPunta = new THREE.Vector3();
  }
  // Lo más alto que hay debajo de la almeja: tierra o chapa del camión.
  piso() {
    const al = this.grua.almeja, c = Math.cos(this.rumbo), s = Math.sin(this.rumbo), ml = al.medioLargo * 0.85;
    let y = -99, tipo = 'suelo';
    for (const u of [-1, 0, 1]) {
      const x = this.p.x - s * ml * u, z = this.p.z - c * ml * u;   // a lo largo de la boca (perpendicular a la pluma)
      const t = this.terreno.alturaEn(x, z) - 0.25 * al.apertura * Math.abs(u), k = this.camiones.alturaEn(x, z);
      if (t > y) { y = t; tipo = 'suelo'; } if (k > y) { y = k; tipo = 'camion'; }
    }
    return { y, tipo };
  }
  paso(dt) {
    const { p, v, ant, d, grua } = this, e = grua.e, al = grua.almeja, punta = grua.punta;
    ant.copy(p);
    if (dt > 0) { this.vPunta.subVectors(punta, this.puntaAnt).multiplyScalar(1 / dt); this.puntaAnt.copy(punta); }
    v.y -= G * dt; v.multiplyScalar(1 - 0.09 * dt);              // gravedad y un poco de aire
    p.addScaledVector(v, dt);
    const piso = this.piso(), antes = this.contacto;
    this.contacto = null;
    if (p.y - al.fondo < piso.y) {                                 // apoyada: el suelo la frena
      p.y = piso.y + al.fondo; p.x = ant.x + (p.x - ant.x) * 0.15; p.z = ant.z + (p.z - ant.z) * 0.15;
      this.contacto = piso.tipo; if (!antes && v.y < -0.8) this.eventos.golpe = Math.min(1, -v.y / 4);
    }
    d.subVectors(p, punta); const dist = d.length();
    if (dist > e.cable) p.copy(punta).addScaledVector(d, e.cable / dist);   // el cable no se estira
    this.sobra = Math.max(0, e.cable - dist);
    if (this.sobra > 3) { e.cable = dist + 3; this.sobra = 3; }     // no desenrolla cable al cuete
    v.subVectors(p, ant).multiplyScalar(1 / dt);
    this.tension = this.sobra < 0.02 ? 1 : 0;
    // orientación: cuelga alineada con el cable, y gira con la cabina con un poco de retraso
    this.tmp.subVectors(punta, p).normalize(); if (this.sobra > 0.05) this.tmp.copy(ARRIBA);
    this.n.lerp(this.tmp, 1 - Math.exp(-dt * 9)).normalize();
    const meta = e.rumbo + e.giro;
    this.vRumbo += ((meta - this.rumbo) * 9 - this.vRumbo * 2.2) * dt; this.rumbo += this.vRumbo * dt;
    al.grupo.position.copy(p);
    al.grupo.quaternion.copy(this.q.setFromUnitVectors(ARRIBA, this.n)).multiply(this.qy.setFromAxisAngle(ARRIBA, this.rumbo + Math.PI / 2));
    this.operar(dt);
  }
  // Morder y soltar. Cerrar apoyada en la tierra cava; abrir con carga la deja caer como partículas.
  operar(dt) {
    const { grua, p, v } = this, al = grua.almeja, ap = grua.e.apertura, dAp = ap - this.apAnt; this.apAnt = ap;
    this.enTierra = this.contacto === 'suelo' ? 0.2 : Math.max(0, (this.enTierra || 0) - dt);   // la almeja rebota un poco al cerrar: cuenta igual
    if (dAp < 0 && this.enTierra > 0 && al.carga < ALMEJA.volumen) {
      const quiero = Math.min(ALMEJA.volumen - al.carga, ALMEJA.volumen * -dAp * 1.5);
      const saco = cavar(this.terreno, p.x, p.z, this.rumbo + Math.PI / 2, al.medioLargo, ALMEJA.ancho / 2, quiero);
      al.carga += saco; if (saco > 0) this.eventos.mordida = Math.max(this.eventos.mordida, 0.5 + ap * 0.5);
      al.verCarga();
    }
    if (dAp > 0 && al.carga > 0.001) {
      const sale = Math.min(al.carga, ALMEJA.volumen * dAp * 1.7), n = Math.max(1, Math.round(sale / 0.0026)), r = this.particulas.rnd;
      al.grupo.updateMatrixWorld();
      for (let i = 0; i < n; i++) {
        this.tmp.set((r() - 0.5) * 1.6 * al.medioLargo, -al.fondo + 0.45 + r() * 0.5, (r() - 0.5) * (ALMEJA.ancho - 0.3));
        al.grupo.localToWorld(this.tmp);
        this.particulas.soltar(this.tmp.x, this.tmp.y, this.tmp.z, v.x + (r() - 0.5) * 0.9, v.y - r() * 1.2, v.z + (r() - 0.5) * 0.9, sale / n);
      }
      al.carga -= sale; if (al.carga < 0.002) al.carga = 0; this.eventos.suelta = Math.max(this.eventos.suelta, sale);
      al.verCarga();
    }
  }
}

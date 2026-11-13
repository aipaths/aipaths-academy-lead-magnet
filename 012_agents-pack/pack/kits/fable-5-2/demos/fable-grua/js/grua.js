import * as THREE from 'three';
import { crearTren } from './orugas.js';
import { crearSuperestructura } from './cabina.js';
import { crearPluma } from './pluma.js';
import { crearAlmeja } from './almeja.js';
import { CableFlojo } from './cables.js';
import { PLUMA, VEL, OBRA } from './medidas.js';

const lim = THREE.MathUtils.clamp, hacia = (v, meta, a) => v + lim(meta - v, -a, a);

// La grúa completa. Se arma por partes; cada parte vive en su archivo.
export class Grua {
  constructor() {
    this.grupo = new THREE.Group(); this.grupo.name = 'grúa';
    this.tren = crearTren();
    this.grupo.add(this.tren.grupo);
    // Lo que el operador mueve: posición y rumbo de las orugas, giro de la cabina y ángulo de la pluma.
    this.e = { x: 0, z: 0, rumbo: 0, giro: 0, pluma: THREE.MathUtils.degToRad(55), cable: 13.2, apertura: 1,
      vGiro: 0, vPluma: 0, vCable: 0, vIzq: 0, vDer: 0, y: 0, cabeceo: 0, rolido: 0 };
    this.punta = new THREE.Vector3();   // de dónde cuelga el cable, en el mundo
  }
  async armar(matTierra) {
    this.sup = await crearSuperestructura();   // todo lo que gira: casa, cabina, contrapeso y caballete
    this.grupo.add(this.sup.grupo);
    this.pluma = crearPluma(this.sup.apice);
    this.sup.grupo.add(this.pluma.grupo, this.pluma.fijos);
    // La almeja cuelga de dos cables (el de sostén y el de cierre) y vive suelta en la escena.
    this.almeja = crearAlmeja(matTierra);
    this.cables = [-0.22, 0.22].map((z) => ({ z, t: new CableFlojo(PLUMA.cable / 2 + 0.004) }));
    this.sueltos = new THREE.Group(); this.sueltos.add(this.almeja.grupo, ...this.cables.map((c) => c.t.grupo));
    this.grupo.rotation.order = 'YZX';
    this.acomodar();
    this.colgar();
    return this;
  }
  // Lleva el estado a las piezas.
  acomodar() {
    const e = this.e;
    e.pluma = THREE.MathUtils.clamp(e.pluma, THREE.MathUtils.degToRad(PLUMA.min), THREE.MathUtils.degToRad(PLUMA.max));
    this.grupo.position.set(e.x, e.y, e.z); this.grupo.rotation.set(e.rolido, e.rumbo, e.cabeceo);
    this.sup.grupo.rotation.y = e.giro;
    this.polea = this.pluma.poner(e.pluma);
    this.grupo.updateMatrixWorld(true);
    this.sup.grupo.localToWorld(this.punta.set(this.polea.x + this.pluma.radioPolea, this.polea.y, 0));
    this.almeja.abrir(e.apertura);
  }
  // Almeja quieta, colgando a plomo de la punta (la física del balanceo llega después).
  colgar() {
    const al = this.almeja.grupo, rumbo = this.e.rumbo + this.e.giro;
    al.position.set(this.punta.x, this.punta.y - this.e.cable, this.punta.z); al.rotation.set(0, rumbo + Math.PI / 2, 0);
    this.tenderCables();
  }
  tenderCables(sobra = 0) {
    const al = this.almeja.grupo; al.updateMatrixWorld(true);
    const haciaGrua = _a.set(this.e.x - al.position.x, 0, this.e.z - al.position.z).normalize();
    for (const c of this.cables) {
      this.sup.grupo.localToWorld(_b.set(this.polea.x + this.pluma.radioPolea, this.polea.y, c.z));
      c.t.poner(_b, al.localToWorld(_c.set(c.z * 0.5, 0, 0)), sobra, haciaGrua);
    }
  }
  // Un paso de la máquina: cada movimiento acelera y frena con su inercia. m es el mando (-1..1 por eje).
  mover(m, dt, terreno) {
    const e = this.e;
    e.vGiro = hacia(e.vGiro, m.giro * MAX.giro, (m.giro ? 0.22 : 0.9) * dt);          // frena más rápido de lo que arranca
    e.vPluma = hacia(e.vPluma, m.pluma * MAX.pluma, 0.2 * dt);
    e.vCable = hacia(e.vCable, m.cable * VEL.cable, 3.5 * dt);
    e.giro += e.vGiro * dt; e.pluma += e.vPluma * dt; e.cable = lim(e.cable + e.vCable * dt, 1.8, 48);
    if (e.pluma <= rad(PLUMA.min) || e.pluma >= rad(PLUMA.max)) e.vPluma = 0;
    e.apertura = lim(e.apertura + (m.almeja * dt) / 2.4, 0, 1);
    // orugas: cada una con su velocidad; la diferencia hace doblar
    e.vIzq = hacia(e.vIzq, (m.avance - m.vira * 0.75) * MAX.oruga, 0.9 * dt);
    e.vDer = hacia(e.vDer, (m.avance + m.vira * 0.75) * MAX.oruga, 0.9 * dt);
    const v = (e.vIzq + e.vDer) / 2, ZC = this.tren.ZC;
    e.rumbo += ((e.vDer - e.vIzq) / (2 * ZC)) * dt;
    const nx = e.x + Math.cos(e.rumbo) * v * dt, nz = e.z - Math.sin(e.rumbo) * v * dt;
    if (Math.abs(nx) < 26 && nz > OBRA.camion.z + 5.2 && nz < 26) { e.x = nx; e.z = nz; } else e.vIzq = e.vDer = 0;   // no pisa el camión ni se va de la obra
    this.tren.mover(e.vIzq * dt, e.vDer * dt);
    if (terreno) this.apoyar(terreno, dt, Math.abs(e.vIzq) + Math.abs(e.vDer) > 0.01);
    this.acomodar();
  }
  // Las orugas siguen el relieve: la altura y la inclinación salen de 4 puntos del terreno, y dejan huella.
  apoyar(t, dt, andando) {
    const e = this.e, c = Math.cos(e.rumbo), s = Math.sin(e.rumbo), ZC = this.tren.ZC, h = [];
    for (const [a, l] of [[2.4, -1], [2.4, 1], [-2.4, -1], [-2.4, 1]]) {
      const x = e.x + c * a + s * l * ZC, z = e.z - s * a + c * l * ZC; h.push(t.alturaEn(x, z));
      if (andando) { const [fi, fj] = t.indice(x, z), k = Math.round(fj) * t.N + Math.round(fi); if (t.fresca[k] < 0.4) { t.fresca[k] = t.fresca[k + 1] = 0.4; t.marcar(Math.round(fi), Math.round(fj), Math.round(fi) + 1, Math.round(fj)); } }
    }
    const k = Math.min(1, dt * 3);
    e.y += ((h[0] + h[1] + h[2] + h[3]) / 4 - e.y) * k;
    e.cabeceo += (lim(Math.atan2((h[0] + h[1] - h[2] - h[3]) / 2, 4.8), -0.14, 0.14) - e.cabeceo) * k;
    e.rolido += (lim(Math.atan2((h[1] + h[3] - h[0] - h[2]) / 2, 2 * ZC), -0.14, 0.14) - e.rolido) * k;
  }
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), rad = THREE.MathUtils.degToRad;
// Velocidades de juego. Giro y cable salen de la ficha (4,6 rpm y 96 m/min); el giro va al 65 % para poder
// apuntar, y las orugas al doble de los 1,28 km/h reales para que cruzar la obra no aburra.
const MAX = { giro: VEL.giro * 0.65, pluma: rad(4.5), oruga: VEL.traslacion * 2 };

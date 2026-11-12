// Cables y almeja colgando de la cabeza de la pluma. Física de péndulo: la almeja es una masa que el
// cable sostiene (restricción de largo máximo, sin empujar). Si la punta frena de golpe, la almeja sigue.
import * as THREE from 'three';
import { CableRecto } from './cable-recto.js';
import { crearAlmeja } from './almeja.js';

export class Colgante {
  constructor(grua, terreno, escena) {
    this.grua = grua; this.terreno = terreno;
    this.almeja = crearAlmeja();
    escena.add(this.almeja.raiz);
    this.largo = 12;                                 // cable soltado desde la punta (m)
    this.pos = new THREE.Vector3();                  // origen de la almeja (arriba del cabezal)
    this.cables = [new CableRecto(0.019), new CableRecto(0.019)];
    this.guia = new CableRecto(0.011);               // cable de guía (tagline) desde el pie de la pluma
    for (const c of [...this.cables, this.guia]) escena.add(c);
    this.punta = new THREE.Vector3(); this.tmp = new THREE.Vector3(); this.tmp2 = new THREE.Vector3();
    this.grua.punta(this.punta);
    this.pos.copy(this.punta).y -= this.largo;
    this.vel = new THREE.Vector3(); this.d = new THREE.Vector3(); this.q = new THREE.Quaternion(); this.tension = 0;
  }

  // cmd: -1 recoge … +1 suelta. abrir: objetivo de la almeja (true/false). tierra: módulo de excavación.
  actualizar(dt, cmd, abrir, tierra) {
    const a = this.almeja;
    const antes = this.largo;
    this.largo = Math.min(38, Math.max(2.5, this.largo + cmd * 1.6 * 1.4 * dt));
    if (this.apoyada && cmd > 0) this.largo = Math.min(this.largo, this.punta.distanceTo(this.pos) + 0.4);   // apoyada: el cable no se sigue soltando
    this.vCable = this.apoyada && cmd > 0 ? 0 : (this.largo - antes) / Math.max(dt, 1e-4);
    const vel = abrir ? 0.75 : tierra.mordida ? 0.36 : 0.5;
    const ab = Math.max(0, Math.min(1, a.abertura + (abrir ? 1 : -1) * vel * dt));
    a.poner(ab, tierra.carga / 3.5);
    this.grua.punta(this.punta);
    const yaw = this.grua.rumbo + this.grua.angGiro;
    if (!tierra.mordida) this.integrar(dt, a);
    else this.vel.set(0, 0, 0);
    if (tierra.mordida) {
      const yMordida = tierra.mordida.ejeY + 0.25 - a.eje.position.y;
      if (cmd < 0) tierra.terminar();                              // el operador recoge: la almeja sale de la tierra
      else {                                                        // mientras muerde, el cable acompaña
        this.pos.set(tierra.mordida.cx, yMordida, tierra.mordida.cz); tierra.morder(ab);
        this.largo = this.punta.distanceTo(this.pos);
      }
    }
    if (!tierra.mordida) {
      if (this.apoyada && !abrir && ab > 0.35 && ab < 0.98) tierra.empezar(this.pos.y + a.eje.position.y, this.pos.x, this.pos.z, yaw);
    }
    this.dibujar();
  }

  // Péndulo con pasos chicos: gravedad, aire, cable inextensible (sólo tira) y suelo con rozamiento.
  integrar(dt, a) {
    const n = 4, h = dt / n, p = this.pos, v = this.vel, d = this.d;
    this.apoyada = false; this.tension = 0;
    for (let k = 0; k < n; k++) {
      v.y -= 9.81 * h;
      v.multiplyScalar(1 - 0.12 * h);                // aire + roce en poleas y cables
      p.addScaledVector(v, h);
      d.subVectors(p, this.punta); const dist = d.length();
      if (dist > this.largo) {                       // el cable está tenso: vuelve a la esfera y pierde la velocidad radial
        d.multiplyScalar(1 / dist); p.copy(this.punta).addScaledVector(d, this.largo);
        const vr = v.dot(d); if (vr > 0) { v.addScaledVector(d, -vr); this.tension += vr; }
      }
      const piso = this.pisoBajo() + a.alto;
      if (p.y <= piso) {                             // apoyada en la tierra
        p.y = piso; if (v.y < 0) v.y = 0;
        v.x *= 1 - Math.min(1, 10 * h); v.z *= 1 - Math.min(1, 10 * h);
        this.apoyada = true;
      }
    }
  }

  // Altura del suelo bajo la almeja: el punto más alto entre el centro y los labios.
  pisoBajo() {
    const yaw = this.grua.rumbo + this.grua.angGiro, c = Math.cos(yaw), s = Math.sin(yaw), t = this.terreno, p = this.pos;
    let h = t.altura(p.x, p.z);
    for (const u of [-0.9, 0.9]) h = Math.max(h, t.altura(p.x + u * c, p.z - u * s) - 0.15);
    if (this.obstaculos) for (const o of this.obstaculos) h = Math.max(h, o.alturaEn(p.x, p.z));
    return h;
  }

  dibujar() {
    const r = this.almeja.raiz, g = this.grua;
    r.position.copy(this.pos);
    r.rotation.set(0, g.rumbo + g.angGiro, 0);
    this.d.subVectors(this.punta, this.pos).normalize();
    if (!this.apoyada && this.d.y > 0.2) { this.q.setFromUnitVectors(THREE.Object3D.DEFAULT_UP, this.d); r.quaternion.premultiply(this.q); }
    r.updateMatrixWorld();
    const lado = this.tmp2.set(0, 0, 1).applyAxisAngle(THREE.Object3D.DEFAULT_UP, g.rumbo + g.angGiro);
    for (let k = 0; k < 2; k++) {
      const s = k ? 0.15 : -0.15;
      this.cables[k].entre(this.tmp.copy(this.punta).addScaledVector(lado, s), r.localToWorld(new THREE.Vector3(0, 0, s * 1.4)));
    }
    this.guia.entre(g.pivote.localToWorld(this.tmp.set(4.5, -0.75, 0)), r.localToWorld(new THREE.Vector3(-0.58, -0.3, 0)));
  }
}

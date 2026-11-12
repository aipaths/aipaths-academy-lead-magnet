// La grúa: orugas → superestructura que gira → pluma que sube y baja. Estado y cinemática.
import * as THREE from 'three';
import { GRUA } from './config.js';
import { crearOrugas } from './orugas.js';
import { crearSuperestructura } from './superestructura.js';
import { crearPluma } from './pluma.js';

export class Grua {
  constructor(terreno) {
    this.terreno = terreno;
    this.base = new THREE.Group();                // posición y rumbo de las orugas
    this.orugas = crearOrugas();
    this.base.add(this.orugas.grupo);
    this.giro = new THREE.Group();                // superestructura (gira sobre el anillo)
    this.giro.position.y = this.orugas.altura;
    this.base.add(this.giro);
    this.sup = crearSuperestructura(this.giro);
    this.pivote = new THREE.Group();              // pie de la pluma
    this.pivote.position.set(GRUA.pieX, GRUA.pieY, 0);
    this.giro.add(this.pivote);
    this.pluma = crearPluma(this.pivote, this.giro);
    // Estado
    this.x = 0; this.z = 0; this.rumbo = 0;
    this.angGiro = 0; this.angPluma = 55 * Math.PI / 180;
    this.vGiro = 0; this.vPluma = 0; this.vIzq = 0; this.vDer = 0;
    this.aplicar();
  }

  aplicar() {
    this.base.position.set(this.x, this.terreno.altura(this.x, this.z), this.z);
    this.base.rotation.y = this.rumbo;
    this.giro.rotation.y = this.angGiro;
    this.pivote.rotation.z = this.angPluma;
    this.pluma.actualizar(this.angPluma);
    this.base.updateMatrixWorld(true);
  }

  // Mueve la máquina con aceleraciones de hidráulica: arranca suave y frena en ~0,4 s.
  mover(dt, e) {
    const hacia = (v, obj, acc) => v + Math.max(-acc * dt, Math.min(acc * dt, obj - v));
    this.vGiro = hacia(this.vGiro, e.giro * GRUA.giroMax * 0.5, Math.abs(e.giro) > 0 ? 0.1 : 0.3);   // 2 rpm de crucero
    this.vPluma = hacia(this.vPluma, e.pluma * GRUA.plumaVel * 1.6, 0.12);
    this.angGiro += this.vGiro * dt;
    this.angPluma = Math.min(GRUA.plumaMax, Math.max(GRUA.plumaMin, this.angPluma + this.vPluma * dt));
    if (this.angPluma === GRUA.plumaMin || this.angPluma === GRUA.plumaMax) this.vPluma = 0;
    // Orugas: tracción diferencial (cada cadena a su velocidad).
    const v = GRUA.traslacion * 1.5, vi = (e.avance - e.viraje) * v, vd = (e.avance + e.viraje) * v;
    this.vIzq = hacia(this.vIzq, vi, 0.6); this.vDer = hacia(this.vDer, vd, 0.6);
    const av = (this.vIzq + this.vDer) / 2, w = (this.vDer - this.vIzq) / (GRUA.trocha - GRUA.zapata);
    this.rumbo += w * dt;
    const nx = this.x + Math.cos(this.rumbo) * av * dt, nz = this.z - Math.sin(this.rumbo) * av * dt;
    if (Math.hypot(nx - 6, nz + 4) < 34) { this.x = nx; this.z = nz; }
    this.orugas.mover(this.vIzq * dt, this.vDer * dt);
    this.aplicar();
    return Math.abs(this.vGiro) / GRUA.giroMax + Math.abs(this.vPluma) / GRUA.plumaVel * 0.5 + Math.abs(av) * 2;
  }

  // Ojo del operador y hacia dónde mira (para la cámara de cabina).
  ojoCabina(ojo, mira) {
    ojo.set(2.35, 1.95, -1.3).applyMatrix4(this.giro.matrixWorld);   // delante del vidrio
    if (mira) mira.set(30, -4, -1.3).applyMatrix4(this.giro.matrixWorld);
  }

  // Punto de la cabeza de la pluma de donde cuelgan los cables (mundo).
  punta(v) { return v.set(GRUA.plumaLargo + 0.35, -0.55, 0).applyMatrix4(this.pivote.matrixWorld); }
}

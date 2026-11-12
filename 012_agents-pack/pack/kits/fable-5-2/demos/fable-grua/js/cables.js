import * as THREE from 'three';
import { MAT } from './materiales.js';

const ARRIBA = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
// Un tirante o cable recto entre dos puntos que se mueven: un cilindro que se estira y se orienta.
export class Tirante {
  constructor(radio, mat = MAT.cable, seg = 6) {
    this.malla = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, 1, seg).translate(0, 0.5, 0), mat);
    this.malla.castShadow = true;
  }
  poner(a, b) {
    d.subVectors(b, a); const l = d.length() || 1e-6;
    this.malla.position.copy(a); this.malla.scale.y = l;
    this.malla.quaternion.setFromUnitVectors(ARRIBA, d.multiplyScalar(1 / l));
  }
}

const abajo = new THREE.Vector3(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
// Cable que puede quedar flojo: tenso es una recta; con cable de sobra hace panza.
export class CableFlojo {
  constructor(radio, tramos = 8) {
    this.tramos = Array.from({ length: tramos }, () => new Tirante(radio));
    this.grupo = new THREE.Group(); this.tramos.forEach((t) => this.grupo.add(t.malla));
  }
  poner(a, b, sobra, haciaDonde) {
    d.subVectors(b, a); const dist = d.length() || 1e-6, n = this.tramos.length;
    const panza = sobra > 0.002 ? Math.sqrt(0.375 * dist * sobra) : 0;     // flecha de una parábola con ese largo de más
    d.multiplyScalar(1 / dist); abajo.set(0, -1, 0).addScaledVector(d, d.y);   // la parte de la gravedad que no va a lo largo del cable
    if (abajo.lengthSq() < 0.05) abajo.copy(haciaDonde); abajo.normalize();
    p0.copy(a);
    for (let i = 1; i <= n; i++) {
      const t = i / n; p1.lerpVectors(a, b, t).addScaledVector(abajo, panza * 4 * t * (1 - t));
      this.tramos[i - 1].poner(p0, p1); p0.copy(p1);
    }
  }
}

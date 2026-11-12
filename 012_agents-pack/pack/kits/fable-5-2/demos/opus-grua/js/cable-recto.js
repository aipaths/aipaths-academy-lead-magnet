// Tramo de cable recto entre dos puntos (un cilindro escalado), que se actualiza cada cuadro.
import * as THREE from 'three';
import { MAT } from './materiales.js';

const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true).translate(0, 0.5, 0);
const Y = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();

export class CableRecto extends THREE.Mesh {
  constructor(radio = 0.017, mat = MAT.cable) {
    super(geo, mat);
    this.radio = radio; this.castShadow = true; this.frustumCulled = false;
  }
  entre(a, b) {
    d.subVectors(b, a); const largo = d.length();
    this.position.copy(a);
    if (largo > 1e-6) this.quaternion.setFromUnitVectors(Y, d.multiplyScalar(1 / largo));
    this.scale.set(this.radio, largo, this.radio);
  }
}

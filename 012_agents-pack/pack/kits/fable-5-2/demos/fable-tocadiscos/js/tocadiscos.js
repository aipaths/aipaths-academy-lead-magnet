// Arma el tocadiscos completo a partir de sus piezas. Se modela en mm y se escala a metros.
import * as THREE from 'three';
import { M } from './medidas.js';
import { crearMateriales } from './materiales.js';
import { crearChasis } from './chasis.js';
import { crearPlato } from './plato.js';
import { crearBrazo } from './brazo.js';
import { crearInterior } from './interior.js';

export function crearTocadiscos() {
  const mat = crearMateriales();
  const raiz = new THREE.Group();
  raiz.scale.setScalar(0.001);
  const chasis = crearChasis(mat);
  const plato = crearPlato(mat);
  const brazo = crearBrazo(mat);
  const interior = crearInterior(mat);
  chasis.cuerpo.add(brazo.base, brazo.pivote);
  raiz.add(chasis.patas, chasis.gabinete, interior.placa, interior.fuente, chasis.cuerpo, plato.estator, plato.giro, interior.tapa);

  // Luz roja del estroboscopio sobre los puntos del plato
  const estrobo = new THREE.PointLight(0xff2a18, 0, 0.09, 2);
  const k = M.PERILLA, p = M.PLATO;
  const d = Math.hypot(p.x - k.x, p.z - k.z);
  estrobo.position.set(k.x + ((p.x - k.x) / d) * 20, M.TOP + 9, k.z + ((p.z - k.z) / d) * 20);
  chasis.cuerpo.add(estrobo);

  // Cinemática del brazo: ángulo (rad, hacia el plato) para dejar la aguja a un radio dado
  const L = Math.hypot(brazo.punta.x, brazo.punta.z);
  const a0 = Math.atan2(-brazo.punta.x, brazo.punta.z);
  const dx = p.x - M.PIVOTE.x, dz = p.z - M.PIVOTE.z;
  const dist = Math.hypot(dx, dz), beta = Math.atan2(-dx, dz);
  const anguloPara = (radio) => beta - Math.acos((dist * dist + L * L - radio * radio) / (2 * dist * L)) - a0;

  return {
    raiz, mat, ui: chasis.ui, estrobo,
    giro: plato.giro, disco: plato.disco, pivote: brazo.pivote, tapa: interior.tapa,
    anguloPara,
  };
}

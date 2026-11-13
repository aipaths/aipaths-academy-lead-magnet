// Ensamblado de la grúa: orugas fijas al chasis y (en las etapas siguientes) estructura superior giratoria.
import * as THREE from 'three';
import { crearMateriales } from './materiales.js';
import { crearOrugas } from './orugas.js';
import { crearCabina, CAB } from './cabina.js';
import { crearAlmeja } from './almeja.js';
import { Cuerda } from './cuerda.js';
import { crearPluma, crearMastil, crearPendolones, PLUMA } from './pluma.js';
import { LAYOUT } from './config.js';

export function crearGrua(scene) {
  const mats = crearMateriales();
  const raiz = new THREE.Group(); raiz.position.set(LAYOUT.crane.x, 0, LAYOUT.crane.z);
  const orugas = crearOrugas(mats);
  raiz.add(orugas.grupo);
  const arriba = new THREE.Group(); arriba.position.y = 1.5; raiz.add(arriba);   // gira sobre la corona
  const cabina = crearCabina(mats); arriba.add(cabina.grupo);
  const mastil = crearMastil(mats); arriba.add(mastil.grupo);
  const pluma = crearPluma(mats), pivote = new THREE.Group(); pivote.position.set(CAB.pivoteX, CAB.pivoteY, 0);
  pivote.add(pluma.grupo); arriba.add(pivote);
  const pend = crearPendolones(mats); pend.mallas.forEach((m) => scene.add(m));
  const almeja = crearAlmeja(mats); scene.add(almeja.grupo);
  const cables = [0, 1].map(() => new Cuerda(14, 0.03, mats.cable)); cables.forEach((c) => scene.add(c.mesh));
  const estado = { giro: 0, pluma: 62, cable: 13, almeja: 0.7 };    // ° de giro, ° de la pluma, m de cable, 0 cerrada … 1 abierta
  const punta = new THREE.Vector3(), puntas = [new THREE.Vector3(), new THREE.Vector3()], A = new THREE.Vector3(), pts = Array.from({ length: 14 }, () => new THREE.Vector3());

  function estructura() {                                         // giro, pluma, pendolones y puntos de salida del cable
    arriba.rotation.y = THREE.MathUtils.degToRad(estado.giro);
    pivote.rotation.z = THREE.MathUtils.degToRad(estado.pluma);
    raiz.updateMatrixWorld(true);
    pend.cuerdas.forEach((c, i) => {                              // 2 cables a cada lado: punta de pluma ↔ mástil
      const z = i < 2 ? -0.3 : 0.3, de = i % 2 ? 0.2 : -0.2;
      c.poner([arriba.localToWorld(new THREE.Vector3(CAB.mastilX, CAB.mastilY + 0.1 + de, z)), pluma.grupo.localToWorld(new THREE.Vector3(PLUMA.largo + 0.15, 0.55 + de, z * 1.2))]);
    });
    pluma.puntas.forEach((p, i) => pluma.grupo.localToWorld(puntas[i].copy(p)));
    punta.addVectors(puntas[0], puntas[1]).multiplyScalar(0.5);
  }

  function colocarAlmeja(G, q) {                                  // la física decide dónde está la almeja; aquí se dibuja con sus cables
    almeja.grupo.position.copy(G); almeja.grupo.quaternion.copy(q);
    almeja.actualizar(estado.almeja, almeja.carga);
    almeja.grupo.updateMatrixWorld(true);
    const atar = almeja.grupo.userData.atar.y;
    cables.forEach((c, i) => {
      A.set(0, atar, i ? 0.3 : -0.3); almeja.grupo.localToWorld(A);
      const d = puntas[i].distanceTo(A), flojo = Math.max(0, estado.cable - d), sag = Math.min(5, Math.sqrt(0.375 * d * flojo));
      for (let k = 0; k < 14; k++) { const u = k / 13; pts[k].lerpVectors(puntas[i], A, u); pts[k].y -= sag * 4 * u * (1 - u); }
      c.poner(pts);
    });
  }
  estructura();
  scene.add(raiz);
  return { raiz, mats, orugas, arriba, cabina, pluma, almeja, estado, estructura, colocarAlmeja, punta, puntas };
}

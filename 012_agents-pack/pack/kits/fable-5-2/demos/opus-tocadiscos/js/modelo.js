// Ensambla el SL-1200MK7 completo en un grupo.
import * as THREE from 'three';
import { M, mm } from './medidas.js';
import { crearChasis } from './chasis.js';
import { crearControles } from './controles.js';
import { crearPlato } from './plato.js';
import { crearBrazo } from './brazo.js';
import { crearTapa } from './tapa.js';
import { fijarBases } from './piezas.js';

export function crearModelo(escena) {
  const raiz = new THREE.Group();
  raiz.name = 'SL-1200MK7';
  escena.add(raiz);
  crearChasis(raiz);
  const ctrl = crearControles(raiz);
  const { giran } = crearPlato(raiz);
  const brazo = crearBrazo(raiz);
  const tapa = crearTapa(raiz);
  // Iluminador estroboscópico: luz roja rasante sobre el borde del plato
  const luzRoja = new THREE.PointLight(0xff2a10, 0.03, 0.085, 2);
  luzRoja.position.set(mm(M.estrobo.x + 7), mm(M.cubierta + 9), mm(M.estrobo.z - 5));
  raiz.add(luzRoja);
  fijarBases();
  return { raiz, ctrl, giran, brazo, tapa, luzRoja };
}

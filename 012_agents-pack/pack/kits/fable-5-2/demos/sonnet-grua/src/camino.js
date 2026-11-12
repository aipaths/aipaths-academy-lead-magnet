// Camino de grava por donde pasan los volquetes y algunos objetos de obra (conos, vallas, tubos) para que no parezca un videojuego.
import * as THREE from 'three';
import { pbr } from './textures.js';
import { LAYOUT } from './config.js';
import { Fabrica, v3 } from './geo.js';

export function crearCamino(scene) {
  const t = pbr('gravel_embedded_concrete', { rep: 1 });
  for (const k of Object.values(t)) k.repeat.set(70, 1.6);
  const camino = new THREE.Mesh(new THREE.PlaneGeometry(220, 5.6), new THREE.MeshStandardMaterial({ ...t, color: new THREE.Color().setScalar(0.62) }));
  camino.rotation.x = -Math.PI / 2; camino.position.set(0, 0.025, LAYOUT.truckSpot.z); camino.receiveShadow = true; scene.add(camino);
  return camino;
}

export function crearObjetos(scene, mats) {
  const f = new Fabrica(), naranja = new THREE.MeshStandardMaterial({ color: 0xff6a13, roughness: 0.6 });
  const blanco = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 });
  const cono = (x, z) => { f.cilindro(naranja, 0.11, 0.7, x, 0.37, z, 'y', 14, 0.045); f.cilindro(naranja, 0.28, 0.04, x, 0.02, z, 'y', 4); f.cilindro(blanco, 0.095, 0.1, x, 0.38, z, 'y', 14, 0.07); };
  for (let i = 0; i < 9; i++) cono(-14 + i * 1.7, 8.2);
  for (let i = 0; i < 6; i++) cono(7.5 + i * 1.7, 14.9);
  const ferro = new THREE.MeshStandardMaterial({ color: 0x59595c, roughness: 0.5, metalness: 0.8 });
  for (let i = 0; i < 4; i++) f.cilindro(ferro, 0.3, 4.6, -18, 0.3 + (i > 1 ? 0.55 : 0), 17 + (i % 2) * 0.62, 'x', 18);           // tubos apilados
  for (let k = 0; k < 6; k++) f.barra(ferro, v3(-6 + k * 2.6, 0, 20), v3(-6 + k * 2.6, 1.4, 20), 0.03);                          // postes de valla
  f.barra(ferro, v3(-6, 1.3, 20), v3(-6 + 5 * 2.6, 1.3, 20), 0.025); f.barra(ferro, v3(-6, 0.5, 20), v3(-6 + 5 * 2.6, 0.5, 20), 0.025);
  const g = f.crear(); scene.add(g); return g;
}

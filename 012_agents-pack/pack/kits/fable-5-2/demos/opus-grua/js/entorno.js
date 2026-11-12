// Lo que rodea a la obra: suelo lejano hasta el horizonte.
import * as THREE from 'three';
import { pbr } from './texturas.js';
import { TERRENO } from './config.js';

export function crearEntorno(escena) {
  const g = new THREE.RingGeometry(TERRENO.tam * 0.47, 620, 96, 3);
  g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv, pos = g.attributes.position;
  for (let v = 0; v < pos.count; v++) uv.setXY(v, pos.getX(v) / 5, pos.getZ(v) / 5);
  const lejos = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ ...pbr('dry_ground_01'), roughness: 1, color: new THREE.Color(0.86, 0.78, 0.66).multiplyScalar(0.94) }));
  lejos.position.set(TERRENO.centroX, -0.14, TERRENO.centroZ);
  lejos.receiveShadow = true;
  escena.add(lejos);
  return { lejos };
}

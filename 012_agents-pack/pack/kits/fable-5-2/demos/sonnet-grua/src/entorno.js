// Cielo (HDRI de Poly Haven, CC0), luz del sol con sombras, niebla y el plano de tierra exterior.
import * as THREE from 'three';
import { HDRLoader } from '../vendor/loaders/HDRLoader.js';
import { crearHorizonte } from './horizonte.js';

export function crearEntorno(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdr = new HDRLoader().load('./assets/sky_1k.hdr', (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = tex; scene.environment = pmrem.fromEquirectangular(tex).texture;
    scene.backgroundIntensity = 0.95; scene.environmentIntensity = 0.75;
  });
  scene.fog = new THREE.Fog(0xb7c5d3, 120, 1500);

  const sol = new THREE.DirectionalLight(0xfff0dc, 3.1);
  sol.position.set(-26, 38, 20); sol.target.position.set(4, 0, 2);
  sol.castShadow = true; sol.shadow.mapSize.set(4096, 4096);
  const c = sol.shadow.camera; c.left = -34; c.right = 34; c.top = 30; c.bottom = -30; c.near = 10; c.far = 120;
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.04;
  scene.add(sol, sol.target);

  crearHorizonte(scene);
  return { sol, hdr };
}

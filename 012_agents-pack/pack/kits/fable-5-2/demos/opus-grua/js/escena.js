// Renderer, cielo HDR, sol con sombras y niebla.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/RGBELoader.js';
import { URLP } from './config.js';

const q = new URLSearchParams(location.search);
export function crearEscena(canvas) {
  // En pantallas ×2 (4K) el MSAA casi no se nota y costaba fps: sólo se usa con densidad menor.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 1.75 || q.has('aa') || URLP.timelapse, powerPreference: 'high-performance', preserveDrawingBuffer: URLP.timelapse });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const escena = new THREE.Scene();
  escena.fog = new THREE.Fog(0xc9cdcf, 160, 900);

  const camara = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.3, 600);

  // Sol de media tarde, bajo y lateral: marca bien la celosía y el relieve de la tierra.
  const sol = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sol.position.set(-40, 55, 30);
  sol.target.position.set(4, 0, -4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096);
  const s = sol.shadow.camera; s.left = -42; s.right = 42; s.top = 42; s.bottom = -42; s.near = 10; s.far = 160;
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;
  escena.add(sol, sol.target);
  escena.add(new THREE.HemisphereLight(0xcfdcea, 0x6b5a45, 0.35));

  const listo = new Promise((ok) => {
    new RGBELoader().load('assets/kloofendal_48d_partly_cloudy_puresky_1k.hdr', (hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      escena.environment = hdr;
      escena.background = hdr;
      escena.backgroundIntensity = 0.85;
      escena.environmentIntensity = 0.55;
      escena.backgroundRotation.y = escena.environmentRotation.y = 1.2;
      ok();
    });
  });

  addEventListener('resize', () => {
    camara.aspect = innerWidth / innerHeight; camara.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });
  return { renderer, escena, camara, sol, listo };
}

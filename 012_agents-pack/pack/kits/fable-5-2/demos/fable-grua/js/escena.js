import * as THREE from 'three';
import { RGBELoader } from '../vendor/RGBELoader.js';
import { SOL, GIRO_CIELO, CAMARA_TIMELAPSE } from './medidas.js';

export const PARAMS = new URLSearchParams(location.search);
export const TIMELAPSE = PARAMS.has('timelapse');

const cargador = new THREE.TextureLoader();
export function textura(ruta, { srgb = false, repetir = true, aniso = 4 } = {}) {
  return new Promise((ok, mal) => cargador.load(ruta, (t) => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso; ok(t);
  }, undefined, () => mal(new Error(`no cargó ${ruta}`))));
}

export function direccionSol() {
  const az = THREE.MathUtils.degToRad(SOL.azimut), al = THREE.MathUtils.degToRad(SOL.altura);
  return new THREE.Vector3(Math.cos(al) * Math.cos(az), Math.sin(al), Math.cos(al) * Math.sin(az));
}

export async function crearEscena(lienzo) {
  const render = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: TIMELAPSE });
  render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  render.setSize(window.innerWidth, window.innerHeight, false);
  render.toneMapping = THREE.ACESFilmicToneMapping;
  render.toneMappingExposure = 0.82;
  render.shadowMap.enabled = true;
  render.shadowMap.type = THREE.PCFShadowMap;

  const escena = new THREE.Scene();
  const [fondo, hdr] = await Promise.all([
    textura('assets/cielo_fondo.jpg', { srgb: true, repetir: false }),
    new RGBELoader().loadAsync('assets/cielo_1k.hdr'),
  ]);
  fondo.mapping = hdr.mapping = THREE.EquirectangularReflectionMapping;
  escena.background = fondo;
  escena.backgroundIntensity = 1.15;
  escena.environment = hdr;
  const giro = -THREE.MathUtils.degToRad(GIRO_CIELO);   // three gira el cielo al revés que los objetos
  escena.backgroundRotation.y = giro; escena.environmentRotation.y = giro;
  escena.environmentIntensity = 0.7;
  escena.fog = new THREE.Fog(0x8b765f, 90, 520);

  // El sol: la misma dirección que tiene en el cielo HDRI, así las sombras coinciden con el fondo.
  const sol = new THREE.DirectionalLight(0xfff0dc, 5.2);
  const dir = direccionSol();
  sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096);
  const c = sol.shadow.camera;
  c.left = -34; c.right = 34; c.top = 34; c.bottom = -34; c.near = 10; c.far = 220; c.updateProjectionMatrix();
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.05;
  escena.add(sol, sol.target);
  const seguirSol = (x, z) => {
    sol.target.position.set(x, 4, z);
    sol.position.copy(sol.target.position).addScaledVector(dir, 110);
  };
  seguirSol(4, 0);

  const camara = new THREE.PerspectiveCamera(CAMARA_TIMELAPSE.fov, window.innerWidth / window.innerHeight, 0.3, 2500);
  camara.position.set(...CAMARA_TIMELAPSE.pos);
  camara.lookAt(...CAMARA_TIMELAPSE.mira);

  window.addEventListener('resize', () => {
    render.setSize(window.innerWidth, window.innerHeight, false);
    camara.aspect = window.innerWidth / window.innerHeight; camara.updateProjectionMatrix();
  });
  return { render, escena, camara, sol, seguirSol };
}

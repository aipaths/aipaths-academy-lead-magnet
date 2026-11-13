// Escena: renderer, iluminación de estudio (HDRI + luz principal con sombras), escritorio de madera y cámara.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/RGBELoader.js';
import { OrbitControls } from 'three/addons/OrbitControls.js';

const qs = new URLSearchParams(location.search);

export async function initScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: qs.has('q') });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120e0b);
  scene.fog = new THREE.FogExp2(0x120e0b, 0.0014);

  const camera = new THREE.PerspectiveCamera(30, 1, 5, 900);
  camera.position.set(14, 58, 74);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.07, minDistance: 18, maxDistance: 260, maxPolarAngle: 1.5, rotateSpeed: 0.8 });
  controls.target.set(4.8, 8, 0);

  const pm = new THREE.PMREMGenerator(renderer);
  const hdr = await new RGBELoader().loadAsync('assets/brown_photostudio_02_2k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pm.fromEquirectangular(hdr).texture; scene.environmentIntensity = 1.15;
  hdr.dispose(); pm.dispose();

  addLights(scene);
  const wood = await addDesk(scene, renderer);
  const quality = makeQuality(renderer);
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
  };
  addEventListener('resize', resize); resize();
  return { renderer, scene, camera, controls, wood, quality, resize };
}

function addLights(scene) {
  // luz principal tipo lámpara de escritorio: cono suave con sombras
  const key = new THREE.SpotLight(0xffddb8, 52000, 0, 0.62, 0.95, 2);
  key.position.set(-42, 118, 52); key.target.position.set(6, 6, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.05; key.shadow.radius = 4;
  key.shadow.camera.near = 40; key.shadow.camera.far = 320;
  const fill = new THREE.DirectionalLight(0xbcd0ff, 0.5); fill.position.set(70, 50, 80);
  const rim = new THREE.DirectionalLight(0xffd7a8, 0.7); rim.position.set(30, 40, -90);
  const hemi = new THREE.HemisphereLight(0xfff0dd, 0x3a2a1c, 0.32);
  scene.add(key, key.target, fill, rim, hemi);
}

async function addDesk(scene, renderer) {
  const loader = new THREE.TextureLoader();
  const load = (f, srgb) => loader.loadAsync('assets/' + f).then((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.6, 1.7); t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  const [map, normalMap, roughnessMap] = await Promise.all([load('wood_diff_2k.jpg', true), load('wood_nor_2k.jpg'), load('wood_rough_2k.jpg')]);
  const wood = new THREE.MeshStandardMaterial({ map, normalMap, roughness: 0.66, color: 0x8f9890, envMapIntensity: 0.3, normalScale: new THREE.Vector2(0.9, 0.9) });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(260, 5, 160), wood);
  desk.position.set(0, -2.5, 4); desk.receiveShadow = true; scene.add(desk);
  return wood;
}

/** Calidad adaptativa: baja la resolución interna si los cuadros bajan de 50; `?q=N` la fija. */
function makeQuality(renderer) {
  const fixed = qs.has('q') ? parseFloat(qs.get('q')) : null;
  const max = Math.min(devicePixelRatio, 2);
  const s = { ratio: fixed ?? Math.min(max, 1.5), fixed: fixed !== null, frames: 0, t0: performance.now(), fps: 0, max };
  renderer.setPixelRatio(s.ratio);
  s.tick = () => {
    s.frames++;
    const now = performance.now();
    if (now - s.t0 < 1000) return;
    s.fps = Math.round((s.frames * 1000) / (now - s.t0)); s.frames = 0; s.t0 = now;
    if (s.fixed) return;
    const next = s.fps < 48 ? s.ratio - 0.125 : (s.fps > 58 && s.ratio < s.max ? s.ratio + 0.125 : s.ratio);
    const r = Math.min(s.max, Math.max(0.75, next));
    if (r !== s.ratio) { s.ratio = r; renderer.setPixelRatio(r); }
  };
  s.set = (r) => { s.fixed = true; s.ratio = r; renderer.setPixelRatio(r); };
  return s;
}

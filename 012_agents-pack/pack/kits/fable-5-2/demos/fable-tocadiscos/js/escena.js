// Renderer, cámara, luz y el escritorio de roble (texturas y HDRI de Poly Haven, CC0).
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RGBELoader } from '../vendor/RGBELoader.js';
import { lienzo, textura, azar } from './texturas.js';

export function crearEscena(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1714);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
  camera.position.set(0.02, 0.62, 0.86);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.06, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.28;
  controls.maxDistance = 2.4;
  controls.maxPolarAngle = Math.PI * 0.487; // nunca por debajo del escritorio
  controls.enablePan = false;

  // Luz principal de ventana (da las sombras) + relleno cálido
  const sol = new THREE.DirectionalLight(0xfff0dc, 2.6);
  sol.position.set(-0.9, 1.5, 0.55);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  const c = sol.shadow.camera;
  c.left = -0.55; c.right = 0.55; c.top = 0.55; c.bottom = -0.55; c.near = 0.5; c.far = 3.2;
  sol.shadow.bias = -0.0002;
  sol.shadow.normalBias = 0.0012;
  sol.shadow.radius = 5;
  scene.add(sol);
  const relleno = new THREE.DirectionalLight(0xbfd4ff, 0.5);
  relleno.position.set(1.2, 0.7, -0.8);
  scene.add(relleno);

  return { renderer, scene, camera, controls, sol };
}

export async function cargarAmbiente({ renderer, scene }) {
  const hdr = await new RGBELoader().loadAsync('assets/photo_studio_loft_hall_1k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  scene.environmentIntensity = 0.85;
  scene.background = hdr;
  scene.backgroundBlurriness = 0.3;
  scene.backgroundIntensity = 0.62;
  pmrem.dispose();
}

function cargarMadera(renderer) {
  const tl = new THREE.TextureLoader();
  const cargar = (n, srgb) => {
    const t = tl.load(`assets/oak_veneer_01_${n}_2k.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 0.8);        // la veta corre a lo largo del escritorio
    t.rotation = Math.PI / 2;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return new THREE.MeshStandardMaterial({
    map: cargar('diff', true), normalMap: cargar('nor_gl'), roughnessMap: cargar('rough'),
    roughness: 0.9, normalScale: new THREE.Vector2(0.6, 0.6), color: 0xd9c4a8,
  });
}

// Funda de disco apoyada al lado: arte generado por código.
function funda() {
  const [c, g] = lienzo(1024, 1024);
  const r = azar(5);
  g.fillStyle = '#16222e';
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.arc(512, 620, 80 + i * 46, Math.PI, 0);
    g.strokeStyle = ['#e9a13b', '#c9571f', '#f2e3c6'][i % 3];
    g.globalAlpha = 0.9 - i * 0.07;
    g.lineWidth = 16 + r() * 8;
    g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#f2e3c6';
  g.font = '700 74px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('MÚSICA GENERADA', 70, 790);
  g.fillText('POR CÓDIGO', 70, 872);
  g.font = '500 34px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('AIPATHS RECORDS · LADO A', 72, 940);
  const cara = new THREE.MeshStandardMaterial({ map: textura(c), roughness: 0.55 });
  const canto = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.8 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.315, 0.004, 0.315), [canto, canto, cara, canto, canto, canto]);
  m.position.set(-0.47, 0.0021, 0.05);
  m.rotation.y = 0.22;
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Sombra de contacto: el HDRI ilumina parejo y sin esto el equipo parece flotar.
function sombraDeContacto() {
  const [c, g] = lienzo(256, 256);
  const grad = g.createRadialGradient(128, 128, 30, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.78)');
  grad.addColorStop(0.62, 'rgba(0,0,0,0.5)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.52),
    new THREE.MeshBasicMaterial({ map: textura(c), transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.0006;
  return m;
}

export function crearEscritorio({ renderer, scene }) {
  const madera = cargarMadera(renderer);
  const tabla = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.036, 0.85), madera);
  tabla.position.y = -0.018;
  tabla.receiveShadow = true;
  scene.add(tabla, funda(), sombraDeContacto());
}

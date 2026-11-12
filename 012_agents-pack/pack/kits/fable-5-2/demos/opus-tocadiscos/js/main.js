// Arranque: renderer, cámara, modelo, UI y bucle. Parámetros: ?fps=1, ?vista=cenital, ?desarmar=1, ?tapa=1.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { crearEscena } from './escena.js';
import { crearModelo } from './modelo.js';
import { aplicarDesarme, piezas } from './piezas.js';
import { poseTapa } from './tapa.js';
import { Audio } from './audio.js';
import { Reproduccion } from './reproduccion.js';
import { crearInteraccion } from './interaccion.js';
import { crearUI } from './ui.js';
import { crearMedidor } from './medidor.js';

const q = new URLSearchParams(location.search);
const lienzo = document.getElementById('lienzo');
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.02, 20);
const controles = new OrbitControls(camara, lienzo);
Object.assign(controles, {
  enableDamping: true,
  dampingFactor: 0.08,
  minDistance: 0.32,
  maxDistance: 1.9,
  maxPolarAngle: 1.48,
  screenSpacePanning: true,
});

export const VISTAS = {
  frente: { pos: [0.16, 0.5, 0.86], obj: [0, 0.085, 0.01] },
  cenital: { pos: [0, 1.25, 0.0005], obj: [0, 0.09, 0] },
  desarmado: { pos: [0.7, 0.86, 1.3], obj: [0, 0.3, 0] },
};
// ?vista=comparar: cenital casi ortográfica (lente larga desde lejos) para comparar con la foto oficial
if (q.get('vista') === 'comparar') {
  VISTAS.comparar = { pos: [0, 3.6, 0.0005], obj: [0, 0.08, 0] };
  camara.fov = 9;
  camara.far = 30;
  camara.updateProjectionMatrix();
  controles.maxDistance = 4;
  document.body.classList.add('limpio');
}
const vista = VISTAS[q.get('vista')] ?? VISTAS.frente;
camara.position.set(...vista.pos);
controles.target.set(...vista.obj);

const { sol } = await crearEscena(escena, renderer);
const modelo = crearModelo(escena);
const audio = new Audio();
const repro = new Reproduccion({ brazo: modelo.brazo, giran: modelo.giran, audio, ctrl: modelo.ctrl, luzRoja: modelo.luzRoja });

const estado = {
  desarme: q.get('desarmar') ? 1 : 0,
  desarmeObj: q.get('desarmar') ? 1 : 0,
  tapa: q.get('tapa') ? 1 : 0,
  tapaObj: q.get('tapa') ? 1 : 0,
  cam: null,
};
const ui = crearUI({ repro, estado, camara, controles, VISTAS });
const hover = crearInteraccion({ lienzo, camara, alClic: (a) => a === 'play' && ui.alternarPlay() });
const medidor = crearMedidor({ renderer, mostrar: q.get('fps') === '1' });

addEventListener('resize', () => {
  camara.aspect = innerWidth / innerHeight;
  camara.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

const reloj = new THREE.Clock();
let sombraPend = 3;
renderer.setAnimationLoop(() => {
  const dt = Math.min(reloj.getDelta(), 0.05);
  let mueve = repro.actualizar(dt);
  for (const k of ['desarme', 'tapa']) {
    const obj = estado[k + 'Obj'];
    if (estado[k] !== obj) {
      estado[k] += Math.sign(obj - estado[k]) * Math.min(Math.abs(obj - estado[k]), dt / (k === 'desarme' ? 1.8 : 1.3));
      mueve = true;
    }
  }
  aplicarDesarme(estado.desarme);
  poseTapa(modelo.tapa, estado.tapa, estado.desarme);
  ui.actualizarCamara(dt);
  controles.update();
  hover();
  if (mueve) sombraPend = 2;
  if (sombraPend > 0) {
    renderer.shadowMap.needsUpdate = true;
    sombraPend--;
  }
  renderer.render(escena, camara);
  medidor.cuadro();
});

document.getElementById('cargando').classList.add('fuera');
window.tocadiscos = { repro, estado, renderer, camara, controles, medidor, sol, piezas };
window.__lista = true;

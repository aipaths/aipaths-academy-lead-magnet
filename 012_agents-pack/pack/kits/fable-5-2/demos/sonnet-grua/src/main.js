import * as THREE from 'three';
import { TIMELAPSE, SHOW_FPS } from './config.js';
import { crearEntorno } from './entorno.js';
import { crearCamara } from './camara.js';
import { Terrain } from './terrain.js';
import { pbr } from './textures.js';
import { crearSimulacion } from './simulacion.js';
import { escenaTimelapse } from './estados.js';
import { crearCamino, crearObjetos } from './camino.js';
import { crearControles } from './controles.js';
import { crearHud } from './hud.js';
import { crearAutopiloto } from './autopiloto.js';
import { ESTADO } from './config.js';
import { Sonido } from './sonido.js';

if (TIMELAPSE) document.body.classList.add('timelapse');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const ajustarPolvo = () => sim?.polvo.ajustar(innerHeight * renderer.getPixelRatio(), cam.fov);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); ajustarPolvo(); });

const scene = new THREE.Scene();
crearEntorno(scene, renderer);
const camara = crearCamara(renderer.domElement), { cam } = camara;

const terreno = new Terrain();
Object.assign(terreno.mesh.material, pbr('brown_mud_dry', { rep: 1 }));
terreno.mesh.material.needsUpdate = true;
scene.add(terreno.mesh);
crearCamino(scene); crearObjetos(scene);
if (TIMELAPSE) escenaTimelapse(terreno);

const sim = crearSimulacion(scene, terreno), controles = crearControles(), hud = TIMELAPSE ? null : crearHud(sim);

ajustarPolvo();
const piloto = crearAutopiloto(sim); let autoOn = new URLSearchParams(location.search).get('auto') === '1';
addEventListener('keydown', (e) => { if (e.code === 'KeyP') autoOn = !autoOn; });
const sonido = new Sonido(sim); let silencio = false;
if (!TIMELAPSE) for (const ev of ['keydown', 'pointerdown']) addEventListener(ev, () => sonido.iniciar());
addEventListener('keydown', (e) => { if (e.code === 'KeyM') { silencio = !silencio; if (sonido.out) sonido.out.gain.value = silencio ? 0 : 0.9; } });
if (new URLSearchParams(location.search).get('sonido') === '1') sonido.iniciar();
window.__sonido = sonido; window.__piloto = piloto; window.__auto = (v) => { autoOn = v; };

// Estados deterministas del timelapse: se simulan a paso fijo antes de mostrar nada y luego se congela.
let congelado = false;
const Z = { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vuelta: 0 };
function simular(segundos, ctrlFn, hasta) { for (let i = 0, n = Math.round(segundos * 60); i < n; i++) { sim.paso(1 / 60, ctrlFn(i / 60)); if (hasta?.()) break; } }
if (TIMELAPSE && ESTADO === 'balanceo') { simular(2.1, () => ({ ...Z, giro: 1 })); simular(0.9, () => Z); congelado = true; }
if (TIMELAPSE && ESTADO === 'palada') {
  simular(150, (t) => piloto.paso(1 / 60), () => piloto.fase === 'subir' && sim.fisica.G.y - terreno.alturaEn(sim.fisica.G.x, sim.fisica.G.z) > 4.2);
  congelado = true;
}

if (TIMELAPSE && ESTADO === 'obra') { simular(170, () => piloto.paso(1 / 60)); congelado = true; }      // la obra después de ~3 min de trabajo
if (TIMELAPSE && ESTADO === 'descarga') {           // a mitad de una descarga: la tierra cae en partículas hacia la caja
  simular(200, () => piloto.paso(1 / 60), () => piloto.fase === 'descargar' && sim.excavacion.carga > 0.4 && sim.excavacion.carga < 1.0);
  congelado = true;
}

// ── Bucle ──
let lento = 0;
function adaptar(f, t) {                      // si anda por debajo de 45 fps durante 3 s, baja la resolución interna de a poco
  lento = f < 45 ? lento + t : 0;
  if (lento > 3 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() - 0.25)); renderer.setSize(innerWidth, innerHeight); ajustarPolvo(); lento = 0; }
}
let tPrev = performance.now(), cuadros = 0, acum = 0, fps = 0;
const elFps = document.getElementById('fps');
function cuadro() {
  const ahora = performance.now(), dt = Math.min((ahora - tPrev) / 1000, 0.05); tPrev = ahora;
  if (!congelado) { const c = autoOn ? piloto.paso(dt) : TIMELAPSE ? Z : controles.leer(); sim.paso(dt, c); sonido.actualizar(dt, c); }
  hud?.(); camara.actualizar(sim, dt);
  renderer.render(scene, cam);
  acum += dt; cuadros++;
  if (acum >= 0.5) { adaptar(cuadros / acum, acum); fps = cuadros / acum; cuadros = 0; acum = 0; window.__fps = fps; if (SHOW_FPS) elFps.textContent = `${fps.toFixed(0)} fps`; }
  if (++window.__cuadros === 8) window.__lista = true;
  requestAnimationFrame(cuadro);
}
window.__cuadros = 0; Object.assign(window, { __terreno: terreno, __sim: sim, __grua: sim.grua, __exc: sim.excavacion, __part: sim.particulas, __camion: sim.camiones, __ctrl: controles.ejes });
requestAnimationFrame(cuadro);

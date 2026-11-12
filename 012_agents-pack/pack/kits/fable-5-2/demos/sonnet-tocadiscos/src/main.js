// Punto de entrada: arma la escena, conecta la interfaz y corre el bucle de dibujo.
import * as THREE from 'three';
import { initScene } from './scene.js';
import { makeMaterials } from './materials.js';
import { buildChassis } from './chassis.js';
import { buildControls } from './controls.js';
import { buildPlatter } from './platter.js';
import { buildArm } from './arm.js';
import { buildLid, lidAnimator } from './lid.js';
import { Phono } from './audio.js';
import { Player } from './player.js';
import { parts } from './parts.js';
import { setupHover, makeExplode, focusPart, updateFocus } from './interaction.js';
import { D } from './dims.js';

const $ = (s) => document.querySelector(s);
const qs = new URLSearchParams(location.search);
const { renderer, scene, camera, controls, wood, quality } = await initScene($('#app'));

const m = makeMaterials(wood);
const root = new THREE.Group(); scene.add(root);
buildChassis(m, root);
const ctl = buildControls(m, root);
const deck = buildPlatter(m, root);
const arm = buildArm(m, root);
const lidPart = buildLid(m, root);
const lid = lidAnimator(lidPart);
const phono = new Phono(), player = new Player(deck, arm, ctl, phono);
const expl = makeExplode(camera, controls), fstate = {};
player.refreshLeds();

// --- vistas de cámara ---
const VIEWS = { front: [[6, 25, 64], [4.8, 9, 0]], top: [[4.8, 92, 0.6], [4.8, 10, 0.2]], hero: [[16, 58, 72], [4.8, 8, 0]] };
function view(name) {
  const [p, t] = VIEWS[name]; fstate.focus = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), t1: new THREE.Vector3(...t), p1: new THREE.Vector3(...p) };
}
const setView = (name) => { const [p, t] = VIEWS[name]; camera.position.set(...p); controls.target.set(...t); controls.update(); };
setView('hero');

// --- botones ---
const setPlay = () => { $('#play').innerHTML = player.on ? '■ Parar <kbd>espacio</kbd>' : '▶ Reproducir <kbd>espacio</kbd>'; };
function togglePlay() {
  if (expl.target) return;
  if (player.on && player.mode !== 'idle') player.stop(); else player.play();
  setPlay();
}
function toggleExplode() {
  if (player.on) player.stop();
  expl.toggle(); $('#explode').textContent = expl.target ? 'Armar' : 'Desarmar';
  $('#explode').insertAdjacentHTML('beforeend', ' <kbd>E</kbd>');
}
function setRpm(r) { player.setRpm(r); $('#k33').classList.toggle('on', r < 40); $('#k45').classList.toggle('on', r > 40); }
function toggleLid() { lid.toggle(); $('#lid').innerHTML = (lid.isOpen ? 'Cerrar tapa' : 'Abrir tapa') + ' <kbd>T</kbd>'; }
let range16 = false;
const setPitchPos = (z) => {
  const f = ctl.fader, d = f.userData.drag, zz = THREE.MathUtils.clamp(z, d.z0, d.z1);
  f.userData.part.base.z = zz; f.position.z = zz;
  const p = ((d.mid - zz) / (d.mid - d.z0)) * (range16 ? 0.16 : 0.08);
  player.setPitch(1 + p); $('#pitch').textContent = `pitch ${(p * 100 >= 0 ? '+' : '') + (p * 100).toFixed(1).replace('.', ',')} %`;
};
$('#play').onclick = togglePlay; $('#explode').onclick = toggleExplode; $('#lid').onclick = toggleLid;
$('#k33').onclick = () => setRpm(33.333); $('#k45').onclick = () => setRpm(45);
$('#vfront').onclick = () => view('front'); $('#vtop').onclick = () => view('top');
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); } else if (e.key === 'e') toggleExplode(); else if (e.key === 't') toggleLid();
  else if (e.key === '1') setRpm(33.333); else if (e.key === '2') setRpm(45);
});

// --- hover, clics y arrastre del fader ---
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(D.deckTop + 0.6)), hit = new THREE.Vector3(), rc = new THREE.Raycaster();
const hover = setupHover({
  camera, renderer, root, tip: $('#tip'), glass: m.glass,
  onPick(p) {
    if (!p || expl.target) return;
    if (p === ctl.start || p === ctl.knob) togglePlay();
    else if (p === ctl.k33) setRpm(33.333); else if (p === ctl.k45) setRpm(45);
    else if (p === lidPart) toggleLid();
    else if (p.userData.part.name.startsWith('Botón RESET')) { setPitchPos(7.8); }
    else if (p.userData.part.name.startsWith('Botón ×2')) { range16 = !range16; setPitchPos(ctl.fader.position.z); }
  },
  onDrag(down, e, _pick, phase) {
    if (phase === 'start') { if (down.part !== ctl.fader || expl.target) return false; controls.enabled = false; return true; }
    if (phase === 'end') { controls.enabled = true; return true; }
    const r = renderer.domElement.getBoundingClientRect();
    rc.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    if (rc.ray.intersectPlane(plane, hit)) setPitchPos(hit.z);
    return true;
  },
});

// --- lista de piezas ---
const ul = $('#list ul');
for (const o of parts) {
  const li = document.createElement('li'); li.textContent = o.userData.part.name;
  li.onmouseenter = () => hover.set(o); li.onmouseleave = () => hover.set(null);
  li.onclick = () => focusPart(camera, controls, o, fstate);
  ul.appendChild(li);
}

// --- bucle ---
let last = performance.now(), frames = 0;
const hud = $('#hud'); hud.hidden = !qs.has('fps');
if (qs.get('ui') === '0') document.body.classList.add('clean');
renderer.setAnimationLoop((now) => {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  player.update(dt); lid.update(dt); expl.update(dt);
  updateFocus(camera, controls, fstate, dt); controls.update();
  renderer.render(scene, camera);
  quality.tick();
  if (!(++frames % 20)) {
    $('#now').textContent = player.now;
    if (!player.on) setPlay();
    hud.textContent = `fps ${quality.fps} · ${quality.ratio.toFixed(2)}x · ${renderer.info.render.calls} dibujos · ${(renderer.info.render.triangles / 1000).toFixed(0)}k tri`;
  }
  if (frames === 6) { $('#load').style.opacity = 0; setTimeout(() => $('#load').remove(), 700); window.__lista = true; }
});

// API para pruebas y capturas
window.__tt = { player, phono, expl, lid, view: setView, flyTo: view, setPitchPos, toggleLid, quality, camera, controls, parts, scene, renderer, ctl, arm, deck };

// Arranque, interfaz y bucle de animación con calidad adaptativa.
import * as THREE from 'three';
import { crearEscena, cargarAmbiente, crearEscritorio } from './escena.js';
import { cargarLogo } from './texturas.js';
import { crearTocadiscos } from './tocadiscos.js';
import { crearDespiece } from './despiece.js';
import { crearHover } from './hover.js';
import { crearAudio } from './audio.js';
import { crearReproductor } from './reproductor.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
if (params.get('ui') === '0') document.body.classList.add('limpio');

const E = crearEscena($('escena'));
await cargarLogo('assets/technics-logo.svg');
const toca = crearTocadiscos();
E.scene.add(toca.raiz);
crearEscritorio(E);
await cargarAmbiente(E);

const audio = crearAudio();
const TEXTOS = { reposo: 'Detenido', subir: 'Levantando el brazo…', ir: 'Llevando el brazo al disco…', bajar: 'Bajando la aguja…', volver: 'Volviendo al apoyo…', apoyar: 'Apoyando el brazo…' };
function refrescar(e) {
  const rep = reproductor;
  $('play').textContent = rep && rep.reproduciendo ? '■ Parar' : '▶ Reproducir';
  const rpm = e.rpmObjetivo < 40 ? '33⅓' : '45';
  const sonando = e.fase === 'sonando';
  $('estado').textContent = sonando ? (e.motor ? `Sonando · ${rpm} rpm` : 'Motor frenado · aguja en el disco') : TEXTOS[e.fase] || '';
  $('estado').classList.toggle('sonando', sonando && e.motor);
  $('v33').classList.toggle('activo', e.rpmObjetivo < 40);
  $('v45').classList.toggle('activo', e.rpmObjetivo > 40);
}
let reproductor = null;
reproductor = crearReproductor(toca, audio, refrescar);
const despiece = crearDespiece(toca, E);
crearHover(E, toca, $('cartel'));

// --- Interfaz ---
let playPendiente = false, quitarDisco = false;
function play() {
  audio.iniciar();
  if (reproductor.reproduciendo) return reproductor.stop();
  if (despiece.estado.objetivo > 0) { desarmar(0); playPendiente = true; return; }
  quitarDisco = false;
  $('disco').textContent = 'Quitar disco';
  reproductor.play();
}
function desarmar(v) {
  if (v > 0 && reproductor.estado.fase !== 'reposo') reproductor.stop();
  despiece.fijar(v);
  $('desarmar').textContent = v > 0.5 ? 'Armar' : 'Desarmar';
}
$('play').onclick = play;
$('v33').onclick = () => { audio.iniciar(); reproductor.velocidad(100 / 3); };
$('v45').onclick = () => { audio.iniciar(); reproductor.velocidad(45); };
$('desarmar').onclick = () => desarmar(despiece.estado.objetivo > 0.5 ? 0 : 1);
$('despiece').oninput = (ev) => { desarmar(+ev.target.value); despiece.estado.t = despiece.estado.objetivo; despiece.sincronizar(); };
$('tapa').onclick = () => { $('tapa').textContent = despiece.alternarTapa() ? 'Cerrar tapa' : 'Abrir tapa'; };
$('disco').onclick = () => {
  if (!toca.disco.visible) { toca.disco.visible = true; $('disco').textContent = 'Quitar disco'; return; }
  if (reproductor.estado.fase !== 'reposo') { reproductor.stop(); quitarDisco = true; } else toca.disco.visible = false;
  $('disco').textContent = 'Poner disco';
};
$('volumen').oninput = (ev) => audio.volumen(+ev.target.value);
E.renderer.domElement.addEventListener('pointerdown', () => audio.iniciar(), { once: true });
addEventListener('keydown', (ev) => {
  if (ev.target.tagName === 'INPUT') return;
  if (ev.code === 'Space') { ev.preventDefault(); play(); }
  if (ev.code === 'KeyD') $('desarmar').click();
});

// --- Calidad adaptativa: si no llega a 50 fps baja la resolución interna ---
const dprMax = Math.min(devicePixelRatio || 1, 2);
const niveles = [...new Set([dprMax, 1.5, 1.25, 1].filter((v) => v <= dprMax))];
let nivel = 0;
const fijo = parseFloat(params.get('q'));
function ajustar() {
  const dpr = fijo > 0 ? fijo : niveles[nivel];
  E.renderer.setPixelRatio(dpr);
  E.renderer.setSize(innerWidth, innerHeight, false);
  E.camera.aspect = innerWidth / innerHeight;
  E.camera.fov = E.camera.aspect < 1.25 ? 46 : 32;
  E.camera.updateProjectionMatrix();
}
addEventListener('resize', ajustar);
ajustar();

const medidor = { cuadros: 0, desde: performance.now(), fps: 0, min: Infinity, historial: [], malas: 0, buenas: 0, subidas: 0 };
const verFps = params.get('fps') === '1';
$('fps').hidden = !verFps;
function medir(ahora) {
  medidor.cuadros++;
  const dt = ahora - medidor.desde;
  if (dt < 1000) return;
  medidor.fps = (medidor.cuadros * 1000) / dt;
  medidor.cuadros = 0;
  medidor.desde = ahora;
  if (document.hidden || ahora < 5000) return; // el arranque (shaders, texturas) no cuenta
  medidor.historial.push(+medidor.fps.toFixed(1));
  if (medidor.historial.length > 120) medidor.historial.shift();
  medidor.min = Math.min(medidor.min, medidor.fps);
  medidor.malas = medidor.fps < 50 ? medidor.malas + 1 : 0;
  medidor.buenas = medidor.fps >= 58 ? medidor.buenas + 1 : 0;
  if (!(fijo > 0)) {
    // 3 segundos seguidos por debajo de 50 → baja un escalón. Si después anda sobrada 10 s, prueba subir (2 intentos).
    if (medidor.malas >= 3 && nivel < niveles.length - 1) { nivel++; medidor.malas = 0; ajustar(); }
    else if (medidor.buenas >= 10 && nivel > 0 && medidor.subidas < 2) { nivel--; medidor.subidas++; medidor.buenas = 0; ajustar(); }
  }
  if (verFps) {
    const i = E.renderer.info.render;
    $('fps').textContent = `${medidor.fps.toFixed(0)} fps  (mín ${medidor.min.toFixed(0)})\n${innerWidth}×${innerHeight} @${E.renderer.getPixelRatio()}x\n${i.calls} draw calls · ${(i.triangles / 1000).toFixed(0)}k tri`;
  }
}

// --- Vistas fijas para las capturas (?vista=frente|arriba|foto) ---
const VISTAS = { frente: [[0, 0.3, 1.02], [0, 0.07, 0]], arriba: [[0, 1.32, 0.0015], [0, 0.08, 0]], foto: [[0, 0.5, 0.86], [0, 0.05, 0]], inicio: [[0.3, 0.5, 0.82], [0, 0.06, 0]] };
function vista(nombre) {
  const [p, t] = VISTAS[nombre] || VISTAS.inicio;
  E.camera.position.set(...p);
  E.controls.target.set(...t);
  E.controls.update();
}
vista(params.get('vista') || 'inicio');
if (params.get('disco') === '0') $('disco').click();
if (params.get('tapa') === '0') { despiece.estado.tapaAbierta = despiece.estado.tapaObjetivo = 0; $('tapa').textContent = 'Abrir tapa'; }

const reloj = new THREE.Clock();
function cuadro(ahora) {
  requestAnimationFrame(cuadro);
  const dt = Math.min(reloj.getDelta(), 0.05);
  despiece.actualizar(dt);
  $('despiece').value = despiece.estado.t;
  reproductor.actualizar(dt);
  if (playPendiente && despiece.estado.t === 0) { playPendiente = false; reproductor.play(); }
  if (quitarDisco && reproductor.estado.fase === 'reposo') { quitarDisco = false; toca.disco.visible = false; }
  E.controls.update();
  E.renderer.render(E.scene, E.camera);
  medir(ahora);
}
E.renderer.compile(E.scene, E.camera);
$('carga').classList.add('lista');
requestAnimationFrame(cuadro);

window.app = { E, toca, reproductor, despiece, audio, medidor, vista, play, desarmar };

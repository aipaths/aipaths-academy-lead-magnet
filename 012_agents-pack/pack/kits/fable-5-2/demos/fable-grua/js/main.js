import * as THREE from 'three';
import { crearEscena, TIMELAPSE, PARAMS } from './escena.js';
import { Terreno } from './terreno.js';
import { crearMateriales } from './materiales.js';
import { Grua } from './grua.js';
import { cavar, depositar, relajar } from './tierra.js';
import { Particulas } from './particulas.js';
import { OBRA } from './medidas.js';
import { Camiones } from './camion.js';
import { Pendulo } from './fisica.js';
import { mando, escucharTeclado, leerTeclado, alApretar } from './controles.js';
import { Demo } from './demo.js';
import { Camara } from './camara.js';
import { crearInterfaz } from './interfaz.js';
import { Sonido } from './sonido.js';
import { Polvo } from './polvo.js';
import { crearObra } from './obra.js';
import { camaraObra, ponerCamara, ETAPA_FINAL } from './camara-obra.js';

if (TIMELAPSE) document.body.classList.add('timelapse');
const lienzo = document.getElementById('lienzo');
const { render, escena, camara, seguirSol } = await crearEscena(lienzo);
const terreno = new Terreno();
escena.add(await terreno.crearMalla());
await crearMateriales();
const grua = await new Grua().armar(terreno.material);
const particulas = new Particulas(terreno);
const camiones = new Camiones(terreno, terreno.material);
particulas.receptores.push(camiones.recibir);
const polvo = new Polvo();
escena.add(grua.grupo, grua.sueltos, particulas.malla, camiones.grupo, crearObra(), polvo.puntos);
particulas.alCaer = (n, x, y, z) => { if (polvo.r() < n * 0.2) polvo.soplar(x, y + 0.2, z, 1, 0.6, 0.5, 0.9); };

// Estado fijo de la obra: la excavación y el acopio salen de cavar de verdad 6 paladas en el pozo,
// soltarlas en la montaña y dejar que todo se desmorone hasta su ángulo natural.
function obraInicial() {
  const { pozo, montana } = OBRA;
  for (let n = 0; n < 6; n++) {
    const x = pozo.x + [0, 1.1, -1.0, 0.3, -0.4, 0.8][n], z = pozo.z + [0, 0.5, -0.4, 1.0, -1.1, -0.9][n];
    let v = 0; for (let k = 0; k < 20; k++) v += cavar(terreno, x, z, 0.3 * n, 1.2, 0.8, 0.13);
    for (let k = 0; k < 60; k++) depositar(terreno, montana.x + Math.sin(k * 2.4) * 0.5, montana.z + Math.cos(k * 1.7) * 0.5, v / 60);
    for (let k = 0; k < 40; k++) relajar(terreno, 4);
  }
  for (let k = 0; k < 400 && relajar(terreno, 4); k++);
}
obraInicial();
grua.mover(mando, 0, terreno);
const pendulo = new Pendulo(grua, terreno, camiones, particulas);
const demo = new Demo(grua, pendulo, camiones);
const sonido = new Sonido();
camiones.alSalir = () => sonido.listo && sonido.bocina();
let caidas = 0, enCaja = 0;

// Un paso de la simulación (siempre el mismo orden: mando → máquina → péndulo → tierra → camión).
function paso(dt) {
  grua.mover(mando, dt, terreno);
  pendulo.paso(dt);
  particulas.paso(dt); caidas += particulas.caidas; enCaja += particulas.enCaja;
  relajar(terreno, 1);
  camiones.paso(dt);
  ambiente(dt);
  polvo.paso(dt);
}
// Polvo y humo: donde muerde la almeja, donde golpea, detrás de las ruedas y en el escape.
const _h = new THREE.Vector3(); let humo = 0;
function ambiente(dt) {
  const e = grua.e, ev = pendulo.eventos, p = pendulo.p, y = p.y - grua.almeja.fondo;
  if (ev.mordida && polvo.r() < 0.25) polvo.soplar(p.x, y + 0.5, p.z, 2, 1.4, 0.8, 1.8);
  if (ev.golpe) polvo.soplar(p.x, y + 0.2, p.z, Math.round(10 * ev.golpe), 1.6, 0.6, 2.0);
  const esfuerzo = Math.abs(e.vGiro) * 2 + Math.abs(e.vCable) * 0.5 + Math.abs(e.vPluma) * 8 + Math.abs(e.vIzq) + Math.abs(e.vDer);
  if ((humo += dt * (0.6 + esfuerzo * 5)) > 1) { humo = 0; grua.sup.grupo.localToWorld(_h.set(-3.0, 4.6, 0.9)); polvo.soplar(_h.x, _h.y, _h.z, 1, 0.08, 1.6, 0.5 + esfuerzo * 0.4, 1); }
  const andar = Math.abs(e.vIzq) + Math.abs(e.vDer);
  if (andar > 0.2 && polvo.r() < andar * dt * 4) polvo.soplar(e.x - Math.cos(e.rumbo) * 2.6, 0.3, e.z + Math.sin(e.rumbo) * 2.6, 1, 2.2, 0.4, 1.6);
  for (const c of camiones.lista) if (c.v > 0.8 && polvo.r() < c.v * dt * 1.6) polvo.soplar(c.x - 3.4, 0.35, OBRA.camion.z, 1, 1.0, 0.5, 2.2);
}
function dibujar() {
  grua.tenderCables(pendulo.sobra);
  particulas.dibujar(); terreno.redibujar(); polvo.dibujar(render, camara);
  seguirSol(grua.e.x + 3, grua.e.z);
  render.render(escena, camara);
}
Object.assign(window, { escena, camara, terreno, grua, particulas, camiones, pendulo, demo, mando, paso, sonido, THREE });

if (TIMELAPSE) {
  // Timelapse: cámara fija, sin interfaz y siempre el mismo estado. Con &demo=1&t=SEG el piloto automático
  // trabaja SEG segundos a paso fijo antes de congelar (así salen las fotos de la primera palada).
  const DT = 1 / 120, seg = Number(PARAMS.get('t') || 0);
  if (PARAMS.has('demo')) { demo.activa = true; for (let i = 0; i < seg * 120; i++) { demo.paso(DT); paso(DT); } }
  else {   // pose por defecto: la cabina viene girando, frena de golpe y la almeja sigue de largo
    grua.e.giro = 0.5; grua.mover(mando, 0, terreno); pendulo.p.copy(grua.punta); pendulo.p.y -= grua.e.cable;
    let t = 0; for (let i = 0; i < 2000 && t < 0.75; i++) { mando.giro = grua.e.giro > 0.13 ? -1 : 0; if (!mando.giro) t += DT; paso(DT); }
  }
  if (PARAMS.get('timelapse') === '2') ponerCamara(camara, camaraObra(THREE, { grua, camiones, particulas }, Number(PARAMS.get('etapa') || ETAPA_FINAL)));   // cámara de construcción
  if (PARAMS.has('cam')) { const c = PARAMS.get('cam').split(',').map(Number); camara.position.set(c[0], c[1], c[2]); camara.lookAt(c[3], c[4], c[5]); }
  let cuadros = 0;
  (function cuadro() { requestAnimationFrame(cuadro); dibujar(); if (++cuadros === 4) window.__lista = true; })();
} else {
  const vista = new Camara(camara, lienzo, grua), interfaz = crearInterfaz(); window.vista = vista;
  escucharTeclado();
  const despertar = () => { sonido.arrancar(); sonido.c.resume(); interfaz.arranco(); window.removeEventListener('keydown', despertar); window.removeEventListener('pointerdown', despertar); };
  window.addEventListener('keydown', despertar); window.addEventListener('pointerdown', despertar);
  alApretar.KeyM = () => { sonido.mudo = !sonido.mudo; };
  alApretar.KeyC = () => vista.cambiar();
  alApretar.KeyP = () => { demo.activa = !demo.activa; Object.assign(mando, { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vira: 0 }); };
  if (PARAMS.has('demo')) demo.activa = true;
  // Calidad adaptativa: si no llega a 50 cuadros por segundo baja la resolución un escalón.
  const escalones = [2, 1.5, 1.25, 1]; let nivel = Math.max(0, escalones.indexOf(Number(PARAMS.get('q')))), lento = 0;
  const fijarCalidad = () => render.setPixelRatio(Math.min(window.devicePixelRatio, escalones[nivel]));
  fijarCalidad();
  const med = { n: 0, t: 0, min: 999, suma: 0, muestras: 0, actual: 0 }; window.__fps = med;
  let antes = performance.now(), cuadros = 0;
  (function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    const real = Math.min(0.05, (ahora - antes) / 1000 || 0.016); antes = ahora;
    if (demo.activa) { demo.paso(real); } else leerTeclado();
    paso(real / 2); if (demo.activa) demo.paso(0); paso(real / 2);
    sonido.actualizar(real, { e: grua.e, mando, pendulo, camiones, caidas: caidas / (real * 60), enCaja: enCaja / (real * 60) }); caidas = enCaja = 0;
    vista.paso(); dibujar();
    med.n++; med.t += real;
    if (med.t >= 0.5) {
      med.actual = med.n / med.t; med.n = 0; med.t = 0;
      if (cuadros > 300) { med.min = Math.min(med.min, med.actual); med.suma += med.actual; med.muestras++; }
      lento = med.actual < 50 && cuadros > 300 ? lento + 1 : 0;
      if (lento >= 6 && nivel < escalones.length - 1 && !PARAMS.has('q')) { nivel++; fijarCalidad(); lento = 0; }
      interfaz.fps(`${med.actual.toFixed(0)} fps · ${render.info.render.calls} llamadas · ${(render.info.render.triangles / 1000).toFixed(0)} mil tri · ${render.getPixelRatio()}x`);
      interfaz.estado(grua.almeja, camiones, demo.activa, sonido.mudo);
    }
    if (++cuadros === 4) window.__lista = true;
  })(antes);
}

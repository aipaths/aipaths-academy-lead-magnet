// Arranque: escena, obra, grúa, camión, física, sonido y bucle.
import * as THREE from 'three';
import { URLP } from './config.js';
import { crearEscena } from './escena.js';
import { crearEntorno } from './entorno.js';
import { crearObra } from './obra.js';
import { Terreno } from './terreno.js';
import { crearCamaras } from './camara.js';
import { texturasListas, setAnisotropia } from './texturas.js';
import { crearHud } from './hud.js';
import { crearMateriales } from './materiales.js';
import { Grua } from './grua.js';
import { Colgante } from './colgante.js';
import { crearControles } from './controles.js';
import { Particulas } from './particulas.js';
import { Tierra, CAPACIDAD } from './tierra.js';
import { palada } from './demo.js';
import { Camiones, CAPACIDAD_CAMION } from './camiones.js';
import { Sonido } from './sonido-mezcla.js';
import { crearCalidad } from './calidad.js';
import { Polvo } from './polvo.js';

const canvas = document.getElementById('lienzo');
const { renderer, escena, camara, listo } = crearEscena(canvas);
setAnisotropia(Math.min(4, renderer.capabilities.getMaxAnisotropy()));   // x16 costaba ~15 fps a 4K en el suelo
crearEntorno(escena);
const terreno = new Terreno();
escena.add(terreno.mesh);
crearMateriales();
crearObra(escena);
const grua = new Grua(terreno);
escena.add(grua.base);
const colgante = new Colgante(grua, terreno, escena);
grua.colgante = colgante;
const particulas = new Particulas(escena, terreno);
const tierra = new Tierra(terreno, particulas);
const polvo = new Polvo(escena);
particulas.polvo = polvo;
const camiones = new Camiones(escena, terreno);
particulas.receptores.push(camiones);
colgante.obstaculos = [camiones];
const camaras = crearCamaras(camara, canvas);
const estado = { abrir: false, auto: null };
const sonido = new Sonido();
const arrancarSonido = () => { if (URLP.timelapse) return; sonido.arrancar(); document.getElementById('inicio').classList.add('oculto'); };
if (!URLP.timelapse) { document.getElementById('inicio').classList.remove('oculto'); document.getElementById('btn-inicio').onclick = arrancarSonido; }
const controles = crearControles({
  alAlternarAlmeja: () => { estado.abrir = !estado.abrir; },
  alCamara: () => camaras.siguiente(),
  alSonido: () => sonido.alternar(),
  alPrimeraTecla: arrancarSonido,
});
const hud = crearHud();
const calidad = crearCalidad(renderer);

const reloj = new THREE.Clock();
const vLabios = new THREE.Vector3(), vCero = new THREE.Vector3();
// Un paso de simulación (dt fijo o real). La demo y el timelapse lo llaman sin dibujar.
function simular(dt) {
  const e = controles.leer(estado.auto);
  grua.mover(dt, e);
  colgante.actualizar(dt, e.cable, estado.abrir, tierra);
  const r = colgante.almeja.raiz;
  tierra.soltar(dt, colgante.almeja.abertura, r.localToWorld(vLabios.set(0, -2.2, 0)), colgante.vel || vCero, r.rotation.y);
  particulas.actualizar(dt);
  if (tierra.mordidoUltimo > 0 && Math.random() < 0.3) polvo.soplar(colgante.pos.x, colgante.pos.y - colgante.almeja.alto, colgante.pos.z, 0.6);
  polvo.actualizar(dt);
  camiones.actualizar(dt);
  terreno.relajar(3);
}

function cuadro() {
  const dt = Math.min(reloj.getDelta(), 1 / 20);
  if (!estado.pausa) simular(dt);
  sonido.actualizar(dt, { grua, colgante, tierra, particulas, camiones, camara });
  terreno.actualizarMalla();
  camaras.actualizar(grua);
  renderer.render(escena, camara);
  hud.cuadro(dt, renderer);
  calidad.cuadro(dt);
  hud.datos(`Giro ${(grua.angGiro * 180 / Math.PI % 360).toFixed(0)}° · Pluma ${(grua.angPluma * 180 / Math.PI).toFixed(0)}° · Cable ${colgante.largo.toFixed(1)} m · Almeja ${(colgante.almeja.abertura * 100).toFixed(0)} % abierta · Carga ${tierra.carga.toFixed(2)} / ${CAPACIDAD} m³<br>Camión ${camiones.c.carga.toFixed(1)} / ${CAPACIDAD_CAMION} m³ · ${camiones.estado} · llenados: ${camiones.llenados}`);
}

Promise.all([listo, texturasListas()]).then(async () => {
  renderer.compile(escena, camara);
  if (URLP.palada) {
    estado.pausa = true;
    if (URLP.palada === 'descarga') { await palada(app, { pasoFijo: true, fasesMax: 8 }); estado.abrir = true; for (let i = 0; i < 70; i++) simular(1 / 60); }
    else await palada(app, { pasoFijo: true });
    estado.pausa = false;
  }
  for (let i = 0; i < 3; i++) { cuadro(); await new Promise(requestAnimationFrame); }
  if (URLP.timelapse) estado.pausa = true;
  window.__lista = true;
  renderer.setAnimationLoop(cuadro);
});
const app = { escena, camara, renderer, terreno, grua, colgante, tierra, particulas, estado, simular, camiones, sonido };
window.__app = app;
window.__palada = (op) => palada(app, op);

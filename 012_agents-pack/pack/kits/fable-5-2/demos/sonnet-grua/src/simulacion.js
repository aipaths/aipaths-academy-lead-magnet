// Un paso de simulación completo: controles → grúa → péndulo del cable → mordida/descarga → partículas → camiones → suelo.
import * as THREE from 'three';
import { crearGrua } from './grua.js';
import { Particulas } from './particulas.js';
import { Excavacion } from './excavar.js';
import { Camiones } from './camion.js';
import { FisicaCable } from './fisica.js';
import { PLUMA } from './pluma.js';
import { Polvo } from './polvo.js';
import { CAB } from './cabina.js';

const GIRO_MAX = 11, GIRO_ACEL = 24, GIRO_FRENO = 140;     // °/s, °/s² al acelerar, °/s² al frenar (de golpe)
const D2R = Math.PI / 180;

export function crearSimulacion(scene, terreno) {
  const grua = crearGrua(scene), particulas = new Particulas(scene, terreno), excavacion = new Excavacion(terreno, particulas);
  const camiones = new Camiones(scene); particulas.camion = camiones;
  const polvo = new Polvo(scene); particulas.polvo = polvo; excavacion.polvo = polvo;
  const humo = { t: 0, tc: 0 }, pe = new THREE.Vector3(), suelo0 = { v: false };
  const fisica = new FisicaCable(grua, excavacion); grua.estructura(); fisica.iniciar(); grua.colocarAlmeja(fisica.G, fisica.q);
  const est = grua.estado, st = { giroVel: 0, avance: 0, vuelta: 0, abiertaPrev: est.almeja, vcable: 0, vpluma: 0, tension: 0 }, up = new THREE.Vector3();
  const acelerar = (v, objetivo, a, f, dt) => { const r = Math.abs(objetivo) > Math.abs(v) && Math.sign(objetivo) * Math.sign(v) >= 0 ? a : f; const d = objetivo - v, m = r * dt; return Math.abs(d) < m ? objetivo : v + Math.sign(d) * m; };

  function orugas(c, dt) {
    st.avance = acelerar(st.avance, c.avance * 2.4, 5, 12, dt); st.vuelta = acelerar(st.vuelta, c.vuelta * 22, 60, 120, dt);
    const raiz = grua.raiz; if (!st.avance && !st.vuelta) return;
    raiz.rotation.y -= st.vuelta * D2R * dt;
    const dx = Math.cos(raiz.rotation.y) * st.avance * dt, dz = -Math.sin(raiz.rotation.y) * st.avance * dt;
    raiz.position.x = THREE.MathUtils.clamp(raiz.position.x + dx, -24, 24); raiz.position.z = THREE.MathUtils.clamp(raiz.position.z + dz, -24, 8);
    const sep = grua.orugas.separacion / 2, ang = st.vuelta * D2R;
    grua.orugas.avanzar((st.avance + ang * sep) * dt, (st.avance - ang * sep) * dt);
    raiz.position.y = terreno.alturaEn(raiz.position.x, raiz.position.z);
  }

  function paso(dt, c) {
    st.giroVel = acelerar(st.giroVel, c.giro * GIRO_MAX, GIRO_ACEL, GIRO_FRENO, dt); est.giro -= st.giroVel * dt;
    st.vpluma = acelerar(st.vpluma, c.pluma * 4.5, 12, 40, dt); est.pluma = THREE.MathUtils.clamp(est.pluma + st.vpluma * dt, PLUMA.min, PLUMA.max);
    st.vcable = acelerar(st.vcable, c.cable * 3.2, 9, 30, dt); est.cable = THREE.MathUtils.clamp(est.cable + st.vcable * dt, 2.5, 27);
    est.almeja = THREE.MathUtils.clamp(est.almeja + c.almeja * (c.almeja > 0 ? 0.6 : 0.55) * dt, 0, 1);
    orugas(c, dt);
    grua.estructura();
    st.tension = fisica.paso(dt);
    excavacion.paso(dt, fisica.G, fisica.V, fisica.yaw, est.almeja, est.almeja - st.abiertaPrev); st.abiertaPrev = est.almeja;
    grua.almeja.carga = excavacion.carga;
    grua.colocarAlmeja(fisica.G, fisica.q);
    particulas.paso(dt); camiones.paso(dt); terreno.paso(); efectos(dt, c);
  }

  function efectos(dt, c) {                                    // humo del escape, polvo de los camiones y del golpe de la almeja
    const act = Math.max(Math.abs(c.giro), Math.abs(c.pluma), Math.abs(c.cable), Math.abs(c.avance), Math.abs(c.almeja) * 0.5);
    humo.t += dt * (3 + 14 * act);
    while (humo.t > 1) { humo.t -= 1; grua.arriba.localToWorld(pe.set(-0.4, 3.05, -0.95)); polvo.emitir(pe.x, pe.y, pe.z, { size: 0.28, grow: 6, life: 2.4, alpha: 0.2 + 0.2 * act, up: 1.6, v: 0.3, color: [0.2, 0.2, 0.21] }); }
    const t = camiones.actual?.v > camiones.saliente?.v ? camiones.actual : camiones.saliente || camiones.actual;
    for (const m of [camiones.actual, camiones.saliente]) if (m && m.v > 1.5) {
      humo.tc += dt * m.v * 2; while (humo.tc > 1) { humo.tc -= 1; polvo.emitir(m.x - 3.3, 0.15, camiones.zona + (Math.random() - 0.5) * 2.4, { size: 0.9, grow: 3.4, life: 2, alpha: 0.2, up: 0.5, v: 1.5 }); }
    }
    if (fisica.enSuelo && !suelo0.v && fisica.V.length() < 20) polvo.rafaga(fisica.G.x, terreno.alturaEn(fisica.G.x, fisica.G.z) + 0.1, fisica.G.z, 10, { size: 1.2, grow: 3, life: 1.8, alpha: 0.28, up: 1.2, v: 3 });
    suelo0.v = fisica.enSuelo; polvo.paso(dt);
  }
  return { grua, particulas, excavacion, camiones, fisica, st, paso, polvo };
}

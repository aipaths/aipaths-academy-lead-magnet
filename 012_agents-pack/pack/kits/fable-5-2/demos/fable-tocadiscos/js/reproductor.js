// Mecánica: motor del plato, recorrido del brazo y la secuencia de play/stop.
import * as THREE from 'three';
import { M } from './medidas.js';

const G = THREE.MathUtils.degToRad;
const suave = (x) => x * x * (3 - 2 * x);
const REPOSO = G(1.6), ARRIBA = G(4.2);   // inclinación del brazo: apoyado / levantado
const DURACION_LADO = 240;                // segundos que tarda en llegar al centro

export function crearReproductor(t, audio, alCambiar) {
  const e = {
    motor: false, rpmObjetivo: 100 / 3, rpm: 0, angulo: 0,
    fase: 'reposo', reloj: 0, psi: 0, alza: REPOSO, psiDesde: 0, radio: M.DISCO.entrada, sonando: false,
  };
  const psiEntrada = t.anguloPara(M.DISCO.entrada);

  // Cada fase: duración y qué hace con u = 0..1
  const fases = {
    subir: { dur: 0.55, paso: (u) => { e.alza = THREE.MathUtils.lerp(e.alzaDesde, ARRIBA, suave(u)); }, sigue: () => e.destino },
    ir: { dur: 1.7, paso: (u) => { e.psi = THREE.MathUtils.lerp(e.psiDesde, psiEntrada, suave(u)); }, sigue: () => 'bajar' },
    bajar: { dur: 1.25, paso: (u) => { e.alza = ARRIBA * (1 - suave(u)); }, sigue: () => 'sonando' },
    volver: { dur: 1.5, paso: (u) => { e.psi = THREE.MathUtils.lerp(e.psiDesde, 0, suave(u)); }, sigue: () => 'apoyar' },
    apoyar: { dur: 0.7, paso: (u) => { e.alza = THREE.MathUtils.lerp(ARRIBA, REPOSO, suave(u)); }, sigue: () => 'reposo' },
  };

  function entrar(fase) {
    e.fase = fase;
    e.reloj = 0;
    e.psiDesde = e.psi;
    e.alzaDesde = e.alza;
    if (fase === 'sonando') { e.radio = M.DISCO.entrada; e.sonando = true; audio.bajarAguja(); }
    if (fase === 'volver') ponerMotor(false);
    alCambiar(e);
  }

  function ponerMotor(si) {
    e.motor = si;
    t.ui.luzEstrobo.material = si ? t.mat.ledRojo : t.mat.ledApagado;
    t.estrobo.intensity = si ? 0.0035 : 0;
    actualizarLeds();
    alCambiar(e);
  }
  function actualizarLeds() {
    const es33 = e.rpmObjetivo < 40;
    t.ui.b33Led.material = es33 ? t.mat.ledRojo : t.mat.ledApagado;
    t.ui.b45Led.material = es33 ? t.mat.ledApagado : t.mat.ledRojo;
  }

  function levantarAguja() {
    if (e.sonando) { e.sonando = false; audio.subirAguja(); }
  }

  const api = {
    estado: e,
    get reproduciendo() { return ['subir', 'ir', 'bajar', 'sonando'].includes(e.fase) && e.destino !== 'volver'; },
    play() {
      if (api.reproduciendo) return;
      t.disco.visible = true;
      ponerMotor(true);
      e.destino = 'ir';
      entrar('subir');
    },
    stop() {
      if (e.fase === 'reposo' || e.destino === 'volver') { ponerMotor(false); return; }
      levantarAguja();
      e.destino = 'volver';
      entrar('subir');
    },
    alternar() { api.reproduciendo ? api.stop() : api.play(); },
    // Botón START·STOP del equipo: sólo el motor (si la aguja está abajo, la música se frena con el plato)
    alternarMotor() { ponerMotor(!e.motor); audio.clic(); pulsar(t.ui.start); },
    velocidad(rpm) {
      e.rpmObjetivo = rpm;
      actualizarLeds();
      audio.clic();
      pulsar(rpm < 40 ? t.ui.b33 : t.ui.b45);
      alCambiar(e);
    },
    actualizar(dt) {
      // Motor: 0,7 s para llegar a 33⅓ [ficha oficial]; frena en ~1 s
      const meta = e.motor ? e.rpmObjetivo : 0;
      const acel = (100 / 3 / 0.7) * dt;
      e.rpm += THREE.MathUtils.clamp(meta - e.rpm, -acel * 0.75, acel);
      e.angulo -= (e.rpm / 60) * Math.PI * 2 * dt; // horario visto de arriba
      t.giro.rotation.y = e.angulo;

      const f = fases[e.fase];
      if (f) {
        e.reloj += dt;
        const u = Math.min(1, e.reloj / f.dur);
        f.paso(u);
        if (u >= 1) entrar(f.sigue());
      } else if (e.fase === 'sonando') {
        // La aguja avanza hacia el centro al ritmo del plato
        e.radio -= ((M.DISCO.entrada - M.DISCO.fin) / DURACION_LADO) * dt * (e.rpm / (100 / 3));
        e.psi = t.anguloPara(e.radio) + Math.sin(e.angulo) * G(0.07); // disco apenas descentrado
        e.alza = Math.sin(e.angulo + 1) * G(0.09) + G(0.09);          // y apenas ondulado
        if (e.radio <= M.DISCO.fin) api.stop();
      }
      t.pivote.rotation.y = -e.psi;
      t.pivote.rotation.x = -e.alza;
      audio.velocidad(e.rpm / (100 / 3));
      for (const b of pulsados) {
        b.t += dt;
        b.o.position.y -= Math.sin(Math.min(1, b.t / 0.22) * Math.PI) * 1.3; // el despiece ya la reubicó este cuadro
        if (b.t > 0.22) pulsados.delete(b);
      }
    },
  };

  const pulsados = new Set();
  function pulsar(o) {
    for (const b of pulsados) if (b.o === o) return;
    pulsados.add({ o, t: 0 });
  }

  t.ui.start.userData.accion = () => api.alternarMotor();
  t.ui.b33.userData.accion = () => api.velocidad(100 / 3);
  t.ui.b45.userData.accion = () => api.velocidad(45);
  actualizarLeds();
  return api;
}

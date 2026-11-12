// Secuencia de reproducción: arranque del plato, el brazo sube, viaja al surco de entrada, baja y avanza.
import * as THREE from 'three';
import { RPM33 } from './medidas.js';
import { MAT } from './materiales.js';
import { anguloParaRadio, ANGULO_REPOSO } from './brazo.js';

const ALZ_ARRIBA = Math.atan(10 / 230);
const ALZ_REPOSO = 0.004;
const R_ENTRADA = 147.5,
  R_FINAL = 62;
const AVANCE = 0.47; // mm por segundo: el lado A dura ~3 min

export class Reproduccion {
  constructor({ brazo, giran, audio, ctrl, luzRoja }) {
    Object.assign(this, { brazo, giran, audio, ctrl, luzRoja });
    this.vel = 0;
    this.velObj = 0;
    this.ritmo = 1;
    this.ang = ANGULO_REPOSO;
    this.alz = ALZ_REPOSO;
    this.radio = R_ENTRADA;
    this.estado = 'quieto';
    this.tweens = [];
    this.token = 0;
    this.encender(false);
  }

  tween(dur, fn) {
    return new Promise((ok) => this.tweens.push({ t: 0, dur, fn, ok }));
  }

  encender(si) {
    this.ctrl.lenteEstrobo.material = this.ctrl.led33.material = si ? MAT.ledRojo : MAT.ledApagado;
    this.ctrl.foco.material.emissiveIntensity = si ? 2.5 : 0;
    this.luzRoja.intensity = si ? 0.03 : 0; // sin cambiar la cantidad de luces (evita recompilar shaders)
  }

  async mover(dur, a1, alz1) {
    const a0 = this.ang,
      z0 = this.alz;
    await this.tween(dur, (e) => {
      const s = e * e * (3 - 2 * e);
      if (a1 !== null) this.ang = THREE.MathUtils.lerp(a0, a1, s);
      if (alz1 !== null) this.alz = THREE.MathUtils.lerp(z0, alz1, s);
    });
  }

  async play() {
    if (this.estado !== 'quieto') return;
    const tok = ++this.token;
    this.estado = 'arrancando';
    await this.audio.iniciar();
    this.audio.pitch((this.ritmo - 1) * 100);
    this.encender(true);
    this.velObj = RPM33;
    await this.mover(0.35, null, ALZ_ARRIBA);
    if (tok !== this.token) return;
    await this.mover(1.3, anguloParaRadio(R_ENTRADA), null);
    if (tok !== this.token) return;
    await this.mover(0.8, null, 0);
    if (tok !== this.token) return;
    this.radio = R_ENTRADA;
    this.audio.bajarAguja();
    this.estado = 'sonando';
  }

  async stop() {
    if (this.estado === 'quieto' || this.estado === 'parando') return;
    const tok = ++this.token;
    const conAguja = this.estado === 'sonando' || this.estado === 'final';
    this.estado = 'parando';
    this.tweens.length = 0;
    if (conAguja) this.audio.frenar(0.9);
    else this.audio.levantarAguja();
    this.velObj = 0;
    if (conAguja) await this.tween(0.9, () => {});
    await this.mover(0.3, null, ALZ_ARRIBA);
    await this.mover(1.2, ANGULO_REPOSO, null);
    await this.mover(0.5, null, ALZ_REPOSO);
    if (tok !== this.token) return;
    this.encender(false);
    this.estado = 'quieto';
  }

  pitch(pct) {
    this.ritmo = 1 + pct / 100;
    if (this.velObj > 0) this.velObj = RPM33;
    this.audio.pitch(pct);
  }

  // Devuelve true si algo del brazo se movió (para actualizar la sombra).
  actualizar(dt) {
    for (const tw of [...this.tweens]) {
      tw.t = Math.min(tw.t + dt / tw.dur, 1);
      tw.fn(tw.t);
      if (tw.t >= 1) {
        this.tweens.splice(this.tweens.indexOf(tw), 1);
        tw.ok();
      }
    }
    // 0,7 s de 0 a 33⅓ (dato oficial); el freno tarda ~0,9 s
    const objetivo = this.velObj * this.ritmo,
      acel = this.velObj > 0 ? RPM33 / 0.7 : RPM33 / 0.9;
    this.vel += THREE.MathUtils.clamp(objetivo - this.vel, -acel * dt, acel * dt);
    for (const g of this.giran) g.rotation.y -= this.vel * dt;
    if (this.estado === 'sonando') {
      this.radio -= AVANCE * this.ritmo * dt;
      if (this.radio <= R_FINAL) {
        this.estado = 'final';
        this.audio.surcoFinal();
        this.finEn = 6;
      }
      this.ang = anguloParaRadio(this.radio);
    } else if (this.estado === 'final') {
      // Surco de salida: la aguja va y viene con la excentricidad del surco cerrado
      const fase = this.giran[0].rotation.y;
      this.ang = anguloParaRadio(R_FINAL - 1.2 + Math.sin(fase) * 1.2);
      if ((this.finEn -= dt) <= 0) this.stop();
    }
    const cambio = this.brazo.giro.rotation.y !== this.ang || this.brazo.alzada.rotation.z !== this.alz;
    this.brazo.giro.rotation.y = this.ang;
    this.brazo.alzada.rotation.z = this.alz;
    return cambio;
  }
}

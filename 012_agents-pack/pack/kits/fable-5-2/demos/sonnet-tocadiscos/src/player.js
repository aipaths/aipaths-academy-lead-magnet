// Coordina el giro del plato, el recorrido del brazo y el audio. Todo el movimiento nace de este estado.
import { thetaForRadius, THETA_REST } from './arm.js';

const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
const LIFT = 1.3;                       // cm que sube la aguja al levantar el brazo

export class Player {
  constructor(deck, arm, ctl, phono) {
    Object.assign(this, { deck, arm, ctl, phono });
    this.angle = 0; this.omega = 0; this.rpm = 33.333; this.pitch = 1;
    this.mode = 'idle'; this.braking = false; this.t = 0; this.lift = 0; this.theta = THETA_REST;
    this.from = THETA_REST; this.thetaIn = thetaForRadius(14.6); this.now = '';
  }

  get on() { return this.mode !== 'idle'; }
  get speed() { return (this.rpm / 33.333) * this.pitch; }

  play() {
    if (this.on) return;
    this.go('spinup'); this.now = 'Arrancando el motor…';
    this.braking = false; this.refreshLeds();
  }

  stop() {
    if (!this.on) return;
    if (['liftEnd', 'toRest', 'lowerRest'].includes(this.mode)) { this.braking = true; return; }
    this.phono.stop(); this.braking = true; this.go('liftEnd');
    this.now = '';
  }

  setRpm(r) { this.rpm = r; this.refreshLeds(); this.phono.setSpeed(this.speed); }
  setPitch(p) { this.pitch = p; this.phono.setSpeed(this.speed); }
  refreshLeds() {
    const { led33, led45 } = this.ctl;
    led33.material.emissiveIntensity = this.rpm < 40 ? 1.8 : 0.0; led45.material.emissiveIntensity = this.rpm < 40 ? 0.0 : 1.8;
  }

  go(mode) { this.mode = mode; this.t = 0; this.from = this.theta; this.fromLift = this.lift; }

  /** Radio del surco bajo la aguja según el paso de la música. */
  radius(step) {
    for (const s of this.phono.segs) {
      if (step < s.end) return s.r0 + (s.r1 - s.r0) * Math.min(1, Math.max(0, (step - s.start) / (s.end - s.start)));
    }
    return 6.3;
  }

  segName(step) {
    const s = this.phono.segs.find((q) => step < q.end);
    return s && s.name !== 'entrada' && s.name !== 'pausa' && s.name !== 'surco final' ? `Lado A · ${s.name}` : 'Lado A';
  }

  update(dt) {
    this.t += dt;
    this.stepArm(dt);
    const target = this.mode === 'idle' || this.braking ? 0 : (this.rpm * Math.PI * 2 / 60) * this.pitch;
    this.omega += (target - this.omega) * Math.min(1, dt * (target ? 5.5 : 3.2));
    if (Math.abs(this.omega) < 0.002 && !target) this.omega = 0;
    this.angle -= this.omega * dt;                 // los discos giran en sentido horario visto desde arriba
    for (const o of this.deck.spin) o.rotation.y = this.angle;
    const on = this.omega > 0.5;
    this.ctl.ledRing.material.emissiveIntensity = on ? 3.2 : 0.8;
    this.ctl.lens.material.emissiveIntensity = on ? 2.4 : 0.0;
    this.arm.setTheta(this.theta); this.arm.setLift(this.lift * LIFT);
  }

  stepArm(dt) {
    const t = this.t, m = this.mode;
    if (m === 'spinup' && t > 0.9) this.go('liftStart');
    else if (m === 'liftStart') { this.lift = smooth(t / 0.45); if (t > 0.45) this.go('toDisc'); }
    else if (m === 'toDisc') {
      this.theta = this.from + (this.thetaIn - this.from) * smooth(t / 1.8);
      if (t > 1.8) this.go('lowering');
    } else if (m === 'lowering') {
      this.lift = 1 - smooth(t / 0.7);
      if (t > 0.7) { this.phono.start(this.speed); this.go('track'); }
    } else if (m === 'track') this.track();
    else if (m === 'liftEnd') { this.lift = Math.min(1, this.fromLift + smooth(t / 0.5) * (1 - this.fromLift)); if (t > 0.5) this.go('toRest'); }
    else if (m === 'toRest') {
      this.theta = this.from + (THETA_REST - this.from) * smooth(t / 1.8);
      if (t > 1.8) this.go('lowerRest');
    } else if (m === 'lowerRest') { this.lift = 1 - smooth(t / 0.6); if (t > 0.6) { this.lift = 0; this.mode = 'idle'; } }
  }

  track() {
    const pos = this.phono.position();
    if (pos === null) return;
    this.theta = thetaForRadius(this.radius(pos));
    this.now = this.segName(pos);
    if (this.phono.finished) { this.phono.stop(0.6); this.go('liftEnd'); this.now = ''; }
  }

  /** Estado legible para pruebas. */
  info() { return { mode: this.mode, rpm: Math.round(this.omega * 60 / Math.PI / 2 * 10) / 10, now: this.now, theta: this.theta }; }
}

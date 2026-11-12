// Motor de audio: reproduce la composición paso a paso y le suma el crujido del vinilo.
import { composeSide } from './compose.js';
import * as V from './voices.js';

const FN = { ep: V.ep, bass: V.bass, bell: V.bell, pad: V.pad };

export class Phono {
  constructor() {
    this.side = composeSide();
    this.ctx = null; this.run = null; this.speed = 1;
  }

  get playing() { return !!this.run; }
  get segs() { return this.side.segs; }

  /** Posición en pasos (fraccionaria) para animar el brazo; null si no suena. */
  position() {
    const r = this.run; if (!r) return null;
    const behind = Math.max(0, r.next - this.ctx.currentTime) / (r.dur / this.speed);
    return Math.max(0, r.i - behind);
  }

  init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const mk = (len, f) => { const b = ctx.createBuffer(2, ctx.sampleRate * len, ctx.sampleRate); for (let c = 0; c < 2; c++) f(b.getChannelData(c)); return b; };
    this.white = mk(1.2, (d) => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
    this.hissBuf = mk(4, (d) => { let l = 0; for (let i = 0; i < d.length; i++) { l = l * 0.7 + (Math.random() * 2 - 1) * 0.3; d[i] = l; } });
    this.rumbleBuf = mk(4, (d) => { let l = 0; for (let i = 0; i < d.length; i++) { l = l * 0.995 + (Math.random() * 2 - 1) * 0.005; d[i] = l * 9; } });
    this.pops = Array.from({ length: 14 }, (_, k) => mk(0.03, (d) => {
      const n = Math.floor(ctx.sampleRate * (0.002 + (k / 14) * 0.012));
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    }));
    this.ir = mk(2.0, (d) => { for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3.2); });
  }

  buildChain() {
    const ctx = this.ctx, c = {};
    c.master = ctx.createGain(); c.master.gain.value = 0.72;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9500;
    const sh = ctx.createWaveShaper(); sh.curve = Float32Array.from({ length: 512 }, (_, i) => Math.tanh((i / 256 - 1) * 1.6));
    c.music = ctx.createGain(); c.music.gain.value = 1.0;
    const conv = ctx.createConvolver(); conv.buffer = this.ir; const wet = ctx.createGain(); wet.gain.value = 0.22;
    c.music.connect(sh); c.music.connect(conv); conv.connect(wet); wet.connect(sh);
    sh.connect(hp); hp.connect(lp); lp.connect(comp); comp.connect(c.master); c.master.connect(ctx.destination);
    c.crack = ctx.createGain(); c.crack.gain.value = 0; c.crack.connect(c.master);
    return c;
  }

  start(speed = 1) {
    this.init(); if (this.ctx.state !== 'running') this.ctx.resume();
    this.stop(0.05); this.speed = speed;
    const ctx = this.ctx, ch = this.buildChain(), t0 = ctx.currentTime + 0.05;
    this.run = { ch, i: 0, next: t0, dur: 0.15, popAt: t0, thumpAt: t0 + 1.8, t0 };
    this.drop(ch, t0);
    this.timer = setInterval(() => this.tick(), 40);
  }

  /** Aguja en el disco: golpe grave, soplido constante y rumble. */
  drop(ch, t) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.22);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(ch.crack); o.start(t); o.stop(t + 0.4);
    ch.crack.gain.setValueAtTime(0.0001, t); ch.crack.gain.linearRampToValueAtTime(1, t + 0.25);
    const mkLoop = (buf, type, f, vol) => {
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
      const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = 0.6;
      const v = ctx.createGain(); v.gain.value = vol; s.connect(b); b.connect(v); v.connect(ch.crack); s.start(t); return s;
    };
    ch.loops = [mkLoop(this.hissBuf, 'bandpass', 3200, 0.05), mkLoop(this.rumbleBuf, 'lowpass', 70, 0.35)];
  }

  pop(ch, t) {
    const ctx = this.ctx, s = ctx.createBufferSource(), g = ctx.createGain(), p = ctx.createStereoPanner();
    s.buffer = this.pops[Math.floor(Math.random() * this.pops.length)];
    g.gain.value = Math.random() < 0.08 ? 0.3 + Math.random() * 0.25 : 0.04 + Math.random() * 0.12;
    p.pan.value = Math.random() * 1.4 - 0.7; s.connect(g); g.connect(p); p.connect(ch.crack); s.start(t);
  }

  tick() {
    const r = this.run; if (!r) return;
    const ctx = this.ctx, horizon = ctx.currentTime + 0.25, steps = this.side.steps;
    while (r.next < horizon && r.i < steps.length) {
      const st = steps[r.i];
      for (const e of st.ev) this.fire(r.ch, e, r.next + e.sw / this.speed);
      r.dur = st.d; r.next += st.d / this.speed; r.i++;
    }
    for (; r.popAt < horizon; r.popAt += 0.06 + Math.random() * 0.22) {   // pops al azar y ráfagas
      this.pop(r.ch, r.popAt);
      if (Math.random() < 0.07) for (let k = 1; k < 4; k++) this.pop(r.ch, r.popAt + k * 0.012);
    }
    for (; r.thumpAt < horizon; r.thumpAt += 1.8 / this.speed) this.pop(r.ch, r.thumpAt);   // una vuelta del disco
    if (r.i >= steps.length && r.next < ctx.currentTime) this.finished = true;
  }

  fire(ch, e, t) {
    const ctx = this.ctx, o = ch.music, s = this.speed;
    if (e.vel === 0) return;
    if (FN[e.k]) FN[e.k](ctx, o, t, e.n, e.dur, e.vel, s);
    else if (e.k === 'kick') V.kick(ctx, o, t, e.vel, s);
    else if (e.k === 'snare') V.snare(ctx, o, t, e.vel, s, this.white);
    else if (e.k === 'hat') V.hat(ctx, o, t, e.vel, s, this.white);
  }

  setSpeed(s) { this.speed = s; }

  stop(fade = 0.35) {
    clearInterval(this.timer);
    const r = this.run; this.run = null; this.finished = false;
    if (!r) return;
    const t = this.ctx.currentTime;
    r.ch.master.gain.cancelScheduledValues(t); r.ch.master.gain.setValueAtTime(r.ch.master.gain.value, t);
    r.ch.master.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => { r.ch.loops?.forEach((l) => { try { l.stop(); } catch (e) { /* ya detenido */ } }); r.ch.master.disconnect(); }, fade * 1000 + 2500);
  }
}

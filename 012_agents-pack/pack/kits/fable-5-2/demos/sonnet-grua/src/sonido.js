// Sonido 100 % procedural (Web Audio): motor diésel, cable/cabrestante, orugas, la almeja mordiendo, la tierra cayendo y el volquete.
export class Sonido {
  constructor(sim) { this.sim = sim; this.ctx = null; this.n = {}; this.prevAbierta = sim.grua.estado.almeja; this.prevTierra = 0; this.cierre = 0; this.suave = { act: 0, cable: 0, giro: 0, oru: 0, tierra: 0, metal: 0 }; this.picos = 0; }

  iniciar() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = this.ctx = new AC(), out = ctx.createGain(), comp = ctx.createDynamicsCompressor(); out.gain.value = 0.9;
    this.analizador = ctx.createAnalyser(); this.analizador.fftSize = 512;
    out.connect(comp); comp.connect(this.analizador); comp.connect(ctx.destination); this.out = out;
    const largo = ctx.sampleRate * 2, buf = ctx.createBuffer(1, largo, ctx.sampleRate), d = buf.getChannelData(0); let b = 0;
    for (let i = 0; i < largo; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = (w * 0.5 + b * 6) * 0.6; }   // ruido rosado
    this.ruido = buf;
    this.motor(); this.cable(); this.tierraNodos(); this.camionNodos();
    ctx.resume?.();
  }

  fuente(tipo, freq) { const o = this.ctx.createOscillator(); o.type = tipo; o.frequency.value = freq; o.start(); return o; }
  generador() { const s = this.ctx.createBufferSource(); s.buffer = this.ruido; s.loop = true; s.start(); return s; }
  ganancia(v = 0, a = null) { const g = this.ctx.createGain(); g.gain.value = v; if (a) g.connect(a); return g; }

  motor() {                                                    // diésel: sierra grave + pulsos de combustión + ronquido
    const { ctx } = this, f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; f.Q.value = 2;
    const g = this.ganancia(0.35, this.out), pulso = this.ganancia(0.6, g); f.connect(pulso); pulso.connect(g);
    const a = this.fuente('sawtooth', 28), b = this.fuente('square', 14.2), lfo = this.fuente('sine', 11), prof = this.ganancia(0.35, pulso.gain);
    lfo.connect(prof); a.connect(f); this.ganancia(0.5, f); b.connect(this.ganancia(0.6, f));
    const r = this.generador(), rf = ctx.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 160; r.connect(rf); rf.connect(this.ganancia(0.5, g));
    this.n.motor = { a, b, lfo, f, g, rf };
  }

  cable() {
    const { ctx } = this, mk = (tipo, f, q, v) => { const s = this.generador(), bf = ctx.createBiquadFilter(); bf.type = tipo; bf.frequency.value = f; bf.Q.value = q; const g = this.ganancia(0, this.out); s.connect(bf); bf.connect(g); return { bf, g }; };
    this.n.cable = mk('bandpass', 1800, 1.2); this.n.giro = mk('bandpass', 260, 4); this.n.oruga = mk('lowpass', 220, 0.8);
    const w = this.fuente('sine', 320), wg = this.ganancia(0, this.out); w.connect(wg); this.n.whine = { w, g: wg };
    this.n.clank = this.fuente('square', 3); const cg = this.ganancia(0, this.out); this.n.clank.connect(cg); this.n.clank.g = cg;
  }

  tierraNodos() {
    const { ctx } = this, s = this.generador(), bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 900; bf.Q.value = 0.6;
    const g = this.ganancia(0, this.out); s.connect(bf); bf.connect(g); this.n.tierra = { g, bf };
    const s2 = this.generador(), bf2 = ctx.createBiquadFilter(); bf2.type = 'bandpass'; bf2.frequency.value = 2400; bf2.Q.value = 2.5;
    const g2 = this.ganancia(0, this.out); s2.connect(bf2); bf2.connect(g2); this.n.metal = { g: g2 };
  }

  camionNodos() {
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220;
    const g = this.ganancia(0, this.out), a = this.fuente('sawtooth', 36), b = this.fuente('square', 18);
    a.connect(f); b.connect(f); f.connect(g); this.n.camion = { a, b, g, f };
  }

  golpe(tipo, fuerza = 1) {                                    // sonidos puntuales: mordida, golpe de metal, descarga
    const { ctx } = this, t = ctx.currentTime; if (!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = this.ruido; const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = tipo === 'muerde' ? 'lowpass' : 'bandpass'; f.frequency.value = tipo === 'muerde' ? 700 : 1500; f.Q.value = tipo === 'muerde' ? 0.8 : 3;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9 * fuerza, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (tipo === 'muerde' ? 0.55 : 0.3));
    s.connect(f); f.connect(g); g.connect(this.out); s.start(t, Math.random()); s.stop(t + 0.7);
    for (const fr of tipo === 'metal' || tipo === 'muerde' ? [190, 410, 970] : []) {            // resonancias metálicas
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(fr * (0.96 + Math.random() * 0.08), t);
      og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.25 * fuerza, t + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(og); og.connect(this.out); o.start(t); o.stop(t + 0.5);
    }
  }

  actualizar(dt, c) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const { sim, n } = this, t = this.ctx.currentTime, k = (v, obj, r) => (obj + (v - obj) * 0);   // (ayuda de lectura)
    const mover = (a, b, r) => a + (b - a) * Math.min(1, r * dt);
    const act = Math.min(1, Math.max(Math.abs(c.giro), Math.abs(c.pluma), Math.abs(c.cable), Math.abs(c.avance) * 0.8, Math.abs(c.vuelta) * 0.6, Math.abs(c.almeja) * 0.7)), S = this.suave;
    S.act = mover(S.act, act, 3);
    const rpm = 0.2 + 0.8 * S.act, m = n.motor;
    m.a.frequency.setTargetAtTime(24 + 26 * rpm, t, 0.1); m.b.frequency.setTargetAtTime(12 + 13 * rpm, t, 0.1); m.lfo.frequency.setTargetAtTime(9 + 14 * rpm, t, 0.1);
    m.f.frequency.setTargetAtTime(220 + 700 * rpm, t, 0.1); m.rf.frequency.setTargetAtTime(150 + 200 * rpm, t, 0.1); m.g.gain.setTargetAtTime(0.26 + 0.22 * rpm, t, 0.1);
    const vc = Math.abs(sim.st.vcable) / 3.2, vg = Math.abs(sim.st.giroVel) / 11, vo = Math.abs(sim.st.avance) / 2.4 + Math.abs(sim.st.vuelta) / 22;
    S.cable = mover(S.cable, Math.max(vc, Math.abs(sim.st.vpluma) / 4.5 * 0.7), 8); S.giro = mover(S.giro, vg, 6); S.oru = mover(S.oru, Math.min(1, vo), 5);
    n.cable.g.gain.setTargetAtTime(0.28 * S.cable, t, 0.05); n.cable.bf.frequency.setTargetAtTime(1200 + 1600 * S.cable, t, 0.05);
    n.whine.w.frequency.setTargetAtTime(260 + 240 * S.cable, t, 0.05); n.whine.g.gain.setTargetAtTime(0.025 * S.cable, t, 0.05);
    n.giro.g.gain.setTargetAtTime(0.22 * S.giro, t, 0.05); n.giro.bf.frequency.setTargetAtTime(200 + 160 * S.giro, t, 0.05);
    n.oruga.g.gain.setTargetAtTime(0.4 * S.oru, t, 0.05); n.clank.frequency.setTargetAtTime(2 + 9 * S.oru, t, 0.1); n.clank.g.gain.setTargetAtTime(0.06 * S.oru, t, 0.05);
    // tierra cayendo: aterrizajes por segundo → ruido granular; en la caja del camión suena a golpes de chapa
    const ev = sim.particulas.eventos; let suelo = 0, caja = 0; for (let i = 0; i < ev.length; i += 4) ev[i + 3] ? caja++ : suelo++; ev.length = 0;
    S.tierra = mover(S.tierra, Math.min(1, suelo / (dt * 700)), 14); S.metal = mover(S.metal, Math.min(1, caja / (dt * 500)), 14);
    n.tierra.g.gain.setTargetAtTime(0.5 * S.tierra, t, 0.03); n.metal.g.gain.setTargetAtTime(0.32 * S.metal, t, 0.03);
    this.eventosSim(dt);
    const tc = sim.camiones, vt = tc.velocidadMax(), cm = n.camion;
    cm.g.gain.setTargetAtTime(Math.min(0.22, 0.02 + vt * 0.025) * (vt > 0.2 ? 1 : 0.15), t, 0.15); cm.a.frequency.setTargetAtTime(30 + vt * 4, t, 0.2); cm.b.frequency.setTargetAtTime(15 + vt * 2, t, 0.2); cm.f.frequency.setTargetAtTime(160 + vt * 40, t, 0.2);
  }

  eventosSim(dt) {
    const { sim } = this, e = sim.excavacion.eventos;
    for (let i = 0; i < e.length; i += 2) if (e[i] === 'muerde') { this.cierre += e[i + 1]; }
    e.length = 0;
    if (this.cierre > 0.12) { this.golpe('muerde', Math.min(1, 0.5 + this.cierre)); this.cierre = 0; this.mordTimer = 0; }
    const ab = sim.grua.estado.almeja; if (this.prevAbierta > 0.02 && ab <= 0.02) this.golpe('metal', 0.7); this.prevAbierta = ab;   // las valvas se cierran de golpe
    if (sim.fisica.enSuelo && !this.enSueloPrev) this.golpe('metal', 0.5); this.enSueloPrev = sim.fisica.enSuelo;
    const ct = sim.camiones.eventos; for (const x of ct) if (x === 'llega' || x === 'sale') this.golpe('metal', 0.35); ct.length = 0;
  }

  nivel() { if (!this.analizador) return 0; const d = new Uint8Array(this.analizador.fftSize); this.analizador.getByteTimeDomainData(d); let s = 0; for (const v of d) s += (v - 128) ** 2; return Math.sqrt(s / d.length) / 128; }
}

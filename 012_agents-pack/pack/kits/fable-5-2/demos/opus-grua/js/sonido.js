// Sonido generado en vivo con Web Audio: fuentes básicas (ruido, motor diésel, golpes) con posición 3D.
export class Audio3D {
  constructor() {
    const ctx = this.ctx = new AudioContext();
    this.maestro = ctx.createGain(); this.maestro.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    this.maestro.connect(comp).connect(ctx.destination);
    // Ruido rosado precalculado (4 s) que usan casi todas las fuentes
    const n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0527; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    this.ruidoBuf = b;
  }
  panner(x = 0, y = 0, z = 0) {
    const p = this.ctx.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse';
    p.refDistance = 8; p.rolloffFactor = 1.1; p.maxDistance = 400;
    p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z;
    p.connect(this.maestro); return p;
  }
  ruido(destino, { tipo = 'lowpass', f = 800, q = 0.7, gan = 0 } = {}) {
    const s = this.ctx.createBufferSource(); s.buffer = this.ruidoBuf; s.loop = true; s.loopStart = Math.random();
    const fil = this.ctx.createBiquadFilter(); fil.type = tipo; fil.frequency.value = f; fil.Q.value = q;
    const g = this.ctx.createGain(); g.gain.value = gan;
    s.connect(fil).connect(g).connect(destino); s.start(0, Math.random() * 3);
    return { fil, g };
  }
  // Diésel: diente de sierra + cuadrada desafinadas, saturadas y filtradas, con pulsos de combustión.
  motor(destino, { base = 38, gan = 0.3 } = {}) {
    const c = this.ctx, salida = c.createGain(); salida.gain.value = gan;
    const fil = c.createBiquadFilter(); fil.type = 'lowpass'; fil.frequency.value = 380; fil.Q.value = 1.4;
    const sat = c.createWaveShaper(); const curva = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curva[i] = Math.tanh(x * 2.6); } sat.curve = curva;
    const am = c.createGain(); am.gain.value = 0.55;
    const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = base;
    const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = base * 0.5; const g2 = c.createGain(); g2.gain.value = 0.45;
    const pulso = c.createOscillator(); pulso.type = 'sine'; pulso.frequency.value = base; const pg = c.createGain(); pg.gain.value = 0.45;
    pulso.connect(pg).connect(am.gain);
    o1.connect(sat); o2.connect(g2).connect(sat);
    const r = this.ruido(sat, { tipo: 'bandpass', f: 140, q: 0.8, gan: 0.7 });
    sat.connect(am).connect(fil).connect(salida).connect(destino);
    for (const o of [o1, o2, pulso]) o.start();
    return {
      salida, fil,
      poner(rpm, carga) {                            // rpm del motor (750–1900) y carga 0–1
        const f = rpm / 60 * 3, t = c.currentTime;    // 6 cilindros: 3 explosiones por vuelta
        o1.frequency.setTargetAtTime(f, t, 0.25); o2.frequency.setTargetAtTime(f * 0.5, t, 0.25); pulso.frequency.setTargetAtTime(f, t, 0.25);
        fil.frequency.setTargetAtTime(260 + carga * 900, t, 0.3); r.fil.frequency.setTargetAtTime(120 + carga * 300, t, 0.3);
      },
    };
  }
  // Golpe corto: metal (clank) o tierra (thud).
  golpe(destino, { f = 160, dur = 0.35, gan = 0.5, ruido = 0.5, fr = 1200 } = {}) {
    const c = this.ctx, t = c.currentTime, g = c.createGain();
    g.gain.setValueAtTime(gan, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); g.connect(destino);
    const o = c.createOscillator(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + dur);
    const go = c.createGain(); go.gain.value = 1 - ruido; o.connect(go).connect(g); o.start(t); o.stop(t + dur);
    const s = c.createBufferSource(); s.buffer = this.ruidoBuf; const fil = c.createBiquadFilter(); fil.type = 'bandpass'; fil.frequency.value = fr; fil.Q.value = 0.9;
    const gr = c.createGain(); gr.gain.value = ruido * 2; s.connect(fil).connect(gr).connect(g); s.start(t, Math.random() * 3); s.stop(t + dur);
  }
  mover(p, v) { const t = this.ctx.currentTime; p.positionX.setTargetAtTime(v.x, t, 0.05); p.positionY.setTargetAtTime(v.y, t, 0.05); p.positionZ.setTargetAtTime(v.z, t, 0.05); }
  oyente(cam) {
    const l = this.ctx.listener, t = this.ctx.currentTime, p = cam.position, f = cam.getWorldDirection(this._f ??= cam.position.clone());
    l.positionX.setTargetAtTime(p.x, t, 0.05); l.positionY.setTargetAtTime(p.y, t, 0.05); l.positionZ.setTargetAtTime(p.z, t, 0.05);
    l.forwardX.setTargetAtTime(f.x, t, 0.05); l.forwardY.setTargetAtTime(f.y, t, 0.05); l.forwardZ.setTargetAtTime(f.z, t, 0.05);
  }
}

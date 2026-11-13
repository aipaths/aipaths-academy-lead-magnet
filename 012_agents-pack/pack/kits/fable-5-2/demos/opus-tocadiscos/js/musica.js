// Música generada en vivo: lo-fi en re menor (ii–V–I–vi), piano eléctrico FM, bajo, batería y campanas.
// Todo se programa con anticipación sobre el reloj de WebAudio; nada es una grabación.

const mtof = (n) => 440 * 2 ** ((n - 69) / 12);

// Generador pseudoaleatorio con semilla: la canción varía por compás pero es repetible.
function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACORDES = [
  { notas: [53, 57, 60, 64], bajo: 38 }, // Dm9
  { notas: [53, 59, 64, 67], bajo: 43 }, // G13
  { notas: [52, 55, 59, 62], bajo: 36 }, // Cmaj9
  { notas: [55, 59, 60, 64], bajo: 33 }, // Am9
];
const ESCALA = [62, 65, 67, 69, 72, 74, 77, 79]; // re menor pentatónica

export class Musica {
  constructor(ctx, salida, desafine) {
    this.ctx = ctx;
    this.salida = salida;
    this.desafine = desafine;
    this.ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.rnd = azar(1200);
    this.tempo = 82;
    this.paso = 0;
  }

  osc(tipo, f, t, fin, destino) {
    const o = this.ctx.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    this.desafine.connect(o.detune);
    o.connect(destino);
    o.start(t);
    o.stop(fin);
    o.onended = () => {
      this.desafine.disconnect(o.detune);
    };
    return o;
  }

  env(t, pico, ataque, caida, dest = this.salida) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(pico, t + ataque);
    g.gain.setTargetAtTime(0, t + ataque, caida);
    g.connect(dest);
    return g;
  }

  // Piano eléctrico: portadora senoidal modulada en FM, índice que cae rápido (el "tine").
  rhodes(n, t, dur, vel) {
    const f = mtof(n),
      fin = t + dur + 1.2;
    const amp = this.env(t, 0.09 * vel, 0.006, dur * 0.55);
    const port = this.osc('sine', f, t, fin, amp);
    const indice = this.ctx.createGain();
    indice.gain.setValueAtTime(f * 1.6 * vel, t);
    indice.gain.setTargetAtTime(f * 0.25, t, 0.12);
    this.osc('sine', f, t, fin, indice);
    indice.connect(port.frequency);
  }

  bajo(n, t, dur) {
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.connect(this.env(t, 0.32, 0.01, dur * 0.6));
    this.osc('triangle', mtof(n), t, t + dur + 0.6, lp);
  }

  campana(n, t) {
    const amp = this.env(t, 0.035, 0.004, 0.5);
    this.osc('sine', mtof(n), t, t + 2.5, amp);
    this.osc('sine', mtof(n) * 3.01, t, t + 0.6, this.env(t, 0.008, 0.002, 0.12));
  }

  ruidoFiltrado(t, tipo, frec, pico, caida, q = 0.8) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.ruido;
    const f = this.ctx.createBiquadFilter();
    f.type = tipo;
    f.frequency.value = frec;
    f.Q.value = q;
    src.connect(f);
    f.connect(this.env(t, pico, 0.002, caida));
    src.start(t, Math.random() * 0.5, caida * 6);
  }

  bombo(t) {
    const o = this.osc('sine', 130, t, t + 0.5, this.env(t, 0.55, 0.003, 0.11));
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  }

  caja(t, v = 1) {
    this.ruidoFiltrado(t, 'bandpass', 1900, 0.2 * v, 0.06, 0.7);
    this.osc('triangle', 185, t, t + 0.15, this.env(t, 0.07 * v, 0.002, 0.03));
  }

  hat(t, v) {
    this.ruidoFiltrado(t, 'highpass', 7200, 0.05 * v, 0.018);
  }

  // Programa un paso de semicorchea; `t` ya incluye el swing.
  tocar(t, ritmo) {
    const s = this.paso % 16,
      compas = Math.floor(this.paso / 16),
      ac = ACORDES[compas % 4];
    const negra = 60 / (this.tempo * ritmo),
      r = this.rnd;
    if (s === 0) ac.notas.forEach((n, i) => this.rhodes(n, t + i * 0.012, negra * 3.2, 0.8 + r() * 0.2));
    if (s === 10 && r() < 0.6)
      ac.notas.slice(1).forEach((n, i) => this.rhodes(n + 12 * (i === 2), t + i * 0.01, negra * 1.2, 0.45));
    if (compas >= 2) {
      if (s === 0 || s === 7 || (s === 10 && r() < 0.7)) this.bombo(t);
      if (s === 4 || s === 12) this.caja(t);
      if (s === 15 && r() < 0.25) this.caja(t, 0.3);
      if (s % 2 === 0) this.hat(t, s % 4 === 0 ? 1 : 0.55 + r() * 0.3);
      else if (r() < 0.18) this.hat(t, 0.3);
      if (s === 0) this.bajo(ac.bajo, t, negra * 1.4);
      if (s === 6) this.bajo(ac.bajo, t, negra * 0.6);
      if (s === 10) this.bajo(ac.bajo + 7, t, negra * 0.8);
      if (s === 14 && r() < 0.5) this.bajo(ac.bajo + 12, t, negra * 0.4);
    }
    if (compas >= 4 && s % 2 === 0 && r() < 0.16) this.campana(ESCALA[Math.floor(r() * ESCALA.length)], t);
    this.paso++;
    return negra / 4;
  }
}

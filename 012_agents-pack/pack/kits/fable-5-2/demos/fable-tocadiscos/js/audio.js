// Motor de audio: la música y el crujido salen de buffers generados por código y se
// reproducen a la velocidad real del plato (playbackRate = rpm / 33⅓).
import { generarMusica } from './musica.js';
import { azar } from './texturas.js';

// Ruido de superficie: soplido, crujidos al azar y dos rayones que vuelven en cada vuelta (1,8 s).
function generarCrujido(ctx) {
  const sr = ctx.sampleRate, vuelta = Math.round(1.8 * sr), n = vuelta * 4;
  const buf = ctx.createBuffer(2, n, sr), r = azar(77);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  let lp = 0, grave = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    lp += (w - lp) * 0.22;
    grave += (w - grave) * 0.004;
    L[i] = lp * 0.011 + grave * 0.11;
    R[i] = lp * 0.011 * (0.7 + r() * 0.6) + grave * 0.11;
  }
  const chasquido = (pos, amp, largo) => {
    for (let i = 0; i < largo && pos + i < n; i++) {
      const v = amp * (1 - i / largo) ** 2 * (i % 2 ? -1 : 1) * (0.5 + r() * 0.5);
      L[pos + i] += v;
      R[pos + i] += v * (0.6 + r() * 0.5);
    }
  };
  for (let k = 0; k < 7.2 * 22; k++) chasquido(Math.floor(r() * n), 0.02 + r() ** 5 * 0.4, 4 + Math.floor(r() * 34));
  for (const [fase, amp] of [[0.31, 0.34], [0.74, 0.2]]) for (let v = 0; v < 4; v++) chasquido(Math.floor((v + fase) * vuelta), amp, 46);
  return buf;
}

export function crearAudio() {
  let ctx = null, master, musica = null, crujido = null, fuentes = null;
  let quiereSonar = false, rate = 0, volumen = 0.85, preparando = null, analizador = null;

  async function iniciar() {
    if (ctx) { if (ctx.state !== 'running') await ctx.resume(); return preparando; }
    ctx = new AudioContext({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = volumen;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 3;
    analizador = ctx.createAnalyser();
    master.connect(comp).connect(analizador).connect(ctx.destination);
    crujido = generarCrujido(ctx);
    preparando = generarMusica(ctx.sampleRate).then((b) => { musica = b; if (quiereSonar) arrancar(); });
    return preparando;
  }

  function golpe(t) { // el "toc" de la aguja al tocar el disco
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.25);
  }

  function arrancar() {
    if (fuentes || !musica) return;
    const t = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0, t); bus.gain.linearRampToValueAtTime(1, t + 0.03);
    const grave = ctx.createBiquadFilter(); grave.type = 'highpass'; grave.frequency.value = 38;
    bus.connect(grave).connect(master);
    const fuente = (buffer, vol, cuando) => {
      const s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = buffer; s.loop = true; g.gain.value = vol;
      s.playbackRate.value = Math.max(rate, 0.0001);
      s.connect(g).connect(bus); s.start(cuando);
      return s;
    };
    fuentes = { bus, c: fuente(crujido, 0.75, t), m: fuente(musica, 0.9, t + 1.5) }; // 1,5 s de surco de entrada
    golpe(t);
  }

  return {
    iniciar,
    get lista() { return !!musica; },
    bajarAguja() { quiereSonar = true; if (ctx) arrancar(); },
    subirAguja() {
      quiereSonar = false;
      if (!fuentes) return;
      const t = ctx.currentTime, f = fuentes;
      f.bus.gain.cancelScheduledValues(t); f.bus.gain.setValueAtTime(f.bus.gain.value, t); f.bus.gain.linearRampToValueAtTime(0, t + 0.04);
      f.c.stop(t + 0.08); f.m.stop(t + 0.08);
      fuentes = null;
    },
    // r = 1 a 33⅓ rpm. Se llama en cada cuadro; suma un lloro mínimo como el de un plato real.
    velocidad(r) {
      rate = r;
      if (!fuentes) return;
      const t = ctx.currentTime, lloro = 1 + Math.sin(t * 3.4) * 0.0012 + Math.sin(t * 41) * 0.0004;
      for (const s of [fuentes.c, fuentes.m]) s.playbackRate.setTargetAtTime(Math.max(0, r * lloro), t, 0.012);
    },
    clic() {
      if (!ctx) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.018);
      g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.04);
    },
    // Nivel de salida ahora mismo (RMS): sirve para comprobar sin parlantes que de verdad suena
    nivel() {
      if (!analizador) return 0;
      const d = new Float32Array(analizador.fftSize);
      analizador.getFloatTimeDomainData(d);
      return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length);
    },
    volumen(v) { volumen = v; if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.03); },
  };
}

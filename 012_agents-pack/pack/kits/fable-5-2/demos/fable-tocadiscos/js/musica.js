// La música del disco: un loop lo-fi de 8 compases escrito nota por nota y sintetizado
// con Web Audio (sin samples). Se renderiza una vez a un buffer para poder tocarlo a la
// velocidad del plato: si el plato frena, la música baja de tono como en un vinilo real.
import { azar } from './texturas.js';

const BPM = 84, NEGRA = 60 / BPM, COMPAS = NEGRA * 4, COMPASES = 8;
export const LARGO = COMPAS * COMPASES;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const swing = (pulso) => (Math.abs((pulso % 1) - 0.5) < 0.01 ? pulso + 0.085 : pulso);

// Acordes por compás: [pulso, bajo, voces]
const FMAJ9 = [41, [57, 60, 64, 67]], E7 = [40, [56, 59, 62, 67]], AM9 = [45, [55, 59, 60, 64]];
const GM9 = [43, [53, 57, 58, 62]], C13 = [48, [52, 57, 58, 62]], DM9 = [38, [53, 57, 60, 64]], G13 = [43, [53, 57, 59, 64]];
const ARMONIA = [[FMAJ9], [E7], [AM9], [GM9, C13], [FMAJ9], [E7], [AM9], [DM9, G13]];
// Melodía: [compás, pulso, nota, duración en pulsos]
const MELODIA = [
  [0, 0.5, 76, 0.5], [0, 1, 79, 1], [0, 2.5, 76, 0.5], [0, 3, 74, 0.5], [0, 3.5, 72, 1],
  [1, 1, 71, 0.75], [1, 2, 68, 0.5], [1, 2.5, 71, 0.5], [1, 3, 74, 1],
  [2, 0, 72, 1.5], [2, 2, 76, 0.5], [2, 2.5, 79, 0.5], [2, 3, 81, 1],
  [3, 0.5, 79, 0.5], [3, 1, 77, 0.5], [3, 1.5, 74, 1], [3, 2.5, 70, 0.5], [3, 3, 69, 0.5], [3, 3.5, 67, 0.5],
  [4, 0, 69, 1.5], [4, 2, 72, 0.5], [4, 2.5, 76, 1.5],
  [5, 0.5, 74, 0.5], [5, 1, 71, 0.5], [5, 1.5, 68, 1], [5, 3, 71, 0.5], [5, 3.5, 72, 0.5],
  [6, 0, 76, 2], [6, 2.5, 72, 0.5], [6, 3, 71, 0.5], [6, 3.5, 69, 0.5],
  [7, 0, 77, 1], [7, 1, 76, 0.5], [7, 1.5, 74, 1], [7, 2.5, 71, 0.5], [7, 3, 74, 1],
];

function instrumentos(ctx, salida, eco) {
  const ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const r = azar(99), d = ruido.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  const osc = (tipo, f, t0, t1) => { const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = f; o.start(t0); o.stop(t1); return o; };
  const gan = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const golpeRuido = (t, dur, filtro, f, vol, q = 0.7) => {
    const s = ctx.createBufferSource(); s.buffer = ruido;
    const fl = ctx.createBiquadFilter(); fl.type = filtro; fl.frequency.value = f; fl.Q.value = q;
    const g = gan(0); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(fl).connect(g).connect(salida);
    s.start(t, r() * 0.5, dur + 0.02);
    return g;
  };
  return {
    // Piano eléctrico por FM: la moduladora decae rápido y da el "ladrido" del ataque
    tecla(t, midi, dur, vel) {
      const f = hz(midi), fin = t + dur + 1.4;
      const env = gan(0);
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vel, t + 0.006);
      env.gain.setTargetAtTime(vel * 0.4, t + 0.006, 0.3); env.gain.setTargetAtTime(0, t + dur, 0.22);
      const mod = osc('sine', f, t, fin), idx = gan(0);
      idx.gain.setValueAtTime(f * 1.9 * vel * 3, t); idx.gain.exponentialRampToValueAtTime(f * 0.12, t + 0.5);
      mod.connect(idx);
      for (const [desafino, pan] of [[-5, -0.5], [5, 0.5]]) {
        const p = osc('sine', f, t, fin); p.detune.value = desafino; idx.connect(p.frequency);
        const pa = ctx.createStereoPanner(); pa.pan.value = pan;
        p.connect(pa).connect(env);
      }
      env.connect(salida); env.connect(eco);
    },
    bajo(t, midi, dur, vel) {
      const f = hz(midi), fin = t + dur + 0.3, env = gan(0);
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vel, t + 0.012);
      env.gain.setTargetAtTime(vel * 0.7, t + 0.012, 0.15); env.gain.setTargetAtTime(0, t + dur, 0.05);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
      osc('sine', f, t, fin).connect(env);
      const tri = osc('triangle', f * 2, t, fin), gt = gan(0.22); tri.connect(gt).connect(lp).connect(env);
      env.connect(salida);
    },
    bombo(t, vel) {
      const o = osc('sine', 130, t, t + 0.4), g = gan(0);
      o.frequency.setValueAtTime(135, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.1);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      o.connect(g).connect(salida);
      golpeRuido(t, 0.012, 'lowpass', 2500, vel * 0.25);
    },
    caja(t, vel) {
      golpeRuido(t, 0.15, 'bandpass', 1900, vel * 0.8).connect(eco);
      const o = osc('triangle', 188, t, t + 0.12), g = gan(0);
      g.gain.setValueAtTime(vel * 0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.connect(g).connect(salida);
    },
    platillo(t, vel, abierto) { golpeRuido(t, abierto ? 0.22 : 0.04, 'highpass', 6800, vel); },
    // Voz que canta la melodía: seno con vibrato que entra tarde
    voz(t, midi, dur, vel) {
      const f = hz(midi), fin = t + dur + 0.6, env = gan(0);
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vel, t + 0.035);
      env.gain.setTargetAtTime(vel * 0.75, t + 0.04, 0.2); env.gain.setTargetAtTime(0, t + dur, 0.12);
      const o = osc('sine', f, t, fin), o3 = osc('sine', f * 3, t, fin), g3 = gan(0.05);
      const vib = osc('sine', 5.2, t, fin), gv = gan(0);
      gv.gain.setValueAtTime(0, t + 0.15); gv.gain.linearRampToValueAtTime(f * 0.006, t + 0.4);
      vib.connect(gv); gv.connect(o.frequency);
      o.connect(env); o3.connect(g3).connect(env);
      env.connect(salida); env.connect(eco);
    },
  };
}

function reverb(ctx) {
  const n = Math.round(ctx.sampleRate * 1.5), ir = ctx.createBuffer(2, n, ctx.sampleRate), r = azar(4);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (r() * 2 - 1) * (1 - i / n) ** 3.2;
  }
  const cv = ctx.createConvolver(); cv.buffer = ir;
  return cv;
}

function escribir(ins, t0, r) {
  const en = (compas, pulso) => Math.max(0, t0 + compas * COMPAS + swing(pulso) * NEGRA + (r() - 0.5) * 0.008);
  ARMONIA.forEach((acordes, c) => {
    const partido = acordes.length === 2;
    acordes.forEach(([bajo, voces], k) => {
      const golpes = partido ? [[k * 2, 1.7]] : [[0, 1.5], [2.5, 1.3]];
      for (const [p, dur] of golpes) voces.forEach((n, i) => ins.tecla(en(c, p) + i * 0.012, n, dur * NEGRA, 0.105 + r() * 0.03));
      const b = partido ? [[k * 2, 1.4, 0], [k * 2 + 1.5, 0.4, 0]] : [[0, 1.3, 0], [2.5, 0.45, 0], [3, 0.8, c % 2 ? 7 : 12]];
      for (const [p, dur, salto] of b) ins.bajo(en(c, p), bajo + salto, dur * NEGRA, 0.5);
    });
    for (const p of c % 2 ? [0, 2.5, 3.5] : [0, 2.5]) ins.bombo(en(c, p), p === 3.5 ? 0.55 : 0.95);
    for (const p of [1, 3]) ins.caja(en(c, p), 0.42);
    for (let p = 0; p < 4; p += 0.5) ins.platillo(en(c, p), (p % 1 ? 0.07 : 0.13) + r() * 0.03, c % 4 === 3 && p === 3.5);
  });
  for (const [c, p, n, dur] of MELODIA) ins.voz(en(c, p), n, dur * NEGRA * 0.92, 0.2);
}

export async function generarMusica(sr) {
  const n = Math.round(LARGO * sr);
  const ctx = new OfflineAudioContext(2, n * 2, sr);
  const salida = ctx.createGain();
  const tono = ctx.createBiquadFilter(); tono.type = 'lowpass'; tono.frequency.value = 6200; tono.Q.value = 0.5;
  const eco = ctx.createGain(); eco.gain.value = 0.3;
  eco.connect(reverb(ctx)).connect(tono);
  salida.connect(tono).connect(ctx.destination);
  const ins = instrumentos(ctx, salida, eco);
  // Se escribe dos veces y se guarda la segunda vuelta: así la cola de la reverb empalma sola
  for (const vuelta of [0, 1]) escribir(ins, vuelta * LARGO, azar(1234));
  const crudo = await ctx.startRendering();
  const buf = new AudioBuffer({ numberOfChannels: 2, length: n, sampleRate: sr });
  let pico = 0;
  for (let c = 0; c < 2; c++) {
    const d = crudo.getChannelData(c).subarray(n, n * 2);
    for (let i = 0; i < n; i++) pico = Math.max(pico, Math.abs(d[i]));
    buf.copyToChannel(d, c);
  }
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) d[i] *= 0.82 / pico; }
  return buf;
}

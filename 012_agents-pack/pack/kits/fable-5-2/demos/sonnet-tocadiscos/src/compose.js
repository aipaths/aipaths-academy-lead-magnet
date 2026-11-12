// Composición del «lado A»: tres temas lo-fi generados por código. Devuelve una línea de tiempo por pasos (semicorcheas).
import { rng } from './util.js';

const Q = { // intervalos sin fundamental (voicing «rootless»)
  m9: [3, 7, 10, 14], maj9: [4, 7, 11, 14], '13': [4, 10, 14, 21], alt: [4, 10, 13, 20],
  m7: [3, 7, 10, 12], maj7: [4, 7, 11, 14], '9': [4, 7, 10, 14], m11: [3, 7, 10, 17],
};

const TRACKS = [
  { name: 'Café con vinilo', bpm: 82, bars: 16, swing: 0.16, seed: 11, scale: [0, 2, 3, 5, 7, 9, 10],
    chords: [[2, 'm9'], [7, '13'], [0, 'maj9'], [9, 'alt']], kick: 'x.....x.x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    comp: ['x..x..x.....x...', 'x.....x..x......'], bass: 'x.....x...x.x...', pad: false },
  { name: 'Lluvia en el balcón', bpm: 98, bars: 16, swing: 0.1, seed: 23, scale: [0, 2, 4, 7, 9],
    chords: [[5, 'maj9'], [4, 'm7'], [2, 'm9'], [7, '13']], kick: 'x.....x...x.....', snare: '....x.......x..x', hat: 'x.xxx.xxx.xxx.xx',
    comp: ['x...x...x..x....', 'x.x...x...x.....'], bass: 'x..x....x..x....', pad: false },
  { name: 'Última aguja', bpm: 70, bars: 12, swing: 0.2, seed: 37, scale: [0, 3, 5, 7, 10],
    chords: [[9, 'm9'], [2, 'm11'], [7, 'maj7'], [4, '13']], kick: 'x.......x.......', snare: '........x.......', hat: '..x...x...x...x.',
    comp: ['x.......x.......', 'x.....x.........'], bass: 'x.......x.......', pad: true },
];

const midiOf = (pc, oct) => pc + 12 * (oct + 1);
const on = (str, i) => str[i % 16] === 'x';

function voicing(pc, quality) {
  return Q[quality].map((iv) => { let n = 48 + pc + iv; while (n > 74) n -= 12; while (n < 55) n += 12; return n; });
}

function bar(tr, b, rnd, motif) {
  const steps = Array.from({ length: 16 }, () => []);
  const [pc, q] = tr.chords[Math.floor(b / 2) % 4];
  const notes = voicing(pc, q), full = b >= 2 && b < tr.bars - 1, outro = b === tr.bars - 1;
  const comp = tr.comp[b % 2];
  for (let i = 0; i < 16; i++) {
    if (on(comp, i) && !(outro && i > 0)) for (const n of notes) steps[i].push({ k: 'ep', n, dur: 1.6, vel: 0.05 + rnd() * 0.012 });
    if (on(tr.bass, i) && !outro) steps[i].push({ k: 'bass', n: midiOf(pc, 1) + (i % 8 === 6 ? 7 : 0), dur: 0.5, vel: 0.2 });
    if (b >= 1 && on(tr.hat, i) && !outro) steps[i].push({ k: 'hat', vel: i % 4 === 0 ? 0.05 : 0.028 });
    if (full && on(tr.kick, i)) steps[i].push({ k: 'kick', vel: 0.55 });
    if (full && on(tr.snare, i)) steps[i].push({ k: 'snare', vel: 0.3 });
  }
  if (tr.pad && b % 2 === 0) steps[0].push(...notes.slice(0, 3).map((n) => ({ k: 'pad', n: n - 12, dur: 5, vel: 0.03 })));
  if (b >= 4 && !outro) addMelody(tr, b, rnd, motif, notes, steps);
  return steps;
}

function addMelody(tr, b, rnd, motif, notes, steps) {
  if (b % 4 === 0 || !motif.length) { motif.length = 0; for (let i = 0; i < 16; i += 2) if (rnd() < 0.34) motif.push(i); }
  motif.forEach((i, j) => {
    const pool = [...notes, notes[0] + 12, notes[1] + 12];
    const n = (b % 4 < 2) ? pool[(j * 3 + b) % pool.length] : pool[(j * 2 + 1) % pool.length];
    steps[i].push({ k: 'bell', n: Math.min(n + 12, 88), dur: 0.9, vel: 0.045 });
  });
}

/** Lado completo: entrada, 3 temas con pausas, y salida con el surco final. */
export function composeSide() {
  const steps = [], segs = [];
  const add = (name, n, dur, r0, r1, gen) => {
    const start = steps.length;
    for (let i = 0; i < n; i++) steps.push({ d: dur, sw: 0, ev: gen ? gen(i) : [] });
    segs.push({ name, start, end: steps.length, r0, r1 });
  };
  add('entrada', 10, 0.15, 14.55, 14.45);
  const radii = [[14.45, 11.65], [11.35, 9.15], [8.85, 6.55]];
  TRACKS.forEach((tr, t) => {
    const rnd = rng(tr.seed), motif = [], dur = 60 / tr.bpm / 4, bars = [];
    for (let b = 0; b < tr.bars; b++) bars.push(bar(tr, b, rnd, motif));
    add(tr.name, tr.bars * 16, dur, radii[t][0], radii[t][1], (i) => {
      const ev = bars[Math.floor(i / 16)][i % 16].map((e) => ({ ...e, sw: i % 2 ? tr.swing * dur : 0 }));
      if (i % 16 === 0 && Math.floor(i / 16) === tr.bars - 1) ev.push({ k: 'ep', n: 62, dur: 3, vel: 0 });
      return ev;
    });
    if (t < 2) add('pausa', 12, 0.18, radii[t][1], radii[t + 1][0]);
  });
  add('surco final', 22, 0.15, 6.55, 6.3);
  return { steps, segs, names: TRACKS.map((t) => t.name) };
}

// Deterministic music bed for the intro: 120 BPM, A minor, 20 s.
// Every scene cut (3, 7, 12, 15, 18 s) lands on a beat (beat = 0.5 s).
// Usage: node scripts/synth-bed.ts assets/audio/bed.wav
import { writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 20;
const BEAT = 0.5;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

// Seeded LCG — no Math.random, same file every run.
let seed = 0x5eed;
const rand = (): number => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
};

const midi = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);
const add = (i: number, v: number, pan = 0): void => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan) * 0.5 * 2;
  R[i] += v * (1 + pan) * 0.5 * 2;
};

// Am – F – C – G, one chord per bar (2 s). Root + third + fifth (+ octave).
const CHORDS = [
  [57, 60, 64, 69],
  [53, 57, 60, 65],
  [48, 55, 60, 64],
  [55, 59, 62, 67],
];
const chordAt = (t: number): number[] => CHORDS[Math.floor(t / 2) % 4];

function pad(): void {
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const bar = t % 2;
    const swell =
      Math.min(1, bar / 0.6) *
      (0.75 + 0.25 * Math.cos((bar / 2) * Math.PI * 2));
    let sL = 0;
    let sR = 0;
    for (const n of chordAt(t)) {
      const f = midi(n);
      // Two slightly detuned saws per voice, spread across the stereo field.
      sL += ((t * f * 1.003) % 1) * 2 - 1;
      sR += ((t * f * 0.997) % 1) * 2 - 1;
    }
    const cutoff =
      t < 3
        ? 0.02 + 0.03 * (t / 3)
        : t < 18
          ? 0.06
          : 0.06 - 0.04 * ((t - 18) / 2);
    lpL += cutoff * (sL - lpL);
    lpR += cutoff * (sR - lpR);
    L[i] += lpL * 0.09 * swell;
    R[i] += lpR * 0.09 * swell;
  }
}

function kick(at: number, gain = 1): void {
  const len = Math.floor(0.35 * SR);
  let phase = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const f = 48 + 110 * Math.exp(-t * 28);
    phase += (2 * Math.PI * f) / SR;
    add(
      Math.floor(at * SR) + k,
      Math.sin(phase) * Math.exp(-t * 9) * 0.3 * gain,
    );
  }
}

function hat(at: number, gain: number, pan: number): void {
  const len = Math.floor(0.05 * SR);
  let prev = 0;
  for (let k = 0; k < len; k++) {
    const n = rand() * 2 - 1;
    const hp = n - prev; // crude high-pass: keeps the "tick"
    prev = n;
    add(
      Math.floor(at * SR) + k,
      hp * Math.exp(-(k / SR) * 90) * 0.08 * gain,
      pan,
    );
  }
}

function clap(at: number): void {
  const len = Math.floor(0.18 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const burst = t < 0.03 ? 1 - ((t * 100) % 1) * 0.6 : 1;
    add(
      Math.floor(at * SR) + k,
      (rand() * 2 - 1) * Math.exp(-t * 22) * burst * 0.07,
    );
  }
}

function bass(at: number, note: number, len: number): void {
  const f = midi(note);
  const n = Math.floor(len * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const saw = ((t * f) % 1) * 2 - 1;
    lp += (0.04 + 0.12 * Math.exp(-t * 18)) * (saw - lp);
    const env = Math.min(1, t / 0.005) * Math.exp(-t * 4);
    add(Math.floor(at * SR) + k, lp * env * 0.22);
  }
}

function bell(at: number, note: number, gain: number): void {
  const f = midi(note);
  const n = Math.floor(1.8 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const s =
      Math.sin(2 * Math.PI * f * t) +
      0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6);
    add(Math.floor(at * SR) + k, s * Math.exp(-t * 2.2) * 0.07 * gain, 0.2);
  }
}

function rhythm(): void {
  for (let b = 0; b < DUR / BEAT; b++) {
    const t = b * BEAT;
    // Intro: a soft "clock" — 16th ticks only (frames ticking by).
    for (let s = 0; s < 4; s++) {
      const ts = t + (s * BEAT) / 4;
      if (ts < 18)
        hat(
          ts,
          ts < 3 ? 0.5 + (s === 0 ? 0.4 : 0) : s === 2 ? 1.1 : 0.55,
          s % 2 ? 0.3 : -0.3,
        );
    }
    if (t >= 3 && t < 18) {
      kick(t, t >= 7 ? 1 : 0.8);
      bass(t + BEAT / 2, chordAt(t)[0] - 12, BEAT / 2);
      if (t >= 7 && b % 2 === 1) clap(t);
    }
  }
  kick(18, 1.1); // final downbeat, then the bed opens up
}

function melody(): void {
  // Bells mark the beats the picture leans on.
  bell(0.95, 81, 0.8); // "Se programó."
  [3, 7, 12, 15].forEach((t) => bell(t, chordAt(t)[3] + 12, 0.5));
  bell(18, 81, 1);
  bell(18.6, 88, 0.7); // the green dot
}

function masterAndWrite(path: string): void {
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 0.3) * Math.min(1, (DUR - t) / 1.2);
    L[i] = Math.tanh(L[i] * 2.4 * fade);
    R[i] = Math.tanh(R[i] * 2.4 * fade);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const gain = 0.89 / peak;
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + N * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

pad();
rhythm();
melody();
masterAndWrite(process.argv[2] ?? "assets/audio/bed.wav");

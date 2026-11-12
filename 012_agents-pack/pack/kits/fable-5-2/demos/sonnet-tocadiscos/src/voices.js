// Instrumentos sintetizados con Web Audio: piano eléctrico, bajo, batería, campanita y colchón.
const hz = (n, s) => 440 * Math.pow(2, (n - 69) / 12) * s;

function env(ctx, g, t, peak, a, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0003, t + dur);
}

function osc(ctx, type, f, t, dur, dest, det = 0) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
  o.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  return o;
}

function noise(ctx, buf, t, dur, dest) {
  const s = ctx.createBufferSource(); s.buffer = buf; s.connect(dest);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

/** Piano eléctrico: fundamental + armónico + «tine» metálico del ataque. */
export function ep(ctx, out, t, n, dur, vel, s) {
  const f = hz(n, s), g = ctx.createGain(); env(ctx, g, t, vel, 0.006, dur); g.connect(out);
  osc(ctx, 'sine', f, t, dur, g, (Math.random() - 0.5) * 8);
  const g2 = ctx.createGain(); env(ctx, g2, t, 0.45, 0.004, dur * 0.4); g2.connect(g);
  osc(ctx, 'sine', f * 2, t, dur, g2);
  const g3 = ctx.createGain(); env(ctx, g3, t, 0.22, 0.002, 0.12); g3.connect(g);
  osc(ctx, 'sine', f * 7.01, t, 0.15, g3);
}

export function bass(ctx, out, t, n, dur, vel, s) {
  const g = ctx.createGain(); env(ctx, g, t, vel, 0.01, dur + 0.25);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; g.connect(lp); lp.connect(out);
  osc(ctx, 'triangle', hz(n, s), t, dur + 0.3, g);
  osc(ctx, 'sine', hz(n, s) * 2, t, dur, g, 4);
}

export function bell(ctx, out, t, n, dur, vel, s) {
  const f = hz(n, s), g = ctx.createGain(); env(ctx, g, t, vel, 0.004, dur); g.connect(out);
  osc(ctx, 'sine', f, t, dur, g);
  const g2 = ctx.createGain(); env(ctx, g2, t, 0.3, 0.003, dur * 0.25); g2.connect(g);
  osc(ctx, 'sine', f * 3.99, t, dur, g2);
}

export function pad(ctx, out, t, n, dur, vel, s) {
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + 1.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; g.connect(lp); lp.connect(out);
  osc(ctx, 'sawtooth', hz(n, s), t, dur, g, -7); osc(ctx, 'sawtooth', hz(n, s), t, dur, g, 7);
}

export function kick(ctx, out, t, vel, s) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(140 * s, t); o.frequency.exponentialRampToValueAtTime(42 * s, t + 0.13);
  env(ctx, g, t, vel, 0.002, 0.34); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.4);
}

export function snare(ctx, out, t, vel, s, nb) {
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900 * s; bp.Q.value = 0.7;
  const g = ctx.createGain(); env(ctx, g, t, vel, 0.002, 0.2); bp.connect(g); g.connect(out); noise(ctx, nb, t, 0.22, bp);
  const g2 = ctx.createGain(); env(ctx, g2, t, vel * 0.5, 0.002, 0.1); g2.connect(out); osc(ctx, 'triangle', 190 * s, t, 0.12, g2);
}

export function hat(ctx, out, t, vel, s, nb) {
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
  const g = ctx.createGain(); env(ctx, g, t, vel, 0.001, 0.05); hp.connect(g); g.connect(out); noise(ctx, nb, t, 0.06, hp);
}

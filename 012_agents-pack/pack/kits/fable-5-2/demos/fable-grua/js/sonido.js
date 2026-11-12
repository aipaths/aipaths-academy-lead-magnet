// Todo el sonido se genera por código (Web Audio), sin grabaciones: motor diésel, cabrestante,
// giro, orugas, la almeja mordiendo y golpeando, la tierra cayendo y el camión.
export class Sonido {
  constructor() { this.listo = false; this.mudo = false; this.tramo = 0; this.caida = 0; this.chapa = 0; }

  arrancar() {
    if (this.listo) return; this.listo = true;
    const c = (this.c = new (window.AudioContext || window.webkitAudioContext)());
    this.salida = c.createGain(); this.salida.gain.value = 0.8;
    const comp = c.createDynamicsCompressor(); this.medidor = c.createAnalyser(); this.medidor.fftSize = 2048;
    this.salida.connect(comp).connect(this.medidor).connect(c.destination);
    // ruido blanco y marrón, en bucle: la materia prima de casi todo
    const n = c.sampleRate * 3, bb = c.createBuffer(1, n, c.sampleRate), bm = c.createBuffer(1, n, c.sampleRate);
    const db = bb.getChannelData(0), dm = bm.getChannelData(0); let ult = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; db[i] = w; ult = (ult + 0.02 * w) / 1.02; dm[i] = ult * 3.5; }
    this.blanco = bb; this.marron = bm;
    // motor diésel: dos dientes de sierra graves + el traqueteo de la combustión + ruido de fondo
    this.motor = this.voz(0.0);
    this.osc = [c.createOscillator(), c.createOscillator()]; const fm = c.createBiquadFilter(); fm.type = 'lowpass'; fm.frequency.value = 260;
    this.osc.forEach((o, i) => { o.type = 'sawtooth'; o.frequency.value = 29 * (i ? 2.01 : 1); o.connect(fm); o.start(); });
    const trem = c.createGain(); trem.gain.value = 0.55; this.lfo = c.createOscillator(); this.lfo.type = 'square'; this.lfo.frequency.value = 14.5;
    const prof = c.createGain(); prof.gain.value = 0.45; this.lfo.connect(prof).connect(trem.gain); this.lfo.start();
    fm.connect(trem).connect(this.motor);
    this.bucle(bm, 'lowpass', 180, 1).connect(this.motor);
    this.motor.gain.value = 0.26;
    // voces continuas, cada una con su volumen
    this.cabrestante = this.voz(0); this.fCab = this.bucle(bb, 'bandpass', 1400, 5, this.cabrestante);
    this.zumbido = c.createOscillator(); this.zumbido.type = 'triangle'; this.zumbido.frequency.value = 380; this.zumbido.connect(this.cabrestante); this.zumbido.start();
    this.giro = this.voz(0); const og = c.createOscillator(); og.type = 'sawtooth'; og.frequency.value = 96; const fg = c.createBiquadFilter(); fg.type = 'lowpass'; fg.frequency.value = 420; og.connect(fg).connect(this.giro); og.start(); this.oGiro = og;
    this.tierra = this.voz(0); this.bucle(bb, 'bandpass', 1900, 0.7, this.tierra); this.bucle(bm, 'lowpass', 500, 1, this.tierra);
    this.enChapa = this.voz(0); this.bucle(bb, 'bandpass', 420, 6, this.enChapa); this.bucle(bb, 'bandpass', 2600, 3, this.enChapa);
    this.camion = this.voz(0); this.oCam = c.createOscillator(); this.oCam.type = 'sawtooth'; this.oCam.frequency.value = 48; const fc = c.createBiquadFilter(); fc.type = 'lowpass'; fc.frequency.value = 340; this.oCam.connect(fc).connect(this.camion); this.oCam.start();
    this.bucle(bm, 'lowpass', 240, 1, this.camion);
  }
  voz(g) { const v = this.c.createGain(); v.gain.value = g; v.connect(this.salida); return v; }
  bucle(buf, tipo, f, q, destino) {
    const s = this.c.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = Math.random();
    const fl = this.c.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); s.start(0, Math.random() * 2);
    if (destino) fl.connect(destino); return fl;
  }
  // Un golpe de ruido filtrado con caída: sirve para el crujido, el polvo y los clanc.
  golpe(buf, tipo, f, q, vol, dur, retraso = 0) {
    const c = this.c, t = c.currentTime + retraso, s = c.createBufferSource(); s.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(fl).connect(g).connect(this.salida); s.start(t, Math.random() * 2, dur + 0.05);
  }
  tono(f, vol, dur, tipo = 'sine', retraso = 0, fFin = f) {
    const c = this.c, t = c.currentTime + retraso, o = c.createOscillator(), g = c.createGain(); o.type = tipo;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(fFin, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g).connect(this.salida); o.start(t); o.stop(t + dur + 0.05);
  }
  clanc(vol = 0.25) { for (const [f, d] of [[311, 0.5], [527, 0.38], [816, 0.3], [1293, 0.2], [2110, 0.12]]) this.tono(f * (0.97 + Math.random() * 0.06), vol * 0.4, d, 'sine'); this.golpe(this.blanco, 'bandpass', 2400, 2, vol, 0.08); }
  mordida(fuerza) { for (let i = 0; i < 7; i++) this.golpe(this.blanco, 'bandpass', 500 + Math.random() * 1400, 1.2, 0.22 * fuerza, 0.12 + Math.random() * 0.16, i * 0.07 + Math.random() * 0.04); this.golpe(this.marron, 'lowpass', 220, 1, 0.7 * fuerza, 0.6); }
  bocina() { this.tono(392, 0.12, 0.35, 'square', 0.1); this.tono(311, 0.12, 0.35, 'square', 0.1); this.golpe(this.blanco, 'highpass', 3500, 1, 0.12, 0.5); }

  // Cada cuadro: los volúmenes y tonos siguen lo que está haciendo la máquina.
  actualizar(dt, { e, mando, pendulo, camiones, caidas, enCaja }) {
    if (!this.listo) return;
    const c = this.c, t = c.currentTime, k = 0.08, a = (p, v) => p.setTargetAtTime(v, t, k);
    const esfuerzo = Math.min(1, Math.abs(e.vGiro) * 2 + Math.abs(e.vCable) * 0.45 + Math.abs(e.vPluma) * 8 + (Math.abs(e.vIzq) + Math.abs(e.vDer)) * 0.6 + (mando.almeja ? 0.3 : 0));
    const f = 29 + esfuerzo * 17; a(this.osc[0].frequency, f); a(this.osc[1].frequency, f * 2.01); a(this.lfo.frequency, f / 2); a(this.motor.gain, 0.26 + esfuerzo * 0.3);
    const vc = Math.abs(e.vCable); a(this.cabrestante.gain, Math.min(0.2, vc * 0.14)); a(this.fCab.frequency, 900 + vc * 700); a(this.zumbido.frequency, 250 + vc * 260);
    a(this.giro.gain, Math.min(0.16, Math.abs(e.vGiro) * 0.55)); a(this.oGiro.frequency, 70 + Math.abs(e.vGiro) * 130);
    // orugas: un clanc metálico cada vez que apoya una zapata
    this.tramo += (Math.abs(e.vIzq) + Math.abs(e.vDer)) * dt * 0.5;
    if (this.tramo > 0.22) { this.tramo = 0; this.golpe(this.blanco, 'bandpass', 1100 + Math.random() * 900, 4, 0.16, 0.07); this.tono(140 + Math.random() * 40, 0.1, 0.09, 'square'); }
    // tierra cayendo: el volumen sigue a cuántos terrones tocan el suelo o la chapa por segundo
    this.caida += (Math.min(1, caidas / 14) - this.caida) * Math.min(1, dt * 10); this.chapa += (Math.min(1, enCaja / 14) - this.chapa) * Math.min(1, dt * 10);
    a(this.tierra.gain, this.caida * 0.5); a(this.enChapa.gain, this.chapa * 0.3);
    const ev = pendulo.eventos;
    if (ev.mordida) { if (!this.mordiendo) this.mordida(ev.mordida); this.mordiendo = 0.5; ev.mordida = 0; }
    this.mordiendo = Math.max(0, (this.mordiendo || 0) - dt);
    if (ev.golpe) { this.tono(70, 0.6 * ev.golpe, 0.35, 'sine', 0, 32); this.golpe(this.marron, 'lowpass', 300, 1, 0.8 * ev.golpe, 0.4); this.clanc(0.12 * ev.golpe); ev.golpe = 0; }
    ev.suelta = 0;
    if (e.apertura <= 0 && this.apAnt > 0) this.clanc(0.22);          // las valvas se cierran: chapa contra chapa
    if (e.apertura >= 1 && this.apAnt < 1) this.clanc(0.1);
    this.apAnt = e.apertura;
    // camión: se oye más cuanto más cerca pasa, y el motor sube con la velocidad
    let vol = 0, rpm = 48;
    for (const cam of camiones.lista) if (cam.grupo.visible) { const cerca = 1 / (1 + Math.abs(cam.x - e.x) / 18); const g = (0.1 + Math.min(1, cam.v / 5) * 0.5) * cerca; if (g > vol) { vol = g; rpm = 48 + cam.v * 9; } }
    a(this.camion.gain, vol * 0.5); a(this.oCam.frequency, rpm);
    this.salida.gain.setTargetAtTime(this.mudo ? 0 : 0.8, t, 0.05);
  }
  // Nivel de salida (RMS), para poder verificar sin parlantes que de verdad suena.
  nivel() { if (!this.listo) return 0; const b = new Float32Array(2048); this.medidor.getFloatTimeDomainData(b); let s = 0; for (const x of b) s += x * x; return Math.sqrt(s / b.length); }
}

// Motor de audio: cadena "de vinilo" (filtro, saturación suave), crujido, wow y frenado del plato.
import { Musica } from './musica.js';

const RPS33 = 33.333 / 60;

// Crujido de vinilo: soplido, retumbe grave, clics finos y algún pop grande. 6 s en bucle.
function bufferCrujido(ctx) {
  const sr = ctx.sampleRate,
    n = sr * 6,
    b = ctx.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let lp = 0,
      ret = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      lp += (w - lp) * 0.08;
      ret += (w - ret) * 0.004;
      d[i] = lp * 0.022 + ret * 0.09;
    }
    const clic = (amp, largo) => {
      const p = Math.floor(Math.random() * (n - largo)),
        s = Math.random() < 0.5 ? -1 : 1;
      for (let k = 0; k < largo; k++) d[p + k] += s * amp * Math.exp(-k / (largo / 5)) * (k % 2 ? -0.6 : 1);
    };
    for (let k = 0; k < 6 * 28; k++) clic(0.04 + Math.random() * 0.16, 12 + Math.floor(Math.random() * 30));
    for (let k = 0; k < 6 * 1.5; k++) clic(0.3 + Math.random() * 0.35, 120 + Math.floor(Math.random() * 200));
  }
  return b;
}

export class Audio {
  iniciar() {
    if (this.ctx) return this.ctx.resume();
    const ctx = (this.ctx = new AudioContext());
    this.salida = ctx.createGain();
    this.salida.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    comp.connect(this.salida);
    this.salida.connect(ctx.destination);
    // Música → filtro de vinilo → saturación suave → compresor
    this.musica = ctx.createGain();
    this.musica.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 7800;
    lp.Q.value = 0.4;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 38;
    const sat = ctx.createWaveShaper();
    const curva = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = i / 511.5 - 1;
      curva[i] = Math.tanh(x * 1.6) / Math.tanh(1.6);
    }
    sat.curve = curva;
    this.musica.connect(hp);
    hp.connect(lp);
    lp.connect(sat);
    sat.connect(comp);
    // Bus de desafinación en cents: pitch del fader + wow a la frecuencia de giro + frenado
    this.desafine = ctx.createConstantSource();
    this.desafine.start();
    this.wow = ctx.createOscillator();
    this.wow.frequency.value = RPS33;
    const wowG = ctx.createGain();
    wowG.gain.value = 7;
    this.wow.connect(wowG);
    wowG.connect(this.desafine.offset);
    this.wow.start();
    // Crujido
    this.crujido = ctx.createGain();
    this.crujido.gain.value = 0;
    const hpC = ctx.createBiquadFilter();
    hpC.type = 'highpass';
    hpC.frequency.value = 25;
    this.crujido.connect(hpC);
    hpC.connect(comp);
    this.fuente = ctx.createBufferSource();
    this.fuente.buffer = bufferCrujido(ctx);
    this.fuente.loop = true;
    this.fuente.connect(this.crujido);
    this.fuente.start();
    this.motor = new Musica(ctx, this.musica, this.desafine);
    this.ritmo = 1;
    return ctx.resume();
  }

  // Pitch del fader (−8 a +8 %): cambia tono y tempo juntos, como en un tocadiscos.
  pitch(pct) {
    this.ritmo = 1 + pct / 100;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.desafine.offset.setTargetAtTime(1200 * Math.log2(this.ritmo), t, 0.08);
    this.fuente.playbackRate.setTargetAtTime(this.ritmo, t, 0.08);
  }

  // La aguja toca el disco: golpe grave, sube el crujido y, tras el surco de entrada, la música.
  bajarAguja(entrada = 1.4) {
    const c = this.ctx,
      t = c.currentTime;
    const o = c.createOscillator(),
      g = c.createGain();
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.15);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g);
    g.connect(this.salida);
    o.start(t);
    o.stop(t + 0.3);
    this.crujido.gain.cancelScheduledValues(t);
    this.crujido.gain.setTargetAtTime(0.9, t, 0.02);
    this.musica.gain.cancelScheduledValues(t);
    this.musica.gain.setValueAtTime(0, t);
    this.musica.gain.setTargetAtTime(1, t + entrada, 0.05);
    this.pitch((this.ritmo - 1) * 100);
    this.motor.paso = 0;
    this.sinMusica = false;
    this.proximo = t + entrada;
    this.vuelta = t + 0.3;
    clearInterval(this.reloj);
    this.reloj = setInterval(() => this.programar(), 25);
  }

  programar() {
    const c = this.ctx,
      limite = c.currentTime + 0.12;
    while (!this.sinMusica && this.proximo < limite) {
      const swing = this.motor.paso % 2 ? 0.035 : -0.035;
      const dur = this.motor.tocar(this.proximo, this.ritmo);
      this.proximo += dur * (1 + swing * 2);
    }
    // Un clic por vuelta: una marquita en el disco que pasa bajo la aguja
    while (this.vuelta < limite) {
      this.motor.ruidoFiltrado(this.vuelta, 'bandpass', 2600, 0.06, 0.004, 1.2);
      this.vuelta += 1 / (RPS33 * this.ritmo);
    }
  }

  // Fin del lado: sólo queda el surco de salida (crujido y clic por vuelta).
  surcoFinal() {
    const t = this.ctx.currentTime;
    this.musica.gain.setTargetAtTime(0, t, 0.4);
    this.sinMusica = true;
  }

  // Botón de stop con la aguja apoyada: el plato frena y la música baja de tono hasta morir.
  frenar(seg = 0.9) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    clearInterval(this.reloj);
    this.desafine.offset.cancelScheduledValues(t);
    this.desafine.offset.setValueAtTime(this.desafine.offset.value, t);
    this.desafine.offset.linearRampToValueAtTime(-2400, t + seg);
    this.fuente.playbackRate.linearRampToValueAtTime(0.3, t + seg);
    this.musica.gain.setTargetAtTime(0, t + seg * 0.4, seg * 0.25);
    this.crujido.gain.setTargetAtTime(0, t + seg * 0.5, seg * 0.2);
    setTimeout(() => this.pitch((this.ritmo - 1) * 100), (seg + 0.6) * 1000);
  }

  // Aguja arriba sin frenar (fin del disco): corta todo rápido.
  levantarAguja() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    clearInterval(this.reloj);
    this.musica.gain.setTargetAtTime(0, t, 0.03);
    this.crujido.gain.setTargetAtTime(0, t, 0.03);
  }
}

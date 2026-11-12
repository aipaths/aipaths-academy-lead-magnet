// Mezcla del sonido según lo que pasa en la obra: motor de la grúa, cabrestante y cable, giro,
// la almeja mordiendo y cerrando, la tierra cayendo y el camión.
import * as THREE from 'three';
import { Audio3D } from './sonido.js';

export class Sonido {
  constructor() { this.listo = false; this.mudo = false; this.v = new THREE.Vector3(); }

  arrancar() {
    if (this.listo) { this.a.ctx.resume(); return; }
    const a = this.a = new Audio3D();
    this.pGrua = a.panner(); this.pAlmeja = a.panner(); this.pCamion = a.panner();
    this.motor = a.motor(this.pGrua, { base: 38, gan: 0.42 });
    this.cabrestante = a.ruido(this.pGrua, { tipo: 'bandpass', f: 900, q: 3, gan: 0 });
    const w = this.zumbido = a.ctx.createOscillator(); w.type = 'triangle'; w.frequency.value = 300;
    this.gZumbido = a.ctx.createGain(); this.gZumbido.gain.value = 0; w.connect(this.gZumbido).connect(this.pGrua); w.start();
    this.cable = a.ruido(this.pAlmeja, { tipo: 'highpass', f: 2500, q: 0.5, gan: 0 });
    this.giro = a.ruido(this.pGrua, { tipo: 'bandpass', f: 220, q: 4, gan: 0 });
    this.mordida = a.ruido(this.pAlmeja, { tipo: 'bandpass', f: 500, q: 0.6, gan: 0 });
    this.chorro = a.ruido(this.pAlmeja, { tipo: 'lowpass', f: 700, q: 0.4, gan: 0 });
    this.caida = a.ruido(this.pAlmeja, { tipo: 'lowpass', f: 300, q: 0.7, gan: 0 });
    this.camion = a.motor(this.pCamion, { base: 50, gan: 0.25 });
    this.listo = true; this.abertura = 0; this.estadoCamion = '';
  }
  alternar() { if (!this.listo) return; this.mudo = !this.mudo; this.a.maestro.gain.setTargetAtTime(this.mudo ? 0 : 0.9, this.a.ctx.currentTime, 0.1); }

  actualizar(dt, { grua, colgante, tierra, particulas, camiones, camara }) {
    if (!this.listo) return;
    const a = this.a, t = a.ctx.currentTime, set = (g, v, tc = 0.08) => g.gain.setTargetAtTime(v, t, tc);
    a.oyente(camara);
    a.mover(this.pGrua, grua.giro.getWorldPosition(this.v));
    a.mover(this.pAlmeja, colgante.pos);
    a.mover(this.pCamion, camiones.c.grupo.position);
    // Motor: sube de vueltas con lo que se pide (giro, pluma, cabrestante, orugas, mordida)
    const vCable = Math.abs(colgante.vCable || 0);
    const carga = Math.min(1, Math.abs(grua.vGiro) * 4 + Math.abs(grua.vPluma) * 15 + vCable * 0.35 + (Math.abs(grua.vIzq) + Math.abs(grua.vDer)) + (tierra.mordida ? 0.8 : 0));
    this.motor.poner(780 + carga * 1050, carga);
    set(this.cabrestante.g, vCable * 0.12); this.cabrestante.fil.frequency.setTargetAtTime(500 + vCable * 300, t, 0.1);
    set(this.gZumbido, vCable * 0.035); this.zumbido.frequency.setTargetAtTime(180 + vCable * 160, t, 0.1);
    set(this.cable.g, vCable * 0.05 + Math.min(0.05, colgante.tension * 0.02));
    set(this.giro.g, Math.abs(grua.vGiro) * 0.9);
    // Almeja mordiendo: crujido con granos al azar
    const mord = tierra.mordidoUltimo / Math.max(dt, 1e-3);
    set(this.mordida.g, Math.min(0.9, mord * 0.35) * (0.6 + Math.random() * 0.4), 0.03);
    if (mord > 0.2 && Math.random() < 0.25) a.golpe(this.pAlmeja, { f: 90 + Math.random() * 60, dur: 0.12, gan: 0.25, ruido: 0.9, fr: 300 + Math.random() * 500 });
    const ab = colgante.almeja.abertura;
    if (this.abertura > 0.02 && ab === 0) a.golpe(this.pAlmeja, { f: 140, dur: 0.6, gan: 0.7, ruido: 0.35, fr: 1800 });   // valvas que cierran
    this.abertura = ab;
    // Tierra que cae: chorro mientras sale de la almeja, golpe sordo cuando llega al piso o a la caja
    set(this.chorro.g, Math.min(0.6, tierra.soltadoUltimo / Math.max(dt, 1e-3) * 0.25));
    const llega = particulas.caidoUltimo / Math.max(dt, 1e-3);
    set(this.caida.g, Math.min(1, llega * 0.5), 0.05);
    if (llega > 0.3 && Math.random() < 0.15) a.golpe(this.pAlmeja, { f: 60, dur: 0.25, gan: 0.35, ruido: 0.8, fr: 250 });
    // Camión: motor según velocidad; suspiro de los frenos de aire al estacionar
    const vc = camiones.v || 0;
    this.camion.poner(700 + vc * 140, Math.min(1, vc / 6 + (camiones.estado === 'saliendo' ? 0.4 : 0)));
    if (this.estadoCamion === 'llegando' && camiones.estado === 'cargando') a.golpe(this.pCamion, { f: 50, dur: 0.9, gan: 0.35, ruido: 1, fr: 3500 });
    this.estadoCamion = camiones.estado;
  }
}

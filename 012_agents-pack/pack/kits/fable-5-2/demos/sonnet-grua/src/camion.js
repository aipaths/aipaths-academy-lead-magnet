// Ciclo de volquetes: llega uno vacío, recibe la tierra (partículas que caen en la caja), se va solo y viene otro.
import * as THREE from 'three';
import { crearCamionMalla, CAJA } from './camion_malla.js';
import { LAYOUT } from './config.js';
import { fbm } from './noise.js';

export const CAPACIDAD = 4.5;                                  // m³ por camión
const X_INICIO = -55, X_FIN = 60, X_PARADA = LAYOUT.truckSpot.x + 1.6;

export class Camiones {
  constructor(scene) {
    this.scene = scene; this.actual = null; this.saliente = null; this.llenados = 0; this.eventos = []; this.sonando = 0;
    this.zona = LAYOUT.truckSpot.z; this.nuevo(true);
  }

  nuevo(yaEstacionado = false) {
    const m = crearCamionMalla(); m.grupo.position.set(yaEstacionado ? X_PARADA : X_INICIO, 0, this.zona); this.scene.add(m.grupo);
    this.actual = { ...m, x: m.grupo.position.x, v: 0, volumen: 0, estado: yaEstacionado ? 'cargando' : 'llegando', espera: 0, ultimo: -1 };
  }

  bajoCaja(t, x, y, z) {                                      // ¿el punto está dentro de la caja de ese camión?
    const lx = x - t.x, lz = z - this.zona;
    return lx > CAJA.x0 - 0.05 && lx < CAJA.x1 + 0.05 && Math.abs(lz) < CAJA.ancho / 2 + 0.05 && y < CAJA.borde + 0.15 && y > 0.8;
  }

  recibe(x, y, z) { const t = this.actual; return !!t && t.estado === 'cargando' && this.bajoCaja(t, x, y, z); }

  agregar(v) { const t = this.actual; t.volumen += v; }

  mover(t, dt) {
    const prev = t.x; t.x += t.v * dt; t.grupo.position.x = t.x;
    const giro = ((t.x - prev) / 0.62); t.ruedas.forEach((w) => { w.rotation.z -= giro; });
    t.grupo.position.y = Math.sin(t.x * 3.1) * 0.012 * Math.min(1, t.v / 3);
  }

  forma(t) {                                                  // la montaña de tierra dentro de la caja crece con el volumen
    const f = Math.min(1.1, t.volumen / CAPACIDAD), c = t.carga, g = c.geometry, p = g.attributes.position;
    c.visible = f > 0.01; if (!c.visible) return;
    const H = 0.12 + 1.15 * f, w = CAJA.ancho / 2 - 0.05, L = t.L / 2;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / L, v = p.getZ(i) / w, edge = Math.max(0, 1 - (Math.pow(Math.abs(u), 2.4) * 0.55 + v * v * 0.8));
      p.setY(i, H * Math.pow(edge, 0.75) * (0.88 + 0.24 * fbm(p.getX(i) * 1.7 + 3, p.getZ(i) * 1.7, 4)));
    }
    p.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere(); t.ultimo = t.volumen;
  }

  paso(dt) {
    const t = this.actual;
    if (!t) { this.pasoSaliente(dt); return; }
    if (t.estado === 'llegando') {
      const d = X_PARADA - t.x; t.v = Math.min(9, Math.sqrt(2 * 1.8 * Math.max(d, 0)) + 0.05); this.mover(t, dt);
      if (d < 0.03) { t.estado = 'cargando'; t.v = 0; t.x = X_PARADA; }
    } else if (t.estado === 'cargando') {
      if (Math.abs(t.volumen - t.ultimo) > 0.02) this.forma(t);
      if (t.volumen >= CAPACIDAD) { t.estado = 'lleno'; t.espera = 0; this.eventos.push('lleno'); }
    } else if (t.estado === 'lleno') {
      t.espera += dt; if (t.espera > 1.4) { t.estado = 'saliendo'; this.saliente = t; this.llenados++; this.actual = null; this.eventos.push('sale'); }
    }
    this.pasoSaliente(dt);
  }

  pasoSaliente(dt) {
    const s = this.saliente;
    if (s) {
      s.v = Math.min(11, s.v + 1.7 * dt); this.mover(s, dt);
      if (!this.actual && s.x > X_PARADA + 16) { this.nuevo(false); this.eventos.push('llega'); }
      if (s.x > X_FIN) { this.scene.remove(s.grupo); this.saliente = null; }
    }
    if (!this.actual && !this.saliente) this.nuevo(false);
  }

  velocidadMax() { return Math.max(this.actual?.v ?? 0, this.saliente?.v ?? 0); }
  llenoPct() { return this.actual ? Math.min(1, this.actual.volumen / CAPACIDAD) : 1; }
}

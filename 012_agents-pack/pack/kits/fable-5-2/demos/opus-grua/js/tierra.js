// La almeja contra la tierra: morder (cava un pozo con la forma del arco de las valvas)
// y soltar (la carga cae como partículas desde entre los labios).
import * as THREE from 'three';
import { ABRE_MAX } from './almeja.js';

const R = 1.3, MEDIO_ANCHO = 0.95;
export const CAPACIDAD = 3.5;                       // m³

export class Tierra {
  constructor(terreno, particulas) {
    this.terreno = terreno; this.part = particulas;
    this.carga = 0; this.mordida = null; this.mordidoUltimo = 0; this.soltadoUltimo = 0;
  }

  // Empieza a morder: fija el eje de las valvas a la altura que tenía al apoyarse.
  empezar(ejeY, cx, cz, yaw) { this.mordida = { ejeY: ejeY - 0.25, cx, cz, yaw }; }
  terminar() { this.mordida = null; }

  // Cava lo que barren los labios: debajo del arco de radio R alrededor del eje, fuera del labio actual.
  morder(abertura) {
    const m = this.mordida; this.mordidoUltimo = 0;
    if (!m || this.carga >= CAPACIDAD) return;
    const t = this.terreno, D = t.celda, h = t.h, M = Math.round(Math.sqrt(h.length));
    const labio = R * Math.sin(abertura * ABRE_MAX);
    const c = Math.cos(m.yaw), s = Math.sin(m.yaw);
    const [gi, gj] = t.aGrilla(m.cx, m.cz), alcance = Math.ceil((R + 0.3) / D) + 1;
    let quitado = 0;
    for (let j = Math.floor(gj - alcance); j <= gj + alcance; j++) for (let i = Math.floor(gi - alcance); i <= gi + alcance; i++) {
      if (i < 1 || j < 1 || i >= M - 1 || j >= M - 1) continue;
      const [x, z] = t.aMundo(i, j), dx = x - m.cx, dz = z - m.cz;
      const u = dx * c - dz * s, v = dx * s + dz * c;       // u: a lo largo de la apertura, v: ancho de valva
      if (Math.abs(v) > MEDIO_ANCHO || Math.abs(u) < labio - 0.05 || Math.abs(u) > R) continue;
      const fondo = Math.max(m.ejeY - Math.sqrt(R * R - u * u), -7), k = j * M + i;
      if (h[k] > fondo) { const d = Math.min(h[k] - fondo, 0.08); h[k] -= d; quitado += d * D * D; t.fresco[k] = 1; }
    }
    if (quitado > 0) { this.carga = Math.min(CAPACIDAD, this.carga + quitado); this.mordidoUltimo = quitado; t.marcar(Math.floor(gi - alcance), Math.floor(gj - alcance), Math.ceil(gi + alcance), Math.ceil(gj + alcance)); }
  }

  // Si la almeja está abierta y cargada, la tierra cae entre los labios.
  soltar(dt, abertura, centro, vel, yaw) {
    this.soltadoUltimo = 0;
    if (this.carga <= 0 || abertura < 0.12 || this.mordida) return;
    const tasa = Math.min(this.carga, CAPACIDAD * 0.9 * abertura * dt);
    const vol = 0.0009, n = Math.max(1, Math.round(tasa / vol)), c = Math.cos(yaw), s = Math.sin(yaw);
    for (let k = 0; k < n; k++) {
      const u = (Math.random() - 0.5) * 1.6 * abertura, v = (Math.random() - 0.5) * 1.8;
      const x = centro.x + u * c + v * s, z = centro.z - u * s + v * c;
      this.part.emitir(x, centro.y - Math.random() * 0.6, z, vel.x + (Math.random() - 0.5) * 0.8, vel.y - Math.random() * 1.5, vel.z + (Math.random() - 0.5) * 0.8, tasa / n);
    }
    this.carga -= tasa; this.soltadoUltimo = tasa;
    if (this.carga < 0.003) this.carga = 0;
  }
}

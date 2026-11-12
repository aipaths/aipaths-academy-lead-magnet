// Mordida y descarga: al cerrar la almeja contra el suelo se resta tierra del mapa (pozo); al abrirla con carga sale en partículas.
import { ALMEJA } from './almeja.js';
import { VOL_PARTICULA } from './particulas.js';

const R2 = ALMEJA.R * 2;

export class Excavacion {
  constructor(terreno, particulas) { this.terreno = terreno; this.part = particulas; this.carga = 0; this.contacto = false; this.mordio = 0; this.acum = 0; this.eventos = []; this.polvo = null; this.t = 0; this.tMordida = -9; this.baseMordida = 0; }

  get muerde() { return this.t - this.tMordida < 0.8; }

  // alturas del suelo bajo las dos puntas de la almeja (abierta un ángulo θ), con la almeja girada `yaw`
  suelo(G, yaw, abierta) {
    const th = (ALMEJA.abiertaMax * abierta * Math.PI) / 180, dx = R2 * Math.sin(th) * Math.cos(yaw), dz = -R2 * Math.sin(th) * Math.sin(yaw);
    const t = this.terreno, a = t.alturaEn(G.x + dx, G.z + dz), b = t.alturaEn(G.x - dx, G.z - dz), c = t.alturaEn(G.x, G.z);
    const tope = Math.max(a, b, c * 0.6 + Math.min(a, b) * 0.4);
    return { tope, medio: (a + b) / 2, base: R2 * Math.cos(th) };
  }

  paso(dt, G, vel, yaw, abierta, dAbierta) {
    this.t += dt;
    const s = this.suelo(G, yaw, abierta), baja = G.y - s.base - s.tope;      // distancia de las puntas al suelo
    this.contacto = baja < 0.5;
    if (dAbierta < -0.0005 && this.contacto && this.carga < ALMEJA.capacidad - 0.02) {
      if (!this.muerde) this.baseMordida = s.base;
      this.morder(G, yaw, abierta, -dAbierta);
    }
    if (abierta > 0.3 && this.carga > 0.003 && dAbierta >= -0.0005) this.soltar(dt, G, vel, yaw, abierta);
    return s;
  }

  morder(G, yaw, abierta, dc) {
    const v = Math.min(ALMEJA.capacidad - this.carga, ALMEJA.capacidad * dc * 1.1);
    const th = (ALMEJA.abiertaMax * abierta * Math.PI) / 180, rx = Math.max(0.6, R2 * Math.sin(th) * 0.95);
    const sacado = this.terreno.cavar(G.x, G.z, rx, ALMEJA.ancho / 2 + 0.1, -yaw, v);
    this.carga += sacado; if (sacado > 1e-4) { this.polvo?.rafaga(G.x, this.terreno.alturaEn(G.x, G.z) + 0.2, G.z, 1 + Math.round(sacado * 14), { size: 1.1, grow: 3.2, life: 2, alpha: 0.28, up: 1.4, v: 2.2 }); this.mordio += sacado; this.tMordida = this.t; this.eventos.push('muerde', sacado); }
  }

  soltar(dt, G, vel, yaw, abierta) {
    const v = Math.min(this.carga, (0.2 + 1.6 * (abierta - 0.25)) * dt);                     // m³ a soltar este cuadro
    this.acum += v / VOL_PARTICULA; this.carga -= v;
    const n = Math.floor(this.acum); this.acum -= n;
    const th = (ALMEJA.abiertaMax * abierta * Math.PI) / 180, ancho = Math.max(0.25, R2 * Math.sin(th)), c = Math.cos(yaw), sn = Math.sin(yaw);
    for (let i = 0; i < n; i++) {
      const u = (Math.random() - 0.5) * ancho, w = (Math.random() - 0.5) * ALMEJA.ancho * 0.9;
      this.part.lanzar(G.x + u * c + w * sn, G.y - R2 * Math.cos(th) * 0.85 + Math.random() * 0.2, G.z - u * sn + w * c,
        vel.x + (Math.random() - 0.5) * 0.9 + u * 0.5 * c, vel.y - Math.random() * 0.6, vel.z + (Math.random() - 0.5) * 0.9 - u * 0.5 * sn);
    }
    if (n) this.eventos.push('suelta', n);
    if (this.carga < 0.003) this.carga = 0;
  }
}

// Ciclo de los volquetes: llega uno vacío por el camino, estaciona al lado de la grúa, se llena,
// se va solo y viene otro. También recibe la tierra que cae dentro de la caja.
import * as THREE from 'three';
import { SITIO } from './config.js';
import { crearCamion, cargarCaja, asentarCaja, CAJA } from './camion.js';

export const CAPACIDAD_CAMION = 10.5;               // m³ (3 paladas de 3,5 m³)
const COLORES = [0xd9531e, 0xe8e4da, 0x2f5f8a, 0xc9a21f];
const LEJOS = 85, V_MAX = 9;

export class Camiones {
  constructor(escena, terreno, { inicial = 'estacionado' } = {}) {
    this.escena = escena; this.terreno = terreno; this.n = 0; this.llenados = 0;
    this.nuevo(inicial === 'estacionado' ? SITIO.camion.x : -LEJOS);
    this.estado = inicial === 'estacionado' ? 'cargando' : 'llegando';
    this.quieto = 0; this.v = 0; this.tmp = new THREE.Vector3();
  }

  nuevo(x) {
    if (this.c) { this.escena.remove(this.c.grupo); }
    this.c = crearCamion(COLORES[this.n++ % COLORES.length]);
    this.x = x; this.c.grupo.position.set(x, 0, SITIO.camion.z);
    this.escena.add(this.c.grupo);
  }

  get lleno() { return this.c.carga >= CAPACIDAD_CAMION * 0.95; }

  // Receptor de partículas: si el terrón cae dentro de la caja, entra (o desborda al piso).
  recibir(x, y, z, vol) {
    const lx = x - this.x - CAJA.x, lz = z - SITIO.camion.z;
    if (Math.abs(lx) > CAJA.largo / 2 + 0.1 || Math.abs(lz) > CAJA.ancho / 2 + 0.1) return false;
    const techo = CAJA.piso + 0.2;
    if (y > techo + this.altoCarga(lx, lz)) return false;
    if (this.estado !== 'cargando') return false;
    const resto = cargarCaja(this.c, lx + CAJA.x, lz, vol);
    if (resto > 0) this.terreno.agregar(x, z, resto);
    this.ultimaCarga = 0;
    return true;
  }
  altoCarga(lx, lz) { const NX = 21, NZ = 10; const i = Math.round((lx + CAJA.largo / 2) / (CAJA.largo / NX)), j = Math.round((lz + CAJA.ancho / 2) / (CAJA.ancho / NZ)); return Math.max(0, this.c.h[Math.max(0, Math.min(NZ, j)) * (NX + 1) + Math.max(0, Math.min(NX, i))] || 0); }

  // Altura de lo que hay en (x, z): la caja con su carga, la cabina o nada. Para que la almeja no lo atraviese.
  alturaEn(x, z) {
    const lx = x - this.x, lz = z - SITIO.camion.z;
    if (Math.abs(lz) > 1.35 || lx < -3.4 || lx > 4.4) return -1;
    if (lx > 2.0) return 3.3;
    const enCaja = Math.abs(lx - CAJA.x) < CAJA.largo / 2 && Math.abs(lz) < CAJA.ancho / 2 - 0.1;
    return enCaja ? CAJA.piso + this.altoCarga(lx - CAJA.x, lz) : CAJA.piso + CAJA.alto;
  }

  actualizar(dt) {
    asentarCaja(this.c);
    this.ultimaCarga = (this.ultimaCarga ?? 9) + dt;
    const parar = SITIO.camion.x;
    if (this.estado === 'llegando') {
      const falta = parar - this.x;
      this.v = Math.min(V_MAX, Math.sqrt(Math.max(0, 2 * 1.2 * falta)));
      if (falta < 0.02) { this.x = parar; this.v = 0; this.estado = 'cargando'; }
    } else if (this.estado === 'cargando') {
      if (this.lleno && this.ultimaCarga > 2.5) { this.estado = 'saliendo'; this.llenados++; }
    } else if (this.estado === 'saliendo') {
      this.v = Math.min(V_MAX, this.v + 1.0 * dt);
      if (this.x > LEJOS) { this.nuevo(-LEJOS); this.estado = 'llegando'; this.v = V_MAX; }
    }
    this.x += this.v * dt;
    this.c.grupo.position.x = this.x;
    for (const r of this.c.ruedas) r.rotation.z -= this.v * dt / 0.53;
    return this.v;
  }
}

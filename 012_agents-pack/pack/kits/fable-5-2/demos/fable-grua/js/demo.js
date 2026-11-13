import { OBRA, SUPER, PLUMA } from './medidas.js';
import { CAJA } from './camion.js';
import { mando } from './controles.js';

const lim = (x) => Math.max(-1, Math.min(1, x));
const PUNTOS = [[0, 0], [1.3, 0.9], [-1.2, -0.7], [0.4, 1.6], [-0.5, -1.7], [1.6, -1.0], [-1.7, 0.9], [0.2, -0.4]];
// Piloto automático: maneja la grúa con el mismo mando que el teclado (cava en el pozo y carga el camión).
export class Demo {
  constructor(grua, pendulo, camiones) { Object.assign(this, { grua, pendulo, camiones }); this.fase = 'ir al pozo'; this.t = 0; this.n = 0; this.activa = false; }
  apuntar(x, z) {
    const e = this.grua.e, dx = x - e.x, dz = z - e.z, R = Math.hypot(dx, dz);
    let dg = Math.atan2(-dz, dx) - e.rumbo - e.giro; dg = Math.atan2(Math.sin(dg), Math.cos(dg));
    const ang = Math.acos(Math.max(0.2, Math.min(0.88, (R - SUPER.pie.x - 0.42) / PLUMA.largo))), dp = ang - e.pluma;
    // Como un buen gruista, "acompaña" el balanceo: mueve la punta en el sentido en que se va la almeja,
    // y así le saca el envión en vez de esperar a que se frene sola.
    const g = e.rumbo + e.giro, p = this.pendulo, ox = p.p.x - this.grua.punta.x, oz = p.p.z - this.grua.punta.z;
    const ot = -Math.sin(g) * ox - Math.cos(g) * oz, or = Math.cos(g) * ox - Math.sin(g) * oz;   // cuánto se adelantó la almeja: de costado y hacia afuera
    mando.giro = lim(dg * 1.6 + (ot / Math.max(4, R)) * 3.2); mando.pluma = lim(dp * 8 - (or / (PLUMA.largo * Math.sin(e.pluma))) * 12);
    return Math.abs(dg) < 0.03 && Math.abs(dp) < 0.02 && Math.abs(e.vGiro) < 0.03;
  }
  paso(dt) {
    const { grua, pendulo, camiones } = this, e = grua.e, al = grua.almeja; this.t += dt;
    Object.assign(mando, { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vira: 0 });
    const [ox, oz] = PUNTOS[this.n % PUNTOS.length], px = OBRA.pozo.x + ox, pz = OBRA.pozo.z + oz;
    const alto = pendulo.p.y - al.fondo, sig = (f) => { this.fase = f; this.t = 0; };
    switch (this.fase) {
      case 'ir al pozo': mando.almeja = 1; mando.cable = alto < 4.5 ? -1 : 0; if (this.apuntar(px, pz) && alto >= 4.3) sig('bajar'); break;
      case 'bajar': this.apuntar(px, pz); mando.almeja = 1; mando.cable = 1; if (pendulo.contacto && pendulo.sobra > 0.12) sig('morder'); break;
      case 'morder': mando.almeja = -1; if (e.apertura <= 0) sig('subir'); break;
      case 'subir': mando.almeja = -1; mando.cable = -1; if (alto > 5.2) sig('ir al camion'); break;
      case 'ir al camion': {
        const c = camiones.actual, listo = c.estado === 'cargando';
        const cx = (listo ? c.grupo.position.x : OBRA.camion.x) + (CAJA.x0 + CAJA.x1) / 2 + ((this.n % 3) - 1) * 1.1;
        const ok = this.apuntar(cx, OBRA.camion.z);
        // viaja alta y, ya sobre la caja, baja hasta quedar apenas por encima del borde
        const quiero = ok && listo ? CAJA.borde + 0.75 : 5.4; mando.cable = lim((alto - quiero) * 2);
        // suelta cuando pasa sobre la caja sin demasiado envión (no espera a que deje de balancearse)
        // a lo largo de la caja (5,6 m) perdona más que a lo ancho (2,2 m)
        const dx = Math.abs(pendulo.p.x - cx), dz = Math.abs(pendulo.p.z - OBRA.camion.z);
        if (ok && listo && alto < CAJA.borde + 1.0 && dx < 1.1 && dz < 0.35 && Math.abs(pendulo.v.x) < 1.5 && Math.abs(pendulo.v.z) < 0.5) sig('soltar'); break;
      }
      case 'soltar': mando.almeja = 1; if (e.apertura >= 1 && this.t > 2.4) { this.n++; sig('ir al pozo'); } break;
    }
  }
}

// Operador automático (sólo para pruebas y para la primera palada del timelapse): maneja con los mismos ejes que el teclado.
import { LAYOUT } from './config.js';
import { PLUMA } from './pluma.js';

const R2D = 180 / Math.PI, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function crearAutopiloto(sim) {
  const { grua, fisica, excavacion, camiones } = sim, est = grua.estado, c = { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vuelta: 0 };
  let fase = 'ir-pila', t = 0, ciclos = 0, destino = { x: LAYOUT.pile.x - 1.5, z: LAYOUT.pile.z + 0.5 };
  const centro = () => grua.raiz.position;

  function apuntar(dest) {                                       // gira y ajusta la pluma para llevar la punta sobre `dest`
    const o = centro(), dx = dest.x - o.x, dz = dest.z - o.z;
    const rumbo = Math.atan2(-dz, dx) * R2D, err = ((rumbo - est.giro + 540) % 360) - 180;
    c.giro = clamp(-err / 12, -1, 1);
    if (Math.abs(err) < 1.5 && Math.abs(sim.st.giroVel) < 1) c.giro = 0;
    const alcance = Math.hypot(dx, dz), cosf = clamp((alcance - 1.05) / PLUMA.largo, 0.2, 0.95), phi = Math.acos(cosf) * R2D;
    c.pluma = clamp((phi - est.pluma) / 3, -1, 1); if (Math.abs(phi - est.pluma) < 0.4) c.pluma = 0;
    return { err, dphi: phi - est.pluma };
  }
  const alturaSuelo = () => sim.excavacion.terreno.alturaEn(fisica.G.x, fisica.G.z);
  const quieto = () => Math.abs(sim.st.giroVel) < 0.5 && fisica.V.length() < 1.2;

  function paso(dt) {
    t += dt; Object.assign(c, { cable: 0, almeja: 0 }); const a = fase === 'ir-camion' || fase === 'descargar' ? null : apuntar(destino);
    const G = fisica.G;
    if (fase === 'ir-pila') {
      c.almeja = 1; c.cable = G.y - alturaSuelo() > 7 ? 1 : 0;
      if (a.err < 2 && Math.abs(a.dphi) < 1.5 && Math.abs(a.err) < 2) { fase = 'bajar'; t = 0; }
    } else if (fase === 'bajar') {
      c.almeja = 1; c.cable = excavacion.contacto ? 0.3 : 1;
      if (excavacion.contacto && t > 1 && quieto()) { fase = 'morder'; t = 0; }
    } else if (fase === 'morder') {
      c.almeja = -1; c.cable = t < 1.2 ? 0.45 : 0;
      if (est.almeja <= 0.02) { fase = 'subir'; t = 0; }
    } else if (fase === 'subir') {
      c.almeja = -1; c.cable = -1; if (G.y - alturaSuelo() > 8.5) { fase = 'ir-camion'; t = 0; }
    } else if (fase === 'ir-camion') {
      const tr = camiones.actual, bed = { x: (tr ? tr.x : 1.1) - 1.8, z: LAYOUT.truckSpot.z };
      const ar = apuntar(bed); c.almeja = -1; c.cable = G.y < 8.2 ? -1 : 0;
      if (Math.abs(ar.err) < 3 && Math.abs(ar.dphi) < 1.2 && t > 2.5) { fase = 'descargar'; t = 0; }
    } else if (fase === 'descargar') {
      const tr = camiones.actual; apuntar({ x: (tr ? tr.x : 1.1) - 1.8, z: LAYOUT.truckSpot.z });
      c.cable = G.y > 5.3 ? 1 : 0; c.almeja = G.y < 6.4 && (fisica.V.length() < 0.8 || t > 14) ? 1 : 0;
      if (est.almeja > 0.95 && excavacion.carga < 0.005 && t > 3) { fase = 'ir-pila'; destino = { x: LAYOUT.pile.x - 2 - (ciclos % 3) * 0.9, z: LAYOUT.pile.z + 0.3 + (ciclos % 2) * 1.2 }; ciclos++; t = 0; }
    }
    return c;
  }
  return { paso, get fase() { return fase; }, get ciclos() { return ciclos; } };
}

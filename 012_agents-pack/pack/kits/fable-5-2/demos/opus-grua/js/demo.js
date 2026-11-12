// Palada automática (para probar y para el timelapse): baja abierta, muerde, sube, gira, suelta y vuelve.
// Con pasoFijo avanza la simulación a 1/60 s sin esperar al navegador (resultado repetible).
import { SITIO } from './config.js';
import { CAJA } from './camion.js';

const NADA = { giro: 0, pluma: 0, cable: 0, avance: 0, viraje: 0 };
const anguloHacia = (g, x, z) => Math.atan2(-(z - g.z), x - g.x) - g.rumbo;
const difAng = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export async function palada(app, { pasoFijo = false, destino = 'camion', excavar = 0, fasesMax = 99 } = {}) {
  const { estado, grua, colgante, tierra } = app;
  const objetivo = destino === 'camion' ? anguloHacia(grua, SITIO.camion.x + CAJA.x, SITIO.camion.z) : destino;
  const girarA = (ang) => () => {
    const d = difAng(ang, grua.angGiro);
    return { ...NADA, giro: Math.abs(d) < 0.01 ? 0 : Math.max(-0.7, Math.min(0.7, d * 1.1)) };   // se acerca despacio para no hamacarla
  };
  const fases = [
    { auto: () => ({ ...NADA, cable: colgante.pos.y - colgante.almeja.alto < 7 ? -1 : 0 }), abrir: false, hasta: () => colgante.pos.y - colgante.almeja.alto >= 7, max: 10 },
    { auto: girarA(excavar), abrir: false, hasta: () => Math.abs(difAng(excavar, grua.angGiro)) < 0.015 && Math.abs(grua.vGiro) < 0.005, max: 30 },
    { auto: () => NADA, abrir: false, hasta: () => Math.hypot(colgante.vel.x, colgante.vel.z) < 0.3, max: 14 },
    { auto: () => ({ ...NADA, cable: 1 }), abrir: true, hasta: () => colgante.apoyada && colgante.almeja.abertura > 0.97, max: 20 },
    { auto: () => NADA, abrir: false, hasta: () => colgante.almeja.abertura === 0, max: 10 },
    { auto: () => ({ ...NADA, cable: -1 }), abrir: false, hasta: () => colgante.pos.y - colgante.almeja.alto > 6.5, max: 12 },
    { auto: girarA(objetivo), abrir: false, hasta: () => Math.abs(difAng(objetivo, grua.angGiro)) < 0.015 && Math.abs(grua.vGiro) < 0.005, max: 30 },
    { auto: () => NADA, abrir: false, hasta: () => Math.hypot(colgante.vel.x, colgante.vel.z) < 0.3, max: 14 },   // espera a que deje de balancearse
    { auto: () => NADA, abrir: true, hasta: () => tierra.carga === 0 && app.particulas.activas === 0, max: 8 },
  ];
  const paso = 1 / 60;
  for (const f of fases.slice(0, fasesMax)) {
    let t = 0;
    estado.abrir = f.abrir;
    while (t < f.max) {
      estado.auto = f.auto();
      if (pasoFijo) { app.simular(paso); t += paso; } else { await new Promise(requestAnimationFrame); t += 1 / 60; }
      if (f.hasta()) break;
    }
  }
  estado.auto = null;
}

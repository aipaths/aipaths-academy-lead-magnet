// Estado fijo del timelapse: la obra ya tiene un pozo cavado y una montaña de descarga, para que cada etapa se compare igual.
import { LAYOUT } from './config.js';
import { VOL_PARTICULA } from './particulas.js';

export function escenaTimelapse(terreno) {
  terreno.cavar(LAYOUT.pile.x - 3.2, LAYOUT.pile.z + 6.0, 1.5, 1.1, 0.3, 3.4);                 // pozo de varias mordidas
  const cx = -11.5, cz = 2.5;
  for (let i = 0; i < 3600; i++) {                                                         // tierra soltada, desmoronándose sola
    const a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.7) * 1.4;
    terreno.sumar(cx + Math.cos(a) * r, cz + Math.sin(a) * r, VOL_PARTICULA);
  }
  for (let k = 0; k < 120; k++) terreno.paso();
}

// Calidad adaptativa: si los fps caen debajo de 50 por un rato, baja la resolución interna
// (×2 → ×1,75 → ×1,5 → ×1,25); si sobra, la vuelve a subir. En timelapse queda fija en ×2.
import { URLP } from './config.js';

export function crearCalidad(renderer) {
  const max = Math.min(devicePixelRatio, 2);
  let acum = 0, n = 0, espera = 0;
  return {
    cuadro(dt) {
      if (URLP.timelapse) return;
      acum += dt; n++; espera -= dt;
      if (acum < 2) return;
      const fps = n / acum; acum = 0; n = 0;
      const pr = renderer.getPixelRatio();
      if (fps < 50 && pr > 1.25 && espera <= 0) { renderer.setPixelRatio(pr - 0.25); espera = 3; }
      else if (fps > 58.5 && pr < max && espera <= 0) { renderer.setPixelRatio(Math.min(max, pr + 0.25)); espera = 8; }
    },
  };
}

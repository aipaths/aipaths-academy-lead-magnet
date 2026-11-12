// Interfaz: datos de la grúa, ayuda y contador de fps (?fps=1). En timelapse no se muestra nada.
import { URLP } from './config.js';

export function crearHud() {
  const hud = document.getElementById('hud'), datos = document.getElementById('datos'), fpsEl = document.getElementById('fps');
  if (!URLP.timelapse) hud.classList.remove('oculto');
  if (URLP.fps && !URLP.timelapse) fpsEl.classList.remove('oculto');
  let n = 0, t = 0; const historial = [];
  window.__fps = { historial, actual: 0 };
  return {
    datos(txt) { datos.innerHTML = txt; },
    cuadro(dt, renderer) {
      n++; t += dt;
      if (t >= 0.5) {
        const f = n / t; n = 0; t = 0; window.__fps.actual = f; historial.push(f); if (historial.length > 600) historial.shift();
        if (URLP.fps) fpsEl.textContent = `${f.toFixed(0)} fps · ${renderer.info.render.calls} dc · ${(renderer.info.render.triangles / 1000).toFixed(0)}k tri · x${renderer.getPixelRatio().toFixed(2)}`;
      }
    },
  };
}

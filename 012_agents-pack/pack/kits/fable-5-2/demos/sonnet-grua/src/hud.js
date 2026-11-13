// Ayuda de teclas y estado (carga de la almeja, camión). No se dibuja en modo timelapse.
import { AYUDA } from './controles.js';
import { CAPACIDAD } from './camion.js';

export function crearHud(sim) {
  const el = document.getElementById('hud');
  el.innerHTML = AYUDA.map(([t, d]) => `<div><b>${t}</b> ${d}</div>`).join('') + '<div id="est" style="margin-top:6px"></div>';
  const est = el.querySelector('#est');
  return () => {
    const t = sim.camiones.actual;
    est.textContent = `almeja ${sim.excavacion.carga.toFixed(2)} m³ · camión ${t ? t.volumen.toFixed(1) : '—'}/${CAPACIDAD} m³ · camiones llenados ${sim.camiones.llenados}`;
  };
}

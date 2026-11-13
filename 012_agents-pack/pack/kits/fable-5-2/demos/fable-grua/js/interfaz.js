import { ALMEJA } from './medidas.js';
import { PARAMS } from './escena.js';

const TECLAS = [['A', 'D', 'girar la cabina'], ['W', 'S', 'subir / bajar la pluma'], ['R', 'F', 'recoger / soltar cable'], ['Q', 'E', 'abrir / cerrar la almeja'], ['↑↓', '←→', 'mover las orugas'], ['C', '', 'cambiar de cámara'], ['P', '', 'piloto automático'], ['M', '', 'sonido sí / no']];
// Tablero mínimo: qué tecla hace qué, cuánta tierra lleva la almeja y cómo va el camión.
export function crearInterfaz() {
  const raiz = document.getElementById('interfaz');
  raiz.innerHTML = `<div class="panel estado"><b>Liebherr HS 8100 · almeja</b><span id="i-almeja"></span><span id="i-camion"></span><div class="barra"><i id="i-barra"></i></div><span id="i-aviso"></span></div>
    <div class="panel teclas">${TECLAS.map(([a, b, t]) => `<p><kbd>${a}</kbd>${b ? `<kbd>${b}</kbd>` : ''} ${t}</p>`).join('')}</div>
    <div class="panel fps" id="i-fps" hidden></div><div class="arranque" id="i-arranque">Hacé clic o tocá una tecla para arrancar el motor</div>`;
  const $ = (id) => document.getElementById(id), fps = $('i-fps'); fps.hidden = !PARAMS.has('fps');
  const num = (x) => x.toFixed(1).replace('.', ',');
  return {
    estado(almeja, camiones, demo, mudo) {
      $('i-almeja').textContent = `Almeja: ${num(almeja.carga)} de ${num(ALMEJA.volumen)} m³`;
      const c = camiones.actual;
      $('i-camion').textContent = c.estado === 'cargando' ? `Camión: ${Math.round(camiones.llenado * 100)} % · viajes: ${camiones.viajes}` : c.estado === 'lleno' ? 'Camión lleno: se va' : `Viene otro camión · viajes: ${camiones.viajes}`;
      $('i-barra').style.width = `${camiones.llenado * 100}%`;
      $('i-aviso').textContent = [demo ? 'Piloto automático (P lo apaga)' : '', mudo ? 'Sin sonido (M)' : ''].filter(Boolean).join(' · ');
    },
    fps(texto) { fps.textContent = texto; },
    arranco() { $('i-arranque').remove(); },
  };
}

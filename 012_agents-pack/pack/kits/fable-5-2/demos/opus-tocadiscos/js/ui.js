// Botones de la barra inferior y transiciones de cámara.
import * as THREE from 'three';

export function crearUI({ repro, estado, camara, controles, VISTAS }) {
  const $ = (id) => document.getElementById(id);
  const bPlay = $('btn-play'),
    bDes = $('btn-desarmar'),
    bTapa = $('btn-tapa'),
    bVista = $('btn-vista');
  let viaje = null,
    vistaActual = 'frente';

  const irA = (nombre) => {
    const v = VISTAS[nombre];
    viaje = {
      t: 0,
      p0: camara.position.clone(),
      o0: controles.target.clone(),
      p1: new THREE.Vector3(...v.pos),
      o1: new THREE.Vector3(...v.obj),
    };
  };

  const pintarPlay = () => {
    const suena = repro.estado !== 'quieto' && repro.estado !== 'parando';
    bPlay.querySelector('.ico').textContent = suena ? '■' : '▶';
    bPlay.querySelector('.txt').textContent = suena ? 'Stop' : 'Play';
    bPlay.classList.toggle('activo', suena);
  };

  const alternarPlay = async () => {
    if (repro.estado === 'quieto') {
      if (estado.desarmeObj) {
        alternarDesarme();
        await new Promise((r) => setTimeout(r, 1900));
      }
      if (estado.tapaObj) {
        estado.tapaObj = 0;
        bTapa.textContent = 'Poner tapa';
      }
      repro.play();
    } else repro.stop();
    pintarPlay();
  };

  const alternarDesarme = () => {
    if (!estado.desarmeObj && repro.estado !== 'quieto') repro.stop();
    estado.desarmeObj = estado.desarmeObj ? 0 : 1;
    bDes.textContent = estado.desarmeObj ? 'Armar' : 'Desarmar';
    bDes.classList.toggle('activo', !!estado.desarmeObj);
    if (vistaActual !== 'cenital') irA(estado.desarmeObj ? 'desarmado' : 'frente');
  };

  bPlay.addEventListener('click', alternarPlay);
  bDes.addEventListener('click', alternarDesarme);
  bTapa.addEventListener('click', () => {
    if (!estado.tapaObj && repro.estado !== 'quieto') repro.stop();
    estado.tapaObj = estado.tapaObj ? 0 : 1;
    bTapa.textContent = estado.tapaObj ? 'Sacar tapa' : 'Poner tapa';
    pintarPlay();
  });
  bVista.addEventListener('click', () => {
    vistaActual = vistaActual === 'cenital' ? (estado.desarmeObj ? 'desarmado' : 'frente') : 'cenital';
    bVista.textContent = vistaActual === 'cenital' ? 'Vista de frente' : 'Vista cenital';
    irA(vistaActual);
  });
  const rango = $('pitch'),
    salida = $('pitch-val');
  rango.addEventListener('input', () => {
    const v = parseFloat(rango.value);
    salida.textContent = (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + ' %';
    repro.pitch(v);
    estado.pitch = v;
  });
  rango.addEventListener('dblclick', () => {
    rango.value = 0;
    rango.dispatchEvent(new Event('input'));
  });

  bTapa.textContent = estado.tapaObj ? 'Sacar tapa' : 'Poner tapa';
  bDes.textContent = estado.desarmeObj ? 'Armar' : 'Desarmar';
  setInterval(pintarPlay, 300);

  return {
    alternarPlay,
    actualizarCamara(dt) {
      if (!viaje) return;
      viaje.t = Math.min(viaje.t + dt / 1.4, 1);
      const e = viaje.t < 0.5 ? 4 * viaje.t ** 3 : 1 - (-2 * viaje.t + 2) ** 3 / 2;
      camara.position.lerpVectors(viaje.p0, viaje.p1, e);
      controles.target.lerpVectors(viaje.o0, viaje.o1, e);
      if (viaje.t >= 1) viaje = null;
    },
  };
}

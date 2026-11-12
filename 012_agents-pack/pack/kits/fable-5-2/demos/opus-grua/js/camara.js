// Cámaras: libre (órbita), desde la cabina, siguiendo la almeja, y la fija del timelapse.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { CAM_TIMELAPSE, URLP } from './config.js';

export function crearCamaras(camara, canvas) {
  const orbita = new OrbitControls(camara, canvas);
  orbita.enableDamping = true; orbita.maxPolarAngle = Math.PI * 0.48; orbita.minDistance = 6; orbita.maxDistance = 140;
  const modos = ['libre', 'cabina', 'almeja'];
  let modo = 0;
  const fijar = () => {
    camara.fov = CAM_TIMELAPSE.fov; camara.updateProjectionMatrix();
    camara.position.set(...CAM_TIMELAPSE.pos); camara.lookAt(...CAM_TIMELAPSE.mira);
  };
  fijar();
  orbita.target.set(...CAM_TIMELAPSE.mira);
  if (URLP.timelapse) orbita.enabled = false;
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), mirada = new THREE.Vector3(...CAM_TIMELAPSE.mira);
  return {
    siguiente() { modo = (modo + 1) % modos.length; orbita.enabled = modos[modo] === 'libre'; return modos[modo]; },
    get modo() { return modos[modo]; },
    actualizar(grua) {
      const dbg = window.__camDebug;   // para revisar detalles desde el protocolo de Chrome
      if (dbg) { camara.position.set(...dbg.pos); camara.lookAt(...dbg.mira); return; }
      if (URLP.timelapse) return fijar();
      if (modos[modo] === 'libre' || !grua) return orbita.update();
      const almeja = grua.colgante.pos;
      if (modos[modo] === 'cabina') {                // el operador mira la almeja desde su asiento
        grua.ojoCabina(tmp, null); camara.position.copy(tmp);
        mirada.lerp(almeja, 0.15); camara.lookAt(mirada);
      } else {                                       // cámara que acompaña a la almeja desde un costado
        grua.ojoCabina(tmp, null);
        tmp.lerp(almeja, 0.6); tmp.y = Math.max(almeja.y + 5, 6); camara.position.lerp(tmp, 0.06); mirada.lerp(almeja, 0.2); camara.lookAt(mirada);
      }
    },
  };
}

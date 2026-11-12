// Cámara: en modo timelapse queda fija (3/4); en modo normal se orbita con el mouse y la rueda.
import * as THREE from 'three';
import { TIMELAPSE, TIMELAPSE_CAM } from './config.js';

export function crearCamara(canvas) {
  const cam = new THREE.PerspectiveCamera(TIMELAPSE_CAM.fov, innerWidth / innerHeight, 0.3, 5000);
  const objetivo = new THREE.Vector3(...TIMELAPSE_CAM.target);
  const cm = new URLSearchParams(location.search).get('cam');                 // ?cam=px,py,pz,tx,ty,tz  (depuración)
  if (cm) { const v = cm.split(',').map(Number); objetivo.set(v[3], v[4], v[5]); TIMELAPSE_CAM.pos = v.slice(0, 3); }
  const o = new THREE.Vector3(...TIMELAPSE_CAM.pos).sub(objetivo);
  const est = { yaw: Math.atan2(o.x, o.z), pitch: Math.asin(o.y / o.length()), dist: o.length() };
  const aplicar = () => {
    cam.position.set(
      objetivo.x + est.dist * Math.cos(est.pitch) * Math.sin(est.yaw),
      objetivo.y + est.dist * Math.sin(est.pitch),
      objetivo.z + est.dist * Math.cos(est.pitch) * Math.cos(est.yaw));
    cam.lookAt(objetivo);
  };
  aplicar();
  if (!TIMELAPSE) {
    let arrastra = false;
    canvas.addEventListener('pointerdown', (e) => { arrastra = true; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', () => { arrastra = false; });
    canvas.addEventListener('pointermove', (e) => {
      if (!arrastra) return;
      est.yaw -= e.movementX * 0.005; est.pitch = THREE.MathUtils.clamp(est.pitch + e.movementY * 0.004, 0.05, 1.4); aplicar();
    });
    canvas.addEventListener('wheel', (e) => { est.dist = THREE.MathUtils.clamp(est.dist * (1 + e.deltaY * 0.001), 8, 90); aplicar(); e.preventDefault(); }, { passive: false });
  }
  addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
  // modos: 1 = vista 3/4 de la obra, 2 = sigue a la almeja, 3 = desde la cabina
  const inicio = { t: objetivo.clone(), est: { ...est } }, tmp = new THREE.Vector3(); let modo = 1;
  function actualizar(sim, dt) {
    if (TIMELAPSE || cm) return;
    if (modo === 2) { objetivo.lerp(sim.fisica.G, Math.min(1, dt * 3)); est.dist += (24 - est.dist) * Math.min(1, dt * 1.5); aplicar(); }
    else if (modo === 3) {
      sim.grua.arriba.localToWorld(tmp.set(1.5, 2.6, 1.0)); cam.position.copy(tmp);
      const g = sim.fisica.G; cam.lookAt(g.x, g.y + 1, g.z);
    } else if (modo === 4) aplicar();
  }
  function cambiar(m) { if (m === modo) return; modo = m; if (m === 1) { objetivo.copy(inicio.t); Object.assign(est, inicio.est); aplicar(); } }
  addEventListener('keydown', (e) => { if (e.code === 'Digit1') cambiar(1); if (e.code === 'Digit2') cambiar(2); if (e.code === 'Digit3') cambiar(3); });
  return { cam, objetivo, est, aplicar, actualizar };
}

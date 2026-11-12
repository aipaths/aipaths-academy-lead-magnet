// Cámara de construcción (?timelapse=2), estilo Blender: en cada etapa encuadra la caja que envuelve
// lo que ya está construido y gira unos grados alrededor de la grúa. Arranca de cerca sobre las orugas
// y se aleja hasta coincidir con la cámara fija (?timelapse=1) en la etapa 13. Es determinística:
// sólo depende del número de etapa y de lo que hay en la escena.
export const FIJA = { pos: [23, 10.5, -37.5], mira: [4, 8.6, 0], fov: 36 };
export const ETAPA_FINAL = 13, GIRO_TOTAL = 88;   // grados que recorre entre la etapa 1 y la 13

export function camaraObra(THREE, mundo, etapa) {
  const caja = new THREE.Box3(new THREE.Vector3(-3.4, 0, -2.6), new THREE.Vector3(3.4, 1.4, 2.6));   // donde van las orugas
  const sumar = (o) => { if (o) { o.updateMatrixWorld(true); caja.union(new THREE.Box3().setFromObject(o)); } };
  if (mundo.grua) { sumar(mundo.grua.grupo); sumar(mundo.grua.sueltos); }
  if (mundo.camiones) for (const c of mundo.camiones.lista) if (Math.abs(c.grupo.position.x) < 30) sumar(c.grupo);
  if (mundo.particulas) {   // desde la tierra deformable, el pozo y la montaña ya son "obra hecha"
    caja.union(new THREE.Box3(new THREE.Vector3(9.5, -1.5, -4.5), new THREE.Vector3(17, 0.5, 3.5)));
    caja.union(new THREE.Box3(new THREE.Vector3(10.5, 0, 3.5), new THREE.Vector3(20.5, 3.4, 13.5)));
  }
  const c = caja.getCenter(new THREE.Vector3()), radio = caja.getSize(new THREE.Vector3()).length() / 2;
  const dx = FIJA.pos[0] - FIJA.mira[0], dy = FIJA.pos[1] - FIJA.mira[1], dz = FIJA.pos[2] - FIJA.mira[2];
  const distF = Math.hypot(dx, dy, dz), azF = Math.atan2(dz, dx), elevF = Math.asin(dy / distF);
  const t = Math.min(1, Math.max(0, (etapa - 1) / (ETAPA_FINAL - 1)));
  let w = Math.min(1, Math.max(0, (etapa - 8) / (ETAPA_FINAL - 8))); w = w * w * (3 - 2 * w);   // de la 8 a la 13 se funde con la fija
  const mez = (a, b) => a + (b - a) * w;
  const elev0 = (24 - 16 * t) * Math.PI / 180;
  return {
    mira: [mez(c.x, FIJA.mira[0]), mez(c.y, FIJA.mira[1]), mez(c.z, FIJA.mira[2])],
    dist: mez(Math.min(distF * 1.2, (radio / Math.sin((FIJA.fov * Math.PI) / 360)) * 1.12), distF),   // a lo sumo un 20 % más lejos que el plano general (cuando el camión queda en primer plano)
    az: azF - ((1 - t) * GIRO_TOTAL * Math.PI) / 180,
    elev: mez(elev0, elevF),
  };
}
export function ponerCamara(camara, p) {
  const ch = Math.cos(p.elev) * p.dist;
  camara.position.set(p.mira[0] + Math.cos(p.az) * ch, p.mira[1] + Math.sin(p.elev) * p.dist, p.mira[2] + Math.sin(p.az) * ch);
  camara.lookAt(p.mira[0], p.mira[1], p.mira[2]);
}

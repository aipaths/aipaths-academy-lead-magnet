// Tapa antipolvo de acrílico. El MK7 no tiene bisagras: se saca entera.
// Por defecto queda parada contra la pared; el botón la pone sobre el tocadiscos.
import * as THREE from 'three';
import { M, mm } from './medidas.js';
import { MAT } from './materiales.js';
import { pieza, malla } from './piezas.js';
import { PARED_Z } from './escena.js';

const AN = M.ancho - 2,
  PR = M.prof - 2,
  AL = M.tapaAlto;

const POSES = {
  puesta: { p: new THREE.Vector3(0, mm(M.cubierta), 0), q: new THREE.Quaternion() },
  apoyada: {
    p: new THREE.Vector3(0.02, mm(PR / 2) * Math.sin(1.4) + 0.001, PARED_Z + 0.033),
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(1.4, 0, 0)),
  },
  desarmada: { p: new THREE.Vector3(0, mm(M.cubierta) + 0.5, -0.04), q: new THREE.Quaternion() },
};

export function crearTapa(raiz) {
  const tapa = pieza(
    raiz,
    'Tapa antipolvo',
    'Acrílico ahumado. En el MK7 no lleva bisagras: se apoya o se saca entera.',
    [0, 0, 0],
  );
  tapa.userData.manual = true;
  const panel = (w, h, pos, rot) => {
    const m = malla(tapa, new THREE.PlaneGeometry(mm(w), mm(h)), MAT.acrilico, { sombra: false, recibe: false });
    m.position.set(...pos.map(mm));
    m.rotation.set(...rot);
    m.renderOrder = 2;
  };
  panel(AN, PR, [0, AL, 0], [-Math.PI / 2, 0, 0]);
  panel(AN, AL, [0, AL / 2, PR / 2], [0, 0, 0]);
  panel(AN, AL, [0, AL / 2, -PR / 2], [0, Math.PI, 0]);
  panel(PR, AL, [AN / 2, AL / 2, 0], [0, Math.PI / 2, 0]);
  panel(PR, AL, [-AN / 2, AL / 2, 0], [0, -Math.PI / 2, 0]);
  // Cantos: el acrílico se ve más denso en los bordes
  const canto = new THREE.MeshStandardMaterial({
    color: 0x5b6066,
    roughness: 0.1,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const arista = (w, h, d, pos) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), canto);
    m.position.set(...pos.map(mm));
    m.renderOrder = 3;
    tapa.add(m);
  };
  for (const s of [-1, 1]) {
    arista(AN, 2.5, 2.5, [0, AL, (s * PR) / 2]);
    arista(AN, 2.5, 2.5, [0, 1.2, (s * PR) / 2]);
    arista(2.5, 2.5, PR, [(s * AN) / 2, AL, 0]);
    arista(2.5, 2.5, PR, [(s * AN) / 2, 1.2, 0]);
    for (const t of [-1, 1]) arista(2.5, AL, 2.5, [(s * AN) / 2, AL / 2, (t * PR) / 2]);
  }
  return tapa;
}

const _p = new THREE.Vector3(),
  _q = new THREE.Quaternion();

// t: 0 apoyada → 1 puesta; d: 0 armado → 1 desarmado.
export function poseTapa(tapa, t, d) {
  const e = t * t * (3 - 2 * t);
  _p.lerpVectors(POSES.apoyada.p, POSES.puesta.p, e);
  _p.y += Math.sin(Math.PI * e) * 0.16;
  _q.slerpQuaternions(POSES.apoyada.q, POSES.puesta.q, e);
  const f = d * d * (3 - 2 * d);
  tapa.position.lerpVectors(_p, POSES.desarmada.p, f);
  tapa.quaternion.slerpQuaternions(_q, POSES.desarmada.q, f);
}

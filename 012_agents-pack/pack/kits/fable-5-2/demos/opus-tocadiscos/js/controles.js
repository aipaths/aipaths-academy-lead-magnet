// Controles de la cubierta: start·stop, 33/45, perilla, iluminador, pitch, ×2, reset, luz target, adaptador.
import * as THREE from 'three';
import { M, mm } from './medidas.js';
import { MAT, conMapa } from './materiales.js';
import { pieza, malla } from './piezas.js';
import { texturaRotulo } from './texturas.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const Y = mm(M.cubierta);
const cil = (r, h, seg = 40) => new THREE.CylinderGeometry(mm(r), mm(r), mm(h), seg);
const caja = (x, y, z, r = 0.8) => new RoundedBoxGeometry(mm(x), mm(y), mm(z), 2, mm(r));
const en = (o, x, y, z) => {
  o.position.set(mm(x), Y + mm(y), mm(z));
  return o;
};

// Tecla con rótulo en la cara superior.
function tecla(p, x, z, an, pr, alto, lineas, tam) {
  const m = malla(p, caja(an, alto, pr, 1.2), MAT.resina);
  en(m, x, alto / 2, z);
  const tapa = new THREE.Mesh(
    new THREE.PlaneGeometry(mm(an - 2), mm(pr - 2)),
    conMapa(MAT.resina, texturaRotulo(lineas, 256, Math.round((256 * pr) / an), { tam })),
  );
  tapa.rotation.x = -Math.PI / 2;
  en(tapa, x, alto + 0.03, z);
  p.add(tapa);
  return m;
}

export function crearControles(raiz) {
  const r = {};

  const arranque = pieza(
    raiz,
    'Start · Stop y 33/45',
    'Tecla grande de arranque y freno (0,7 s hasta 33⅓) y selectores de velocidad.',
    [0, 120, 30],
  );
  malla(arranque, caja(M.startStop.an + 3, 2, M.startStop.pr + 3, 1), MAT.anodizadoBrillo).position.set(
    mm(M.startStop.x),
    Y + mm(1),
    mm(M.startStop.z),
  );
  r.startStop = tecla(arranque, M.startStop.x, M.startStop.z, M.startStop.an, M.startStop.pr, 7, ['START • STOP'], 30);
  r.startStop.userData.accion = 'play';
  for (const [b, t] of [
    [M.b33, '33'],
    [M.b45, '45'],
  ]) {
    tecla(arranque, b.x, b.z, 24, 8, 3, [t + '            '], 54);
    const led = malla(arranque, new THREE.BoxGeometry(mm(6), mm(0.6), mm(1.6)), t === '33' ? MAT.ledRojo : MAT.ledApagado, {
      sombra: false,
    });
    en(led, b.x + 5, 3.2, b.z);
    r['led' + t] = led;
  }

  const perilla = pieza(
    raiz,
    'Perilla de encendido e iluminador',
    'Interruptor giratorio. Al encenderse, el iluminador rojo ilumina los puntos estroboscópicos.',
    [-15, 125, 10],
  );
  malla(perilla, cil(16, 1.5), MAT.anodizadoBrillo).position.set(mm(M.encendido.x), Y + mm(0.75), mm(M.encendido.z));
  const pomo = malla(perilla, cil(13, 15, 48), MAT.aluminio);
  en(pomo, M.encendido.x, 8, M.encendido.z);
  pomo.material = MAT.anodizadoBrillo;
  const cara = new THREE.Mesh(
    new THREE.CircleGeometry(mm(12.4), 40),
    conMapa(MAT.anodizadoBrillo, texturaRotulo(['OFF   ON', '│'], 256, 256, { tam: 34, fondo: '#202024' })),
  );
  cara.rotation.x = -Math.PI / 2;
  en(cara, M.encendido.x, 15.55, M.encendido.z);
  perilla.add(cara);
  r.pomo = [pomo, cara];
  // Iluminador: cajita que apunta al eje del plato, con la lente roja del lado del borde
  const dx = M.plato.x - M.estrobo.x,
    dz = M.plato.z - M.estrobo.z,
    d = Math.hypot(dx, dz);
  const caja1 = malla(perilla, caja(12, 7, 9, 2), MAT.resina);
  en(caja1, M.estrobo.x, 3.5, M.estrobo.z);
  caja1.rotation.y = Math.atan2(dx, dz);
  const lente = malla(perilla, new THREE.BoxGeometry(mm(8), mm(4), mm(0.6)), MAT.ledApagado, { sombra: false });
  en(lente, M.estrobo.x + (dx / d) * 4.7, 4, M.estrobo.z + (dz / d) * 4.7);
  lente.rotation.y = caja1.rotation.y;
  r.lenteEstrobo = lente;

  const pitch = pieza(
    raiz,
    'Pitch fader',
    'Control de velocidad ±8 % (±16 % con ×2), con detección digital del centro.',
    [45, 120, 0],
  );
  const p = M.pitch;
  malla(pitch, caja(p.ancho, 1, p.largo, 2), MAT.anodizadoBrillo).position.set(mm(p.x), Y + mm(0.5), mm(p.z));
  malla(pitch, new THREE.BoxGeometry(mm(3), mm(1.2), mm(p.largo - 12)), MAT.hueco).position.set(mm(p.x), Y + mm(0.5), mm(p.z));
  const cursor = malla(pitch, caja(16, 12, 13, 1.5), MAT.aluminio);
  cursor.material = MAT.anodizadoBrillo;
  en(cursor, p.x, 7, p.z);
  const raya = malla(pitch, new THREE.BoxGeometry(mm(16.2), mm(0.8), mm(1.4)), MAT.cromo, { sombra: false });
  en(raya, p.x, 13.05, p.z);
  r.cursorPitch = [cursor, raya];
  const ledPitch = malla(pitch, new THREE.BoxGeometry(mm(2.4), mm(0.6), mm(1.2)), MAT.ledRojo, { sombra: false });
  en(ledPitch, p.x - 17, 0.3, p.z);

  const extras = pieza(
    raiz,
    'Botones ×2 y Reset',
    '×2 duplica el rango del pitch a ±16 %. Reset vuelve la velocidad a 0 sin mover el fader.',
    [30, 110, 0],
  );
  tecla(extras, M.x2.x, M.x2.z, 14, 7, 2.5, ['×2           '], 58);
  const led2 = malla(extras, new THREE.BoxGeometry(mm(4), mm(0.6), mm(1.4)), MAT.ledApagado, { sombra: false });
  en(led2, M.x2.x + 3.2, 2.7, M.x2.z);
  const reset = malla(extras, cil(M.reset.r, 3.5), MAT.anodizadoBrillo);
  en(reset, M.reset.x, 1.75, M.reset.z);

  const target = pieza(
    raiz,
    'Luz target',
    'Lámpara que sube con un clic para leer los surcos en una cabina oscura.',
    [0, 135, 20],
  );
  malla(target, cil(6, 1.2), MAT.anodizadoBrillo).position.set(mm(M.target.x), Y + mm(0.6), mm(M.target.z));
  const vara = malla(target, cil(3.6, 34, 24), MAT.tuboNegro);
  en(vara, M.target.x, 17, M.target.z);
  const foco = malla(target, new THREE.SphereGeometry(mm(4.2), 20, 12), MAT.luzTarget, { sombra: false });
  en(foco, M.target.x, 35, M.target.z);
  r.foco = foco;
  const aguj = new THREE.Mesh(new THREE.CircleGeometry(mm(6), 24), MAT.hueco);
  aguj.rotation.x = -Math.PI / 2;
  en(aguj, M.agujero.x, 0.05, M.agujero.z);
  raiz.add(aguj);

  const adap = pieza(
    raiz,
    'Adaptador de 45 rpm',
    'Pieza para centrar los simples de 7" de agujero grande. Vive en su hueco de la esquina.',
    [-10, 130, -25],
  );
  malla(adap, cil(M.adaptador.r + 1.5, 0.8), MAT.hueco).position.set(mm(M.adaptador.x), Y + mm(0.4), mm(M.adaptador.z));
  malla(adap, cil(M.adaptador.r, 6, 64), MAT.anodizadoBrillo).position.set(mm(M.adaptador.x), Y + mm(3), mm(M.adaptador.z));
  malla(adap, cil(3.6, 3), MAT.cromo).position.set(mm(M.adaptador.x), Y + mm(7.5), mm(M.adaptador.z));
  malla(adap, new THREE.TorusGeometry(mm(M.adaptador.r - 4), mm(0.6), 8, 64), MAT.cromo, { sombra: false })
    .rotateX(Math.PI / 2)
    .position.set(mm(M.adaptador.x), Y + mm(6.05), mm(M.adaptador.z));
  return r;
}

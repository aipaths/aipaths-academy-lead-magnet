// Mandos de la placa superior, medidos sobre la foto cenital oficial.
import * as THREE from 'three';
import { mesh, cyl, lathe, rbox } from './util.js';
import { part } from './parts.js';
import { keyTex, knobTex } from './tex-deck.js';
import { D } from './dims.js';

const Y = D.deckTop;
const LIFT = 19;     // los mandos suben con la placa (16) y un poco más

function key(m, label, w, h, d, x, z, name, info) {
  const top = new THREE.MeshStandardMaterial({ map: keyTex(label, 256, Math.round(256 * d / w)), roughness: 0.5 });
  const k = mesh(rbox(w, h, d, Math.min(0.14, h * 0.4)), [m.black, m.black, top, m.black, m.black, m.black]);
  k.position.set(x, Y + h / 2, z);
  return part(k, name, info, [0, LIFT + 2, 0]);
}

function led(mat, w, x, y, z) {
  const l = mesh(new THREE.BoxGeometry(w, 0.05, 0.12), mat, { cast: false });
  l.position.set(x, y, z); return l;
}

export function buildControls(m, root) {
  const c = {};
  c.start = key(m, 'START·STOP', 4.4, 0.7, 3.2, -14.7, 15.2, 'Botón START·STOP', 'Arranca y frena el plato con freno electrónico (0,7 s hasta 33⅓ rpm).');
  c.k33 = key(m, '33', 2.4, 0.5, 0.9, -10.8, 16.6, 'Tecla 33 rpm', 'Velocidad de LP. Con el interruptor también hay 78 rpm.');
  c.k45 = key(m, '45', 2.4, 0.5, 0.9, -8.4, 16.6, 'Tecla 45 rpm', 'Velocidad de single de 7″.');
  c.led33 = led(m.ledBlue, 0.9, 0, 0.26, 0.3); c.led45 = led(m.ledBlue.clone(), 0.9, 0, 0.26, 0.3);
  c.k33.add(c.led33); c.k45.add(c.led45);
  root.add(c.start, c.k33, c.k45);
  buildKnob(m, root, c);
  buildFader(m, root, c);
  buildMisc(m, root, c);
  return c;
}

function buildKnob(m, root, c) {
  const prof = [[0, 0], [1.25, 0], [1.28, 0.2], [1.2, 0.95], [1.0, 1.1], [0, 1.1]];
  const g = new THREE.Group();
  g.add(mesh(lathe(prof, 48), m.anodized));
  const cap = mesh(new THREE.CircleGeometry(1.0, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: knobTex('OFF'), roughness: 0.4, metalness: 0.6 }));
  cap.position.y = 1.105; g.add(cap);
  const ring = mesh(new THREE.TorusGeometry(1.32, 0.12, 8, 40, Math.PI * 1.1).rotateX(Math.PI / 2), m.ledRed, { cast: false });
  ring.position.y = 0.12; ring.rotation.y = -0.9; g.add(ring);
  g.position.set(-16.0, Y, 10.8);
  c.knob = part(g, 'Perilla de encendido', 'Enciende el tocadiscos; el aro de LED ilumina los puntos estroboscópicos del plato.', [0, LIFT + 6, 0]);
  c.ledRing = ring;
  root.add(g);
}

function buildFader(m, root, c) {
  const g = new THREE.Group();
  const cap = mesh(rbox(1.9, 1.1, 1.4, 0.2), m.anodized);
  cap.position.y = 0.55;
  const stripe = mesh(new THREE.BoxGeometry(1.5, 0.03, 0.12), m.silver, { cast: false });
  stripe.position.y = 1.11;
  g.add(cap, stripe);
  g.position.set(24.15, Y, 7.9);
  c.fader = part(g, 'Fader de pitch', 'Regula la velocidad del plato ±8 % o ±16 %. Arrastralo con el mouse.', [0, LIFT + 4, 0]);
  c.fader.userData.drag = { z0: 2.9, z1: 12.7, mid: 7.8 };
  root.add(g);
}

function buildMisc(m, root, c) {
  // RESET y ×2
  const reset = new THREE.Group();
  reset.add(mesh(cyl(0.8, 0.8, 0.35, 32), m.anodized));
  reset.position.set(20.8, Y + 0.17, 11.1);
  root.add(part(reset, 'Botón RESET del pitch', 'Vuelve la velocidad a la nominal sin importar la posición del fader.', [0, LIFT + 3, 0]));
  const x2 = mesh(rbox(1.3, 0.25, 0.55, 0.08), m.black);
  x2.position.set(24.0, Y + 0.12, -0.4);
  root.add(part(x2, 'Botón ×2 (rango del pitch)', 'Alterna el rango del pitch entre ±8 % y ±16 %.', [0, LIFT + 3, 0]));
  x2.add(led(m.ledRed, 0.6, 1.0, 0.13, -0.36));
  // luz de aguja: tope metálico con lente
  const lamp = new THREE.Group();
  lamp.add(mesh(cyl(0.55, 0.62, 0.9, 24), m.steel));
  const lens = mesh(new THREE.SphereGeometry(0.34, 16, 10, 0, 6.3, 0, 1.5), m.ledWhite, { cast: false });
  lens.position.y = 0.45; lamp.add(lens);
  lamp.position.set(8.2, Y + 0.45, 16.1);
  c.lamp = part(lamp, 'Luz de aguja (LED)', 'LED blanco de larga vida para ver la aguja en un club a oscuras.', [0, LIFT + 5, 0]);
  c.lens = lens;
  root.add(lamp);
  // adaptador de 45 rpm sobre su soporte
  const ad = new THREE.Group();
  ad.add(mesh(cyl(1.15, 1.2, 0.5, 40), m.anodized));
  const cone = mesh(cyl(0.3, 0.8, 0.28, 32), m.steel); cone.position.y = 0.38; ad.add(cone);
  ad.position.set(-14.6, Y + 0.25, -14.2);
  root.add(part(ad, 'Adaptador de 45 rpm', 'Se coloca sobre el eje para tocar singles de 7″ de agujero grande.', [-4, 34, -3]));
}

// Brazo en S de balance estático. Largo efectivo 230 mm, pivote a 215 mm del eje, offset 22°.
import * as THREE from 'three';
import { mesh, cyl, lathe, rbox } from './util.js';
import { part } from './parts.js';
import { knobTex } from './tex-deck.js';
import { D } from './dims.js';

const P = D.pivot, Y = D.deckTop, TY = D.tubeY;
const THETA_PO = Math.atan2(-P.z, -P.x);          // del pivote hacia el eje del plato
export const THETA_REST = 100.5 * Math.PI / 180;

/** Ángulo del brazo para que la aguja caiga en el radio r (cm) del disco. */
export function thetaForRadius(r) {
  const c = (D.d * D.d + D.L * D.L - r * r) / (2 * D.d * D.L);
  return THETA_PO - Math.acos(Math.min(1, c));
}

const S_CURVE = [[-6.8, 0], [-3, 0], [0, 0], [3, -0.6], [7, -1.4], [11, -2.15], [14.5, -2.7], [16.6, -2.55], [18.4, -1.9]];

export function buildArm(m, root) {
  const out = {};
  buildStatic(m, root);
  const yaw = new THREE.Group(); yaw.position.set(P.x, TY, P.z);
  const pitch = new THREE.Group(); yaw.add(pitch);
  const tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(S_CURVE.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal'), 90, 0.32, 14), m.blackGlossy);
  pitch.add(part(tube, 'Tubo del brazo (forma de S)', 'Brazo universal en S, balance estático, largo efectivo 230 mm.', [0, 31, 0]));

  const cw = new THREE.Group();
  cw.add(mesh(cyl(1.45, 1.45, 2.6, 40).rotateZ(Math.PI / 2), m.anodized));
  for (const x of [-1.1, 1.1]) { const r = mesh(new THREE.TorusGeometry(1.46, 0.07, 8, 40).rotateY(Math.PI / 2), m.silver); r.position.x = x; cw.add(r); }
  const dial = mesh(cyl(1.2, 1.2, 0.5, 40).rotateZ(Math.PI / 2), m.black); dial.position.x = 1.5; cw.add(dial);
  cw.position.x = -5.7;
  pitch.add(part(cw, 'Contrapeso', 'Se desliza para equilibrar el brazo y dar la fuerza de aguja (0–4 g).', [-3, 34, 0]));

  buildHeadshell(m, pitch);
  out.yaw = yaw; out.pitch = pitch;
  out.setTheta = (t) => { yaw.rotation.y = -t; };
  out.setLift = (cm) => { pitch.rotation.z = cm * 0.045; };
  out.setTheta(THETA_REST);
  root.add(yaw);
  return out;
}

function buildHeadshell(m, pitch) {
  const Cx = 18.36, Cz = -1.87;
  const hs = new THREE.Group();
  hs.position.set(Cx, 0, Cz); hs.rotation.y = -D.offset;
  const plate = mesh(rbox(4.9, 0.14, 1.9, 0.05), m.blackGlossy); plate.position.set(2.45, -0.42, 0);
  const collar = mesh(cyl(0.55, 0.55, 0.9, 28).rotateZ(Math.PI / 2), m.silver); collar.position.set(0.3, 0, 0);
  const neck = mesh(rbox(1.5, 0.35, 0.7, 0.08), m.blackGlossy); neck.position.set(0.9, -0.2, 0);
  const finger = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8).rotateZ(Math.PI / 2), m.silver); finger.position.set(1.6, -0.28, 0.9);
  hs.add(plate, collar, neck, finger);
  pitch.add(part(hs, 'Portacápsula (headshell)', 'Soporta la cápsula con el ángulo de offset de 22°. Pesa unos 7,6 g.', [2, 27, 0]));

  const cart = new THREE.Group();
  cart.add(mesh(rbox(2.5, 1.45, 1.7, 0.15), m.cartridge));
  const stripe = mesh(new THREE.BoxGeometry(0.5, 1.2, 1.72), m.silver, { cast: false }); stripe.position.x = -0.6; cart.add(stripe);
  cart.position.set(3.2, -1.25, 0);
  hs.add(part(cart, 'Cápsula (cartucho)', 'Convierte las vibraciones del surco en señal eléctrica (imán móvil).', [2, -6, 0]));

  const st = new THREE.Group();
  const cant = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 8), m.silver);
  cant.rotation.z = Math.PI / 2 - 0.55; cant.position.set(0.3, -0.12, 0);
  const tip = mesh(new THREE.SphereGeometry(0.075, 12, 10), m.stylus); tip.position.set(0.62, -0.28, 0);
  const hit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0.3, -0.1, 0);
  st.add(cant, tip, hit);
  st.position.set(4.4, -1.97, 0);      // la punta queda en x = 5,0 desde el collar: a 230 mm del pivote
  hs.add(part(st, 'Aguja (stylus)', 'Punta de diamante: lee el surco y hace vibrar la cápsula.', [2, -18, 0]));
}

function buildStatic(m, root) {
  const base = new THREE.Group();
  const prof = [[3.0, 0], [5.0, 0], [5.0, 0.55], [4.6, 0.9], [3.7, 0.9], [3.5, 0.6], [3.0, 0.6]];
  base.add(mesh(lathe(prof, 64), m.blackGlossy));
  const ring = mesh(new THREE.TorusGeometry(4.7, 0.09, 8, 80).rotateX(Math.PI / 2), m.silver); ring.position.y = 0.88; base.add(ring);
  base.position.set(P.x, Y, P.z);
  root.add(part(base, 'Base del brazo', 'Soporte circular del brazo, fijo a la placa superior.', [0, 16, 0]));

  const post = new THREE.Group();
  post.add(mesh(cyl(1.4, 1.5, TY + 1.0 - Y - 0.9, 32), m.anodized));
  const cap = mesh(cyl(1.5, 1.5, 0.5, 32), m.anodized); cap.position.y = (TY + 1.0 - Y - 0.9) / 2; post.add(cap);
  post.position.set(P.x, (Y + 0.9 + TY + 1.0) / 2, P.z);
  root.add(part(post, 'Pilar y cojinete vertical', 'Cojinete de baja fricción: deja girar el brazo sobre el disco.', [0, 21, 0]));

  const collar = mesh(cyl(2.0, 2.0, 0.9, 40), m.black);
  collar.position.set(P.x, Y + 1.6, P.z);
  root.add(part(collar, 'Anillo de altura del brazo', 'Regula la altura del brazo de 0 a 6 mm.', [0, 19, 0]));

  const as = new THREE.Group();
  as.add(mesh(cyl(1.1, 1.1, 0.8, 36), m.anodized));
  const top = mesh(new THREE.CircleGeometry(0.95, 36).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: knobTex('0 1 2 3'), roughness: 0.5, metalness: 0.5 }));
  top.position.y = 0.405; as.add(top);
  as.position.set(24.3, Y + 0.9 + 0.4, -7.9);
  root.add(part(as, 'Rueda anti-skate', 'Compensa la fuerza que empuja la aguja hacia el centro.', [3, 22, 0]));

  const lever = new THREE.Group();
  const bar = mesh(rbox(5.2, 0.3, 0.55, 0.08), m.anodized); bar.position.x = 2.6;
  const pad = mesh(rbox(1.4, 0.34, 0.95, 0.1), m.black); pad.position.x = 4.7;
  lever.add(bar, pad);
  lever.position.set(22.2, Y + 1.2, -6.4); lever.rotation.y = -Math.atan2(4.9, 1.6);
  root.add(part(lever, 'Palanca de elevación', 'Sube y baja el brazo con suavidad sobre el surco.', [5, 20, 0]));

  const rest = new THREE.Group();
  rest.add(mesh(cyl(0.55, 0.7, TY - 0.45 - Y, 20), m.blackGlossy));
  const cradle = mesh(new THREE.TorusGeometry(0.4, 0.12, 8, 16, Math.PI).rotateZ(Math.PI), m.silver); cradle.position.y = (TY - 0.45 - Y) / 2 + 0.4;
  rest.add(cradle);
  rest.position.set(20.0, Y + (TY - 0.45 - Y) / 2, 5.25);
  root.add(part(rest, 'Soporte de reposo del brazo', 'Apoyo donde descansa el brazo cuando no suena un disco.', [4, 17, 0]));
}

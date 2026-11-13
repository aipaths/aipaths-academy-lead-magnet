// Chasis: caja inferior, placa superior, patas aisladoras y panel trasero.
import * as THREE from 'three';
import { mesh, cyl, lathe, rbox } from './util.js';
import { part } from './parts.js';
import { D } from './dims.js';

function roundRect(w, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const extrude = (shape, depth, bevel) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 40 });
  g.rotateX(-Math.PI / 2);          // extrusión hacia arriba
  return g;
};

export function buildChassis(m, root) {
  const bevel = 0.12, wall = 1.6;
  // caja inferior: paredes huecas + piso, para ver el motor al desarmar
  const outer = roundRect(D.w - 2 * bevel, D.dp - 2 * bevel, 1.0);
  const hole = roundRect(D.w - 2 * wall, D.dp - 2 * wall, 0.6);
  outer.holes.push(new THREE.Path(hole.getPoints(24)));
  const base = new THREE.Group();
  const walls = mesh(extrude(outer, D.baseH - 1.0 - 2 * bevel, bevel), m.black);
  walls.position.y = bevel + 0.9;
  const floor = mesh(rbox(D.w - 0.2, 1.1, D.dp - 0.2, 0.3), m.black);
  floor.position.y = 0.55;
  base.add(walls, floor, part(buildRear(m), 'Conectores traseros (PHONO, tierra y corriente)', 'Salida PHONO con cable desmontable, borne de tierra y entrada de corriente de 110–240 V.', [0, 0, -9]));
  base.position.set(D.cx, D.feetH, D.cz);
  root.add(part(base, 'Chasis (caja inferior)', 'Caja de dos capas con alta rigidez: aguanta el volumen alto sin realimentación.', [0, 0, 0]));

  // placa superior con el pozo del plato; lleva la serigrafía
  const top = roundRect(D.w - 2 * bevel, D.dp - 2 * bevel, 1.0);
  const well = new THREE.Path(); well.absarc(-D.cx, D.cz, 16.75, 0, Math.PI * 2, true);
  top.holes.push(well);
  const deck = new THREE.Group();
  const plate = mesh(extrude(top, D.deckT - 2 * bevel, bevel), m.black);
  plate.position.y = bevel;
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(D.w - 0.1, D.dp - 0.1).rotateX(-Math.PI / 2), m.deckDecal);
  decal.position.y = D.deckT + 0.004; decal.receiveShadow = true; decal.renderOrder = 2;
  deck.add(plate, decal);
  deck.position.set(D.cx, D.deckTop - D.deckT, D.cz);
  root.add(part(deck, 'Placa superior del chasis', 'Placa negra mate con el pozo del plato, la ranura del pitch y los mandos.', [0, 16, 0]));

  buildFeet(m, root);
  return { base, deck };
}

function buildFeet(m, root) {
  const prof = [[0, 0], [2.9, 0], [3.2, 0.3], [3.2, 1.6], [2.9, 2.0], [2.6, D.feetH], [0, D.feetH]];
  const ring = new THREE.TorusGeometry(3.1, 0.12, 6, 40).rotateX(Math.PI / 2);
  const sx = [D.x0 + 4.4, D.x1 - 4.4], sz = [D.z0 + 4.4, D.z1 - 4.4];
  let n = 1;
  for (const x of sx) for (const z of sz) {
    const f = new THREE.Group();
    f.add(mesh(lathe(prof, 40), m.rubber));
    const r = mesh(ring, m.anodized); r.position.y = 1.1; f.add(r);
    f.position.set(x, 0, z);
    root.add(part(f, `Pata aisladora ${n++}`, 'Pata de goma regulable que aísla las vibraciones del escritorio.',
      [Math.sign(x - D.cx) * 3, -2.5, Math.sign(z - D.cz) * 3]));
  }
}

/** Panel trasero: salida PHONO (RCA), tierra y entrada de corriente (foto de interiores del catálogo). */
function buildRear(m) {
  const g = new THREE.Group();
  const y = 2.4, z = -D.dp / 2;
  const plate = mesh(rbox(11, 3.4, 0.3, 0.1), m.blackGlossy);
  plate.position.set(-2.4, y, z + 0.05); g.add(plate);
  [['#f2f2f2', 1.1], ['#d02a1c', -1.1]].forEach(([c, dx]) => {
    const jack = mesh(cyl(0.55, 0.55, 1.1, 24).rotateX(Math.PI / 2), m.steel);
    jack.position.set(-4.6 + dx + 1.1, y + 0.25, z - 0.4); g.add(jack);
    const col = mesh(cyl(0.7, 0.7, 0.25, 24).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }));
    col.position.set(-4.6 + dx + 1.1, y + 0.25, z - 0.2); g.add(col);
  });
  const earth = mesh(cyl(0.5, 0.5, 0.9, 6).rotateX(Math.PI / 2), m.silver);
  earth.position.set(-1.0, y - 0.2, z - 0.4); g.add(earth);
  const ac = mesh(rbox(2.6, 1.4, 1.0, 0.15), m.blackGlossy);
  ac.position.set(2.6, y + 0.1, z - 0.3); g.add(ac);
  return g;
}

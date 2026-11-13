// Plato, slipmat, disco, eje y las piezas del motor sin núcleo (foto de interiores del catálogo).
import * as THREE from 'three';
import { mesh, cyl, lathe, disc } from './util.js';
import { part } from './parts.js';
import { D } from './dims.js';

export function buildPlatter(m, root) {
  const out = { spin: [] };
  const g = new THREE.Group();
  // cáscara de aluminio inyectado: tapa, faldón y cubo central
  const prof = [[0, 2.3], [16.42, 2.3], [16.6, 2.12], [16.6, 0.25], [16.4, 0], [15.85, 0], [15.85, 1.6],
    [3.4, 1.6], [3.4, 0.15], [2.7, 0.15], [2.7, 1.9], [0.45, 1.9], [0.45, 0]];
  const platterMat = m.platter.clone(); platterMat.side = THREE.DoubleSide;
  g.add(mesh(lathe(prof, 128), platterMat));
  // nervaduras radiales bajo la tapa
  const rib = new THREE.BoxGeometry(12.4, 1.25, 0.32);
  const ribs = new THREE.InstancedMesh(rib, m.platterDark, 24);
  const o = new THREE.Object3D();
  for (let i = 0; i < 24; i++) {
    o.position.set(0, 0.98, 0); o.rotation.set(0, (i / 24) * Math.PI * 2, 0);
    o.translateX(9.55); o.updateMatrix(); ribs.setMatrixAt(i, o.matrix);
  }
  ribs.castShadow = true; g.add(ribs);
  g.add(disc(D.platterR - 0.01, m.strobe, 2.304, 14.0, 128));
  g.position.y = D.platterTop - 2.3;
  root.add(part(g, 'Plato', 'Aluminio inyectado, Ø 332 mm. El borde lleva los puntos estroboscópicos para controlar la velocidad.', [0, 27, 0]));
  out.platter = g; out.spin.push(g);

  const mat = new THREE.Group();
  mat.add(mesh(cyl(D.matR, D.matR, 0.3, 96, true), m.black));
  mat.add(disc(D.matR, m.slipmat, 0.15 + 0.002));
  mat.position.y = D.platterTop + 0.15;
  root.add(part(mat, 'Slipmat', 'Fieltro negro con el logo Technics; deja deslizar el disco para hacer scratch.', [0, 33, 0]));
  out.slipmat = mat; out.spin.push(mat);

  const rec = new THREE.Group();
  rec.add(mesh(cyl(D.recR, D.recR, 0.2, 128), m.blackGlossy));
  rec.add(disc(D.recR, m.vinyl, 0.1 + 0.003, 0, 128));
  rec.add(disc(5.0, m.label, 0.1 + 0.006, 0, 64));
  rec.position.y = D.matTop + 0.1;
  root.add(part(rec, 'Disco de vinilo', 'LP de 12″ (Ø 300 mm) con surcos, tres temas y etiqueta central. Gira a 33⅓ rpm.', [0, 40, 0]));
  out.record = rec; out.spin.push(rec);

  const sp = new THREE.Group();
  sp.add(mesh(cyl(0.36, 0.36, 1.8, 20), m.steel));
  const tip = mesh(new THREE.ConeGeometry(0.36, 0.3, 20), m.steel); tip.position.y = 1.05; sp.add(tip);
  sp.position.y = D.platterTop + 0.9 + 1.2;
  root.add(part(sp, 'Eje central (spindle)', 'Centra el disco sobre el plato.', [0, 46, 0]));
  buildMotor(m, root, out);
  return out;
}

function buildMotor(m, root, out) {
  const pcb = new THREE.Group();
  pcb.add(mesh(cyl(9.2, 9.2, 0.25, 64), m.pcb));
  const trace = mesh(new THREE.TorusGeometry(7.4, 0.07, 6, 80).rotateX(Math.PI / 2), m.brass);
  trace.position.y = 0.13; pcb.add(trace);
  pcb.position.y = 3.9;
  root.add(part(pcb, 'Placa del motor (PCB)', 'Electrónica de control digital: regula torque y velocidad en cuatro niveles.', [0, 3, 0]));

  const coils = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const c = mesh(cyl(8.6, 8.6, 0.55, 20, false), m.copper);
    c.geometry = new THREE.CylinderGeometry(8.6, 8.6, 0.55, 14, 1, false, i * 0.698, 0.52);
    coils.add(c);
  }
  coils.position.y = 4.5;
  root.add(part(coils, 'Bobinas del motor (cobre)', 'Motor directo sin núcleo: sin imanes que «peguen» el giro, la rotación es pareja.', [0, 6.5, 0]));

  const rotor = new THREE.Group();
  rotor.add(mesh(lathe([[0.9, 0], [9.4, 0], [9.4, 0.7], [9.0, 0.7], [9.0, 0.35], [0.9, 0.35]], 64), m.magnet));
  rotor.children[0].material = m.magnet.clone(); rotor.children[0].material.side = THREE.DoubleSide;
  rotor.position.y = 5.3;
  root.add(part(rotor, 'Rotor magnético del motor', 'Imán anular que gira pegado al plato.', [0, 11, 0]));

  const bearing = new THREE.Group();
  bearing.add(mesh(cyl(1.25, 1.25, 3.2, 32), m.brass));
  const shaft = mesh(cyl(0.5, 0.5, 4.2, 24), m.steel); shaft.position.y = 1.6; bearing.add(shaft);
  bearing.position.set(0, 5.1, 0);
  root.add(part(bearing, 'Eje y cojinete (latón)', 'Cojinete de latón donde apoya el plato.', [0, 17, 0]));
  out.rotor = rotor;
}

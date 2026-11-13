// Chasis, base inferior, patas aisladoras y serigrafía de la cubierta.
import * as THREE from 'three';
import { M, mm } from './medidas.js';
import { MAT, conMapa } from './materiales.js';
import { pieza, malla } from './piezas.js';
import { texturaCubierta } from './texturas.js';

// Rectángulo redondeado extruido hacia arriba, con bisel suave en los bordes.
function bloque(ancho, prof, alto, radio, bisel) {
  const w = mm(ancho / 2 - bisel),
    d = mm(prof / 2 - bisel),
    r = mm(radio);
  const s = new THREE.Shape();
  s.moveTo(-w + r, -d);
  s.lineTo(w - r, -d);
  s.quadraticCurveTo(w, -d, w, -d + r);
  s.lineTo(w, d - r);
  s.quadraticCurveTo(w, d, w - r, d);
  s.lineTo(-w + r, d);
  s.quadraticCurveTo(-w, d, -w, d - r);
  s.lineTo(-w, -d + r);
  s.quadraticCurveTo(-w, -d, -w + r, -d);
  const b = mm(bisel);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: mm(alto) - 2 * b,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, b, 0);
  return geo;
}

// Pata con estrías horizontales (torneado).
function geoPata() {
  const p = [new THREE.Vector2(0, 0)];
  const alto = M.pataAlto,
    r = 29;
  p.push(new THREE.Vector2(mm(r - 1), 0));
  for (let y = 1.5; y < alto - 4; y += 2.2) {
    p.push(new THREE.Vector2(mm(r), mm(y)), new THREE.Vector2(mm(r - 0.9), mm(y + 1.1)));
  }
  p.push(new THREE.Vector2(mm(r - 3), mm(alto - 1)), new THREE.Vector2(mm(r - 7), mm(alto)), new THREE.Vector2(0, mm(alto)));
  return new THREE.LatheGeometry(p, 48);
}

export function crearChasis(raiz) {
  const altoBase = 17,
    altoAlu = M.chasisAlto - altoBase;

  const base = pieza(
    raiz,
    'Base inferior',
    'Cuerpo de BMC (compuesto de resina y mineral) con goma: absorbe vibraciones.',
    [0, 30, 0],
  );
  const gBase = bloque(M.ancho - 1.5, M.prof - 1.5, altoBase, 7, 1);
  malla(base, gBase, MAT.resina).position.y = mm(M.pataAlto);

  const chasis = pieza(
    raiz,
    'Chasis de aluminio',
    'Cubierta superior de aluminio inyectado, anodizado negro (el primer SL-1200 todo negro).',
    [0, 75, 0],
  );
  malla(chasis, bloque(M.ancho, M.prof, altoAlu, 7, 2.2), MAT.anodizado).position.y = mm(M.pataAlto + altoBase);
  // Cara superior con la serigrafía
  const deco = new THREE.Mesh(
    new THREE.PlaneGeometry(mm(M.ancho - 4.4), mm(M.prof - 4.4)),
    conMapa(MAT.anodizado, texturaCubierta(), { roughness: 0.48, metalness: 0.5 }),
  );
  deco.material.map.repeat.set((M.ancho - 4.4) / M.ancho, (M.prof - 4.4) / M.prof);
  deco.material.map.offset.set(2.2 / M.ancho, 2.2 / M.prof);
  deco.rotation.x = -Math.PI / 2;
  deco.position.y = mm(M.cubierta) + 0.00005;
  deco.receiveShadow = true;
  chasis.add(deco);

  const patas = pieza(
    raiz,
    'Patas aisladoras',
    'Cuatro patas de goma de silicona, regulables en altura: aíslan del golpe de los parlantes.',
    [0, 0, 0],
  );
  const gp = geoPata();
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const pata = malla(patas, gp, MAT.goma);
    pata.position.set(mm(sx * (M.ancho / 2 - 45)), 0, mm(sz * (M.prof / 2 - 45)));
  }
  return { chasis, base, patas };
}

import * as THREE from 'three';
import { TREN, SUPER } from './medidas.js';
import { MAT, Armador, sombra, caja, rueda } from './materiales.js';

const A = TREN.entreEjes / 2;            // media distancia entre ruedas
const C = TREN.alto / 2;                 // altura del centro de las ruedas
const R = C - 0.045;                     // radio por donde corre el centro de cada zapata
const LARGO = 4 * A + 2 * Math.PI * R;   // largo de la cadena
const ZC = (TREN.anchoTotal - TREN.zapata) / 2;   // centro de cada oruga

// Punto de la cadena a una distancia s: tramo de abajo, vuelta delantera, tramo de arriba, vuelta trasera.
function enCadena(s, out) {
  s = ((s % LARGO) + LARGO) % LARGO;
  if (s < 2 * A) return out.set(-A + s, C - R, 0);
  s -= 2 * A;
  if (s < Math.PI * R) { const a = s / R; return out.set(A + Math.sin(a) * R, C - Math.cos(a) * R, a); }
  s -= Math.PI * R;
  if (s < 2 * A) return out.set(A - s, C + R, Math.PI);
  const a = (s - 2 * A) / R + Math.PI;
  return out.set(-A + Math.sin(a) * R, C - Math.cos(a) * R, a);
}

function zapata() {
  const a = new Armador(), p = TREN.paso - 0.012;
  a.add(MAT.oruga, caja(p, 0.05, TREN.zapata), 0, 0, 0);
  for (const x of [-0.07, 0, 0.07]) a.add(MAT.oruga, caja(0.022, 0.04, TREN.zapata - 0.04), x, -0.043, 0);   // 3 nervios
  a.add(MAT.oruga, caja(p * 0.8, 0.09, 0.2), 0, 0.06, 0);   // eslabón de la cadena
  return a.grupo().children[0].geometry;
}

function dentada(r, dientes, ancho) {
  const f = new THREE.Shape();
  for (let i = 0; i < dientes * 2; i++) {
    const a = (i / (dientes * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 0.86;
    for (const da of [-0.25, 0.25]) { const b = a + (da * Math.PI) / dientes; f[i || da > 0 ? 'lineTo' : 'moveTo'](Math.cos(b) * rr, Math.sin(b) * rr); }
  }
  return new THREE.ExtrudeGeometry(f, { depth: ancho, bevelEnabled: false }).translate(0, 0, -ancho / 2);
}

function unaOruga(lado) {
  const g = new THREE.Group(); g.position.z = lado * ZC;
  const a = new Armador();
  // bastidor: una viga cajón con tapas inclinadas, como en la foto lateral
  a.add(MAT.gris, caja(2 * A - 0.5, 0.52, 0.5), 0, C, 0);
  a.add(MAT.gris, caja(2 * A - 1.3, 0.16, 0.62), 0, C + 0.3, 0);
  for (let i = 0; i < TREN.rodillos; i++) {
    const x = -A + 0.75 + (i * (2 * A - 1.5)) / (TREN.rodillos - 1);
    a.add(MAT.acero, rueda(0.15, 0.34, 16), x, 0.26, 0); a.add(MAT.gris, caja(0.2, 0.16, 0.56), x, 0.33, 0);
  }
  for (let i = 0; i < TREN.rodillosArriba; i++) a.add(MAT.acero, rueda(0.11, 0.3, 14), (i - 0.5) * 2.2, C + R - 0.2, 0);
  // guías y reductor de traslación (del lado de afuera de la rueda motriz)
  a.add(MAT.gris, rueda(0.3, 0.2, 20), -A, C, lado * 0.33); a.add(MAT.negro, rueda(0.2, 0.1, 16), -A, C, lado * 0.46);
  a.add(MAT.gris, caja(0.9, 0.22, 0.56), A - 0.55, C, 0);   // tensor de la rueda guía
  g.add(a.grupo('bastidor'));
  const motriz = sombra(new THREE.Mesh(dentada(R - 0.05, 13, 0.16), MAT.acero)); motriz.position.set(-A, C, 0);
  const tensoraGeo = new Armador().add(MAT.acero, rueda(R - 0.1, 0.22, 28)).add(MAT.acero, rueda(R - 0.03, 0.06, 28)).grupo().children[0].geometry;
  const tensora = sombra(new THREE.Mesh(tensoraGeo, MAT.acero)); tensora.position.set(A, C, 0);
  g.add(motriz, tensora);
  const n = Math.round(LARGO / TREN.paso);
  const zapatas = sombra(new THREE.InstancedMesh(zapata(), MAT.oruga, n));
  g.add(zapatas);
  return { g, zapatas, n, motriz, tensora, avance: 0 };
}

export function crearTren() {
  const grupo = new THREE.Group(); grupo.name = 'tren de orugas';
  const a = new Armador();
  // carro central en X, con las vigas que van a cada oruga y la corona de giro arriba
  a.add(MAT.gris, caja(2.5, 0.62, 2.3), 0, TREN.luz + 0.31, 0);
  for (const x of [-1.25, 1.25]) a.add(MAT.gris, caja(0.75, 0.5, 2 * ZC - 0.3), x, TREN.luz + 0.3, 0);
  a.add(MAT.gris, new THREE.CylinderGeometry(1.25, 1.35, 0.2, 40), 0, TREN.luz + 0.72, 0);
  a.add(MAT.acero, new THREE.CylinderGeometry(1.12, 1.12, SUPER.piso - TREN.luz - 0.82, 40), 0, (SUPER.piso + TREN.luz + 0.82) / 2, 0);
  grupo.add(a.grupo('carro'));
  const orugas = [unaOruga(-1), unaOruga(1)];   // [izquierda, derecha]
  orugas.forEach((o) => grupo.add(o.g));
  const p = new THREE.Vector3(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), eje = new THREE.Vector3(0, 0, 1), uno = new THREE.Vector3(1, 1, 1);
  // Mueve las zapatas: cada una avanza por la cadena lo mismo que avanzó la oruga.
  function mover(izq = 0, der = 0) {
    [izq, der].forEach((d, k) => {
      const o = orugas[k]; o.avance -= d;
      for (let i = 0; i < o.n; i++) {
        enCadena(i * (LARGO / o.n) + o.avance, p); q.setFromAxisAngle(eje, p.z);
        o.zapatas.setMatrixAt(i, m.compose(new THREE.Vector3(p.x, p.y, 0), q, uno));
      }
      o.zapatas.instanceMatrix.needsUpdate = true;
      o.motriz.rotation.z = o.tensora.rotation.z = o.avance / R;
    });
  }
  mover();
  return { grupo, mover, ZC };
}

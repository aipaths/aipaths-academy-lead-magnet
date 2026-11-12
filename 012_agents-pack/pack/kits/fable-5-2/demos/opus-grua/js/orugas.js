// Tren de orugas del HS 8100 HD: 2 orugas de 6,45 m × 1,22 m, tejas de 800 mm (3-web), trocha 4,95 m.
import * as THREE from 'three';
import { GRUA } from './config.js';
import { MAT, caja, tubo, fusionar } from './materiales.js';

const R = 0.55, XC = GRUA.orugaLargo / 2 - R - 0.05, YC = R + 0.07;     // centros de rueda motriz y guía
const PER = 4 * XC + 2 * Math.PI * R, PASO = 0.3, NT = Math.round(PER / PASO);

// Punto del recorrido de la cadena para un parámetro s (m) — un "estadio" alrededor de las ruedas.
function recorrido(s, p, ang) {
  s = ((s % PER) + PER) % PER;
  const recta = 2 * XC, curva = Math.PI * R;
  if (s < recta) { p.set(XC - s, YC - R, 0); ang.v = 0; return; }                         // abajo, hacia atrás
  s -= recta;
  if (s < curva) { const a = s / R; p.set(-XC - Math.sin(a) * R, YC - Math.cos(a) * R, 0); ang.v = -a; return; }
  s -= curva;
  if (s < recta) { p.set(-XC + s, YC + R, 0); ang.v = -Math.PI; return; }                   // arriba, hacia adelante
  s -= recta; const a = s / R; p.set(XC + Math.sin(a) * R, YC + Math.cos(a) * R, 0); ang.v = -Math.PI - a;
}

function geoTeja() {
  const w = GRUA.zapata, partes = [caja(PASO * 0.92, 0.05, w, 0, 0, 0)];
  for (const dx of [-0.09, 0, 0.09]) partes.push(caja(0.025, 0.045, w, dx, -0.045, 0));     // 3 garras
  partes.push(caja(0.16, 0.06, 0.32, 0, 0.05, 0));                                         // eslabón
  return fusionar(partes);
}

function bastidor() {
  const forma = new THREE.Shape();
  forma.moveTo(-XC - 0.2, YC - 0.25); forma.lineTo(XC + 0.2, YC - 0.25); forma.lineTo(XC - 0.3, YC + 0.42);
  forma.lineTo(-XC + 0.3, YC + 0.42); forma.closePath();
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.56, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
  g.translate(0, 0, -0.28);
  const rodillos = [], ruedas = [];
  for (let k = 0; k < 8; k++) { const x = -XC + 0.35 + k * (2 * XC - 0.7) / 7; const c = new THREE.CylinderGeometry(0.17, 0.17, 0.62, 14); c.rotateX(Math.PI / 2); c.translate(x, YC - R + 0.2, 0); rodillos.push(c); }
  for (const x of [-XC * 0.45, XC * 0.45]) { const c = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12); c.rotateX(Math.PI / 2); c.translate(x, YC + R - 0.17, 0); rodillos.push(c); }
  for (const [x, dientes] of [[-XC, 13], [XC, 0]]) {                                        // motriz atrás, guía adelante
    const c = new THREE.CylinderGeometry(R - 0.08, R - 0.08, 0.5, 26); c.rotateX(Math.PI / 2); c.translate(x, YC, 0); ruedas.push(c);
    for (let d = 0; d < dientes; d++) { const a = d / dientes * Math.PI * 2; ruedas.push(caja(0.12, 0.14, 0.1, x + Math.cos(a) * (R - 0.05), YC + Math.sin(a) * (R - 0.05), 0)); }
    const tapa = new THREE.CylinderGeometry(0.22, 0.26, 0.7, 16); tapa.rotateX(Math.PI / 2); tapa.translate(x, YC, 0); ruedas.push(tapa);
  }
  return { bastidor: g, rodillos: fusionar(rodillos), ruedas: fusionar(ruedas) };
}

export function crearOrugas() {
  const grupo = new THREE.Group();
  const teja = geoTeja(), b = bastidor();
  const lados = [];
  for (const lado of [-1, 1]) {
    const z = lado * (GRUA.trocha - GRUA.zapata) / 2;
    const g = new THREE.Group(); g.position.z = z;
    const marco = new THREE.Mesh(b.bastidor, MAT.grisOscuro);
    const rod = new THREE.Mesh(b.rodillos, MAT.negro), rue = new THREE.Mesh(b.ruedas, MAT.negro);
    const tejas = new THREE.InstancedMesh(teja, MAT.oruga, NT);
    for (const m of [marco, rod, rue, tejas]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
    grupo.add(g);
    lados.push({ tejas, s: 0 });
  }
  // Chasis central (carbody) con el anillo de giro arriba.
  const centro = fusionar([caja(3.3, 0.8, GRUA.trocha - 2 * GRUA.zapata - 0.1, 0, 0.95, 0), caja(1.4, 0.5, GRUA.trocha - 1.2, 0, 0.9, 0)]);
  const anillo = new THREE.CylinderGeometry(1.25, 1.35, 0.3, 40); anillo.translate(0, 1.5, 0);
  for (const [g, m] of [[centro, MAT.grisOscuro], [anillo, MAT.negro]]) { const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; grupo.add(me); }

  const p = new THREE.Vector3(), ang = { v: 0 }, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), E = new THREE.Euler(), uno = new THREE.Vector3(1, 1, 1);
  const colocar = (l) => {
    for (let k = 0; k < NT; k++) {
      recorrido(k * PER / NT + l.s, p, ang); E.set(0, 0, ang.v); q.setFromEuler(E);
      l.tejas.setMatrixAt(k, m4.compose(p, q, uno));
    }
    l.tejas.instanceMatrix.needsUpdate = true;
  };
  lados.forEach(colocar);
  return {
    grupo, altura: 1.65,
    // Avanza cada cadena según lo que recorrió su lado (m). Positivo = hacia adelante.
    mover(izq, der) { if (izq) { lados[0].s += izq; colocar(lados[0]); } if (der) { lados[1].s += der; colocar(lados[1]); } },
  };
}

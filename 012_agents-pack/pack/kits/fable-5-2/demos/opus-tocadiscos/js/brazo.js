// Brazo en S estático universal: 230 mm efectivos, overhang 15 mm, offset 22°.
// Jerarquía: giroY (pivote) → alzada (inclina) → tubo, headshell, cápsula, contrapeso.
import * as THREE from 'three';
import { M, mm, alturaDisco } from './medidas.js';
import { MAT } from './materiales.js';
import { pieza, malla } from './piezas.js';

const B = M.brazo;
const L = B.largo;
const yTubo = () => alturaDisco() + B.sobreDisco;
const cil = (r, h, seg = 40) => new THREE.CylinderGeometry(mm(r), mm(r), mm(h), seg);
// Eje x local = del pivote a la aguja; z local positivo = hacia el lado del eje del plato.
const CURVA = [
  [0, 0],
  [60, -12],
  [120, -24],
  [158, -27],
  [179, -21],
];

// Ángulo de giro (rotation.y) para que la aguja quede a `r` mm del eje del plato.
export function anguloParaRadio(r) {
  const sx = M.plato.x - B.x,
    sz = M.plato.z - B.z,
    d = Math.hypot(sx, sz);
  const a = (L * L - r * r + d * d) / (2 * d),
    h = Math.sqrt(Math.max(L * L - a * a, 0));
  const mx = (a * sx) / d,
    mz = (a * sz) / d;
  // De las dos soluciones, la que queda hacia el frente.
  const c1 = [mx - (h * sz) / d, mz + (h * sx) / d],
    c2 = [mx + (h * sz) / d, mz - (h * sx) / d];
  const [px, pz] = c1[1] > c2[1] ? c1 : c2;
  return Math.atan2(-pz, px);
}

// Reposo: aguja medida en la foto cenital, en (+117, +135) mm.
export const ANGULO_REPOSO = Math.atan2(-(135 - B.z), 117 - B.x);

function crearBase(raiz) {
  const base = pieza(raiz, 'Base del brazo', 'Torreta con ajuste de altura (0–6 mm) y dial de anti-skating.', [70, 125, -40], {
    retraso: 0.1,
  });
  base.position.set(mm(B.x), mm(M.cubierta), mm(B.z));
  const pozo = new THREE.Mesh(new THREE.RingGeometry(mm(40), mm(58), 96), MAT.resina);
  pozo.rotation.x = -Math.PI / 2;
  pozo.position.y = mm(0.08);
  pozo.receiveShadow = true;
  base.add(pozo);
  malla(base, new THREE.TorusGeometry(mm(58), mm(0.8), 6, 96), MAT.anodizadoBrillo).rotateX(Math.PI / 2);
  malla(base, cil(30, 6, 64), MAT.anodizadoBrillo).position.y = mm(3);
  const anillo = malla(base, cil(25, 9, 64), MAT.aluminio);
  anillo.position.y = mm(10.5);
  anillo.material = MAT.anodizado;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r = malla(base, new THREE.BoxGeometry(mm(1), mm(8), mm(1.4)), MAT.anodizadoBrillo, { sombra: false, elegible: false });
    r.position.set(Math.cos(a) * mm(25.2), mm(10.5), Math.sin(a) * mm(25.2));
    r.rotation.y = -a;
  }
  const columna = yTubo() - M.cubierta - 6;
  malla(base, cil(14, columna - 15, 40), MAT.tuboNegro).position.y = mm(15 + (columna - 15) / 2);
  // Dial de anti-skating (a la derecha y atrás del pivote, como en la foto)
  malla(base, cil(9, 7, 40), MAT.anodizadoBrillo).position.set(mm(40), mm(13), mm(6));
  malla(base, cil(9.5, 0.6, 40), MAT.anodizadoBrillo, { sombra: false }).position.set(mm(40), mm(16.6), mm(6));
  // Apoyabrazo y palanca de cueing: el tubo descansa en la horquilla
  const apoyo = new THREE.Group();
  apoyo.rotation.y = ANGULO_REPOSO;
  base.add(apoyo);
  const yHorquilla = yTubo() - M.cubierta - 5.5;
  malla(apoyo, cil(3, yHorquilla, 20), MAT.tuboNegro).position.set(mm(98), mm(yHorquilla / 2), mm(-20));
  const horq = malla(apoyo, new THREE.TorusGeometry(mm(5), mm(1.2), 8, 16, Math.PI), MAT.tuboNegro);
  horq.position.set(mm(98), mm(yHorquilla + 4), mm(-20));
  horq.rotation.set(Math.PI, Math.PI / 2, 0);
  malla(apoyo, new THREE.BoxGeometry(mm(12), mm(16), mm(10)), MAT.tuboNegro).position.set(mm(70), mm(8), mm(-32));
  const palanca = malla(apoyo, cil(1.6, 30, 12), MAT.tuboNegro);
  palanca.position.set(mm(80), mm(14), mm(-38));
  palanca.rotation.set(0, 0, -1.2);
  return base;
}

export function crearBrazo(raiz) {
  crearBase(raiz);
  const giro = new THREE.Group();
  giro.position.set(mm(B.x), mm(yTubo()), mm(B.z));
  giro.rotation.y = ANGULO_REPOSO;
  raiz.add(giro);
  const alzada = new THREE.Group();
  giro.add(alzada);

  const brazo = pieza(
    alzada,
    'Brazo en S',
    'Tubo de aluminio de 230 mm efectivos, sobre un cardán de rodamientos de precisión.',
    [0, 165, 0],
    { retraso: 0.5 },
  );
  const pts = CURVA.map(([x, z]) => new THREE.Vector3(mm(x), 0, mm(z)));
  malla(brazo, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, mm(3.9), 16), MAT.tuboNegro);
  malla(brazo, new THREE.BoxGeometry(mm(22), mm(16), mm(20)), MAT.tuboNegro).position.set(0, mm(1), 0);
  malla(brazo, cil(4.6, 18, 24), MAT.tuboNegro)
    .rotateZ(Math.PI / 2)
    .position.set(mm(9), 0, 0);
  const collar = malla(brazo, cil(5.4, 9, 24), MAT.cromo);
  collar.position.set(mm(CURVA[4][0] + 3), 0, mm(CURVA[4][1] + 1.2));
  collar.rotation.set(0, -Math.atan2(21, 51), Math.PI / 2);
  malla(brazo, cil(3, 70, 20), MAT.cromo)
    .rotateZ(Math.PI / 2)
    .position.set(mm(-35), 0, 0);

  const contrapeso = pieza(
    alzada,
    'Contrapeso',
    'Equilibra el brazo; el aro numerado fija la presión de la aguja (0–4 g).',
    [-75, 165, 0],
    { retraso: 0.7 },
  );
  const pesa = malla(contrapeso, cil(17, 30, 48), MAT.anodizado);
  pesa.rotation.z = Math.PI / 2;
  pesa.position.x = mm(-52);
  const aro = malla(contrapeso, cil(17.4, 6, 48), MAT.anodizadoBrillo);
  aro.rotation.z = Math.PI / 2;
  aro.position.x = mm(-34);

  const headshell = pieza(
    alzada,
    'Headshell',
    'Portacápsula de aluminio (7,6 g) con el ángulo de offset de 22° y el dedo para levantarlo.',
    [22, 165, 0],
    { retraso: 0.85 },
  );
  const dir = new THREE.Vector2(L - CURVA[4][0] - 3, -(CURVA[4][1] + 1.2)).normalize();
  const giroHS = -Math.atan2(dir.y, dir.x);
  const hs = new THREE.Group();
  hs.position.set(mm(CURVA[4][0] + 6), mm(-4.5), mm(CURVA[4][1] + 2.4));
  hs.rotation.y = giroHS;
  headshell.add(hs);
  malla(hs, new THREE.BoxGeometry(mm(50), mm(2.2), mm(18)), MAT.anodizadoBrillo).position.set(mm(25), 0, 0);
  const dedo = malla(hs, new THREE.BoxGeometry(mm(22), mm(1.4), mm(4)), MAT.anodizadoBrillo);
  dedo.position.set(mm(34), mm(2), mm(-13));
  dedo.rotation.set(0.25, 0.35, 0);

  const capsula = pieza(
    alzada,
    'Cápsula y aguja',
    'Cápsula magnética con la púa de diamante: convierte el surco en señal eléctrica.',
    [40, 135, 0],
    { retraso: 0.95 },
  );
  const cg = new THREE.Group();
  cg.position.copy(hs.position);
  cg.rotation.y = giroHS;
  capsula.add(cg);
  const largoHS = Math.hypot(mm(L) - hs.position.x, hs.position.z);
  malla(cg, new THREE.BoxGeometry(mm(17), mm(13), mm(16)), MAT.capsula).position.set(largoHS - mm(10), mm(-7.6), 0);
  malla(
    cg,
    new THREE.BoxGeometry(mm(6), mm(3), mm(8)),
    new THREE.MeshStandardMaterial({ color: 0x8c1a14, roughness: 0.4 }),
  ).position.set(largoHS - mm(3), mm(-12.5), 0);
  const aguja = malla(cg, new THREE.ConeGeometry(mm(0.5), mm(4), 8), MAT.aguja, { sombra: false });
  aguja.rotation.z = Math.PI;
  aguja.position.set(largoHS, mm(-14.5), 0);

  return { giro, alzada };
}

// Tren de rodaje: dos orugas (zapatas instanciadas que recorren el óvalo), bastidor, ruedas, rodillos y cuerpo central.
import * as THREE from 'three';

const LARGO = 4.5, RAD = 0.52, ALTO_CENTRO = RAD, PASO = 0.31, ANCHO = 0.95, SEP = 2.75;
const PERIM = 2 * LARGO + 2 * Math.PI * RAD;

function enCamino(u) {                               // posición (x,y) y ángulo a lo largo del óvalo, u ∈ [0, PERIM)
  u = ((u % PERIM) + PERIM) % PERIM;
  const a = LARGO, c = Math.PI * RAD;
  if (u < a) return [-LARGO / 2 + u, 0, 0];                                              // abajo, hacia adelante
  if (u < a + c) { const t = (u - a) / RAD; return [LARGO / 2 + Math.sin(t) * RAD, ALTO_CENTRO - Math.cos(t) * RAD, t]; }
  if (u < 2 * a + c) return [LARGO / 2 - (u - a - c), 2 * RAD, Math.PI];                  // arriba, hacia atrás
  const t = (u - 2 * a - c) / RAD; return [-LARGO / 2 - Math.sin(t) * RAD, ALTO_CENTRO + Math.cos(t) * RAD, Math.PI + t];
}

function cilindro(r, largo, mat, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, largo, seg), mat);
  m.rotation.x = Math.PI / 2; m.castShadow = m.receiveShadow = true; return m;
}
const caja = (x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat); m.castShadow = m.receiveShadow = true; return m; };

function geometriaZapata() {                         // placa con dos garras (grousers) y bordes
  const g = new THREE.BoxGeometry(PASO * 0.94, 0.09, ANCHO);
  const garra = new THREE.BoxGeometry(PASO * 0.2, 0.07, ANCHO * 0.96); garra.translate(PASO * 0.12, -0.075, 0);
  const g2 = garra.clone(); g2.translate(-PASO * 0.28, 0, 0);
  return mergeSimple([g, garra, g2]);
}
function mergeSimple(list) {                         // unión sencilla de BoxGeometry (todas con las mismas atribuciones)
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of list) {
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); uv.push(...g.attributes.uv.array);
    idx.push(...Array.from(g.index.array, (i) => i + off)); off += g.attributes.position.count;
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  r.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); r.setIndex(idx); return r;
}

function unaOruga(mats) {
  const g = new THREE.Group();
  const bast = caja(LARGO + 0.5, 0.62, 0.56, mats.aceroOscuro); bast.position.y = ALTO_CENTRO + 0.02; g.add(bast);
  const placa = caja(LARGO + 0.2, 0.2, ANCHO * 0.78, mats.negro); placa.position.y = ALTO_CENTRO + 0.38; g.add(placa);
  const rueda = (x, r, mat = mats.aceroOscuro) => { const c = cilindro(r, ANCHO * 0.7, mat, 28); c.position.set(x, ALTO_CENTRO, 0); g.add(c); return c; };
  rueda(-LARGO / 2, RAD * 0.93); rueda(LARGO / 2, RAD * 0.93);                          // rueda motriz y guía
  const cubo = (x) => { const c = cilindro(RAD * 0.45, ANCHO * 0.84, mats.amarillo, 16); c.position.set(x, ALTO_CENTRO, 0); g.add(c); };
  cubo(-LARGO / 2); cubo(LARGO / 2);
  for (let i = 0; i < 6; i++) { const r = cilindro(0.17, ANCHO * 0.64, mats.acero, 14); r.position.set(-1.75 + i * 0.7, 0.19, 0); g.add(r); }
  for (let i = 0; i < 2; i++) { const r = cilindro(0.11, ANCHO * 0.5, mats.acero, 12); r.position.set(-0.9 + i * 1.8, 2 * RAD - 0.05, 0); g.add(r); }
  const n = Math.round(PERIM / PASO), zap = new THREE.InstancedMesh(geometriaZapata(), mats.zapata, n);
  zap.castShadow = zap.receiveShadow = true; zap.frustumCulled = false; g.add(zap);
  return { g, zap, n };
}

export function crearOrugas(mats) {
  const grupo = new THREE.Group(), o = [unaOruga(mats), unaOruga(mats)];
  o[0].g.position.z = -SEP / 2; o[1].g.position.z = SEP / 2; grupo.add(o[0].g, o[1].g);
  const cuerpo = caja(2.9, 0.62, 3.3, mats.amarillo); cuerpo.position.set(0, 0.92, 0); grupo.add(cuerpo);
  const bajo = caja(2.2, 0.35, 2.6, mats.aceroOscuro); bajo.position.set(0, 0.55, 0); grupo.add(bajo);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const v = caja(0.9, 0.16, 0.5, mats.amarillo); v.position.set(sx * 1.4, 0.94, sz * 1.2); grupo.add(v); }
  const anillo = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.7, 0.28, 48), mats.negro); anillo.position.y = 1.36; anillo.castShadow = true; grupo.add(anillo);
  const fase = [0, 0], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const actualizar = () => o.forEach((t, k) => {
    for (let i = 0; i < t.n; i++) {
      const [x, y, a] = enCamino(fase[k] + i * (PERIM / t.n));
      q.setFromEuler(e.set(0, 0, a)); m.compose(new THREE.Vector3(x, y + 0.045, 0), q, new THREE.Vector3(1, 1, 1)); t.zap.setMatrixAt(i, m);
    }
    t.zap.instanceMatrix.needsUpdate = true;
  });
  actualizar();
  return { grupo, separacion: SEP, avanzar(izq, der) { fase[0] += izq; fase[1] += der; actualizar(); } };
}

import * as THREE from 'three';
import { ALMEJA } from './medidas.js';
import { MAT, Armador, sombra, caja, rueda, V } from './materiales.js';
import { Tirante } from './cables.js';

// Almeja mecánica de 2 cables. La cinemática es la real: las valvas giran en el travesaño de abajo
// y 4 brazos de largo fijo las unen al cabezal; al abrirse, el travesaño baja.
const R_BISAGRA = 1.15, ANG_BISAGRA = 0.31;   // esquina de afuera de cada valva, medida desde el eje
const BRAZO = 1.3, A_CABEZAL = 0.28;          // largo del brazo y media separación de sus pernos arriba
const LABIO = 1.25;                           // del eje al filo
export const APERTURA_MAX = 0.87;             // 50°
const ZB = ALMEJA.ancho / 2 - 0.09;

function valva() {
  const a = new Armador(), m = MAT.almeja, an = ALMEJA.ancho;
  const arco = [[1.09, 0.355], [1.12, -0.2], [1.05, -0.55], [0.86, -0.9], [0.5, -1.15], [0.02, LABIO * -1]];
  const lateral = new THREE.Shape([[0, 0.1], ...arco, [0.02, -0.1]].map(([x, y]) => new THREE.Vector2(x, y)));
  for (const z of [-an / 2, an / 2 - 0.03]) a.add(m, new THREE.ExtrudeGeometry(lateral, { depth: 0.03, bevelEnabled: false }), 0, 0, z);
  const dentro = arco.map(([x, y]) => [x * 0.965, y * 0.965]).reverse();
  const lomo = new THREE.Shape([...arco, ...dentro].map(([x, y]) => new THREE.Vector2(x, y)));
  a.add(m, new THREE.ExtrudeGeometry(lomo, { depth: an, bevelEnabled: false }), 0, 0, -an / 2);
  a.add(m, rueda(0.07, an + 0.1, 12), 1.09, 0.355, 0);                                  // perno de los brazos
  for (const x of [0.45, 0.9]) a.add(m, caja(0.06, 0.1, an), x, -Math.sqrt(1.4 - x * x) - 0.02, 0, 0, 0, Math.atan2(x, 1.2));   // refuerzos del lomo
  for (let i = 0; i < 5; i++) a.add(MAT.acero, caja(0.07, 0.2, 0.13), 0.04, -LABIO - 0.04, -an / 2 + 0.17 + i * ((an - 0.34) / 4), 0, 0, 0.25);   // dientes
  return a.grupo().children;
}

export function crearAlmeja(matTierra) {
  const grupo = new THREE.Group(); grupo.name = 'almeja';
  const a = new Armador();
  // cabezal: dos placas con las poleas y el perno de los brazos
  for (const z of [-0.2, 0.2]) a.add(MAT.almeja, caja(0.85, 0.55, 0.04), 0, -0.27, z);
  a.add(MAT.almeja, caja(0.5, 0.1, 0.5), 0, -0.05, 0);
  for (const x of [-0.2, 0.2]) a.add(MAT.acero, rueda(0.2, 0.06, 20), x, -0.25, 0);
  a.add(MAT.almeja, rueda(0.05, 2 * ZB + 0.12, 10), -A_CABEZAL, -0.3, 0).add(MAT.almeja, rueda(0.05, 2 * ZB + 0.12, 10), A_CABEZAL, -0.3, 0);
  grupo.add(a.grupo('cabezal'));
  // travesaño de abajo, con las valvas
  const bajo = new THREE.Group(); grupo.add(bajo);
  const b = new Armador();
  b.add(MAT.almeja, rueda(0.09, ALMEJA.ancho + 0.14, 14), 0, 0, 0);
  for (const z of [-0.13, 0.13]) b.add(MAT.almeja, caja(0.5, 0.5, 0.04), 0, 0.2, z);
  for (const x of [-0.12, 0.12]) b.add(MAT.acero, rueda(0.17, 0.05, 18), x, 0.25, 0);
  bajo.add(b.grupo('travesaño'));
  const valvas = [1, -1].map((lado) => {
    const g = new THREE.Group(); g.scale.x = lado;
    for (const m of valva()) g.add(sombra(m));
    bajo.add(g); return g;
  });
  // la tierra adentro (se ve desde arriba cuando va cargada)
  const carga = sombra(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12).scale(0.95, 0.62, 0.74), matTierra));
  carga.visible = false; bajo.add(carga);
  const brazos = [], aparejo = [];
  for (const lado of [1, -1]) for (const z of [-ZB, ZB]) { const t = new Tirante(0.045, MAT.almeja, 8); brazos.push({ lado, z, t }); grupo.add(t.malla); }
  for (const x of [-0.16, 0.16]) for (const z of [-0.03, 0.03]) { const t = new Tirante(0.013); aparejo.push({ x, z, t }); grupo.add(t.malla); }
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  const obj = {
    grupo, apertura: 0, carga: 0, fondo: 0,
    // apertura 0 = cerrada, 1 = abierta del todo
    abrir(ap) {
      obj.apertura = ap; const th = ap * APERTURA_MAX, al = ANG_BISAGRA + th;
      const bx = R_BISAGRA * Math.cos(al), by = R_BISAGRA * Math.sin(al);
      const h = by + Math.sqrt(BRAZO * BRAZO - (bx - A_CABEZAL) ** 2);     // del perno del cabezal al eje de las valvas
      bajo.position.y = -0.3 - h;
      valvas[0].rotation.z = th; valvas[1].rotation.z = -th;
      for (const r of brazos) r.t.poner(p.set(r.lado * A_CABEZAL, -0.3, r.z), q.set(r.lado * bx, bajo.position.y + by, r.z));
      for (const r of aparejo) r.t.poner(p.set(r.x, -0.3, r.z), q.set(r.x * 0.7, bajo.position.y + 0.3, r.z));
      obj.fondo = 0.3 + h + LABIO * Math.cos(th) + 0.1;                     // del enganche del cable al filo
      obj.medioLargo = Math.max(1.12, LABIO * Math.sin(th) + 0.25);        // media boca
      obj.verCarga();
    },
    verCarga() {
      const lleno = Math.min(1, obj.carga / ALMEJA.volumen);
      carga.visible = lleno > 0.03;
      carga.scale.setScalar(0.45 + 0.55 * Math.cbrt(lleno)); carga.position.y = -0.62 + 0.1 * lleno;
    },
  };
  obj.abrir(0);
  return obj;
}

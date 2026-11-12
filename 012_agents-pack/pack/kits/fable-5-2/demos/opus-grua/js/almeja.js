// Almeja mecánica de 2 cables (~3,5 m³): cabezal con poleas, 2 brazos, travesaño inferior y 2 valvas.
// Al abrir, las valvas giran sobre el travesaño y, como los brazos no cambian de largo, el travesaño baja.
import * as THREE from 'three';
import { MAT, caja, tubo, fusionar } from './materiales.js';
import { tex } from './texturas.js';

const ANCHO = 1.9, BRAZO = Math.hypot(0.85, 0.9), CAB_X = 0.45, CAB_Y = 0.5;
const ESQ = new THREE.Vector2(1.3, 0.25);           // esquina superior de la valva (relativa al eje)
export const ABRE_MAX = 68 * Math.PI / 180;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function perfil() {                                 // borde exterior de la valva, desde el labio a la esquina
  const c = new THREE.SplineCurve([new THREE.Vector2(0.02, -1.25), new THREE.Vector2(0.75, -1.08), new THREE.Vector2(1.18, -0.62), new THREE.Vector2(1.33, -0.1), ESQ]);
  return c.getPoints(18);
}

function geoValva() {
  const pts = perfil();
  const lado = new THREE.Shape([new THREE.Vector2(0, 0), ...pts, new THREE.Vector2(0.25, 0.12)]);
  for (const [x, y, r] of [[0.72, -0.52, 0.2], [0.36, -0.88, 0.11], [1.02, -0.05, 0.1]]) { const h = new THREE.Path(); h.absarc(x, y, r, 0, Math.PI * 2, true); lado.holes.push(h); }
  const placa = (z) => { const g = new THREE.ExtrudeGeometry(lado, { depth: 0.07, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, z); return g; };
  const piel = [];                                  // chapa curva de la valva, tramo por tramo
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1], largo = a.distanceTo(b) + 0.01, ang = Math.atan2(b.y - a.y, b.x - a.x);
    const g = new THREE.BoxGeometry(largo, 0.06, ANCHO); g.rotateZ(ang); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, 0); piel.push(g);
  }
  const dientes = []; for (let k = 0; k < 6; k++) dientes.push(caja(0.18, 0.1, 0.12, -0.03, -1.27, -0.8 + k * 0.32));
  return fusionar([placa(ANCHO / 2 - 0.07), placa(-ANCHO / 2), ...piel, ...dientes, caja(0.12, 0.12, ANCHO, 0.25, 0.1, 0)]);
}

export function crearAlmeja() {
  const mat = new THREE.MeshStandardMaterial({
    color: 0x6d6a65, metalness: 0.5, roughness: 0.75, map: tex('rusty_metal_02_diff_1k.jpg', { color: true }),
    normalMap: tex('rusty_metal_02_nor_1k.jpg'), roughnessMap: tex('rusty_metal_02_rough_1k.jpg'),
  });
  const raiz = new THREE.Group();                   // origen = donde llegan los cables (arriba del cabezal)
  const sombra = (m) => { m.castShadow = m.receiveShadow = true; return m; };
  const cabezal = sombra(new THREE.Mesh(fusionar([caja(1.15, CAB_Y, 0.9, 0, -CAB_Y / 2, 0),
    ...[-0.22, 0.22].map((z) => { const s = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 22); s.rotateX(Math.PI / 2); s.translate(0, -0.25, z); return s; })]), mat));
  raiz.add(cabezal);
  const eje = new THREE.Group(); raiz.add(eje);     // travesaño inferior (eje de las valvas)
  eje.add(sombra(new THREE.Mesh(fusionar([caja(0.7, 0.45, ANCHO + 0.2, 0, 0.05, 0), tubo(V(0, 0, -1.08), V(0, 0, 1.08), 0.14, 12)]), mat)));
  const gv = geoValva();
  const valvas = [1, -1].map((s) => { const g = new THREE.Group(); g.scale.x = s; const m = sombra(new THREE.Mesh(gv, mat)); g.add(m); eje.add(g); return g; });
  // Carga de tierra que asoma entre las valvas
  const carga = sombra(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tex('brown_mud_02_diff_1k.jpg', { color: true }), normalMap: tex('brown_mud_02_nor_1k.jpg'), roughness: 0.95 })));
  carga.visible = false; eje.add(carga);
  const brazoGeo = tubo(V(0, 0, 0), V(0, 1, 0), 0.09, 8);
  const brazos = [];
  for (const s of [1, -1]) for (const z of [-0.62, 0.62]) { const b = sombra(new THREE.Mesh(brazoGeo, MAT.grisOscuro)); raiz.add(b); brazos.push({ b, s, z }); }

  const c = new THREE.Vector2(), h = V(), e = V(), d = V(), Y = V(0, 1, 0);
  const almeja = {
    raiz, abertura: 0, llenado: 0, alto: 0,
    // a: 0 cerrada … 1 abierta. Devuelve la distancia del origen al labio (para apoyar en el piso).
    poner(a, llenado) {
      this.abertura = a; this.llenado = llenado;
      const ang = a * ABRE_MAX;
      c.copy(ESQ).rotateAround(new THREE.Vector2(), ang);
      const yh = c.y + Math.sqrt(BRAZO * BRAZO - (c.x - CAB_X) ** 2);  // altura del cabezal sobre el eje
      eje.position.y = -(CAB_Y + yh);
      valvas[0].rotation.z = ang; valvas[1].rotation.z = -ang;
      for (const { b, s, z } of brazos) {
        h.set(s * CAB_X, -CAB_Y, z); e.set(s * c.x, eje.position.y + c.y, z);
        b.position.copy(h); d.subVectors(e, h); b.scale.set(1, d.length(), 1); b.quaternion.setFromUnitVectors(Y, d.normalize());
      }
      carga.visible = llenado > 0.02 && a < 0.6;
      carga.scale.set(1.2 * (1 - a * 0.5), 0.3 + 0.6 * llenado, ANCHO * 0.47); carga.position.y = -0.6 + 0.45 * llenado;
      this.alto = CAB_Y + yh + 1.27 * Math.cos(ang);
      return this.alto;
    },
    // Puntos del labio (mundo) para saber dónde muerde.
    eje,
  };
  almeja.poner(0, 0);
  return almeja;
}

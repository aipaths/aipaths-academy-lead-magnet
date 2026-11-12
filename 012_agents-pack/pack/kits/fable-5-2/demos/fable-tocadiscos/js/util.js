// Ayudas de geometría. Todo el tocadiscos se modela en milímetros.
import * as THREE from 'three';

// Marca un objeto como pieza: nombre para el cartel y desplazamiento del despiece (mm).
export function pieza(obj, nombre, detalle, despiece = null) {
  obj.userData.pieza = { nombre, detalle };
  if (despiece) obj.userData.despiece = new THREE.Vector3(...despiece);
  return obj;
}

export function malla(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export const cilindro = (r, h, mat, x = 0, y = 0, z = 0, seg = 48) =>
  malla(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y + h / 2, z);

export const caja = (w, h, d, mat, x = 0, y = 0, z = 0) =>
  malla(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);

// Rectángulo redondeado como THREE.Shape (o Path para agujeros), centrado en (cx, cy).
export function rectRedondeado(w, h, r, cx = 0, cy = 0, Clase = THREE.Shape) {
  const s = new Clase();
  const x = cx - w / 2, y = cy - h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

export function circulo(cx, cy, r) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, Math.PI * 2, true);
  return p;
}

// Extruye una forma hacia arriba (eje Y) desde y0, con un bisel chico para que
// los bordes agarren luz. Las formas se dibujan en (X, -Z).
export function extruir(forma, alto, y0, mat, bisel = 0.6) {
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: alto - bisel * 2, bevelEnabled: bisel > 0, bevelThickness: bisel,
    bevelSize: bisel, bevelSegments: 2, curveSegments: 48,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0 + bisel, 0);
  return malla(geo, mat);
}

// Placa con esquinas redondeadas (botones), centrada en x,z y apoyada en y0.
export const placa = (w, d, alto, r, mat, x, y0, z, bisel = 0.5) =>
  extruir(rectRedondeado(w - bisel * 2, d - bisel * 2, r, x, -z), alto, y0, mat, bisel);

// Cuerpo de revolución. El perfil [[radio, y], ...] se escribe desde el centro de arriba
// hacia afuera y abajo; se invierte porque LatheGeometry lo quiere al revés (v=0 queda afuera).
export function torno(perfil, mat, seg = 96) {
  const pts = perfil.map(([r, y]) => new THREE.Vector2(r, y)).reverse();
  return malla(new THREE.LatheGeometry(pts, seg), mat);
}

// Contorno de rectángulo redondeado, n puntos (para el gabinete con chaflán).
function contorno(w, d, r, n = 10) {
  const pts = [];
  const esquinas = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 1], [-w / 2 + r, -d / 2 + r, 2], [w / 2 - r, -d / 2 + r, 3]];
  for (const [cx, cz, k] of esquinas) {
    for (let i = 0; i <= n; i++) {
      const a = (k + i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
  }
  return pts;
}

// Pared entre niveles [{y, margen}] de un rectángulo redondeado (cada tramo con su arista viva).
export function pared(w, d, r, niveles, mat, haciaAdentro = false) {
  const pos = [], idx = [];
  for (let k = 0; k < niveles.length - 1; k++) {
    const a = niveles[k], b = niveles[k + 1];
    const ca = contorno(w - a.margen * 2, d - a.margen * 2, r), cb = contorno(w - b.margen * 2, d - b.margen * 2, r);
    const base = pos.length / 3, n = ca.length;
    for (let i = 0; i < n; i++) pos.push(ca[i][0], a.y, ca[i][1], cb[i][0], b.y, cb[i][1]);
    for (let i = 0; i < n; i++) {
      const p = base + i * 2, q = base + ((i + 1) % n) * 2;
      if (haciaAdentro) idx.push(p, q, p + 1, q, q + 1, p + 1);
      else idx.push(p, p + 1, q, q, p + 1, q + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return malla(geo, mat);
}

// Tapa plana horizontal con forma (mira hacia arriba).
export function tapaPlana(forma, y, mat) {
  const geo = new THREE.ShapeGeometry(forma, 32);
  geo.rotateX(-Math.PI / 2);
  return malla(geo, mat, 0, y, 0);
}

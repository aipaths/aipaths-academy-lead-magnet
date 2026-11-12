// Gabinete, chapa superior, patas y controles. Posiciones medidas en la foto cenital.
import * as THREE from 'three';
import { M } from './medidas.js';
import { pieza, malla, cilindro, caja, rectRedondeado, circulo, extruir, placa, pared, tapaPlana, torno } from './util.js';
import { lienzo, textura, dibujarLogo } from './texturas.js';

const FUENTE = '"Helvetica Neue", Helvetica, Arial, sans-serif';

function rotulo(texto, w, d, { px = 28, color = '#c6c9cd', alinear = 'center', peso = 500 } = {}) {
  const k = 16; // px por mm
  const [c, g] = lienzo(Math.round(w * k), Math.round(d * k));
  g.fillStyle = color;
  g.font = `${peso} ${px * (k / 10)}px ${FUENTE}`;
  g.textBaseline = 'middle';
  g.textAlign = alinear;
  g.fillText(texto, alinear === 'center' ? c.width / 2 : k * 1.6, c.height / 2 + 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: textura(c), transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.raycast = () => {};
  return m;
}

function gabinete(mat) {
  const g = new THREE.Group();
  const { ANCHO: W, FONDO: D, TOP, CHAPA, CHAFLAN_Y, BASE_Y, SUELA_Y } = M;
  const techo = TOP - CHAPA;
  g.add(pared(W, D, 5, [{ y: CHAFLAN_Y, margen: 0 }, { y: techo, margen: 0 }], mat.gabinete));
  g.add(pared(W, D, 5, [{ y: BASE_Y, margen: 11 }, { y: CHAFLAN_Y, margen: 0 }], mat.sombra));
  g.add(pared(W, D, 5, [{ y: 30, margen: 9 }, { y: techo, margen: 9 }], mat.gabinete, true));
  const borde = rectRedondeado(W, D, 5);
  borde.holes.push(rectRedondeado(W - 18, D - 18, 5, 0, 0, THREE.Path));
  g.add(tapaPlana(borde, techo, mat.gabinete));
  g.add(tapaPlana(rectRedondeado(W - 18, D - 18, 5), 30, mat.hueco));
  // Suela de goma que se ve de frente entre las patas
  g.add(pared(W, D, 5, [{ y: SUELA_Y, margen: 14 }, { y: BASE_Y, margen: 11 }], mat.sombra));
  const abajo = tapaPlana(rectRedondeado(W - 28, D - 28, 5), SUELA_Y, mat.goma);
  abajo.rotation.x = Math.PI;
  g.add(abajo);
  return pieza(g, 'Gabinete inferior', 'Base pesada de compuesto y goma: frena las vibraciones', [0, 45, 0]);
}

function patas(mat) {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = new THREE.Group();
    p.add(cilindro(M.PATA_R, 20, mat.goma, 0, 0, 0, 64));
    p.add(cilindro(M.PATA_R - 5, 12, mat.gabinete, 0, 18, 0, 48));
    p.position.set(sx * M.PATA_X, 0, sz * M.PATA_Z);
    g.add(p);
  }
  return pieza(g, 'Patas aislantes', 'Cuatro patas con resorte y goma, regulables en altura', [0, 0, 0]);
}

function chapa(mat) {
  const { ANCHO: W, FONDO: D, TOP, CHAPA, PLATO, BASE_BRAZO: BB, ADAPTADOR: AD, AGUJERO: AG, PITCH: P } = M;
  const forma = rectRedondeado(W, D, 5);
  forma.holes.push(circulo(PLATO.x, -PLATO.z, PLATO.r + 2.2));
  forma.holes.push(circulo(BB.x, -BB.z, BB.r));
  forma.holes.push(circulo(AD.x, -AD.z, AD.r + 1));
  forma.holes.push(circulo(AG.x, -AG.z, AG.r));
  forma.holes.push(rectRedondeado(P.w, P.d, 1.5, P.x, -P.z, THREE.Path));
  const g = new THREE.Group();
  g.add(extruir(forma, CHAPA, TOP - CHAPA, mat.chapa, 0.7));
  // Fondos de cada hueco
  g.add(cilindro(PLATO.r + 3, 0.6, mat.chapa, PLATO.x, TOP - CHAPA, PLATO.z, 96));
  g.add(cilindro(BB.r + 0.5, 0.6, mat.negroSatinado, BB.x, TOP - 3, BB.z, 72));
  g.add(cilindro(AD.r + 1.5, 0.6, mat.hueco, AD.x, TOP - 4, AD.z));
  g.add(cilindro(AG.r + 0.5, 0.6, mat.hueco, AG.x, TOP - 8, AG.z, 24));
  g.add(caja(P.w + 1, 0.6, P.d + 1, mat.boton, P.x, TOP - 1.6, P.z));
  g.add(caja(4.4, 0.4, P.d - 12, mat.hueco, P.x, TOP - 1.0, P.z));
  return g;
}

// Todo lo impreso sobre la chapa, en una sola textura (4,52 px/mm).
function impresos() {
  const { ANCHO: W, FONDO: D, PITCH: P, RESET, LOGO, PERILLA } = M;
  const k = 2048 / W;
  const [c, g] = lienzo(2048, Math.round(D * k));
  const X = (x) => (x + W / 2) * k, Z = (z) => (z + D / 2) * k;
  const gris = '#b4b8bd';
  dibujarLogo(g, X(LOGO.x), Z(LOGO.z), LOGO.ancho * k, '#d5d8dc');
  g.fillStyle = gris;
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `500 ${2.05 * k}px ${FUENTE}`;
  g.fillText('DIRECT DRIVE TURNTABLE SYSTEM   SL-1200MK7', X(102), Z(162.6));
  g.font = `500 ${2.1 * k}px ${FUENTE}`;
  g.fillText('RESET', X(RESET.x), Z(RESET.z + 11.5));
  g.fillText('PITCH ADJ.', X(P.x), Z(P.z + P.d / 2 + 4.5));
  // Escala del pitch: ±8 %, una marca por punto
  for (let n = -8; n <= 8; n++) {
    const z = P.centro + (n / 8) * P.recorrido;
    const largo = n % 2 === 0 ? 2.6 : 1.3;
    g.fillRect(X(P.x - P.w / 2 - 2.2 - largo), Z(z) - 1, largo * k, 2);
    if (n % 2 === 0 && n !== 0) {
      const t = Math.abs(n) === 8 ? (n < 0 ? '–8' : '+8') : String(Math.abs(n));
      g.fillText(t, X(P.x - P.w / 2 - 8.2), Z(z));
    }
  }
  // Línea del 0 % hasta el botón de reset
  g.fillRect(X(RESET.x), Z(P.centro) - 1, (P.x - P.w / 2 - 9 - RESET.x) * k, 2);
  g.fillRect(X(RESET.x) - 1, Z(P.centro), 2, (RESET.z - RESET.r - 2 - P.centro) * k);
  // Tabla del estroboscopio junto a la perilla
  g.font = `500 ${1.9 * k}px ${FUENTE}`;
  g.textAlign = 'right';
  ['+6.4', '3.3', '0', '–3.3'].forEach((t, i) => {
    g.fillText(t, X(PERILLA.x + 23), Z(PERILLA.z + 17 + i * 3.1));
    g.beginPath();
    g.arc(X(PERILLA.x + 12), Z(PERILLA.z + 17 + i * 3.1), (i === 2 ? 0.75 : 0.45) * k, 0, 7);
    g.fill();
  });
  g.textAlign = 'left';
  g.fillText('%', X(PERILLA.x + 25), Z(PERILLA.z + 21.6));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D),
    new THREE.MeshBasicMaterial({ map: textura(c), transparent: true, depthWrite: false, toneMapped: false, opacity: 0.8 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = M.TOP + 0.08;
  m.raycast = () => {};
  return m;
}

function controles(mat, ui) {
  const g = new THREE.Group();
  const { TOP, START: S, B33, B45, PERILLA: K, LUZ_AGUJA: L, PITCH: P, X2, RESET: R, ADAPTADOR: AD, PLATO } = M;

  // START·STOP
  const start = new THREE.Group();
  start.add(placa(S.w, S.d, 3.2, 2, mat.boton, 0, 0, 0, 0.8));
  const rs = rotulo('START · STOP', S.w, 8, { px: 25, color: '#d8dade' });
  rs.position.y = 3.3;
  start.add(rs);
  start.position.set(S.x, TOP, S.z);
  g.add(caja(S.w + 2.4, 0.3, S.d + 2.4, mat.hueco, S.x, TOP, S.z));
  g.add(pieza(start, 'Botón START·STOP', 'Arranca y frena el motor. Clic para probarlo', [0, 22, 0]));
  ui.start = start;

  // 33 y 45, cada uno con su LED
  for (const [b, t, clave] of [[B33, '33', 'b33'], [B45, '45', 'b45']]) {
    const bt = new THREE.Group();
    bt.add(placa(b.w, b.d, 2.4, 1.2, mat.boton, 0, 0, 0, 0.5));
    const r = rotulo(t, 9, 6, { px: 31, color: '#d8dade' });
    r.position.set(-b.w / 2 + 6, 2.5, 0);
    const led = caja(5.2, 0.5, 1.5, mat.ledApagado, b.w / 2 - 5.6, 2.1, 0);
    led.castShadow = false;
    bt.add(r, led);
    bt.position.set(b.x, TOP, b.z);
    g.add(pieza(bt, `Botón ${t} rpm`, 'Elige la velocidad. Apretando los dos juntos va a 78', [0, 16, 0]));
    ui[clave] = bt;
    ui[clave + 'Led'] = led;
  }

  // Perilla de encendido con la luz estroboscópica mirando al plato
  const perilla = new THREE.Group();
  perilla.add(cilindro(K.r, K.alto - 1.5, mat.negroSatinado, 0, 0, 0, 64));
  perilla.add(torno([[0, K.alto], [K.r - 2.4, K.alto], [K.r - 0.4, K.alto - 1.5]], mat.aluminioOscuro, 64));
  perilla.add(cilindro(K.r + 2.2, 1.2, mat.negroSatinado, 0, 0, 0, 64));
  const ang = Math.atan2(PLATO.z - K.z, PLATO.x - K.x);
  const luz = malla(new THREE.CylinderGeometry(K.r + 0.25, K.r + 0.25, 7, 24, 1, true, Math.PI / 2 - ang - 0.5, 1.0), mat.ledApagado, 0, 6.5, 0);
  luz.castShadow = false;
  perilla.add(luz);
  perilla.position.set(K.x, TOP, K.z);
  g.add(pieza(perilla, 'Perilla de encendido y estroboscopio', 'La luz roja ilumina los puntos del plato para ver si la velocidad es exacta', [0, 30, 0]));
  ui.luzEstrobo = luz;

  // Luz de aguja (sale hacia arriba al apretarla)
  const la = new THREE.Group();
  la.add(cilindro(L.r, L.alto, mat.negroSatinado, 0, 0, 0, 32));
  const angL = Math.atan2(PLATO.z - L.z, PLATO.x - L.x);
  const foco = malla(new THREE.CylinderGeometry(L.r + 0.15, L.r + 0.15, 6, 16, 1, true, Math.PI / 2 - angL - 0.55, 1.1), mat.ledBlanco, 0, L.alto - 5, 0);
  foco.castShadow = false;
  la.add(foco, cilindro(L.r + 2, 0.8, mat.negroSatinado, 0, 0, 0, 32));
  la.position.set(L.x, TOP, L.z);
  g.add(pieza(la, 'Luz de aguja', 'LED blanco para ver el surco a oscuras', [0, 26, 0]));

  // Pitch: perilla deslizante, botón ×2 y reset
  const pitch = new THREE.Group();
  pitch.add(placa(16, 19, 6.5, 1.5, mat.boton, 0, 0, 0, 0.8));
  pitch.add(caja(16.4, 2.6, 2.2, mat.negroSatinado, 0, 6, 0));
  pitch.add(caja(15, 0.3, 0.7, mat.aluminio, 0, 8.6, 0));
  pitch.position.set(P.x, TOP - 1, P.centro);
  g.add(pieza(pitch, 'Control de pitch', 'Sube o baja la velocidad ±8 % (±16 % con ×2)', [0, 24, 0]));
  ui.pitch = pitch;

  const x2 = new THREE.Group();
  x2.add(placa(X2.w, X2.d, 2.2, 1.2, mat.boton, 0, 0, 0, 0.5));
  const rx = rotulo('×2', 8, 6, { px: 24 });
  rx.position.set(-4.5, 2.3, 0);
  const ledx = caja(5, 0.5, 1.4, mat.ledApagado, 4.6, 1.9, 0);
  x2.add(rx, ledx);
  x2.position.set(X2.x, TOP, X2.z);
  g.add(pieza(x2, 'Botón ×2', 'Duplica el rango del pitch a ±16 %', [0, 16, 0]));

  const reset = new THREE.Group();
  reset.add(cilindro(R.r, 2, mat.negroSatinado, 0, 0, 0, 40));
  reset.add(torno([[0, 2.3], [R.r - 1.6, 2.3], [R.r - 0.5, 2]], mat.aluminioOscuro, 40));
  reset.position.set(R.x, TOP, R.z);
  g.add(pieza(reset, 'Botón RESET', 'Vuelve el pitch a 0 % exacto, esté donde esté la perilla', [0, 16, 0]));
  const led0 = caja(3.2, 0.5, 1.1, mat.ledRojo, P.x - P.w / 2 - 7.6, TOP - 0.2, P.centro);
  led0.castShadow = false;
  g.add(led0);

  // Adaptador para discos de 45
  const ad = new THREE.Group();
  ad.add(torno([[3.6, 5.2], [8, 5.2], [10, 3.2], [AD.r - 1, 3.2], [AD.r, 2.2], [AD.r, 0]], mat.negroSatinado, 64));
  ad.position.set(AD.x, TOP - 3.4, AD.z);
  g.add(pieza(ad, 'Adaptador de 45 rpm', 'Para los simples de agujero grande', [0, 40, 0]));
  return g;
}

export function crearChasis(mat) {
  const ui = {};
  const cuerpo = new THREE.Group();
  cuerpo.add(chapa(mat), impresos(), controles(mat, ui));
  pieza(cuerpo, 'Chasis superior', 'Chapa de aluminio fundido a presión, pintada de negro mate', [0, 200, 0]);
  return { cuerpo, gabinete: gabinete(mat), patas: patas(mat), ui };
}

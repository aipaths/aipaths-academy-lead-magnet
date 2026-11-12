// Texturas dibujadas por código (canvas): logo, slipmat, etiqueta, surcos, puntos del plato.
import * as THREE from 'three';

export function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

export function textura(c, { datos = false, repetir = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = datos ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Generador con semilla: las texturas salen iguales en cada carga.
export function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Logo oficial (SVG de Wikimedia Commons, letras blancas sobre caja negra) ---
let mascaraLogo = null;
export const PROPORCION_LOGO = 1324 / 208;

export async function cargarLogo(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const [tmp, gt] = lienzo(1400, 400);
  gt.drawImage(img, 0, 0, 1400, 400);
  // Recorte de las letras (sin la ®): x 3..334, y 25..77 del SVG de 350×100.
  const [c, g] = lienzo(1324, 208);
  g.drawImage(tmp, 12, 100, 1324, 208, 0, 0, 1324, 208);
  const d = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    d.data[i + 3] = d.data[i]; // luminancia → alfa
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
  }
  g.putImageData(d, 0, 0);
  mascaraLogo = c;
}

// Dibuja el logo centrado en (cx, cy), con el ancho dado, teñido de un color.
export function dibujarLogo(g, cx, cy, ancho, color, giro = 0) {
  const alto = ancho / PROPORCION_LOGO;
  const [t, gt] = lienzo(mascaraLogo.width, mascaraLogo.height);
  gt.fillStyle = color;
  gt.fillRect(0, 0, t.width, t.height);
  gt.globalCompositeOperation = 'destination-in';
  gt.drawImage(mascaraLogo, 0, 0);
  g.save();
  g.translate(cx, cy);
  g.rotate(giro);
  g.drawImage(t, -ancho / 2, -alto / 2, ancho, alto);
  g.restore();
}

// Grano fino para que la pintura mate no quede lisa como plástico de videojuego.
export function texturaGrano(semilla = 7, contraste = 40) {
  const [c, g] = lienzo(256, 256);
  const r = azar(semilla);
  const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * contraste * 2;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return textura(c, { datos: true, repetir: true });
}

// Slipmat: fieltro negro con el logo dos veces (uno al derecho, otro invertido).
// Medido en la foto cenital: logo de 244 mm de ancho sobre 288 mm de diámetro.
export function texturaSlipmat() {
  const N = 2048;
  const [c, g] = lienzo(N, N);
  g.fillStyle = '#0d0d0f';
  g.fillRect(0, 0, N, N);
  const pxmm = N / 288;
  dibujarLogo(g, N / 2, N / 2 - 22.5 * pxmm, 244 * pxmm, '#68727d');
  dibujarLogo(g, N / 2, N / 2 + 22.5 * pxmm, 244 * pxmm, '#68727d', Math.PI);
  g.strokeStyle = 'rgba(120,130,140,0.35)';
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(N / 2, N / 2, 135 * pxmm, 0, Math.PI * 2);
  g.stroke();
  // Pelusa del fieltro
  const r = azar(11);
  const d = g.getImageData(0, 0, N, N);
  for (let i = 0; i < d.data.length; i += 4) {
    const k = 0.72 + r() * 0.56;
    d.data[i] *= k;
    d.data[i + 1] *= k;
    d.data[i + 2] *= k;
  }
  g.putImageData(d, 0, 0);
  return textura(c);
}

// Las 4 filas de puntos estroboscópicos del borde del plato (u = vuelta completa).
export function texturaPuntos() {
  const W = 4096, H = 128;
  const [c, g] = lienzo(W, H);
  g.fillStyle = '#19191b';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#e6e6e6';
  const filas = [
    { n: 190, y: 0.14, r: 2.8 },
    { n: 174, y: 0.39, r: 3.6 },
    { n: 186, y: 0.63, r: 4.4 },
    { n: 180, y: 0.86, r: 5.2 },
  ];
  for (const f of filas) {
    for (let i = 0; i < f.n; i++) {
      g.beginPath();
      g.ellipse(((i + 0.5) / f.n) * W, f.y * H, f.r * 0.8, f.r * 2.1, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = textura(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// Surcos del vinilo. Con UV polares (v = radio) alcanza una tira de 1 dimensión.
// Zonas en mm de radio: 50–60 cera muerta, 60–146 surcos con 3 separadores, 146–150.5 entrada.
export function texturasSurcos() {
  const H = 2048, R0 = 50, R1 = 150.5;
  const [cc, gc] = lienzo(4, H);
  const [cr, gr] = lienzo(4, H);
  const r = azar(3);
  const separadores = [83, 104, 127];
  for (let y = 0; y < H; y++) {
    const radio = R0 + (y / (H - 1)) * (R1 - R0); // v=0 es el borde de afuera
    let liso = radio < 60 || radio > 146;
    for (const s of separadores) if (Math.abs(radio - s) < 0.9) liso = true;
    const col = liso ? 5 : 9 + r() * 9;
    const rug = liso ? 30 : 70 + r() * 60;
    gc.fillStyle = `rgb(${col},${col},${col + 1})`;
    gc.fillRect(0, y, 4, 1);
    gr.fillStyle = `rgb(${rug},${rug},${rug})`;
    gr.fillRect(0, y, 4, 1);
  }
  const color = textura(cc);
  const rugosidad = textura(cr, { datos: true });
  for (const t of [color, rugosidad]) t.wrapS = THREE.RepeatWrapping;
  return { color, rugosidad };
}

function textoEnArco(g, texto, cx, cy, radio, centro, espaciado) {
  const letras = [...texto];
  let ang = centro - ((letras.length - 1) * espaciado) / 2;
  for (const l of letras) {
    g.save();
    g.translate(cx + Math.cos(ang) * radio, cy + Math.sin(ang) * radio);
    g.rotate(ang - Math.PI / 2);
    g.fillText(l, 0, 0);
    g.restore();
    ang += espaciado;
  }
}

// Etiqueta del disco (diseño propio, 100 mm de diámetro).
export function texturaEtiqueta() {
  const N = 1024;
  const [c, g] = lienzo(N, N);
  const m = N / 2;
  const grad = g.createRadialGradient(m, m, 40, m, m, m);
  grad.addColorStop(0, '#e9a13b');
  grad.addColorStop(1, '#c9571f');
  g.fillStyle = grad;
  g.fillRect(0, 0, N, N);
  g.strokeStyle = 'rgba(40,18,8,0.75)';
  g.lineWidth = 5;
  for (const rr of [0.93, 0.9]) {
    g.beginPath();
    g.arc(m, m, m * rr, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = '#2a1408';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 86px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('AIPATHS', m, m - 235);
  g.font = '500 34px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('R E C O R D S', m, m - 172);
  g.font = '700 46px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('LADO A', m - 250, m + 6);
  g.fillText('33⅓', m + 255, m + 6);
  g.font = '600 50px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('Música generada', m, m + 170);
  g.fillText('por código', m, m + 230);
  g.font = '500 27px "Helvetica Neue", Helvetica, Arial, sans-serif';
  textoEnArco(g, 'HECHO CON CLAUDE · THREE.JS · WEB AUDIO · SIN SAMPLES', m, m, m * 0.81, Math.PI / 2, -0.047);
  return textura(c);
}

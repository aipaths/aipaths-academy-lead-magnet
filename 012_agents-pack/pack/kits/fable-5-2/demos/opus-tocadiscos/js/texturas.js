// Texturas dibujadas con canvas: serigrafía de la cubierta, slipmat, borde estroboscópico y rótulos.
import * as THREE from 'three';
import { M } from './medidas.js';

export const SERIF = '"Rockwell", "Georgia", "Times New Roman", serif';
export const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

export function aTextura(c, { srgb = true, aniso = 8, repetir = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Grano fino sobre todo el lienzo (anodizado, fieltro, goma).
export function grano(ctx, w, h, fuerza, semilla = 1) {
  const img = ctx.getImageData(0, 0, w, h);
  let s = semilla * 9301 + 49297;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 9301 + 49297) % 233280;
    const n = (s / 233280 - 0.5) * fuerza;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// Serigrafía de la cubierta superior: 4,5 px por mm, coordenadas de la foto cenital.
export function texturaCubierta() {
  const k = 4.5,
    W = Math.round(M.ancho * k),
    H = Math.round(M.prof * k);
  const [c, g] = lienzo(W, H);
  g.fillStyle = '#17171a';
  g.fillRect(0, 0, W, H);
  grano(g, W, H, 7, 3);
  const P = (x, z) => [(x + M.ancho / 2) * k, (z + M.prof / 2) * k];
  const texto = (t, x, z, mmAlto, { font = SANS, peso = 500, color = '#c9c9cc', alin = 'center' } = {}) => {
    const [px, pz] = P(x, z);
    g.font = `${peso} ${mmAlto * k}px ${font}`;
    g.fillStyle = color;
    g.textAlign = alin;
    g.textBaseline = 'middle';
    g.fillText(t, px, pz);
  };
  // Logo y leyenda abajo a la derecha del plato
  texto('Technics', M.logo.x, M.logo.z - 1, 6.2, { font: SERIF, peso: 700, color: '#d8d8da' });
  texto('DIRECT DRIVE TURNTABLE SYSTEM   SL-1200MK7', M.logo.x + 4, M.logo.z + 5.2, 1.6, { color: '#a9a9ad' });
  // Escala del pitch: −8 arriba, +8 abajo, una marca por 1 %
  const p = M.pitch,
    rango = 50;
  for (let i = -8; i <= 8; i++) {
    const z = p.z + (i / 8) * rango;
    const [x0, pz] = P(p.x - 14.5, z);
    g.fillStyle = i === 0 ? '#e8452c' : '#9a9a9e';
    g.fillRect(x0, pz - 0.35 * k, (i === 0 ? 4 : i % 2 ? 1.6 : 2.6) * k, 0.7 * k);
    if (i % 2 === 0 && i !== 0) texto((i > 0 ? '+' : '') + i, p.x - 18, z, 2.1, { color: '#a9a9ad', alin: 'right' });
  }
  texto('PITCH ADJ', p.x, p.z + p.largo / 2 + 6, 1.9);
  texto('RESET', M.reset.x, M.reset.z + 10, 1.8);
  // Línea que une el reset con el 0 del pitch (como en la foto)
  g.strokeStyle = '#7d7d82';
  g.lineWidth = 0.35 * k;
  g.beginPath();
  g.moveTo(...P(M.reset.x, M.reset.z - 8));
  g.lineTo(...P(M.reset.x, p.z));
  g.lineTo(...P(p.x - 14, p.z));
  g.stroke();
  // Marcas de velocidad junto al iluminador
  ['33', '45', '78'].forEach((t, i) =>
    texto(t + ' ·', M.encendido.x + 17, M.encendido.z + 4 + i * 3, 1.5, { color: '#8c8c90', alin: 'left' }),
  );
  // Aro fino alrededor del pozo del plato
  const [cx, cz] = P(M.plato.x, M.plato.z);
  g.strokeStyle = '#0b0b0c';
  g.lineWidth = 2.5 * k;
  g.beginPath();
  g.arc(cx, cz, (M.plato.r + 2.5) * k, 0, Math.PI * 2);
  g.stroke();
  return aTextura(c, { aniso: 16 });
}

// Slipmat de fieltro negro con el logo doble (uno derecho y otro girado 180°).
export function texturaSlipmat() {
  const S = 2048,
    [c, g] = lienzo(S, S);
  g.fillStyle = '#141414';
  g.fillRect(0, 0, S, S);
  grano(g, S, S, 22, 7);
  g.save();
  g.translate(S / 2, S / 2);
  g.fillStyle = '#5a5c60';
  g.font = `700 ${S * 0.185}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  const ancho = g.measureText('Technics').width,
    esc = (S * 0.8) / ancho;
  g.scale(esc, 1);
  g.fillText('Technics', 0, -S * 0.012);
  g.rotate(Math.PI);
  g.fillText('Technics', 0, -S * 0.012);
  g.restore();
  g.strokeStyle = '#2c2d30';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(S / 2, S / 2, S * 0.485, 0, Math.PI * 2);
  g.stroke();
  return aTextura(c, { aniso: 8 });
}

// Banda inclinada del borde del plato: 4 filas de puntos estroboscópicos (50/60 Hz a 33⅓ y 45).
export function texturaEstrobo() {
  const W = 8192,
    H = 128,
    [c, g] = lienzo(W, H);
  g.fillStyle = '#1a1a1c';
  g.fillRect(0, 0, W, H);
  const filas = [222, 180, 160, 133];
  filas.forEach((n, f) => {
    const y = H * (0.16 + f * 0.225),
      r = H * 0.075;
    g.fillStyle = '#d4d6da';
    for (let i = 0; i < n; i++) {
      g.beginPath();
      g.arc((i + 0.5) * (W / n), y, r, 0, Math.PI * 2);
      g.fill();
    }
  });
  return aTextura(c, { aniso: 16 });
}

// Rótulo chico (texto claro sobre fondo oscuro) para la cara de un botón o perilla.
export function texturaRotulo(lineas, w = 256, h = 192, { fondo = '#121214', color = '#d0d0d3', tam = 40 } = {}) {
  const [c, g] = lienzo(w, h);
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  grano(g, w, h, 6, 5);
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 ${tam}px ${SANS}`;
  lineas.forEach((t, i) => g.fillText(t, w / 2, h / 2 + (i - (lineas.length - 1) / 2) * tam * 1.2));
  return aTextura(c, { aniso: 8 });
}

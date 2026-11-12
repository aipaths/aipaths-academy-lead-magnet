// Texturas procedurales del plato, el slipmat y el vinilo (canvas, sin archivos externos).
import { canvasTex, rng } from './util.js';

const TAU = Math.PI * 2;
const ringPath = (g, r0, r1) => { g.beginPath(); g.arc(0, 0, r1, 0, TAU); g.moveTo(r0, 0); g.arc(0, 0, r0, 0, TAU, true); };

/** Slipmat de fieltro negro con el logo «Technics» arriba y otro girado 180° abajo (foto cenital). */
export function slipmatTex() {
  return canvasTex(2048, 2048, (g, w) => {
    const k = w / 29.7, rnd = rng(7);
    g.fillStyle = '#08090a'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 160000; i++) {         // fibras del fieltro
      g.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${0.03 + rnd() * 0.06})`;
      g.fillRect(rnd() * w, rnd() * w, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    g.translate(w / 2, w / 2);
    g.strokeStyle = '#1b1c1f'; g.lineWidth = 3;
    for (const r of [14.2, 1.4]) { g.beginPath(); g.arc(0, 0, r * k, 0, 7); g.stroke(); }
    g.fillStyle = '#35363b'; g.textAlign = 'center';
    g.font = 'bold 200px Georgia, "Times New Roman", serif';
    g.font = `bold ${200 * (23.2 * k) / g.measureText('Technics').width}px Georgia, "Times New Roman", serif`;
    for (let i = 0; i < 2; i++) { g.fillText('Technics', 0, -0.55 * k); g.rotate(Math.PI); }
  });
}

/** Banda estroboscópica del borde del plato: puntitos en tres hileras y filetes plateados. */
export function strobeTex() {
  return canvasTex(2048, 2048, (g, w) => {
    const R = w / 2, k = R / 16.6;
    g.translate(R, R);
    g.fillStyle = '#0b0b0d'; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
    g.fillStyle = '#d3d6dc'; ringPath(g, 16.42 * k, 16.6 * k); g.fill('evenodd');
    ringPath(g, 14.78 * k, 15.0 * k); g.fill('evenodd');
    g.fillStyle = '#9ea2aa';
    for (const [r, n, d] of [[16.05, 330, 0.12], [15.65, 300, 0.14], [15.25, 270, 0.16]]) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        g.beginPath(); g.arc(Math.cos(a) * r * k, Math.sin(a) * r * k, d * k, 0, 7); g.fill();
      }
    }
  });
}

/** Rugosidad del vinilo: surcos mates, espacios entre temas y entrada/salida espejadas. */
export function vinylRoughTex() {
  return canvasTex(1024, 1024, (g, w) => {
    const k = w / 30;
    g.translate(w / 2, w / 2);
    g.fillStyle = '#1e1e1e'; g.beginPath(); g.arc(0, 0, w / 2, 0, 7); g.fill();
    g.fillStyle = '#939393'; ringPath(g, 6.2 * k, 14.6 * k); g.fill('evenodd');
    g.fillStyle = '#1a1a1a';
    for (const r of [11.5, 9.0]) { ringPath(g, (r - 0.15) * k, (r + 0.15) * k); g.fill('evenodd'); }
  }, { linear: true });
}

/** Relieve: miles de surcos concéntricos. */
export function vinylBumpTex() {
  return canvasTex(2048, 2048, (g, w) => {
    const k = w / 30, rnd = rng(11);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, w);
    g.translate(w / 2, w / 2); g.lineWidth = 1.2;
    for (let r = 6.2 * k; r < 14.6 * k; r += 2.4) {
      const mid = Math.abs(r / k - 11.5) < 0.2 || Math.abs(r / k - 9.0) < 0.2;
      const v = mid ? 128 : 90 + (rnd() * 110 | 0);
      g.strokeStyle = `rgb(${v},${v},${v})`;
      g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    }
  }, { linear: true });
}

/** Mapa de anisotropía: dirección tangencial de los surcos en cada punto (da el brillo de «reloj de arena»). */
export function vinylAnisoTex() {
  return canvasTex(1024, 1024, (g, w) => {
    const img = g.createImageData(w, w), d = img.data;
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) {
      const dx = x - w / 2 + 0.5, dy = w / 2 - y - 0.5, l = Math.hypot(dx, dy) || 1, i = (y * w + x) * 4;
      d[i] = 128 + 127 * (-dy / l); d[i + 1] = 128 + 127 * (dx / l); d[i + 2] = 255; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, { linear: true, aniso: 4 });
}

/** Etiqueta central del disco. */
export function labelTex() {
  return canvasTex(1024, 1024, (g, w) => {
    const k = w / 10;
    g.translate(w / 2, w / 2);
    g.fillStyle = '#c4381f'; g.beginPath(); g.arc(0, 0, w / 2, 0, 7); g.fill();
    g.strokeStyle = '#f2e6c8'; g.lineWidth = 5;
    for (const r of [4.55, 2.4]) { g.beginPath(); g.arc(0, 0, r * k, 0, 7); g.stroke(); }
    g.fillStyle = '#f2e6c8'; g.textAlign = 'center';
    g.font = `bold ${0.95 * k}px Georgia, serif`; g.fillText('AIPATHS', 0, -0.9 * k);
    g.font = `${0.42 * k}px Helvetica, Arial, sans-serif`;
    g.fillText('LO-FI GENERADO POR CÓDIGO', 0, 1.0 * k);
    g.fillText('LADO A · 33⅓ RPM', 0, 1.8 * k);
    arcText(g, 'AIPATHS RECORDS · AIPATHS RECORDS · ', 3.55 * k, 0.3 * k);
    g.fillStyle = '#0c0c0c'; g.beginPath(); g.arc(0, 0, 0.36 * k, 0, 7); g.fill();
  });
}

function arcText(g, text, r, size) {
  g.font = `bold ${size}px Helvetica, Arial, sans-serif`;
  const step = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    g.save(); g.rotate(i * step); g.translate(0, -r); g.fillText(text[i], 0, 0); g.restore();
  }
}

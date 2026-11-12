// Serigrafía del plinto y texturas de plástico, teclas y perillas (canvas).
import { canvasTex, rng } from './util.js';
import { D } from './dims.js';

const GRAY = 'rgba(158,160,166,0.82)';

/** Ruido fino para dar grano al plástico negro mate (bump + rugosidad). */
export function plasticTex() {
  const t = canvasTex(512, 512, (g, w) => {
    const rnd = rng(3);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 90000; i++) {
      const v = 100 + (rnd() * 56 | 0);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd() * w, rnd() * w, 1.5, 1.5);
    }
  }, { linear: true, repeat: true });
  t.repeat.set(6, 5);
  return t;
}

/** Calca de la placa superior: logo, leyenda, escala del pitch y marcos de las teclas, a escala real. */
export function deckTex() {
  const W = 2560, H = Math.round(W * D.dp / D.w), k = W / D.w;
  const X = (x) => (x - D.x0) * k, Z = (z) => (z - D.z0) * k;
  return canvasTex(W, H, (g) => {
    g.fillStyle = GRAY; g.strokeStyle = GRAY; g.textAlign = 'center';
    g.font = `bold ${1.15 * k}px Georgia, serif`; g.fillText('Technics', X(15.1), Z(16.3));
    g.font = `${0.27 * k}px Helvetica, Arial, sans-serif`; g.letterSpacing = '1px';
    g.fillText('DIRECT DRIVE TURNTABLE SYSTEM  SL-1200MK7', X(15.4), Z(17.25));
    pitchScale(g, X, Z, k);
    g.font = `${0.3 * k}px Helvetica, Arial, sans-serif`;
    g.fillText('×2', X(23.4), Z(-1.0)); g.fillText('RESET', X(20.8), Z(12.7));
    g.fillText('PITCH ADJ', X(24.2), Z(14.3));
    g.lineWidth = 0.05 * k;
    g.strokeRect(X(24.7), Z(-0.9), 0.6 * k, 0.28 * k);     // LED del ×2
    for (const [cx, cz, w, h] of [[-14.7, 15.2, 5.1, 3.9], [-9.6, 16.6, 5.5, 1.6]]) {
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(X(cx - w / 2), Z(cz - h / 2), w * k, h * k);
      g.strokeRect(X(cx - w / 2), Z(cz - h / 2), w * k, h * k);
    }
    g.beginPath(); g.arc(X(14.6), Z(-14.2), 0.36 * k, 0, 7); g.fillStyle = 'rgba(0,0,0,0.9)'; g.fill(); g.stroke();
    // marco de la ranura del pitch
    g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(X(23.0), Z(1.3), 2.3 * k, 12.2 * k);
    g.fillStyle = 'rgba(0,0,0,1)'; g.fillRect(X(23.95), Z(2.0), 0.4 * k, 10.8 * k);
  });
}

function pitchScale(g, X, Z, k) {
  g.font = `${0.34 * k}px Helvetica, Arial, sans-serif`;
  ['+8', '+6', '+4', '+2', '0', '-2', '-4', '-6', '-8'].forEach((s, i) => {
    const z = 2.9 + i * 1.225;
    g.fillText(s.replace(/^\+|-/, ''), X(21.9), Z(z + 0.12));
    g.fillRect(X(22.5), Z(z) - 1, (i === 4 ? 0.5 : 0.3) * k, 0.06 * k);
  });
}

/** Tecla con rótulo. */
export function keyTex(label, w = 256, h = 160, color = '#a9abb1') {
  return canvasTex(w, h, (g) => {
    g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, w, h);
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `${h * (label.length > 3 ? 0.17 : 0.42)}px Helvetica, Arial, sans-serif`; g.letterSpacing = '2px';
    g.fillText(label, w / 2, h / 2);
  });
}

/** Tapa de perilla: marcas radiales finas y rótulo OFF. */
export function knobTex(text) {
  return canvasTex(512, 512, (g, w) => {
    const grd = g.createRadialGradient(w * 0.4, w * 0.4, 20, w / 2, w / 2, w / 2);
    grd.addColorStop(0, '#5b5d63'); grd.addColorStop(1, '#17181a');
    g.fillStyle = grd; g.fillRect(0, 0, w, w);
    g.translate(w / 2, w / 2); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < 360; i += 3) { g.rotate(Math.PI / 60); g.beginPath(); g.moveTo(40, 0); g.lineTo(256, 0); g.stroke(); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#d0d2d8'; g.textAlign = 'center'; g.font = '70px Helvetica, Arial, sans-serif';
    g.fillText(text, w / 2, w * 0.32);
  });
}

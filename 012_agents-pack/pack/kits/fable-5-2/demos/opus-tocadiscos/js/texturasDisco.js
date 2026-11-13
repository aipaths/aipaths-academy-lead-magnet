// Vinilo: surcos, etiqueta y mapa de anisotropía circular (el brillo en abanico de un disco real).
import { lienzo, aTextura, SERIF, SANS } from './texturas.js';
import { M } from './medidas.js';

const S = 2048;
const R = M.disco.r;

// Radios (mm) de las pausas entre temas: bandas lisas que se ven brillar distinto.
const PAUSAS = [138, 121, 103, 88, 74];

function surcos(g) {
  g.fillStyle = '#060606';
  g.fillRect(0, 0, S, S);
  const k = S / 2 / R;
  for (let r = 146; r > 58; r -= 0.18) {
    const pausa = PAUSAS.some((p) => Math.abs(r - p) < 0.9);
    const v = pausa ? 18 : 9 + ((r * 37.1) % 7);
    g.strokeStyle = `rgb(${v},${v},${v + 1})`;
    g.lineWidth = 0.18 * k;
    g.beginPath();
    g.arc(S / 2, S / 2, r * k, 0, Math.PI * 2);
    g.stroke();
  }
  // Borde exterior liso y zona de salida
  g.strokeStyle = '#141414';
  g.lineWidth = 3 * k;
  g.beginPath();
  g.arc(S / 2, S / 2, (R - 1.6) * k, 0, Math.PI * 2);
  g.stroke();
}

function etiqueta(g) {
  const k = S / 2 / R,
    r = M.disco.etiqueta * k,
    cx = S / 2;
  const grad = g.createRadialGradient(cx, cx, 0, cx, cx, r);
  grad.addColorStop(0, '#efe6d2');
  grad.addColorStop(1, '#e2d5ba');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cx, r, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#b8342a';
  g.lineWidth = r * 0.05;
  g.beginPath();
  g.arc(cx, cx, r * 0.9, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#2a2420';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${r * 0.2}px ${SERIF}`;
  g.fillText('Opus Records', cx, cx - r * 0.5);
  g.font = `500 ${r * 0.1}px ${SANS}`;
  g.fillText('MÚSICA GENERADA POR CÓDIGO', cx, cx - r * 0.3);
  g.font = `600 ${r * 0.11}px ${SANS}`;
  g.fillText('LADO A', cx - r * 0.42, cx + r * 0.05);
  g.fillText('33⅓ RPM', cx + r * 0.42, cx + r * 0.05);
  g.font = `500 ${r * 0.085}px ${SANS}`;
  ['1. Madera y polvo', '2. Brazo en S', '3. Corriente continua'].forEach((t, i) =>
    g.fillText(t, cx, cx + r * (0.32 + i * 0.13)),
  );
  g.fillStyle = '#1a1a1a';
  g.beginPath();
  g.arc(cx, cx, 3.62 * k, 0, Math.PI * 2);
  g.fill();
}

export function texturaDisco() {
  const [c, g] = lienzo(S, S);
  surcos(g);
  etiqueta(g);
  return aTextura(c, { aniso: 16 });
}

// Rugosidad: surcos semimate, pausas más lisas, etiqueta de papel mate.
export function rugosidadDisco() {
  const [c, g] = lienzo(1024, 1024);
  const k = 512 / R;
  g.fillStyle = 'rgb(70,70,70)';
  g.fillRect(0, 0, 1024, 1024);
  for (let r = 146; r > 58; r -= 0.5) {
    const pausa = PAUSAS.some((p) => Math.abs(r - p) < 0.9);
    const v = pausa ? 40 : 95 + ((r * 13.7) % 30);
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 0.6 * k;
    g.beginPath();
    g.arc(512, 512, r * k, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = 'rgb(225,225,225)';
  g.beginPath();
  g.arc(512, 512, M.disco.etiqueta * k, 0, Math.PI * 2);
  g.fill();
  return aTextura(c, { srgb: false });
}

// Dirección de anisotropía tangente a los surcos (RG = dirección, B = fuerza).
export function anisotropiaDisco() {
  const N = 512,
    [c, g] = lienzo(N, N);
  const img = g.createImageData(N, N),
    et = M.disco.etiqueta / R;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = ((x + 0.5) / N) * 2 - 1,
        v = 1 - ((y + 0.5) / N) * 2;
      const d = Math.hypot(u, v) || 1,
        i = (y * N + x) * 4;
      img.data[i] = ((-v / d) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((u / d) * 0.5 + 0.5) * 255;
      img.data[i + 2] = d > et ? 255 : 0;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return aTextura(c, { srgb: false, aniso: 1 });
}

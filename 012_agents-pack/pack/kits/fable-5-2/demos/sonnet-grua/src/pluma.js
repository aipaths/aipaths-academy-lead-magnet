// Pluma reticulada (4 cordones + diagonales), cabezal con poleas, mástil trasero y cables de pendolón.
import * as THREE from 'three';
import { Fabrica, v3 } from './geo.js';
import { Cuerda } from './cuerda.js';
import { CAB } from './cabina.js';

export const PLUMA = { largo: 21, min: 25, max: 80 };      // grados de inclinación sobre la horizontal
const SEG = 14;

function semiancho(x) {                            // la sección se afina hacia la punta
  const t = x / PLUMA.largo;
  return t < 0.3 ? 0.88 : 0.88 - (t - 0.3) / 0.7 * 0.46;
}

function reticulado(f, mat) {
  const L = PLUMA.largo, esq = (x, k) => { const h = semiancho(x); return v3(x, k < 2 ? h : -h, k === 0 || k === 3 ? h : -h); };
  for (let s = 0; s <= SEG; s++) {
    const x = (s * L) / SEG, r = 0.075 - 0.03 * (x / L);
    for (let k = 0; k < 4; k++) {
      if (s < SEG) { const x2 = ((s + 1) * L) / SEG; f.barra(mat, esq(x, k), esq(x2, k), r, 6); }
      f.barra(mat, esq(x, k), esq(x, (k + 1) % 4), 0.03, 5);                         // aro
      if (s < SEG) { const x2 = ((s + 1) * L) / SEG, a = esq(x, k), b = esq(x2, (k + 1) % 4), c = esq(x, (k + 1) % 4), d = esq(x2, k); f.barra(mat, s % 2 ? a : c, s % 2 ? b : d, 0.028, 5); }
    }
  }
}

export function crearPluma(mats) {
  const f = new Fabrica(), L = PLUMA.largo;
  reticulado(f, mats.amarillo);
  f.caja(mats.amarillo, 0.5, 0.9, 1.9, 0.1, 0, 0);                                    // pie
  f.cilindro(mats.acero, 0.1, 2.0, 0, 0, 0, 'z', 12);
  for (const z of [-0.5, 0.5]) f.cilindro(mats.negro, 0.5, 0.1, L + 0.15, 0, z, 'z', 24);   // poleas de punta
  for (const z of [-0.3, 0.3]) f.cilindro(mats.negro, 0.34, 0.06, L + 0.15, 0.1, z, 'z', 20);
  for (const z of [-0.72, 0, 0.72]) f.caja(mats.amarillo, 0.9, 1.1, 0.08, L + 0.1, 0, z);   // placas del cabezal
  f.cilindro(mats.acero, 0.06, 1.8, L + 0.15, 0, 0, 'z', 10);
  const grupo = f.crear();
  const puntas = [v3(L + 0.15, -0.5, -0.5), v3(L + 0.15, -0.5, 0.5)];                  // por donde salen los dos cables
  return { grupo, puntas };
}

export function crearMastil(mats) {
  const f = new Fabrica(), p = v3(CAB.pivoteX - 0.1, CAB.pivoteY + 0.1, 0), t = v3(CAB.mastilX, CAB.mastilY, 0);
  for (const z of [-0.55, 0.55]) {
    const a = v3(p.x, p.y, z), b = v3(t.x, t.y, z * 0.55);
    f.barra(mats.amarillo, a, b, 0.09, 8);
    f.barra(mats.amarillo, v3(a.x, a.y - 0.25, z), b, 0.04, 6);
    f.barra(mats.negro, b, v3(-4.0, 1.78, z * 2.3), 0.035, 6);                         // tensores al contrapeso
  }
  for (let i = 1; i < 6; i++) { const u = i / 6, x = p.x + (t.x - p.x) * u, y = p.y + (t.y - p.y) * u, w = 0.55 - 0.3 * u; f.barra(mats.amarillo, v3(x, y, -w), v3(x, y, w), 0.035, 5); }
  for (const z of [-0.3, 0.3]) f.cilindro(mats.negro, 0.42, 0.12, t.x, t.y + 0.1, z, 'z', 20);
  f.cilindro(mats.acero, 0.06, 1.0, t.x, t.y + 0.1, 0, 'z', 10);
  return { grupo: f.crear(), punta: t };
}

export function crearPendolones(mats) {                // cables de elevación de pluma: mástil → punta de pluma
  const c = [0, 1, 2, 3].map(() => new Cuerda(2, 0.035, mats.cable));
  return { cuerdas: c, mallas: c.map((x) => x.mesh) };
}

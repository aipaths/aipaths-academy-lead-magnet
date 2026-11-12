import { OBRA } from './medidas.js';

// La tierra que se deforma. Tres operaciones sobre el mapa de alturas del terreno:
// cavar (resta), depositar (suma) y relajar (desmorona lo que quedó más empinado que el ángulo natural).

// Saca hasta "vol" m³ de una huella rectangular girada (la boca de la almeja). Devuelve lo que sacó.
export function cavar(t, x, z, giro, medioLargo, medioAncho, vol) {
  const { N, celda, h } = t, c = Math.cos(giro), s = Math.sin(giro), area = celda * celda;
  const [fi, fj] = t.indice(x, z), r = Math.ceil((Math.hypot(medioLargo, medioAncho) + 0.3) / celda);
  const i0 = Math.max(2, Math.floor(fi - r)), i1 = Math.min(N - 3, Math.ceil(fi + r)), j0 = Math.max(2, Math.floor(fj - r)), j1 = Math.min(N - 3, Math.ceil(fj + r));
  const pesos = []; let suma = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const dx = (i - fi) * celda, dz = (j - fj) * celda, u = (dx * c - dz * s) / medioLargo, w = (dx * s + dz * c) / medioAncho;
    if (Math.abs(u) >= 1 || Math.abs(w) >= 1) continue;
    const p = (1 - u * u) * Math.min(1, (1 - Math.abs(w)) * 4);   // cuenco: más hondo al medio
    pesos.push(j * N + i, p); suma += p;
  }
  if (!suma) return 0;
  let sacado = 0;
  for (let k = 0; k < pesos.length; k += 2) {
    const d = Math.min(0.5, (vol * pesos[k + 1]) / (suma * area)), q = pesos[k];
    if (h[q] - d < -OBRA.fondo) continue;                        // hay un fondo duro
    h[q] -= d; sacado += d * area; t.fresca[q] = 1;
  }
  t.marcar(i0, j0, i1, j1); activar(t, i0, j0, i1, j1);
  return sacado;
}

// Suma "vol" m³ en un punto (lo reparte entre los 4 vértices vecinos).
export function depositar(t, x, z, vol) {
  const { N, celda, h } = t; let [fi, fj] = t.indice(x, z);
  if (fi < 2 || fj < 2 || fi > N - 4 || fj > N - 4) return;
  const i = Math.floor(fi), j = Math.floor(fj), k = j * N + i, dh = vol / (celda * celda); fi -= i; fj -= j;
  h[k] += dh * (1 - fi) * (1 - fj); h[k + 1] += dh * fi * (1 - fj); h[k + N] += dh * (1 - fi) * fj; h[k + N + 1] += dh * fi * fj;
  t.fresca[k] = t.fresca[k + 1] = t.fresca[k + N] = t.fresca[k + N + 1] = 1;
  t.marcar(i, j, i + 1, j + 1); activar(t, i - 1, j - 1, i + 2, j + 2);
}

function activar(t, i0, j0, i1, j1) {
  const a = t.activo;
  t.activo = a ? [Math.min(a[0], i0), Math.min(a[1], j0), Math.max(a[2], i1), Math.max(a[3], j1)] : [i0, j0, i1, j1];
}

// Ángulo de reposo: si entre dos puntos vecinos hay más desnivel que el que aguanta la tierra suelta,
// la mitad del exceso se pasa del alto al bajo. Repetido cuadro a cuadro, la montaña se desmorona sola.
const VECINOS = [[1, 0, 1], [0, 1, 1], [1, 1, Math.SQRT2], [-1, 1, Math.SQRT2]];
export function relajar(t, pasadas = 2) {
  for (let n = 0; n < pasadas && t.activo; n++) {
    const { N, h, fresca } = t, maxD = OBRA.reposo * t.celda;
    let [i0, j0, i1, j1] = t.activo; i0 = Math.max(1, i0 - 1); j0 = Math.max(1, j0 - 1); i1 = Math.min(N - 3, i1 + 1); j1 = Math.min(N - 3, j1 + 1);
    let a0 = N, b0 = N, a1 = -1, b1 = -1; const alReves = (t.vuelta = !t.vuelta);
    for (let jj = j0; jj <= j1; jj++) for (let ii = i0; ii <= i1; ii++) {
      const i = alReves ? i1 - (ii - i0) : ii, j = alReves ? j1 - (jj - j0) : jj, k = j * N + i;
      for (const [di, dj, dist] of VECINOS) {
        const q = k + dj * N + di, d = h[k] - h[q], tope = maxD * dist;
        if (d > tope) { const m = (d - tope) * 0.3; h[k] -= m; h[q] += m; fresca[q] = Math.max(fresca[q], 0.85); } else if (d < -tope) { const m = (-d - tope) * 0.3; h[k] += m; h[q] -= m; fresca[k] = Math.max(fresca[k], 0.85); } else continue;
        if (Math.abs(d) - tope < 0.004) continue;                 // ya casi quieto: no hace falta seguir
        a0 = Math.min(a0, i - 1); b0 = Math.min(b0, j); a1 = Math.max(a1, i + 1); b1 = Math.max(b1, j + 1);
      }
    }
    t.marcar(i0, j0, i1 + 1, j1 + 1);
    t.activo = a1 < 0 ? null : [a0, b0, a1, b1];
  }
  return !!t.activo;
}

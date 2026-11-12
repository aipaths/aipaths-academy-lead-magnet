// Medidas (cm) del SL-1200MK7 y posiciones medidas sobre la foto cenital oficial. Ver referencias/…/fuentes.md.
export const D = {
  // plinto: 45,3 × 35,2 (ficha: 453 × 353 mm); coordenadas respecto del eje del plato
  x0: -17.85, x1: 27.44, z0: -17.3, z1: 17.94,
  feetH: 2.4,          // patas aisladoras
  deckTop: 10.4,       // cara superior del plinto
  deckT: 1.4,          // espesor de la placa superior
  platterTop: 11.9, matTop: 12.2, recTop: 12.4,
  platterR: 16.6,      // Ø 332 mm
  matR: 14.85, recR: 15.0,
  // brazo: largo efectivo 230 mm, pivote a 215 mm del eje, offset 22°
  pivot: { x: 19.96, z: -7.98 },
  L: 23.0, d: 21.5, offset: 22 * Math.PI / 180, tubeY: 14.6,
  // grooves del disco (cm de radio): entrada, fin
  grooveOut: 14.5, grooveIn: 6.3,
};
D.w = D.x1 - D.x0; D.dp = D.z1 - D.z0;
D.cx = (D.x0 + D.x1) / 2; D.cz = (D.z0 + D.z1) / 2;
D.baseH = D.deckTop - D.deckT - D.feetH;   // altura de la caja inferior

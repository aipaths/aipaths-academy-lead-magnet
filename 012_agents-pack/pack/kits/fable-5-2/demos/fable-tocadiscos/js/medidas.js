// Medidas en mm. Origen: centro del chasis apoyado en el escritorio. X derecha, Z hacia el frente, Y arriba.
// Fuentes en referencias/technics-sl-1200-mk7/fuentes.md
// [F] = ficha oficial · [C] = medido en la foto cenital · [L] = medido en la foto de frente
export const M = {
  ANCHO: 453, FONDO: 353,          // [F] 453 × 353 mm (alto 169 con la tapa)
  ALTO_TOTAL: 169,                 // [F]
  TOP: 81,                         // [L] cara superior de la chapa sobre el escritorio
  CHAPA: 11,                       // [L] espesor de la chapa de aluminio
  CHAFLAN_Y: 41, BASE_Y: 23, SUELA_Y: 10, // [L] perfil del gabinete
  PATA_R: 28, PATA_X: 190.6, PATA_Z: 135, // [L] patas de 56 mm; Z estimado
  PLATO: { x: -46.8, z: 0, r: 166, alto: 13 }, // [F] Ø332 mm · [C] centro · [L] 13 mm sobre la chapa
  SLIPMAT_R: 144,                  // [C]
  PIVOTE: { x: 149.6, z: -87.5, y: 36 }, // [C] dirección · [F] a 215 mm del eje (230 − 15 de overhang)
  BASE_BRAZO: { x: 146, z: -84, r: 61 }, // [C]
  ADAPTADOR: { x: -189.5, z: -143.9, r: 19 }, // [C]
  AGUJERO: { x: 97.1, z: -145.3, r: 6 }, // [C]
  PERILLA: { x: -204.6, z: 104.9, r: 13.3, alto: 19 }, // [C] [L]
  START: { x: -194.2, z: 149.5, w: 41.3, d: 32.8 }, // [C]
  B33: { x: -156.8, z: 162.1, w: 22.8, d: 7 }, // [C]
  B45: { x: -130.7, z: 162.1, w: 22.8, d: 7 }, // [C]
  LUZ_AGUJA: { x: 32.3, z: 156.5, r: 5, alto: 26 }, // [C] [L]
  PITCH: { x: 194.5, z: 72.5, w: 19.9, d: 125.6, centro: 71.2, recorrido: 50.5 }, // [C]
  X2: { x: 194.5, z: -7.7, w: 20, d: 7 }, // [C]
  RESET: { x: 161.1, z: 106.5, r: 7 }, // [C]
  LOGO: { x: 91, z: 154.2, ancho: 36 }, // [C]
  DISCO: { r: 151, etiqueta: 50, entrada: 146, fin: 62 }, // LP de 12" estándar
};

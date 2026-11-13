// Medidas en metros. El origen de cada número está en referencias/grua-almeja/fuentes.md.
// Y arriba, X hacia adelante de la grúa (hacia donde apunta la pluma con giro 0).

export const OBRA = {
  tam: 80,            // lado del cuadrado de tierra que se deforma
  N: 257,             // vértices por lado (celdas de 31 cm)
  reposo: 0.70,
  fondo: 6,           // hasta dónde se puede cavar       // tangente del ángulo natural de la tierra suelta (35°)
  pozo: { x: 13.2, z: -0.5 },      // excavación ya empezada
  montana: { x: 15.5, z: 8.5 },    // acopio de tierra
  camion: { x: 3, z: -10.5 },      // donde estaciona el volquete
};

// Sol del HDRI dry_cracked_lake (Poly Haven): espejado: el sol queda en u 0,402 · v 0,223.
// El cielo se gira GIRO_CIELO grados para que detrás de la grúa quede cielo abierto y el sol
// pegue de frente-costado; el sol de la escena gira igual, así las sombras coinciden.
export const GIRO_CIELO = -5.6;
export const SOL = { azimut: -35.2 + GIRO_CIELO, altura: 49.9 };

// Cámara fija del timelapse. NO TOCAR después de la primera captura.
export const CAMARA_TIMELAPSE = { pos: [23, 10.5, -37.5], mira: [4, 8.6, 0], fov: 36 };

// Liebherr HS 8100.1 HD. "oficial" = plano de dimensiones de la ficha técnica (pág. 6).
export const TREN = {
  largo: 6.45,        // oficial: largo de la oruga
  entreEjes: 5.36,    // oficial: de la rueda motriz a la tensora
  anchoTotal: 4.95,   // oficial: orugas extendidas
  zapata: 0.8,        // oficial: zapata de 3 nervios
  alto: 1.22,         // oficial
  luz: 0.35,          // oficial: luz libre al piso
  rodillos: 8, rodillosArriba: 2,   // estimado de las fotos
  paso: 0.22,         // estimado: largo de cada zapata
};
export const SUPER = {
  piso: 1.36,         // oficial: altura del piso de la superestructura
  techo: 3.4,         // oficial: altura de la casa de máquinas
  cola: 4.7,          // oficial: radio de giro de cola
  frenteCabina: 2.9,  // oficial: del eje de giro al frente de la cabina
  ancho: 3.5,         // oficial: ancho de transporte
  caballete: 7.3,     // estimado: altura del caballete levantado
  pie: { x: 1.15, y: 1.95 },   // oficial: articulación de la pluma
};
export const PLUMA = {
  largo: 20,          // oficial: pie 5,5 + tramo 3 + tramo 6 + cabeza 5,5
  ancho: 1.43,        // oficial
  alto: 1.35,         // estimado
  cable: 0.034,       // oficial: 34 mm
  min: 28, max: 78,   // grados
};
export const ALMEJA = { ancho: 1.62, largoAbierta: 3.0, largoCerrada: 2.2, altoCerrada: 2.8, peso: 3200, volumen: 2.6 };  // catálogo de almejas de 2 cables
export const VEL = { giro: 4.6 * 2 * Math.PI / 60, cable: 96 / 60, traslacion: 1.28 / 3.6 };   // oficial: 4,6 rpm · 96 m/min · 1,28 km/h
export const COLOR = { amarillo: 0xf0a020, gris: 0x565a5f, grisClaro: 0x8d9296, blanco: 0xe9e7e0, negro: 0x151515 };

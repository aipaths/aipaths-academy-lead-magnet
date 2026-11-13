// Medidas del SL-1200MK7 en milímetros (hoja oficial + foto cenital, ver referencias/…-opus/fuentes.md).
// Ejes: x a la derecha, y hacia arriba, z hacia el frente. Origen: centro del chasis sobre el escritorio.
export const mm = (v) => v / 1000;

export const M = {
  ancho: 453,
  prof: 353,
  pataAlto: 26,
  chasisAlto: 52,
  get cubierta() {
    return this.pataAlto + this.chasisAlto;
  }, // 78 mm: altura de la cubierta superior
  plato: { x: -47, z: -1, r: 166, rPlano: 150, alto: 18 },
  slipmat: { r: 151, alto: 2.5 },
  disco: { r: 150, alto: 1.6, etiqueta: 50 },
  brazo: { x: 152, z: -90, largo: 230, overhang: 15, offset: 22, sobreDisco: 21 },
  pitch: { x: 193, z: 70, largo: 121, ancho: 18 },
  x2: { x: 193, z: -7 },
  reset: { x: 160, z: 107, r: 6.5 },
  startStop: { x: -194, z: 148, an: 42, pr: 32 },
  b33: { x: -156, z: 162 },
  b45: { x: -131, z: 162 },
  encendido: { x: -204, z: 105, r: 14 },
  estrobo: { x: -187, z: 98 }, // fuera del borde del plato (r 166), mirando al eje
  adaptador: { x: -189, z: -142, r: 19 },
  target: { x: 35, z: 158 },
  agujero: { x: 96, z: -144 },
  logo: { x: 91, z: 154 },
  tapaAlto: 90,
};

// Altura (mm) de la cara superior del disco: donde apoya la aguja.
export const alturaDisco = () => M.cubierta + M.plato.alto + M.slipmat.alto + M.disco.alto;

// Velocidad real: 33⅓ rpm en rad/s.
export const RPM33 = (33.333 / 60) * Math.PI * 2;

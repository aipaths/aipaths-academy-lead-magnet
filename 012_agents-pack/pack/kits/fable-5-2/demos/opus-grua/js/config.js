// Medidas reales (Liebherr HS 8100 HD, hoja técnica oficial) en metros, y parámetros de la simulación.
const q = new URLSearchParams(location.search);
export const URLP = {
  timelapse: q.get('timelapse') === '1',
  fps: q.get('fps') === '1',
  palada: q.get('palada'),             // en timelapse: '1' simula una palada fija; 'descarga' la congela soltando la tierra en el camión
};

export const GRUA = {
  orugaLargo: 6.45, orugaAlto: 1.22, zapata: 0.8, trocha: 4.95, despeje: 0.35,
  radioCola: 4.7, plumaAncho: 1.43, plumaLargo: 24, pieX: 1.25, pieY: 1.0,              // pie de la pluma, relativo al anillo de giro (≈2,65 m del piso)
  giroMax: 4 * 2 * Math.PI / 60,          // 4 rpm
  plumaVel: (84 - 15) / 44 * Math.PI / 180, // 15–84° en 44 s
  plumaMin: 30 * Math.PI / 180, plumaMax: 80 * Math.PI / 180,
  cableVel: 1.6,                           // 96 m/min
  traslacion: 0.36,                        // 0,8 mph
};

export const TERRENO = {
  tam: 96, celdas: 192,                    // 96 m de lado, celda de 0,5 m
  centroX: 6, centroZ: -4,
  reposo: 34 * Math.PI / 180,              // ángulo de reposo de tierra suelta
  fondo: -7,                               // no se cava más abajo que esto
};

export const SITIO = {
  pila: { x: 16, z: 12, r: 7.5, h: 4.2 },     // montaña de tierra inicial
  camion: { x: 1.5, z: -15.5 },            // bahía donde estaciona el volquete
};

// Cámara fija del timelapse (definida en la etapa 1, no se cambia).
export const CAM_TIMELAPSE = { pos: [-30, 21, 40], mira: [5, 7.5, -5], fov: 42 };

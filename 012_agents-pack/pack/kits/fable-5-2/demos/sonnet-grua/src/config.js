// Parámetros de la URL y medidas de la escena (metros). Grúa de referencia: Liebherr HS 855 HD (fotos en referencias/).
const q = new URLSearchParams(location.search);
export const TIMELAPSE = q.get('timelapse') === '1';
export const SHOW_FPS = q.get('fps') === '1';
export const ESTADO = q.get('estado') || '';

export const LAYOUT = {
  crane: { x: 0, z: 0 },          // centro de giro de la grúa al empezar
  pile: { x: 12.5, z: 0.5, h: 4.2, r: 8.5 },   // la montaña de tierra
  truckSpot: { x: -0.5, z: 11.5 },             // donde se estaciona el volquete
};

// Cámara de 3/4 fija del timelapse: grúa entera, camión y montaña. NO se cambia entre etapas.
export const TIMELAPSE_CAM = { pos: [-31, 20, 47], target: [4, 6.2, 2], fov: 34 };

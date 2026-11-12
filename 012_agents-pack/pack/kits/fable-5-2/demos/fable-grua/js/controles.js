// El mando de la grúa: lo llenan el teclado o el piloto automático, y lo lee la grúa.
export const mando = { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vira: 0 };
const teclas = new Set();
const eje = (mas, menos) => (teclas.has(mas) ? 1 : 0) - (teclas.has(menos) ? 1 : 0);
export const alApretar = {};   // acciones de una sola vez: { KeyC: () => ... }

export function escucharTeclado() {
  window.addEventListener('keydown', (ev) => {
    if (ev.metaKey || ev.ctrlKey) return;
    if (ev.code.startsWith('Arrow') || ev.code === 'Space') ev.preventDefault();
    if (!ev.repeat && alApretar[ev.code]) alApretar[ev.code]();
    teclas.add(ev.code);
  });
  window.addEventListener('keyup', (ev) => teclas.delete(ev.code));
  window.addEventListener('blur', () => teclas.clear());
}
export function leerTeclado() {
  mando.giro = eje('KeyA', 'KeyD');            // A gira a la izquierda, D a la derecha
  mando.pluma = eje('KeyW', 'KeyS');           // W sube la pluma, S la baja
  mando.cable = eje('KeyF', 'KeyR');           // F suelta cable, R recoge
  mando.almeja = eje('KeyQ', 'KeyE') || (teclas.has('Space') ? -1 : 0);   // Q abre, E (o espacio) cierra
  mando.avance = eje('ArrowUp', 'ArrowDown');
  mando.vira = eje('ArrowLeft', 'ArrowRight');
  return teclas.size > 0;
}

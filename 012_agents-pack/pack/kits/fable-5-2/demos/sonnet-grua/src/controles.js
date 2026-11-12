// Teclado → ejes de control (-1..1). También acepta `ctrl.auto` para que un guion (autopiloto o pruebas) maneje la grúa.
export const AYUDA = [
  ['← →', 'girar la cabina'], ['↑ ↓', 'subir / bajar la pluma'], ['Q / E', 'soltar / recoger cable'],
  ['Z / X', 'abrir / cerrar la almeja'], ['W S', 'orugas adelante / atrás'], ['A D', 'orugas: girar'], ['1 2 3', 'cámara'], ['M', 'silencio'], ['P', 'operador automático'],
];

export function crearControles() {
  const teclas = new Set(), ejes = { giro: 0, pluma: 0, cable: 0, almeja: 0, avance: 0, vuelta: 0, auto: null };
  addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; teclas.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
  addEventListener('keyup', (e) => teclas.delete(e.code));
  addEventListener('blur', () => teclas.clear());
  const k = (a, b) => (teclas.has(a) ? 1 : 0) - (teclas.has(b) ? 1 : 0);
  function leer() {
    if (ejes.auto) return ejes.auto;
    ejes.giro = k('ArrowRight', 'ArrowLeft'); ejes.pluma = k('ArrowUp', 'ArrowDown'); ejes.cable = k('KeyQ', 'KeyE');
    ejes.almeja = k('KeyZ', 'KeyX'); ejes.avance = k('KeyW', 'KeyS'); ejes.vuelta = k('KeyD', 'KeyA');
    return ejes;
  }
  return { leer, ejes, teclas };
}

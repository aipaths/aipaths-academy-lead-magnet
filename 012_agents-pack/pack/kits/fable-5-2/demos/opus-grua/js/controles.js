// Teclado: ← → cabina · ↑ ↓ pluma · R/F cable · Espacio almeja · W/S/A/D orugas · C cámara · M sonido.
const teclas = new Set();
const evitar = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']);

export function crearControles({ alAlternarAlmeja, alCamara, alSonido, alPrimeraTecla }) {
  let primera = true;
  addEventListener('keydown', (e) => {
    if (evitar.has(e.code)) e.preventDefault();
    if (primera) { primera = false; alPrimeraTecla?.(); }
    if (e.repeat) return;
    teclas.add(e.code);
    if (e.code === 'Space') alAlternarAlmeja();
    if (e.code === 'KeyC') alCamara();
    if (e.code === 'KeyM') alSonido();
  });
  addEventListener('keyup', (e) => teclas.delete(e.code));
  addEventListener('blur', () => teclas.clear());
  const eje = (mas, menos) => (teclas.has(mas) ? 1 : 0) - (teclas.has(menos) ? 1 : 0);
  return {
    teclas,
    // Pedido del operador: cada eje entre -1 y 1. "auto" lo puede pisar (demo, pruebas).
    leer(auto) {
      if (auto) return auto;
      return {
        giro: eje('ArrowLeft', 'ArrowRight'),       // izquierda = antihorario visto de arriba
        pluma: eje('ArrowUp', 'ArrowDown'),
        cable: eje('KeyF', 'KeyR'),                 // + suelta (baja la almeja)
        avance: eje('KeyW', 'KeyS'),
        viraje: eje('KeyA', 'KeyD'),
      };
    },
  };
}

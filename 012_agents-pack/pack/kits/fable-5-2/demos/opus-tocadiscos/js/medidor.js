// Medidor de fps (?fps=1) y calidad adaptativa: si no llega a 55 fps baja la resolución interna.
export function crearMedidor({ renderer, mostrar }) {
  const caja = document.getElementById('fps');
  caja.hidden = !mostrar;
  const pasos = [2, 1.75, 1.5, 1.25, 1];
  let nivel = pasos.findIndex((p) => p <= renderer.getPixelRatio() + 1e-6);
  let cuadros = 0,
    desde = performance.now(),
    ventana = 0,
    lento = 0,
    ultimo = performance.now();
  const historial = [];
  let peor = 0;
  const m = { fps: 0, ms: 0, historial };

  m.cuadro = () => {
    const ahora = performance.now();
    peor = Math.max(peor, ahora - ultimo);
    ultimo = ahora;
    cuadros++;
    if (ahora - desde < 1000) return;
    m.fps = (cuadros * 1000) / (ahora - desde);
    m.ms = (ahora - desde) / cuadros;
    historial.push(Math.round(m.fps));
    if (historial.length > 120) historial.shift();
    // Calidad adaptativa: dos segundos seguidos por debajo de 55 fps → un escalón menos
    lento = m.fps < 55 ? lento + 1 : 0;
    if (lento >= 2 && nivel < pasos.length - 1 && ++ventana > 2) {
      nivel++;
      lento = 0;
      renderer.setPixelRatio(pasos[nivel]);
      renderer.setSize(innerWidth, innerHeight, false);
    }
    if (mostrar) {
      const i = renderer.info.render;
      caja.textContent =
        `${m.fps.toFixed(0)} fps · peor ${peor.toFixed(0)} ms\n` +
        `resolución ×${renderer.getPixelRatio()} · ${i.calls} draws · ${(i.triangles / 1000).toFixed(0)}k tri`;
    }
    cuadros = 0;
    desde = ahora;
    peor = 0;
  };
  return m;
}

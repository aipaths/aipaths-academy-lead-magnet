// Vista desarmada: cada pieza marcada con userData.despiece se corre ese vector (mm) según t = 0..1.
import * as THREE from 'three';

const suave = (x) => x * x * (3 - 2 * x);

export function crearDespiece(tocadiscos, { camera, controls }) {
  const piezas = [];
  tocadiscos.raiz.traverse((o) => {
    if (o.userData.despiece) piezas.push({ o, base: o.position.clone(), d: o.userData.despiece });
  });
  // Las piezas salen escalonadas: primero la tapa, al final lo de abajo.
  const maxY = Math.max(...piezas.map((p) => p.d.y));
  for (const p of piezas) p.retraso = (1 - Math.max(p.d.y, 0) / maxY) * 0.35;

  const estado = { t: 0, objetivo: 0, tapaAbierta: 1, tapaObjetivo: 1 };
  const ANGULO_TAPA = THREE.MathUtils.degToRad(72);

  function aplicar() {
    for (const p of piezas) {
      const k = suave(THREE.MathUtils.clamp((estado.t - p.retraso) / (1 - 0.35), 0, 1));
      p.o.position.copy(p.base).addScaledVector(p.d, k);
    }
    tocadiscos.tapa.rotation.x = -ANGULO_TAPA * estado.tapaAbierta * (1 - suave(Math.min(1, estado.t * 2.5)));
  }

  function actualizar(dt) {
    const antes = estado.t;
    const paso = dt / 1.6;
    estado.t += THREE.MathUtils.clamp(estado.objetivo - estado.t, -paso, paso);
    estado.tapaAbierta += THREE.MathUtils.clamp(estado.tapaObjetivo - estado.tapaAbierta, -dt / 0.9, dt / 0.9);
    aplicar();
    if (estado.t !== antes) {
      // La cámara acompaña: sube el punto de mira y se aleja para que entre todo
      const k = suave(estado.t), ka = suave(antes);
      controls.target.y += (k - ka) * 0.27;
      const dir = camera.position.clone().sub(controls.target);
      dir.setLength(dir.length() + (k - ka) * 0.86);
      camera.position.copy(controls.target).add(dir);
    }
  }

  aplicar();
  return {
    estado, actualizar, sincronizar: aplicar,
    fijar(v) { estado.objetivo = THREE.MathUtils.clamp(v, 0, 1); },
    alternar() { estado.objetivo = estado.objetivo > 0.5 ? 0 : 1; return estado.objetivo; },
    alternarTapa() { estado.tapaObjetivo = estado.tapaObjetivo > 0.5 ? 0 : 1; return estado.tapaObjetivo; },
  };
}

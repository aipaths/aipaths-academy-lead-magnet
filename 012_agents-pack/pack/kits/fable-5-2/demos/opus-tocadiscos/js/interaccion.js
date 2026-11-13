// Puntero: nombre de la pieza al pasar el mouse, resaltado suave y clic en START·STOP.
import * as THREE from 'three';
import { seleccionables, piezaDe } from './piezas.js';

const resaltados = new WeakMap();
function resaltado(mat) {
  if (!resaltados.has(mat)) {
    const r = mat.clone();
    r.emissive = new THREE.Color(0x3a2a18);
    r.emissiveIntensity = mat.emissiveIntensity > 0 ? mat.emissiveIntensity : 1;
    if (mat.emissive && mat.emissive.getHex() !== 0) r.emissive.copy(mat.emissive);
    resaltados.set(mat, r);
  }
  return resaltados.get(mat);
}

export function crearInteraccion({ lienzo, camara, alClic }) {
  const ray = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  const etiqueta = document.getElementById('etiqueta');
  let pendiente = false,
    actual = null,
    abajo = null,
    ultimoX = 0,
    ultimoY = 0;

  const marcar = (p) => {
    if (actual === p) return;
    if (actual)
      actual.traverse((o) => {
        if (o.userData.original) {
          o.material = o.userData.original;
          delete o.userData.original;
        }
      });
    actual = p;
    if (p)
      p.traverse((o) => {
        if (o.isMesh && !o.userData.original) {
          o.userData.original = o.material;
          o.material = resaltado(o.material);
        }
      });
    etiqueta.hidden = !p;
    if (p) {
      etiqueta.querySelector('strong').textContent = p.userData.nombre;
      etiqueta.querySelector('span').textContent = p.userData.descripcion;
    }
  };

  const elegir = () => {
    ray.setFromCamera(puntero, camara);
    const hit = ray.intersectObjects(seleccionables, false)[0];
    return hit ? { pieza: piezaDe(hit.object), malla: hit.object } : null;
  };

  lienzo.addEventListener('pointermove', (e) => {
    puntero.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ultimoX = e.clientX;
    ultimoY = e.clientY;
    pendiente = e.buttons === 0;
    if (!pendiente) marcar(null);
  });
  lienzo.addEventListener('pointerleave', () => {
    pendiente = false;
    marcar(null);
  });
  lienzo.addEventListener('pointerdown', (e) => {
    abajo = [e.clientX, e.clientY];
  });
  lienzo.addEventListener('pointerup', (e) => {
    if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 4) return;
    const h = elegir();
    if (h?.malla.userData.accion) alClic(h.malla.userData.accion);
  });

  // Se llama una vez por cuadro: como mucho un raycast por cuadro.
  return function actualizar() {
    if (!pendiente) return;
    pendiente = false;
    const h = elegir();
    marcar(h?.pieza ?? null);
    etiqueta.style.left = ultimoX + 'px';
    etiqueta.style.top = ultimoY + 'px';
    lienzo.style.cursor = h?.malla.userData.accion ? 'pointer' : '';
  };
}

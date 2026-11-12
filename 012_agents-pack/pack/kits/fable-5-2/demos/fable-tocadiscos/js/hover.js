// Cartel con el nombre de la pieza al pasar el mouse, resaltado y clics sobre los botones 3D.
import * as THREE from 'three';

export function crearHover({ camera, renderer }, tocadiscos, cartel) {
  const rayo = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const resaltados = new Map(); // material original → copia iluminada
  let actual = null, pendiente = null, abajo = null;
  const lienzo = renderer.domElement;

  const piezaDe = (obj) => {
    for (let o = obj; o; o = o.parent) if (o.userData.pieza) return o;
    return null;
  };
  const accionDe = (obj) => {
    for (let o = obj; o; o = o.parent) if (o.userData.accion) return o.userData.accion;
    return null;
  };

  function iluminado(m) {
    if (!resaltados.has(m)) {
      const c = m.clone();
      if (c.emissive) {
        c.emissive = new THREE.Color(0x3a5570);
        c.emissiveIntensity = 0.38;
        c.emissiveMap = null;
      }
      resaltados.set(m, c);
    }
    return resaltados.get(m);
  }

  function resaltar(pieza, si) {
    pieza.traverse((o) => {
      if (!o.isMesh || o.material.isMeshBasicMaterial) return;
      // No pisar el resaltado de una pieza hija con nombre propio
      if (piezaDe(o) !== pieza) return;
      if (si) {
        o.userData.matOriginal = o.material;
        o.material = Array.isArray(o.material) ? o.material.map(iluminado) : iluminado(o.material);
      } else if (o.userData.matOriginal) {
        o.material = o.userData.matOriginal;
        delete o.userData.matOriginal;
      }
    });
  }

  function apuntar() {
    const e = pendiente;
    pendiente = null;
    const r = lienzo.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(mouse, camera);
    const toque = rayo.intersectObject(tocadiscos.raiz, true).find((t) => t.object.visible && piezaDe(t.object));
    const pieza = toque ? piezaDe(toque.object) : null;
    if (pieza !== actual) {
      if (actual) resaltar(actual, false);
      if (pieza) resaltar(pieza, true);
      actual = pieza;
    }
    if (pieza) {
      cartel.querySelector('b').textContent = pieza.userData.pieza.nombre;
      cartel.querySelector('span').textContent = pieza.userData.pieza.detalle;
      const x = Math.min(e.clientX + 18, window.innerWidth - cartel.offsetWidth - 12);
      cartel.style.transform = `translate(${x}px, ${e.clientY + 18}px)`;
    }
    cartel.classList.toggle('visible', !!pieza);
    lienzo.style.cursor = toque && accionDe(toque.object) ? 'pointer' : '';
    return toque;
  }

  lienzo.addEventListener('pointermove', (e) => {
    if (e.buttons) return; // mientras se arrastra para girar no se busca nada
    if (!pendiente) requestAnimationFrame(apuntar);
    pendiente = e;
  });
  lienzo.addEventListener('pointerleave', () => {
    if (actual) resaltar(actual, false);
    actual = null;
    cartel.classList.remove('visible');
  });
  lienzo.addEventListener('pointerdown', (e) => { abajo = [e.clientX, e.clientY]; });
  lienzo.addEventListener('pointerup', (e) => {
    if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 5) return;
    pendiente = e;
    const toque = apuntar();
    const accion = toque && accionDe(toque.object);
    if (accion) accion();
  });
}

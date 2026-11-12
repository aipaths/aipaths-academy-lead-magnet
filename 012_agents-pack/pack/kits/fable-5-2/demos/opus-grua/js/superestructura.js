// Superestructura que gira: plataforma, capós amarillos, cabina a la izquierda, cabrestantes,
// contrapeso trasero de 17,3 t (R 4,7 m) con franjas, pórtico en A, barandas y luces.
import * as THREE from 'three';
import { MAT, caja, tubo, fusionar } from './materiales.js';
import { texRotulo, texFranjas, texRejilla } from './rotulos.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const malla = (g, m, padre) => { const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; padre.add(me); return me; };

export const APEX = V(-1.55, 5.9, 0);          // cima del pórtico en A (local a la superestructura)

export function crearSuperestructura(giro) {
  // Plataforma y capós
  malla(fusionar([caja(6.0, 0.5, 3.3, -0.75, 0.25, 0), caja(1.8, 0.35, 2.2, 1.1, 0.18, 0)]), MAT.grisOscuro, giro);
  malla(fusionar([
    caja(4.6, 1.9, 1.45, -1.35, 1.45, 1.0),       // capó derecho (motor)
    caja(2.9, 1.6, 0.85, -2.2, 1.3, -1.2),        // capó izquierdo trasero (hidráulica)
    caja(1.2, 0.5, 2.0, -3.0, 2.1, 0.15),         // techo trasero
  ]), MAT.amarillo, giro);
  // Rejillas de ventilación en el capó derecho
  const rej = new THREE.MeshStandardMaterial({ map: texRejilla(), roughness: 0.8, metalness: 0.3 });
  for (const x of [-2.6, -1.4]) { const p = malla(new THREE.PlaneGeometry(0.9, 0.9), rej, giro); p.position.set(x, 1.55, 1.731); }
  // Rótulo "HS 8100 LIEBHERR" a los dos lados
  const rot = new THREE.MeshBasicMaterial({ map: texRotulo('LIEBHERR', 'HS 8100'), transparent: true, toneMapped: true });
  rot.color.setScalar(0.9);
  const r1 = malla(new THREE.PlaneGeometry(2.6, 0.65), rot, giro); r1.position.set(-0.55, 2.0, 1.732); r1.castShadow = false;
  const r2 = malla(new THREE.PlaneGeometry(2.0, 0.5), rot, giro); r2.position.set(-2.3, 1.75, -1.631); r2.rotation.y = Math.PI; r2.castShadow = false;

  // Cabrestantes (2 de 250 kN para la almeja y el de la pluma) entre los capós
  const tambores = [];
  for (const [x, y, r] of [[-0.3, 0.95, 0.42], [-1.35, 0.95, 0.42], [-2.5, 1.45, 0.36]]) {
    const c = new THREE.CylinderGeometry(r, r, 1.0, 24); c.rotateX(Math.PI / 2); c.translate(x, y, -0.25); tambores.push(c);
    const b = new THREE.CylinderGeometry(r + 0.1, r + 0.1, 0.06, 24); b.rotateX(Math.PI / 2);
    tambores.push(b.clone().translate(x, y, 0.27), b.translate(x, y, -0.77));
  }
  malla(fusionar(tambores), MAT.grisOscuro, giro);

  // Cabina (izquierda, adelante): marco gris claro y vidrios grandes
  const cab = new THREE.Group(); cab.position.set(1.15, 0.5, -1.3); giro.add(cab);
  malla(fusionar([caja(2.0, 0.12, 1.0, 0, 0.06, 0), caja(2.15, 0.12, 1.08, 0.05, 2.06, 0), caja(0.12, 2.0, 1.0, -0.94, 1.03, 0),
    caja(0.08, 2.0, 0.08, 0.96, 1.03, 0.46), caja(0.08, 2.0, 0.08, 0.96, 1.03, -0.46), caja(2.0, 2.0, 0.06, -0.0, 1.03, 0.47).translate(0, 0, 0)]), MAT.blanco, cab);
  const vid = [caja(0.03, 1.8, 0.86, 0.97, 1.05, 0), caja(1.75, 1.6, 0.03, 0.05, 1.1, -0.49), caja(1.75, 0.03, 0.85, 0.05, 2.07, 0)];
  malla(fusionar(vid), MAT.vidrio, cab).castShadow = false;
  malla(fusionar([caja(0.55, 0.12, 0.5, 0.2, 0.6, 0.05), caja(0.1, 0.65, 0.5, -0.07, 0.95, 0.05)]), MAT.negro, cab);   // asiento
  const espejo = fusionar([tubo(V(0.9, 1.7, -0.5), V(1.3, 1.9, -0.8), 0.02), caja(0.05, 0.35, 0.22, 1.3, 1.75, -0.82)]);
  malla(espejo, MAT.negro, cab);

  // Contrapeso trasero (3,5 × 1,96 × 1,05 m) con franjas rojas y blancas en las esquinas
  malla(caja(1.05, 1.96, 3.5, -4.175, 0.98 - 0.15, 0), MAT.grisOscuro, giro);
  const fr = new THREE.MeshStandardMaterial({ map: texFranjas(), roughness: 0.6 });
  for (const z of [-1.751, 1.751]) { const p = malla(new THREE.PlaneGeometry(1.05, 1.7), fr, giro); p.position.set(-4.175, 0.85, z); if (z < 0) p.rotation.y = Math.PI; }
  for (const z of [-1.45, 1.45]) { const p = malla(new THREE.PlaneGeometry(0.6, 1.7), fr, giro); p.position.set(-4.701, 0.85, z); p.rotation.y = -Math.PI / 2; }

  // Pórtico en A (gris): patas delanteras y traseras a la cima, con su eje de poleas
  const pa = [];
  for (const z of [-1, 1]) {
    pa.push(tubo(V(0.1, 0.5, z * 1.15), V(APEX.x, APEX.y, z * 0.8), 0.13, 8));
    pa.push(tubo(V(-3.55, 2.35, z * 1.15), V(APEX.x, APEX.y, z * 0.8), 0.11, 8));
  }
  pa.push(tubo(V(APEX.x, APEX.y, -0.95), V(APEX.x, APEX.y, 0.95), 0.12, 10));
  for (const z of [-0.45, -0.15, 0.15, 0.45]) { const s = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20); s.rotateX(Math.PI / 2); s.translate(APEX.x, APEX.y, z); pa.push(s); }
  malla(fusionar(pa), MAT.grisClaro, giro);

  // Barandas amarillas sobre los capós, escalera, escape y balizas
  const bar = [];
  for (const [x0, x1, z] of [[-3.6, 0.8, 1.72], [-3.6, -0.8, -1.62]]) {
    bar.push(tubo(V(x0, 3.3, z), V(x1, 3.3, z), 0.025), tubo(V(x0, 2.85, z), V(x1, 2.85, z), 0.02));
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 4) bar.push(tubo(V(x, 2.4, z), V(x, 3.3, z), 0.025));
  }
  malla(fusionar(bar), MAT.amarillo, giro);
  const esc = []; for (let k = 0; k < 5; k++) esc.push(tubo(V(0.6, 0.6 + k * 0.38, 1.76), V(0.6, 0.6 + k * 0.38, 1.36), 0.02));
  esc.push(tubo(V(0.6, 0.4, 1.76), V(0.6, 2.4, 1.76), 0.025), tubo(V(0.6, 0.4, 1.36), V(0.6, 2.4, 1.36), 0.025));
  malla(fusionar(esc), MAT.grisClaro, giro);
  malla(tubo(V(-2.9, 2.3, 1.2), V(-2.9, 3.6, 1.2), 0.09, 12), MAT.negro, giro);
  const baliza = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6a00, emissiveIntensity: 0.6, roughness: 0.3 });
  for (const z of [1.3, -1.0]) { const b = malla(new THREE.CylinderGeometry(0.09, 0.11, 0.2, 12), baliza, giro); b.position.set(-3.35, 2.47, z); }
  return { cabina: cab };
}

// Plato, slipmat, disco y motor de tracción directa.
import * as THREE from 'three';
import { M } from './medidas.js';
import { pieza, malla, cilindro, torno } from './util.js';
import { texturaSlipmat, texturaPuntos, texturasSurcos, texturaEtiqueta } from './texturas.js';

function plato(mat) {
  const g = new THREE.Group();
  const A = M.PLATO.alto, R = M.PLATO.r;
  // Cara de arriba y canto pulido [C: aro brillante a 148–150,5 mm]
  g.add(torno([[3.4, A], [149.4, A]], mat.plato, 128));
  g.add(torno([[149.4, A], [150.6, A - 0.4], [151.2, A - 1.2]], mat.aluminio, 128));
  // Borde cónico con las 4 filas de puntos [C: 151–166 mm · L: 10 mm de alto]
  const puntos = new THREE.MeshStandardMaterial({ map: texturaPuntos(), metalness: 1, roughness: 0.3 });
  g.add(torno([[151.2, A - 1.2], [R, A - 10.5]], puntos, 180));
  // Falda y cara de abajo (hueca: adentro va el motor)
  g.add(torno([[R, A - 10.5], [R, -8], [158, -8], [158, 6.5], [72, 6.5], [72, 2], [3.4, 2]], mat.plato, 128));
  // Eje de acero
  g.add(torno([[0, 22.5], [2.2, 22.2], [3.5, 20.8], [3.6, 2]], mat.acero, 32));
  return pieza(g, 'Plato', 'Aluminio fundido de 332 mm y 1,8 kg. Los puntos del borde sirven de estroboscopio', [0, 345, 0]);
}

function iman(mat) {
  const g = new THREE.Group();
  g.add(torno([[70, 2], [70, -3.5], [44, -3.5], [44, 2]], mat.iman, 96));
  // Polos del imán pintados alternados para que se entienda que es un rotor
  const n = 16;
  for (let i = 0; i < n; i += 2) {
    const seg = malla(new THREE.RingGeometry(46, 68, 12, 1, (i / n) * Math.PI * 2, (Math.PI * 2) / n), mat.hierro, 0, -3.6, 0);
    seg.rotation.x = Math.PI / 2;
    g.add(seg);
  }
  return pieza(g, 'Rotor (imán)', 'Va atornillado al plato: el plato mismo es parte del motor', [0, 295, 0]);
}

function slipmat() {
  const lado = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 1 });
  const cara = new THREE.MeshStandardMaterial({ map: texturaSlipmat(), roughness: 0.96, metalness: 0 });
  const m = malla(new THREE.CylinderGeometry(M.SLIPMAT_R, M.SLIPMAT_R, 2, 128), [lado, cara, lado], 0, M.PLATO.alto + 1, 0);
  m.rotation.y = Math.PI / 2;
  return pieza(m, 'Slipmat', 'Paño de fieltro: deja frenar el disco con la mano mientras el plato sigue girando', [0, 395, 0]);
}

function disco(mat) {
  const g = new THREE.Group();
  const D = M.DISCO;
  const y = M.PLATO.alto + 2;
  g.add(malla(new THREE.CylinderGeometry(D.r, D.r, 1.6, 128), mat.vinilo, 0, y + 0.8, 0));
  const s = texturasSurcos();
  const surcos = new THREE.MeshPhysicalMaterial({
    map: s.color, roughnessMap: s.rugosidad, roughness: 1, metalness: 0.0,
    anisotropy: 0.92, clearcoat: 0.25, clearcoatRoughness: 0.2, envMapIntensity: 0.78,
  });
  const cara = torno([[D.etiqueta, y + 1.62], [150.5, y + 1.62]], surcos, 160);
  cara.geometry.computeTangents();
  cara.castShadow = false;
  g.add(cara);
  const etiqueta = malla(new THREE.CircleGeometry(D.etiqueta, 64),
    new THREE.MeshStandardMaterial({ map: texturaEtiqueta(), roughness: 0.7 }), 0, y + 1.63, 0);
  etiqueta.rotation.x = -Math.PI / 2;
  etiqueta.castShadow = false;
  g.add(etiqueta);
  return pieza(g, 'Disco de vinilo', 'LP de 12 pulgadas. La música está en el surco: una espiral de casi 500 m', [0, 445, 0]);
}

// Estator sin núcleo: bobinas planas sobre una placa, sin hierro (por eso no "cabecea").
function estator(mat) {
  const g = new THREE.Group();
  g.add(cilindro(76, 1.6, mat.pcb, 0, 0, 0, 72));
  g.add(cilindro(80, 1.2, mat.hierro, 0, -1.2, 0, 72));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const b = malla(new THREE.TorusGeometry(10.5, 4.2, 10, 28), mat.cobre, Math.cos(a) * 55, 3.6, Math.sin(a) * 55);
    b.rotation.x = Math.PI / 2;
    b.scale.set(1.15, 0.85, 0.75);
    b.rotation.z = -a + Math.PI / 2;
    g.add(b);
  }
  g.add(cilindro(13, 9, mat.laton, 0, 1.6, 0, 40));
  g.add(cilindro(22, 3, mat.hierro, 0, 1.6, 0, 40));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.35;
    g.add(malla(new THREE.BoxGeometry(5, 2.2, 4), mat.chip, Math.cos(a) * 32, 2.7, Math.sin(a) * 32));
  }
  g.position.set(M.PLATO.x, M.TOP - M.CHAPA + 1.8, M.PLATO.z);
  return pieza(g, 'Motor (estator sin núcleo)', 'Nueve bobinas de cobre empujan el imán del plato. Sin correas ni engranajes: 33⅓ rpm en 0,7 s', [0, 255, 0]);
}

export function crearPlato(mat) {
  const giro = new THREE.Group();
  giro.position.set(M.PLATO.x, M.TOP, M.PLATO.z);
  const partes = { plato: plato(mat), iman: iman(mat), slipmat: slipmat(), disco: disco(mat) };
  giro.add(partes.plato, partes.iman, partes.slipmat, partes.disco);
  return { giro, estator: estator(mat), ...partes };
}

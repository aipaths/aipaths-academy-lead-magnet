// Almeja de cable: dos valvas (medios cilindros) articuladas arriba, dientes, tirantes y cabezal con poleas.
import * as THREE from 'three';
import { Fabrica, v3 } from './geo.js';

export const ALMEJA = { R: 0.78, ancho: 1.7, abiertaMax: 54, capacidad: 1.5, tirante: 1.05 };

function valva(mats, signo) {                         // una valva: medio cilindro + chapas laterales + dientes
  const { R, ancho } = ALMEJA, g = new THREE.Group();
  const cas = new THREE.CylinderGeometry(R, R, ancho, 28, 1, true, 0, Math.PI); cas.rotateX(Math.PI / 2);
  const mm = new THREE.MeshStandardMaterial({ color: 0x555a60, roughness: 0.55, metalness: 0.6, side: THREE.DoubleSide, normalMap: mats.zapata.normalMap, normalScale: new THREE.Vector2(0.4, 0.4) });
  const c = new THREE.Mesh(cas, mm); c.castShadow = c.receiveShadow = true; g.add(c);
  const sh = new THREE.Shape(); sh.absarc(0, 0, R, -Math.PI / 2, Math.PI / 2, false); sh.closePath();
  for (const z of [-ancho / 2, ancho / 2]) {
    const p = new THREE.Mesh(new THREE.ShapeGeometry(sh, 20), mm); p.position.z = z; p.castShadow = true; g.add(p);
  }
  const f = new Fabrica();
  for (let i = 0; i < 5; i++) f.caja(mats.acero, 0.13, 0.22, 0.2, 0.04, -R - 0.05, -ancho / 2 + 0.22 + i * ((ancho - 0.44) / 4), 0, 0, 0.15);   // dientes
  f.caja(mats.aceroOscuro, 0.1, 0.09, ancho + 0.02, 0.02, -R, 0);                 // filo
  f.caja(mats.aceroOscuro, 0.08, 0.5, 0.12, R + 0.02, 0.22, ancho / 2 - 0.1); f.caja(mats.aceroOscuro, 0.08, 0.5, 0.12, R + 0.02, 0.22, -ancho / 2 + 0.1);   // orejas de tirante
  f.caja(mats.aceroOscuro, 0.5, 0.1, 0.1, 0.1, R + 0.0, 0);
  g.add(f.crear());
  g.position.y = 0; g.children.forEach((m) => { m.position.y += -R; });
  const pivote = new THREE.Group(); pivote.add(g); pivote.userData.signo = signo;
  if (signo < 0) g.scale.x = -1;
  return pivote;
}

export function crearAlmeja(mats) {
  const raiz = new THREE.Group(), { R, ancho, tirante } = ALMEJA;
  const dcha = valva(mats, 1), izda = valva(mats, -1); raiz.add(dcha, izda);
  const f = new Fabrica();                           // cabezal superior (se mueve con la apertura) → malla propia
  const cab = new Fabrica();
  cab.caja(mats.amarillo, 1.1, 0.55, 0.95, 0, 0, 0); cab.cilindro(mats.negro, 0.34, 0.1, 0, 0.35, -0.34, 'z', 20); cab.cilindro(mats.negro, 0.34, 0.1, 0, 0.35, 0.34, 'z', 20);
  cab.cilindro(mats.acero, 0.07, 1.0, 0, 0.35, 0, 'z', 10);
  const cabezal = cab.crear(); raiz.add(cabezal);
  // pasador central inferior (donde se ata el cable de cierre) y tirantes
  f.cilindro(mats.acero, 0.09, ancho + 0.1, 0, 0, 0, 'z', 12); f.caja(mats.negro, 0.5, 0.3, 0.5, 0, 0.2, 0);
  raiz.add(f.crear());
  const tiran = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), mats.aceroOscuro); m.castShadow = true; raiz.add(m); return m; });
  const carga = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6b5238, roughness: 1 }));
  carga.visible = false; raiz.add(carga);
  const arriba = new THREE.Vector3(0, 1, 0), atar = new THREE.Vector3();

  function actualizar(abierta, volumen = 0) {        // abierta: 0 = cerrada … 1 = abierta del todo
    const th = THREE.MathUtils.degToRad(ALMEJA.abiertaMax * abierta);
    dcha.rotation.z = th; izda.rotation.z = -th;
    // orejas: punto de enganche de cada valva tras girar; el cabezal sube hasta que el tirante (largo fijo) llega
    let yCab = 0;
    for (const [i, s] of [[0, 1], [1, -1]]) {
      const ex0 = R + 0.02, ey0 = -R + 0.22, ex = ex0 * Math.cos(th) - ey0 * Math.sin(th), ey = ex0 * Math.sin(th) + ey0 * Math.cos(th);
      for (const [k, z] of [[0, -ancho / 2 + 0.1], [1, ancho / 2 - 0.1]]) {
        const ax = s * 0.38, dx = ex * s - ax, ay = ey + Math.sqrt(Math.max(0.01, (tirante + 0.6) ** 2 - dx * dx)), idx = i * 2 + k;
        yCab = Math.max(yCab, ay);
        const a = v3(ex * s, ey, z), b = v3(ax, ay, z * 0.5), d = b.clone().sub(a), t = tiran[idx];
        t.position.copy(a).addScaledVector(d, 0.5); t.scale.set(1, d.length(), 1); t.quaternion.setFromUnitVectors(arriba, d.normalize());
      }
    }
    cabezal.position.y = yCab + 0.15;
    atar.set(0, yCab + 0.15 + 0.7, 0); raiz.userData.atar = atar;
    carga.visible = volumen > 0.02 && abierta > 0.1;
    if (carga.visible) { const k = Math.cbrt(volumen / 1.5); carga.scale.set(R * 0.8 * k + 0.05, 0.3 * k + 0.05, ancho / 2 * 0.9); carga.position.y = -R * 1.25; }
  }
  actualizar(0.6);
  return { grupo: raiz, actualizar, atar, cabezal, carga: 0 };
}

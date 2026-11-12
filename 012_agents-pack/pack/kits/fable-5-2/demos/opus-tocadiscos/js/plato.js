// Plato, slipmat, disco, motor (rotor + estator) y eje. Lo que gira se devuelve en `giran`.
import * as THREE from 'three';
import { M, mm } from './medidas.js';
import { MAT, conMapa } from './materiales.js';
import { pieza, malla } from './piezas.js';
import { texturaEstrobo, texturaSlipmat } from './texturas.js';
import { texturaDisco, rugosidadDisco, anisotropiaDisco } from './texturasDisco.js';

const P = M.plato;
const Y0 = M.cubierta;
const cil = (rt, rb, h, seg = 128, abierto = false) => new THREE.CylinderGeometry(mm(rt), mm(rb), mm(h), seg, 1, abierto);

// Disco plano mirando hacia arriba (UV circular correcto para las texturas).
function tapaCircular(r, mat) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(mm(r), 128), mat);
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

function crearPlatoAlu(g) {
  const estrobo = new THREE.MeshStandardMaterial({ map: texturaEstrobo(), metalness: 0.8, roughness: 0.3 });
  const h = P.alto;
  // Pollera vertical, banda inclinada con puntos y cara superior
  malla(g, cil(P.r, P.r, 8, 128, true), MAT.plato).position.y = mm(4);
  malla(g, cil(P.rPlano + 1.5, P.r, h - 8, 160, true), estrobo).position.y = mm(8 + (h - 8) / 2);
  const tope = tapaCircular(P.rPlano + 1.5, MAT.plato);
  tope.position.y = mm(h);
  g.add(tope);
  // Aros pulidos: el interior de la banda y el borde inferior
  const aro = (r, y, grosor) => {
    const t = malla(g, new THREE.TorusGeometry(mm(r), mm(grosor), 6, 160), MAT.cromo, { sombra: false });
    t.rotation.x = Math.PI / 2;
    t.position.y = mm(y);
  };
  aro(P.rPlano + 1.6, h, 0.7);
  aro(P.r, 8, 0.6);
  // Nervaduras por debajo (se ven al desarmar)
  const bajo = tapaCircular(P.r, MAT.plato);
  bajo.rotation.x = Math.PI / 2;
  g.add(bajo);
}

export function crearPlato(raiz) {
  const giran = [];
  const x = mm(P.x),
    z = mm(P.z);

  const plato = pieza(
    raiz,
    'Plato',
    'Aluminio inyectado, Ø 332 mm. El borde lleva 4 filas de puntos estroboscópicos para calibrar la velocidad.',
    [0, 265, 0],
    { retraso: 0.4 },
  );
  plato.position.set(x, mm(Y0), z);
  crearPlatoAlu(plato);
  giran.push(plato);

  const slip = pieza(
    raiz,
    'Slipmat',
    'Paño de fieltro con el logo: deja que el disco patine sobre el plato para hacer scratch.',
    [0, 325, 0],
    { retraso: 0.6 },
  );
  slip.position.set(x, mm(Y0 + P.alto), z);
  const fieltro = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 1 });
  malla(slip, cil(M.slipmat.r, M.slipmat.r, M.slipmat.alto, 128, true), fieltro).position.y = mm(M.slipmat.alto / 2);
  const cara = tapaCircular(M.slipmat.r, new THREE.MeshStandardMaterial({ map: texturaSlipmat(), roughness: 0.97 }));
  cara.position.y = mm(M.slipmat.alto);
  slip.add(cara);
  giran.push(slip);

  const disco = pieza(
    raiz,
    'Disco de vinilo',
    'LP de 12" a 33⅓. La música que suena se genera en vivo con código, no es una grabación.',
    [0, 385, 0],
    { retraso: 0.8 },
  );
  disco.position.set(x, mm(Y0 + P.alto + M.slipmat.alto), z);
  malla(
    disco,
    cil(M.disco.r, M.disco.r, M.disco.alto, 128, true),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.4 }),
  ).position.y = mm(M.disco.alto / 2);
  const vinilo = new THREE.MeshPhysicalMaterial({
    map: texturaDisco(),
    roughnessMap: rugosidadDisco(),
    roughness: 1,
    metalness: 0,
    anisotropy: 0.85,
    anisotropyMap: anisotropiaDisco(),
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  });
  const surcos = tapaCircular(M.disco.r, vinilo);
  surcos.position.y = mm(M.disco.alto);
  disco.add(surcos);
  giran.push(disco);

  const rotor = pieza(
    raiz,
    'Rotor del motor',
    'Anillo de imanes de neodimio fijo al plato: el motor directo lo mueve sin correa.',
    [0, 205, 0],
    { retraso: 0.2 },
  );
  rotor.position.set(x, mm(Y0 - 9), z);
  malla(rotor, cil(96, 96, 2, 96), MAT.aluminio).position.y = mm(7);
  malla(rotor, cil(92, 92, 6, 96, true), MAT.iman).position.y = mm(3);
  malla(rotor, cil(70, 70, 6, 96, true), MAT.iman).position.y = mm(3);
  giran.push(rotor);

  const estator = pieza(
    raiz,
    'Estator del motor',
    'Motor directo sin núcleo (coreless): bobinas planas de cobre sobre una placa. Sin vibración de engranajes.',
    [0, 150, 0],
  );
  estator.position.set(x, mm(Y0 - 24), z);
  malla(estator, cil(100, 100, 1.6, 96), MAT.pcb).position.y = mm(0.8);
  const bobina = new THREE.TorusGeometry(mm(9), mm(3.4), 8, 24);
  bobina.rotateX(Math.PI / 2);
  bobina.scale(1, 0.45, 1.25);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = malla(estator, bobina, MAT.cobre);
    b.position.set(Math.cos(a) * mm(81), mm(3.2), Math.sin(a) * mm(81));
    b.rotation.y = -a;
  }

  const eje = pieza(
    raiz,
    'Eje y cojinete',
    'Eje de acero pulido sobre un cojinete de bolas: centra el plato y el disco.',
    [0, 450, 0],
    { retraso: 1 },
  );
  eje.position.set(x, 0, z);
  malla(eje, cil(3.62, 3.62, 58, 32), MAT.cromo).position.y = mm(Y0 - 30 + 29);
  const punta = malla(eje, new THREE.SphereGeometry(mm(3.62), 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.cromo);
  punta.position.y = mm(Y0 + 28);
  malla(eje, cil(14, 14, 30, 48), MAT.laton).position.y = mm(Y0 - 25);

  return { giran };
}

// Lo que hay alrededor de la obra: camino que sigue, vallado de obra, contenedores-oficina,
// baño químico, árboles y lomas a lo lejos (sin texturas inventadas: pintura, chapa y la tierra de Poly Haven).
import * as THREE from 'three';
import { MAT, caja, tubo, fusionar } from './materiales.js';
import { pbr, tex } from './texturas.js';
import { SITIO } from './config.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const sombra = (m, recibe = true) => { m.castShadow = true; m.receiveShadow = recibe; return m; };

function texMalla() {                                 // malla de alambre del vallado (canvas con transparencia)
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.strokeStyle = 'rgba(190,195,198,1)'; g.lineWidth = 3;
  for (let k = -128; k < 256; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 128, 128); g.stroke(); g.beginPath(); g.moveTo(k + 128, 0); g.lineTo(k, 128); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}

function vallado(escena) {
  const malla = new THREE.MeshStandardMaterial({ map: texMalla(), alphaTest: 0.4, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.5 });
  const postes = [], bases = [], paneles = [];
  const lado = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 3.5);
    for (let k = 0; k < n; k++) {
      const a = k / n, b = (k + 1) / n, xa = x0 + (x1 - x0) * a, za = z0 + (z1 - z0) * a, xb = x0 + (x1 - x0) * b, zb = z0 + (z1 - z0) * b;
      if (Math.abs((za + zb) / 2 - SITIO.camion.z) < 5 && Math.abs(x1 - x0) < 1) continue;   // portón en el camino
      postes.push(tubo(V(xa, 0, za), V(xa, 2.0, za), 0.025, 5));
      bases.push(caja(0.7, 0.14, 0.22, xa, 0.07, za));
      const p = new THREE.PlaneGeometry(3.5, 1.9); const uv = p.attributes.uv; for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * 3.5, uv.getY(v) * 1.9);
      p.rotateY(-Math.atan2(zb - za, xb - xa)); p.translate((xa + xb) / 2, 1.0, (za + zb) / 2); paneles.push(p);
    }
  };
  lado(-46, -50, 58, -50); lado(58, -50, 58, 42); lado(58, 42, -46, 42); lado(-46, 42, -46, -50);
  escena.add(sombra(new THREE.Mesh(fusionar(postes), MAT.grisClaro)), sombra(new THREE.Mesh(fusionar(bases), new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.95 }))));
  escena.add(sombra(new THREE.Mesh(fusionar(paneles), malla), false));
}

function contenedor(escena, x, z, rot, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const pintura = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.6, normalMap: tex('metal_plate_nor_1k.jpg', { rep: 2 }) });
  const acan = []; for (let k = 0; k < 24; k++) acan.push(caja(0.06, 2.4, 0.05, -2.9 + k * 0.25, 1.3, 1.23), caja(0.06, 2.4, 0.05, -2.9 + k * 0.25, 1.3, -1.23));
  g.add(sombra(new THREE.Mesh(fusionar([caja(6.06, 2.6, 2.44, 0, 1.3, 0), ...acan]), pintura)));
  g.add(sombra(new THREE.Mesh(fusionar([caja(1.1, 0.9, 0.04, -1.2, 1.5, 1.25), caja(1.1, 0.9, 0.04, 1.4, 1.5, 1.25)]), MAT.vidrio)));
  g.add(sombra(new THREE.Mesh(caja(0.9, 2.0, 0.04, 2.5, 1.05, 1.25), MAT.grisOscuro)));
  escena.add(g);
}

function lejanos(escena) {
  // Árboles (copas irregulares) en grupos, y lomas suaves en el horizonte
  const copas = [], troncos = [];
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let k = 0; k < 90; k++) {                    // cada árbol: varias masas de follaje deformadas
    const a = rnd() * Math.PI * 2, r = 150 + rnd() * 150, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 7 + rnd() * 8;
    for (let m = 0; m < 4; m++) {
      const c = new THREE.IcosahedronGeometry(h * (0.22 + rnd() * 0.12), 1), p = c.attributes.position;
      for (let v = 0; v < p.count; v++) { const f = 0.8 + rnd() * 0.35; p.setXYZ(v, p.getX(v) * f, p.getY(v) * f * 0.8, p.getZ(v) * f); }
      c.translate(x + (rnd() - 0.5) * h * 0.45, h * (0.62 + rnd() * 0.25), z + (rnd() - 0.5) * h * 0.45); copas.push(c);
    }
    troncos.push(tubo(V(x, 0, z), V(x, h * 0.6, z), 0.22, 5));
  }
  const follaje = new THREE.Mesh(fusionar(copas), new THREE.MeshStandardMaterial({ color: 0x3d4a2c, roughness: 1 }));
  follaje.geometry.computeVertexNormals(); escena.add(follaje);
  escena.add(new THREE.Mesh(fusionar(troncos), new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 1 })));
  const lomas = new THREE.CylinderGeometry(560, 560, 1, 96, 1, true);
  const pos = lomas.attributes.position;
  for (let v = 0; v < pos.count; v++) { const x = pos.getX(v), z = pos.getZ(v), a = Math.atan2(z, x); if (pos.getY(v) > 0) pos.setY(v, 14 + Math.sin(a * 5) * 9 + Math.sin(a * 13 + 1) * 5); else pos.setY(v, -2); }
  lomas.computeVertexNormals();
  escena.add(new THREE.Mesh(lomas, new THREE.MeshStandardMaterial({ color: 0x77755a, roughness: 1, side: THREE.BackSide, fog: true })));
}

export function crearObra(escena) {
  // Camino de ripio que sigue fuera del mapa de alturas
  const camino = new THREE.PlaneGeometry(420, 6.2); camino.rotateX(-Math.PI / 2);
  const uv = camino.attributes.uv; for (let v = 0; v < uv.count; v++) uv.setXY(v, uv.getX(v) * 84, uv.getY(v) * 1.24);
  const ripio = new THREE.MeshStandardMaterial({ ...pbr('dry_ground_01'), roughness: 1, color: 0x9b958b });
  const m = new THREE.Mesh(camino, ripio); m.position.set(0, -0.1, SITIO.camion.z); m.receiveShadow = true; escena.add(m);
  vallado(escena);
  contenedor(escena, -28, -40, 0.05, 0xe9e6dd);
  contenedor(escena, -20.5, -40, 0.05, 0x2f5f8a);
  contenedor(escena, 44, 30, -1.4, 0xe9e6dd);
  const bano = sombra(new THREE.Mesh(caja(1.15, 2.3, 1.15, -12, 1.15, -40), new THREE.MeshStandardMaterial({ color: 0x2e7d4f, roughness: 0.6 }))); escena.add(bano);
  lejanos(escena);
}

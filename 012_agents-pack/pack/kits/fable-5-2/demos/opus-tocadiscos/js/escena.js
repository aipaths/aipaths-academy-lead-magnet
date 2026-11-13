// Ambiente: escritorio de nogal (Poly Haven CC0), pared, piso, luz de ventana y lámpara cálida.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { lienzo, aTextura, grano, SERIF, SANS } from './texturas.js';

const ESCRITORIO = { ancho: 1.7, prof: 0.78, alto: 0.04 };
export const PARED_Z = -0.42;

function cargar(loader, url, srgb) {
  return new Promise((ok, mal) =>
    loader.load(
      url,
      (t) => {
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        ok(t);
      },
      undefined,
      mal,
    ),
  );
}

async function escritorio(escena, maxAniso) {
  const tl = new THREE.TextureLoader();
  const [dif, nor, rug] = await Promise.all([
    cargar(tl, 'assets/wood_table_001_diff_2k.jpg', true),
    cargar(tl, 'assets/wood_table_001_nor_gl_2k.jpg', false),
    cargar(tl, 'assets/wood_table_001_rough_2k.jpg', false),
  ]);
  for (const t of [dif, nor, rug]) {
    t.anisotropy = maxAniso;
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2; // la veta corre a lo ancho del escritorio
    t.repeat.set(0.62, 1.35);
  }
  const mat = new THREE.MeshStandardMaterial({
    map: dif,
    normalMap: nor,
    roughnessMap: rug,
    roughness: 0.9,
    normalScale: new THREE.Vector2(0.6, 0.6),
  });
  const tapa = new THREE.Mesh(new THREE.BoxGeometry(ESCRITORIO.ancho, ESCRITORIO.alto, ESCRITORIO.prof), mat);
  tapa.position.set(0, -ESCRITORIO.alto / 2, PARED_Z + ESCRITORIO.prof / 2 + 0.002);
  tapa.receiveShadow = true;
  escena.add(tapa);
}

function pared(escena) {
  const [c, g] = lienzo(1024, 1024);
  g.fillStyle = '#8f8476';
  g.fillRect(0, 0, 1024, 1024);
  grano(g, 1024, 1024, 10, 11);
  const t = aTextura(c, { repetir: true });
  t.repeat.set(3, 2);
  const muro = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
  muro.position.set(0, 0.8, PARED_Z);
  muro.receiveShadow = true;
  escena.add(muro);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0x2a211b, roughness: 0.8 }));
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = -0.74;
  escena.add(piso);
}

// Funda de un LP apoyada contra la pared, a la izquierda.
function funda(escena) {
  const [c, g] = lienzo(1024, 1024);
  const grad = g.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#c85a2e');
  grad.addColorStop(1, '#5e2418');
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = 'rgba(245,232,210,.92)';
  g.beginPath();
  g.arc(512, 470, 250, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#5e2418';
  g.beginPath();
  g.arc(512, 470, 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f5e8d2';
  g.textAlign = 'center';
  g.font = `700 92px ${SERIF}`;
  g.fillText('Madera y polvo', 512, 860);
  g.font = `500 34px ${SANS}`;
  g.fillText('SESIONES GENERATIVAS · 33⅓', 512, 920);
  grano(g, 1024, 1024, 14, 4);
  const lado = new THREE.MeshStandardMaterial({ color: 0x3a1a12, roughness: 0.9 });
  const cara = new THREE.MeshStandardMaterial({ map: aTextura(c), roughness: 0.75 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.314, 0.314, 0.004), [lado, lado, lado, lado, cara, lado]);
  m.position.set(-0.64, 0.155, PARED_Z + 0.045);
  m.rotation.set(-0.14, 0.12, 0);
  m.castShadow = m.receiveShadow = true;
  escena.add(m);
}

function luces(escena) {
  // Luz de ventana: fuerte, desde adelante a la izquierda, con sombras suaves
  const sol = new THREE.DirectionalLight(0xfff1de, 2.4);
  sol.position.set(-0.9, 1.5, 0.9);
  sol.target.position.set(0, 0.05, 0);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -0.6, right: 0.6, top: 0.6, bottom: -0.6, near: 0.5, far: 3.5 });
  sol.shadow.bias = -0.0003;
  sol.shadow.normalBias = 0.012;
  sol.shadow.radius = 5;
  escena.add(sol, sol.target);
  // Lámpara cálida desde la derecha, sin sombra
  const lampara = new THREE.SpotLight(0xffb36b, 3.2, 2.4, 0.9, 1, 1.4);
  lampara.position.set(0.8, 0.95, 0.1);
  lampara.target.position.set(0.05, 0.08, -0.05);
  escena.add(lampara, lampara.target);
  return { sol };
}

export async function crearEscena(escena, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdr = await new RGBELoader().loadAsync('assets/lebombo_1k.hdr');
  escena.environment = pmrem.fromEquirectangular(hdr).texture;
  escena.environmentIntensity = 0.55;
  escena.environmentRotation.set(0, 2.2, 0);
  hdr.dispose();
  pmrem.dispose();
  escena.background = new THREE.Color(0x1d1712);
  escena.fog = new THREE.Fog(0x1d1712, 2.2, 5);
  await escritorio(escena, renderer.capabilities.getMaxAnisotropy());
  pared(escena);
  funda(escena);
  return luces(escena);
}
